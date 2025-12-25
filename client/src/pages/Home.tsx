import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import GameGrid from "@/components/GameGrid";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Game, Capybara } from "@shared/schema";
import marioWorldCover from "@assets/super-mario-world_1766698426438.jpg";

interface GameWithCore extends Game {
  core: string;
}

const localGames: GameWithCore[] = [
  {
    id: -1,
    title: "Super Mario World",
    core: "snes",
    cover: marioWorldCover,
    rom: "/super-mario-world.zip",
  },
  {
    id: -2,
    title: "Super Bomberman 4",
    core: "snes",
    cover: "https://upload.wikimedia.org/wikipedia/en/8/85/Super_Bomberman_4_Coverart.png",
    rom: "/bomberman4.zip",
  },
];

const platforms = [
  { id: "all", name: "Todos" },
  { id: "snes", name: "SNS" },
  { id: "n64", name: "SNS-64" },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const [selectedPlatform, setSelectedPlatform] = useState("all");

  const { data: apiGames = [] } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });

  const { data: capybaras = [] } = useQuery<Capybara[]>({
    queryKey: ["/api/capybaras"],
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
      <main className="flex-1 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="flex justify-center gap-2 mb-6">
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
            </div>

            <div className="space-y-6">
              <Card className="hover-elevate">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    Capy Capture
                    <Badge variant="secondary" className="ml-auto">Live</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Latest capybara sightings in the retro gaming universe.
                  </p>
                  <div className="space-y-4">
                    {capybaras.length > 0 ? (
                      capybaras.map((capy) => (
                        <div key={capy.id} className="flex gap-3 items-start border-b pb-3 last:border-0">
                          <img 
                            src={capy.imageUrl} 
                            alt={capy.name} 
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{capy.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{capy.location}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs italic text-center text-muted-foreground py-4">
                        No sightings recorded yet...
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
