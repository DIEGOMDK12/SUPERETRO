import { Card } from "@/components/ui/card";

interface Game {
  id: number;
  title: string;
  core: string;
  cover: string;
  rom: string;
}

interface GameCardProps {
  game: Game;
  onPlay: (game: Game) => void;
}

export default function GameCard({ game, onPlay }: GameCardProps) {
  return (
    <Card
      data-testid={`card-game-${game.id}`}
      className="group cursor-pointer overflow-visible border-4 border-card-border bg-card transition-transform duration-200 hover:scale-105"
      onClick={() => onPlay(game)}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={game.cover}
          alt={game.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full transition-transform duration-200 group-hover:translate-y-0">
          <span className="font-mono text-xs text-primary">PRESSIONE PARA JOGAR</span>
        </div>
      </div>
      <div className="p-4 bg-card">
        <h3 className="font-mono text-xs leading-relaxed text-foreground line-clamp-2">
          {game.title}
        </h3>
      </div>
    </Card>
  );
}
