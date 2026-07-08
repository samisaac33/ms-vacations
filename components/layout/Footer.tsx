export function Footer() {
  const sections = [
    {
      title: "Soporte",
      links: ["Centro de ayuda", "Información de seguridad", "Opciones de cancelación"],
    },
    {
      title: "Empresa",
      links: ["Sobre nosotros", "Empleo", "Prensa"],
    },
    {
      title: "Legal",
      links: ["Política de privacidad", "Términos y condiciones", "Cookies"],
    },
  ];

  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-10">
        <div className="grid gap-8 sm:grid-cols-3">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 text-sm font-semibold text-foreground">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted transition-colors hover:text-foreground hover:underline"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
          <p className="text-sm text-muted">
            © 2026 ms-vacations · Inspirado en experiencias que importan
          </p>
          <div className="flex gap-4 text-sm text-muted">
            <span>Español (ES)</span>
            <span>€ EUR</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
