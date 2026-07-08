import type { LegalSection } from "@/lib/legal/types";

type Props = {
  sections: LegalSection[];
  lastUpdated?: string;
  intro?: string;
};

export function LegalDocument({ sections, lastUpdated, intro }: Props) {
  return (
    <div className="prose-legal mt-8">
      {lastUpdated ? (
        <p className="text-xs text-muted/80">Última actualización: {lastUpdated}</p>
      ) : null}
      {intro ? <p>{intro}</p> : null}
      {sections.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          {section.paragraphs?.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
          {section.list?.length ? (
            <ul>
              {section.list.map((item) => (
                <li key={item.slice(0, 48)}>{item}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </div>
  );
}
