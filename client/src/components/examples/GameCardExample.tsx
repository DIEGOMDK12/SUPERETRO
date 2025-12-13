import GameCard from "../GameCard";

export default function GameCardExample() {
  const mockGame = {
    id: 1,
    title: "Super Mario World",
    core: "snes",
    cover: "https://upload.wikimedia.org/wikipedia/en/3/32/Super_Mario_World_Coverart.png",
    rom: "https://example.com/game.zip",
  };

  return (
    <div className="max-w-xs">
      <GameCard game={mockGame} onPlay={(g) => console.log("Playing:", g.title)} />
    </div>
  );
}
