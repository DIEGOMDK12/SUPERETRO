import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";

declare global {
  interface Window {
    EJS_player: string;
    EJS_core: string;
    EJS_gameUrl: string;
    EJS_pathtodata: string;
    EJS_startOnLoaded: boolean;
  }
}

export default function Play() {
  const [, setLocation] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const core = params.get("core") || "snes";
    const game = params.get("game") || "";

    if (!game) {
      setLocation("/");
      return;
    }

    if (scriptLoaded.current) return;
    scriptLoaded.current = true;

    const isLocalFile = game.startsWith("/") || game.startsWith("./");
    const gameUrl = isLocalFile ? game : `/api/rom?url=${encodeURIComponent(game)}`;
    
    window.EJS_player = "#game";
    window.EJS_core = core;
    window.EJS_gameUrl = gameUrl;
    window.EJS_pathtodata = "https://cdn.emulatorjs.org/stable/data/";
    window.EJS_startOnLoaded = true;

    fetch(gameUrl, { method: "HEAD" })
      .then((res) => {
        if (!res.ok) {
          throw new Error("ROM não disponível no momento");
        }
        setLoading(false);
        const script = document.createElement("script");
        script.src = "https://cdn.emulatorjs.org/stable/data/loader.js";
        script.async = true;
        document.body.appendChild(script);
      })
      .catch(() => {
        setLoading(false);
        setError("O Archive.org está temporariamente indisponível. Tente novamente em alguns minutos.");
      });
  }, [setLocation]);

  const handleBack = () => {
    window.location.href = "/";
  };

  return (
    <div className="fixed inset-0 bg-black">
      <Button
        variant="outline"
        size="default"
        onClick={handleBack}
        className="fixed top-4 left-4 z-50 bg-black/80 backdrop-blur-md border-primary text-primary font-mono text-xs"
        data-testid="button-back"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        VOLTAR AO MENU
      </Button>
      
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
          ref={containerRef}
          className="w-full h-full"
          style={{ width: "100%", height: "100%" }}
        />
      )}
    </div>
  );
}
