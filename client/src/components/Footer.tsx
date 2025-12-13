export default function Footer() {
  return (
    <footer className="py-8 text-center border-t border-border">
      <p className="font-sans text-xs text-muted-foreground">
        Powered by EmulatorJS
      </p>
      <p className="font-sans text-xs text-muted-foreground mt-2">
        ROMs provided by{" "}
        <a
          href="https://archive.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
          data-testid="link-archive"
        >
          Archive.org
        </a>
      </p>
      <p className="font-mono text-xs text-muted-foreground mt-4 opacity-50">
        &copy; 2024 SUPER NINTENDO CLOUD
      </p>
    </footer>
  );
}
