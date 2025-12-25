import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Upload, ArrowLeft, LogOut, Gamepad2, HardDrive, Image } from "lucide-react";
import { useLocation } from "wouter";
import type { Game } from "@shared/schema";

const platforms = [
  { id: "snes", name: "SNS", accept: ".zip,.sfc,.smc" },
  { id: "n64", name: "SNS-64", accept: ".zip,.n64,.z64,.v64" },
];

export default function Admin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("snes");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [romFile, setRomFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState("");
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setLocation("/login");
      return;
    }

    fetch("/api/auth/verify", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) {
          setAuthenticated(true);
        } else {
          localStorage.removeItem("adminToken");
          setLocation("/login");
        }
      })
      .catch(() => {
        localStorage.removeItem("adminToken");
        setLocation("/login");
      });
  }, [setLocation]);

  const { data: games = [], isLoading } = useQuery<Game[]>({
    queryKey: ["/api/games"],
    enabled: authenticated === true,
  });

  const localGames: Game[] = [
    {
      id: -1,
      title: "Super Mario World",
      core: "snes",
      cover: "@assets/super-mario-world_1766698426438.jpg",
      rom: "/super-mario-world.zip",
    },
    {
      id: -2,
      title: "Super Bomberman 4",
      core: "snes",
      cover: "@assets/image_1766698488699.png",
      rom: "/bomberman4.zip",
    },
  ];

  const allGames = [...localGames, ...games];

  const createGame = useMutation({
    mutationFn: async (gameData: { title: string; cover: string; rom: string; core: string }) => {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(gameData),
      });
      if (!response.ok) throw new Error("Failed to create game");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      setTitle("");
      setCoverFile(null);
      setRomFile(null);
      setUploadProgress(0);
      setUploadStage("");
      toast({ title: "Jogo adicionado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao adicionar jogo", variant: "destructive" });
    },
  });

  const deleteGame = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/games/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to delete game");
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      toast({ title: "Jogo removido!" });
    },
  });

  const handleLogout = async () => {
    const token = localStorage.getItem("adminToken");
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    localStorage.removeItem("adminToken");
    setLocation("/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !coverFile || !romFile) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const token = localStorage.getItem("adminToken");
      
      setUploadStage("Enviando capa...");
      setUploadProgress(10);
      const coverBuffer = await coverFile.arrayBuffer();
      const coverResponse = await fetch("/api/upload-cover", {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          "X-Filename": coverFile.name,
          Authorization: `Bearer ${token}`,
        },
        body: coverBuffer,
      });
      const { path: coverPath } = await coverResponse.json();
      setUploadProgress(40);

      setUploadStage("Enviando ROM...");
      const romBuffer = await romFile.arrayBuffer();
      const romResponse = await fetch("/api/upload-rom", {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          "X-Filename": romFile.name,
          Authorization: `Bearer ${token}`,
        },
        body: romBuffer,
      });
      const { path: romPath } = await romResponse.json();
      setUploadProgress(80);

      setUploadStage("Salvando jogo...");
      await createGame.mutateAsync({ title, cover: coverPath, rom: romPath, core: platform });
      setUploadProgress(100);
    } catch (err) {
      toast({ title: "Erro no upload", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const selectedPlatform = platforms.find(p => p.id === platform);
  const getPlatformName = (core: string) => platforms.find(p => p.id === core)?.name || core.toUpperCase();

  const totalGames = allGames.length;
  const snesGames = allGames.filter(g => g.core === "snes").length;
  const n64Games = allGames.filter(g => g.core === "n64").length;

  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-mono text-sm text-muted-foreground animate-pulse">VERIFICANDO...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground font-mono">PAINEL ADMIN</h1>
          </div>
          <Button
            variant="outline"
            size="default"
            onClick={handleLogout}
            data-testid="button-logout"
            className="font-mono text-xs"
          >
            <LogOut className="h-4 w-4 mr-2" />
            SAIR
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalGames}</p>
                  <p className="text-sm text-muted-foreground">Total de Jogos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                  <HardDrive className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{snesGames}</p>
                  <p className="text-sm text-muted-foreground">Jogos SNS</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <Image className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{n64Games}</p>
                  <p className="text-sm text-muted-foreground">Jogos SNS-64</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-mono">ADICIONAR JOGO</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="platform">Plataforma</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger data-testid="select-platform">
                      <SelectValue placeholder="Selecione a plataforma" />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Nome do Jogo</Label>
                  <Input
                    id="title"
                    data-testid="input-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Super Mario World"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cover">Imagem da Capa</Label>
                  <Input
                    id="cover"
                    data-testid="input-cover"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                  />
                  {coverFile && (
                    <p className="text-xs text-muted-foreground">{coverFile.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rom">Arquivo ROM ({selectedPlatform?.accept || ".zip"})</Label>
                  <Input
                    id="rom"
                    data-testid="input-rom"
                    type="file"
                    accept={selectedPlatform?.accept || ".zip"}
                    onChange={(e) => setRomFile(e.target.files?.[0] || null)}
                  />
                  {romFile && (
                    <p className="text-xs text-muted-foreground">{romFile.name}</p>
                  )}
                </div>

                {uploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{uploadStage}</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                <Button
                  type="submit"
                  data-testid="button-add-game"
                  disabled={uploading || createGame.isPending}
                  className="w-full font-mono"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? "ENVIANDO..." : "ADICIONAR JOGO"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-mono">JOGOS CADASTRADOS</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-muted-foreground">Carregando...</p>
              ) : games.length === 0 ? (
                <div className="text-center py-8">
                  <Gamepad2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum jogo cadastrado ainda.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {allGames.map((game) => (
                    <div
                      key={game.id}
                      data-testid={`game-item-${game.id}`}
                      className="flex items-center justify-between gap-3 p-3 rounded-md bg-muted"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={game.cover.startsWith("@assets") ? `/attached_assets/${game.cover.split("/").pop()}` : game.cover}
                          alt={game.title}
                          className="w-12 h-16 object-cover rounded flex-shrink-0"
                        />
                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="font-medium truncate">{game.title}</span>
                          <Badge variant="secondary" className="w-fit text-xs">
                            {getPlatformName(game.core)}
                          </Badge>
                        </div>
                      </div>
                      {game.id > 0 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          data-testid={`button-delete-${game.id}`}
                          onClick={() => deleteGame.mutate(game.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
