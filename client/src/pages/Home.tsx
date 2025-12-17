import { useLocation } from "wouter";
import Header from "@/components/Header";
import GameGrid from "@/components/GameGrid";
import Footer from "@/components/Footer";

interface Game {
  id: number;
  title: string;
  core: string;
  cover: string;
  rom: string;
}

const games: Game[] = [
  {
    id: 1,
    title: "Super Bomberman 4",
    core: "snes",
    cover: "https://upload.wikimedia.org/wikipedia/en/8/85/Super_Bomberman_4_Coverart.png",
    rom: "/bomberman4.zip",
  },
  {
    id: 2,
    title: "X-Men - Mutant Apocalypse",
    core: "snes",
    cover: "https://upload.wikimedia.org/wikipedia/en/7/7f/X-Men_Mutant_Apocalypse_cover.jpg",
    rom: "/xmen-mutant-apocalypse.zip",
  },
];

export default function Home() {
  const [, setLocation] = useLocation();

  const handlePlayGame = (game: Game) => {
    const params = new URLSearchParams({
      core: game.core,
      game: game.rom,
    });
    setLocation(`/play?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <GameGrid games={games} onPlayGame={handlePlayGame} />
      </main>
      <Footer />
    </div>
  );
}
