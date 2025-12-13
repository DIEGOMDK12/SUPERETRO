import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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

    window.EJS_player = "#game";
    window.EJS_core = core;
    window.EJS_gameUrl = game;
    window.EJS_pathtodata = "https://cdn.emulatorjs.org/stable/data/";
    window.EJS_startOnLoaded = true;

    const script = document.createElement("script");
    script.src = "https://cdn.emulatorjs.org/stable/data/loader.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
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
      <div
        id="game"
        ref={containerRef}
        className="w-full h-full"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
