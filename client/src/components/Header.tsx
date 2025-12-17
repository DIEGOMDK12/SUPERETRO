export default function Header() {
  return (
    <header className="relative py-12 text-center">
      <div className="absolute inset-0 opacity-10">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
          }}
        />
      </div>
      <div className="relative z-10">
        <div className="inline-block border-4 border-primary bg-background px-6 py-4 shadow-[0_0_20px_rgba(0,255,255,0.5),0_0_40px_rgba(0,255,255,0.3)]">
          <h1
            className="font-mono text-xl md:text-3xl lg:text-4xl text-foreground tracking-wider"
            data-testid="text-title"
          >
            RETRO GAMES
          </h1>
          <h2 className="font-mono text-base md:text-xl lg:text-2xl text-primary mt-2" style={{textShadow: '0 0 10px rgba(0,255,255,0.8)'}}>
            ARCADE
          </h2>
        </div>
        <p className="mt-8 font-sans text-sm md:text-base text-muted-foreground max-w-md mx-auto">
          Jogue os clássicos do SNES diretamente no seu navegador
        </p>
      </div>
    </header>
  );
}
