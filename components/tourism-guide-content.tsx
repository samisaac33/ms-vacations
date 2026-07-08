import Link from "next/link";
import type { TourismFaq, TourismSection } from "@/lib/tourism-guide";

type Props = {
  sections: TourismSection[];
  faqs: TourismFaq[];
};

export function TourismGuideContent({ sections, faqs }: Props) {
  return (
    <div className="mt-10 space-y-12">
      {sections.map((section) => (
        <section key={section.id} id={section.id} className="scroll-mt-24">
          <h2 className="text-xl font-semibold text-ink">{section.title}</h2>
          <div className="prose-legal mt-4">
            {section.paragraphs?.map((p) => (
              <p key={p.slice(0, 48)}>{p}</p>
            ))}
            {section.list?.length ? (
              <ul>
                {section.list.map((item) => (
                  <li key={item.slice(0, 48)}>{item}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      ))}

      <section id="preguntas-frecuentes" className="scroll-mt-24">
        <h2 className="text-xl font-semibold text-ink">Preguntas frecuentes</h2>
        <dl className="mt-6 space-y-6">
          {faqs.map(({ question, answer }) => (
            <div key={question} className="card p-5">
              <dt className="font-semibold text-ink">{question}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted">{answer}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

export function TourismGuideNav({ sections }: { sections: TourismSection[] }) {
  return (
    <nav
      aria-label="Contenido de la guía"
      className="card mt-8 p-5 sm:p-6"
    >
      <p className="text-sm font-semibold text-ink">En esta guía</p>
      <ul className="mt-3 flex flex-col gap-2 text-sm">
        {sections.map((s) => (
          <li key={s.id}>
            <Link href={`#${s.id}`} className="text-ocean hover:underline">
              {s.title}
            </Link>
          </li>
        ))}
        <li>
          <Link href="#preguntas-frecuentes" className="text-ocean hover:underline">
            Preguntas frecuentes
          </Link>
        </li>
      </ul>
    </nav>
  );
}
