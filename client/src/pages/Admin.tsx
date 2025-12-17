import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Upload, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import type { Game } from "@shared/schema";

export default function Admin() {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [cover, setCover] = useState("");
  const [romFile, setRomFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: games = [], isLoading } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });

  const createGame = useMutation({
    mutationFn: async (gameData: { title: string; cover: string; rom: string }) => {
      return apiRequest("POST", "/api/games", {
        ...gameData,
        core: "snes",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      setTitle("");
      setCover("");
      setRomFile(null);
      toast({ title: "Jogo adicionado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao adicionar jogo", variant: "destructive" });
    },
  });

  const deleteGame = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/games/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      toast({ title: "Jogo removido!" });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !cover || !romFile) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }

    setUploading(true);

    try {
      const arrayBuffer = await romFile.arrayBuffer();
      const response = await fetch("/api/upload-rom", {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          "X-Filename": romFile.name,
        },
        body: arrayBuffer,
      });

      const { path } = await response.json();

      await createGame.mutateAsync({ title, cover, rom: path });
    } catch (err) {
      toast({ title: "Erro no upload", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Painel Admin</h1>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Adicionar Novo Jogo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="cover">URL da Capa</Label>
                <Input
                  id="cover"
                  data-testid="input-cover"
                  value={cover}
                  onChange={(e) => setCover(e.target.value)}
                  placeholder="https://exemplo.com/capa.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rom">Arquivo ROM (ZIP)</Label>
                <Input
                  id="rom"
                  data-testid="input-rom"
                  type="file"
                  accept=".zip"
                  onChange={(e) => setRomFile(e.target.files?.[0] || null)}
                />
              </div>

              <Button
                type="submit"
                data-testid="button-add-game"
                disabled={uploading || createGame.isPending}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "Enviando..." : "Adicionar Jogo"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jogos Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Carregando...</p>
            ) : games.length === 0 ? (
              <p className="text-muted-foreground">Nenhum jogo cadastrado ainda.</p>
            ) : (
              <div className="space-y-3">
                {games.map((game) => (
                  <div
                    key={game.id}
                    data-testid={`game-item-${game.id}`}
                    className="flex items-center justify-between p-3 rounded-md bg-muted"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={game.cover}
                        alt={game.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <span className="font-medium">{game.title}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      data-testid={`button-delete-${game.id}`}
                      onClick={() => deleteGame.mutate(game.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
