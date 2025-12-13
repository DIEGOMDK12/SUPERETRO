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
        <div className="inline-block border-8 border-primary bg-background px-8 py-6 shadow-[8px_8px_0px_0px_rgba(139,92,246,0.3)]">
          <h1
            className="font-mono text-2xl md:text-4xl lg:text-5xl text-foreground tracking-wider"
            data-testid="text-title"
          >
            SUPER NINTENDO
          </h1>
          <h2 className="font-mono text-lg md:text-2xl lg:text-3xl text-primary mt-2">
            CLOUD
          </h2>
        </div>
        <p className="mt-8 font-sans text-sm md:text-base text-muted-foreground max-w-md mx-auto">
          Jogue os clássicos do SNES diretamente no seu navegador
        </p>
      </div>
    </header>
  );
}
