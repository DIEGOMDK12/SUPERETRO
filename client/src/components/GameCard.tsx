import { memo } from "react";
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

const GameCard = memo(function GameCard({ game, onPlay }: GameCardProps) {
  return (
    <Card
      data-testid={`card-game-${game.id}`}
      className="group cursor-pointer overflow-visible border-4 border-card-border bg-card will-change-auto"
      onClick={() => onPlay(game)}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={game.cover}
          alt={game.title}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          width={200}
          height={267}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-active:opacity-100" />
        <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-active:opacity-100">
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
});

export default GameCard;
