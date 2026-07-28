"use client";

import { useState } from "react";
import { PropertyDetailModal, ShowMoreButton } from "@/components/property-detail-modal";
import {
  aboutPreviewText,
  resolvePropertyAbout,
  shouldShowAboutMore,
} from "@/lib/property-detail-content";
import type { Property } from "@/lib/properties";

type Props = {
  property: Property;
};

function AboutContent({ property }: Props) {
  const about = resolvePropertyAbout(property);

  return (
    <div className="space-y-6 text-ink">
      <p className="leading-relaxed">{about.intro}</p>
      {about.sections.map((section) => (
        <section key={section.title}>
          <h3 className="text-lg font-semibold">{section.title}</h3>
          {section.lead ? <p className="mt-3 font-semibold leading-relaxed">{section.lead}</p> : null}
          <div className="mt-3 space-y-3 leading-relaxed text-muted">
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function PropertyAboutPanel({ property }: Props) {
  const [open, setOpen] = useState(false);
  const about = resolvePropertyAbout(property);
  const preview = aboutPreviewText(about);
  const showMore = shouldShowAboutMore(about);

  return (
    <section>
      <div className="line-clamp-6 whitespace-pre-line leading-relaxed text-muted">{preview}</div>
      {showMore ? (
        <ShowMoreButton label="Mostrar más" onClick={() => setOpen(true)} />
      ) : null}

      <PropertyDetailModal
        open={open}
        title="Sobre la propiedad"
        onClose={() => setOpen(false)}
      >
        <AboutContent property={property} />
      </PropertyDetailModal>
    </section>
  );
}
