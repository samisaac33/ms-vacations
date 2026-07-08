import Link from "next/link";

function LogoIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      className="h-8 w-8 text-primary"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16 2C9.373 2 4 7.373 4 14c0 7.5 12 16 12 16s12-8.5 12-16c0-6.627-5.373-12-12-12zm0 17a5 5 0 110-10 5 5 0 010 10z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-6 md:px-10">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <LogoIcon />
          <span className="hidden text-lg font-bold tracking-tight text-primary sm:inline">
            ms-vacations
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Principal">
          <Link
            href="/"
            className="text-sm font-medium text-foreground underline decoration-primary decoration-2 underline-offset-4"
          >
            Mis vacaciones
          </Link>
          <Link
            href="#"
            className="text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Solicitudes
          </Link>
          <Link
            href="#"
            className="text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Equipo
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="hidden rounded-full px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface sm:block"
          >
            Conviértete en host
          </button>
          <button
            type="button"
            aria-label="Idioma y región"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-surface"
          >
            <GlobeIcon />
          </button>
          <button
            type="button"
            aria-label="Menú de usuario"
            className="flex items-center gap-3 rounded-full border border-border py-1.5 pl-3 pr-1.5 transition-shadow hover:shadow-md"
          >
            <MenuIcon />
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-semibold text-white">
              SA
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
