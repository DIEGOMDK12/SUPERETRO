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
    title: "Super Mario World",
    core: "snes",
    cover: "https://upload.wikimedia.org/wikipedia/en/3/32/Super_Mario_World_Coverart.png",
    rom: "https://archive.org/download/SuperMarioWorld_201903/Super%20Mario%20World.zip",
  },
  {
    id: 2,
    title: "Donkey Kong Country",
    core: "snes",
    cover: "https://upload.wikimedia.org/wikipedia/en/c/c1/Donkey_Kong_Country_SNES_cover.png",
    rom: "https://archive.org/download/DonkeyKongCountry_201903/Donkey%20Kong%20Country.zip",
  },
  {
    id: 3,
    title: "Zelda - A Link to the Past",
    core: "snes",
    cover: "https://upload.wikimedia.org/wikipedia/en/2/21/The_Legend_of_Zelda_A_Link_to_the_Past_SNES_Game_Cover.jpg",
    rom: "https://archive.org/download/LegendOfZeldaTheALinkToThePast_201903/Legend%20of%20Zelda%2C%20The%20-%20A%20Link%20to%20the%20Past.zip",
  },
  {
    id: 4,
    title: "Street Fighter II Turbo",
    core: "snes",
    cover: "https://upload.wikimedia.org/wikipedia/en/1/1d/SF2_JPN_flyer.jpg",
    rom: "https://archive.org/download/StreetFighter2Turbo_201812/Street%20Fighter%20II%20Turbo.zip",
  },
  {
    id: 5,
    title: "Super Bomberman 4",
    core: "snes",
    cover: "https://upload.wikimedia.org/wikipedia/en/8/85/Super_Bomberman_4_Coverart.png",
    rom: "/bomberman4.zip",
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
