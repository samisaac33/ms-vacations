import Link from "next/link";

type Props = {
  slug: string;
  active: "precios" | "fotos";
};

export function AdminPropertySubnav({ slug, active }: Props) {
  const tabs = [
    { key: "precios" as const, href: `/admin/propiedades/${slug}/precios`, label: "Precios" },
    { key: "fotos" as const, href: `/admin/propiedades/${slug}/fotos`, label: "Fotos" },
  ];

  return (
    <nav
      aria-label="Secciones de la propiedad"
      className="mb-4 flex flex-wrap gap-2 border-b border-zinc-200 pb-3"
    >
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          aria-current={active === tab.key ? "page" : undefined}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
            active === tab.key
              ? "bg-zinc-900 text-white"
              : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
