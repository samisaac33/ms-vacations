"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { GalleryImage } from "@/lib/property-photo-groups";
import { groupPropertyPhotos } from "@/lib/property-photo-groups";
import { shareUrl } from "@/lib/share";

type Props = {
  images: GalleryImage[];
  propertyName: string;
  shareUrl: string;
  onClose: () => void;
};

function ShareButton({ propertyName, url }: { propertyName: string; url: string }) {
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleShare() {
    const result = await shareUrl({
      title: propertyName,
      text: `Mira ${propertyName} en MS Vacations`,
      url,
    });
    if (result === "copied") setFeedback("Enlace copiado");
    else if (result === "shared") setFeedback("Compartido");
    setTimeout(() => setFeedback(null), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-sand-dark"
      aria-label="Compartir"
    >
      {feedback ? (
        <span className="absolute -bottom-8 right-0 whitespace-nowrap rounded bg-ink px-2 py-1 text-xs text-white">
          {feedback}
        </span>
      ) : null}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 3v12M7 8l5-5 5 5M5 21h14"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function ExpandedView({
  images,
  index,
  onBack,
  onPrev,
  onNext,
}: {
  images: GalleryImage[];
  index: number;
  onBack: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onBack();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onBack, onNext, onPrev]);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-ink/95">
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10"
          aria-label="Volver al recorrido"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M15 6l-6 6 6 6"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <p className="text-sm font-medium">
          {index + 1} / {images.length}
        </p>
        <div className="w-9" />
      </div>
      <div className="relative flex flex-1 items-center justify-center px-4 pb-8">
        <button
          type="button"
          onClick={onPrev}
          className="absolute left-2 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-xl text-white hover:bg-white/25"
          aria-label="Foto anterior"
        >
          ‹
        </button>
        <div className="relative h-full w-full max-h-[75vh] max-w-5xl">
          <Image
            src={images[index]!.src}
            alt={images[index]!.alt}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
        </div>
        <button
          type="button"
          onClick={onNext}
          className="absolute right-2 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-xl text-white hover:bg-white/25"
          aria-label="Foto siguiente"
        >
          ›
        </button>
      </div>
    </div>
  );
}

function SectionGrid({
  sectionImages,
  onOpen,
}: {
  sectionImages: { image: GalleryImage; globalIndex: number }[];
  onOpen: (index: number) => void;
}) {
  const [hero, ...rest] = sectionImages;

  return (
    <div className="space-y-2">
      {hero && (
        <button
          type="button"
          onClick={() => onOpen(hero.globalIndex)}
          className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-sand-dark"
        >
          <Image
            src={hero.image.src}
            alt={hero.image.alt}
            fill
            className="object-cover"
            sizes="100vw"
          />
        </button>
      )}
      {rest.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {rest.map(({ image, globalIndex }) => (
            <button
              key={`${image.src}-${globalIndex}`}
              type="button"
              onClick={() => onOpen(globalIndex)}
              className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-sand-dark"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                sizes="50vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function PropertyPhotoTour({
  images,
  propertyName,
  shareUrl: shareLink,
  onClose,
}: Props) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const sections = groupPropertyPhotos(images);

  const goPrev = useCallback(() => {
    setExpandedIndex((i) => {
      if (i === null) return null;
      return i <= 0 ? images.length - 1 : i - 1;
    });
  }, [images.length]);

  const goNext = useCallback(() => {
    setExpandedIndex((i) => {
      if (i === null) return null;
      return i >= images.length - 1 ? 0 : i + 1;
    });
  }, [images.length]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && expandedIndex === null) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [expandedIndex, onClose]);

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex flex-col bg-white"
        role="dialog"
        aria-modal="true"
        aria-label="Recorrido fotográfico"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-sand-dark bg-white px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-sand-dark"
            aria-label="Cerrar recorrido"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M15 6l-6 6 6 6"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h2 className="text-base font-semibold text-ink">Recorrido fotográfico</h2>
          <div className="relative">
            <ShareButton propertyName={propertyName} url={shareLink} />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 pb-8 pt-4">
          {sections.map((section) => (
            <section key={section.id} className="mb-8">
              <h3 className="mb-3 text-lg font-semibold text-ink">{section.title}</h3>
              <SectionGrid
                sectionImages={section.images}
                onOpen={(index) => setExpandedIndex(index)}
              />
            </section>
          ))}
        </div>
      </div>

      {expandedIndex !== null && (
        <ExpandedView
          images={images}
          index={expandedIndex}
          onBack={() => setExpandedIndex(null)}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}
    </>
  );
}
