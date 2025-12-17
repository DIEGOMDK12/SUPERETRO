import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import GameGrid from "@/components/GameGrid";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import type { Game } from "@shared/schema";

interface GameWithCore extends Game {
  core: string;
}

const localGames: GameWithCore[] = [
  {
    id: -1,
    title: "Super Bomberman 4",
    core: "snes",
    cover: "https://upload.wikimedia.org/wikipedia/en/8/85/Super_Bomberman_4_Coverart.png",
    rom: "/bomberman4.zip",
  },
  {
    id: -2,
    title: "X-Men - Mutant Apocalypse",
    core: "snes",
    cover: "https://upload.wikimedia.org/wikipedia/en/7/7f/X-Men_Mutant_Apocalypse_cover.jpg",
    rom: "/xmen-mutant-apocalypse.zip",
  },
];

const platforms = [
  { id: "all", name: "Todos" },
  { id: "snes", name: "Super Nintendo" },
  { id: "n64", name: "Nintendo 64" },
  { id: "psx", name: "PlayStation 1" },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const [selectedPlatform, setSelectedPlatform] = useState("all");

  const { data: apiGames = [] } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });

  const allGames: GameWithCore[] = [
    ...localGames,
    ...apiGames.map(g => ({ ...g, core: g.core || "snes" })),
  ];

  const filteredGames = selectedPlatform === "all" 
    ? allGames 
    : allGames.filter(g => g.core === selectedPlatform);

  const handlePlayGame = (game: GameWithCore) => {
    const params = new URLSearchParams({
      core: game.core,
      game: game.rom,
    });
    setLocation(`/play?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="absolute top-4 right-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon" data-testid="button-admin">
            <Settings className="h-5 w-5" />
          </Button>
        </Link>
      </div>
      <main className="flex-1">
        <div className="flex justify-center gap-2 mb-6 px-4">
          {platforms.map((platform) => (
            <Button
              key={platform.id}
              variant={selectedPlatform === platform.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPlatform(platform.id)}
              data-testid={`button-platform-${platform.id}`}
              className="font-mono text-xs"
            >
              {platform.name}
            </Button>
          ))}
        </div>
        <GameGrid games={filteredGames} onPlayGame={handlePlayGame} />
      </main>
      <Footer />
    </div>
  );
}
