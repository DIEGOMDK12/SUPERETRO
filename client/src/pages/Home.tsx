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

export default function Home() {
  const [, setLocation] = useLocation();

  const { data: apiGames = [] } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });

  const allGames: GameWithCore[] = [
    ...localGames,
    ...apiGames.map(g => ({ ...g, core: g.core || "snes" })),
  ];

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
        <GameGrid games={allGames} onPlayGame={handlePlayGame} />
      </main>
      <Footer />
    </div>
  );
}
