import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle, Maximize, Save, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    EJS_player: string;
    EJS_core: string;
    EJS_gameUrl: string;
    EJS_pathtodata: string;
    EJS_startOnLoaded: boolean;
    EJS_emulator: {
      gameManager: {
        getSaveFile: () => Promise<Uint8Array>;
        loadSaveFiles: (data: Uint8Array) => void;
      };
    };
  }
}

export default function Play() {
  const [, setLocation] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);
  const abortController = useRef<AbortController | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameId, setGameId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const core = params.get("core") || "snes";
    const game = params.get("game") || "";

    if (!game) {
      setLocation("/");
      return;
    }

    const gameIdentifier = `${core}-${game.split('/').pop() || game}`;
    setGameId(gameIdentifier);

    if (scriptLoaded.current) return;
    scriptLoaded.current = true;

    const isLocalFile = game.startsWith("/") || game.startsWith("./");
    const gameUrl = isLocalFile ? game : `/api/rom?url=${encodeURIComponent(game)}`;
    
    window.EJS_player = "#game";
    window.EJS_core = core;
    window.EJS_gameUrl = gameUrl;
    window.EJS_pathtodata = "https://cdn.emulatorjs.org/stable/data/";
    window.EJS_startOnLoaded = true;

    abortController.current = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.current?.abort();
    }, 15000);

    const loadEmulator = () => {
      const script = document.createElement("script");
      script.src = "https://cdn.emulatorjs.org/stable/data/loader.js";
      script.async = true;
      document.body.appendChild(script);
    };

    fetch(gameUrl, { 
      method: "HEAD",
      signal: abortController.current.signal
    })
      .then((res) => {
        clearTimeout(timeoutId);
        if (!res.ok) {
          throw new Error("ROM não disponível no momento");
        }
        setLoading(false);
        if ('requestIdleCallback' in window) {
          requestIdleCallback(loadEmulator, { timeout: 1000 });
        } else {
          setTimeout(loadEmulator, 100);
        }
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        setLoading(false);
        if (err.name === 'AbortError') {
          setError("Tempo limite excedido. Verifique sua conexão e tente novamente.");
        } else {
          setError("O servidor está temporariamente indisponível. Tente novamente em alguns minutos.");
        }
      });

    return () => {
      clearTimeout(timeoutId);
      abortController.current?.abort();
    };
  }, [setLocation]);

  const handleBack = useCallback(() => {
    window.location.href = "/";
  }, []);

  const handleFullscreen = useCallback(() => {
    const container = gameContainerRef.current;
    if (!container) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen().catch(() => {
        toast({
          title: "Tela cheia não suportada",
          variant: "destructive"
        });
      });
    }
  }, [toast]);

  const handleSaveToCloud = useCallback(async () => {
    if (!gameId || !window.EJS_emulator?.gameManager) {
      toast({
        title: "Aguarde o jogo carregar",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const saveData = await window.EJS_emulator.gameManager.getSaveFile();
      const base64 = btoa(String.fromCharCode.apply(null, Array.from(saveData)));
      
      const response = await fetch("/api/saves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, saveData: base64 })
      });

      if (response.ok) {
        toast({ title: "Jogo salvo na nuvem!" });
      } else {
        throw new Error("Failed to save");
      }
    } catch {
      toast({
        title: "Erro ao salvar",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  }, [gameId, toast]);

  const handleLoadFromCloud = useCallback(async () => {
    if (!gameId || !window.EJS_emulator?.gameManager) {
      toast({
        title: "Aguarde o jogo carregar",
        variant: "destructive"
      });
      return;
    }

    setLoadingSave(true);
    try {
      const response = await fetch(`/api/saves/${encodeURIComponent(gameId)}`);
      
      if (response.status === 404) {
        toast({
          title: "Nenhum save encontrado",
          variant: "destructive"
        });
        return;
      }

      if (!response.ok) throw new Error("Failed to load");

      const save = await response.json();
      const binary = atob(save.saveData);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      
      window.EJS_emulator.gameManager.loadSaveFiles(bytes);
      toast({ title: "Save carregado!" });
    } catch {
      toast({
        title: "Erro ao carregar save",
        variant: "destructive"
      });
    } finally {
      setLoadingSave(false);
    }
  }, [gameId, toast]);

  return (
    <div ref={containerRef} className="fixed inset-0 bg-black touch-none">
      <div className="fixed top-4 left-4 z-50 flex gap-2 flex-wrap">
        <Button
          variant="outline"
          size="default"
          onClick={handleBack}
          className="bg-black/80 backdrop-blur-md border-primary text-primary font-mono text-xs"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          VOLTAR
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleFullscreen}
          className="bg-black/80 backdrop-blur-md border-primary text-primary"
          data-testid="button-fullscreen"
        >
          <Maximize className="w-4 h-4" />
        </Button>
      </div>

      <div className="fixed top-4 right-4 z-50 flex gap-2 flex-wrap">
        <Button
          variant="outline"
          size="default"
          onClick={handleSaveToCloud}
          disabled={saving || loading}
          className="bg-black/80 backdrop-blur-md border-primary text-primary font-mono text-xs"
          data-testid="button-save-cloud"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? "SALVANDO..." : "SALVAR"}
        </Button>
        <Button
          variant="outline"
          size="default"
          onClick={handleLoadFromCloud}
          disabled={loadingSave || loading}
          className="bg-black/80 backdrop-blur-md border-primary text-primary font-mono text-xs"
          data-testid="button-load-cloud"
        >
          <Download className="w-4 h-4 mr-2" />
          {loadingSave ? "CARREGANDO..." : "CARREGAR"}
        </Button>
      </div>
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-mono text-sm text-primary animate-pulse">CARREGANDO...</p>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="font-mono text-sm text-center text-foreground max-w-md">{error}</p>
          <Button variant="default" onClick={handleBack} className="font-mono text-xs mt-4">
            VOLTAR AO MENU
          </Button>
        </div>
      )}
      
      {!error && (
        <div
          id="game"
          ref={gameContainerRef}
          className="w-full h-full"
          style={{ width: "100%", height: "100%", contain: "layout style paint" }}
        />
      )}
    </div>
  );
}
