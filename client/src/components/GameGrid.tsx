import GameCard from "./GameCard";

interface Game {
  id: number;
  title: string;
  core: string;
  cover: string;
  rom: string;
}

interface GameGridProps {
  games: Game[];
  onPlayGame: (game: Game) => void;
}

export default function GameGrid({ games, onPlayGame }: GameGridProps) {
  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-mono text-sm md:text-base text-center text-muted-foreground mb-8">
          SELECIONE UM JOGO
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {games.map((game) => (
            <GameCard key={game.id} game={game} onPlay={onPlayGame} />
          ))}
        </div>
      </div>
    </section>
  );
}
