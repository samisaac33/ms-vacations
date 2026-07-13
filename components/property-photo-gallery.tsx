"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { PropertyPhotoTour } from "@/components/property-photo-tour";
import type { GalleryImage } from "@/lib/property-photo-groups";
import { shareUrl } from "@/lib/share";

type Props = {
  images: GalleryImage[];
  propertyName: string;
  shareLink?: string;
  catalogHref?: string;
  onOpenTour?: (index: number) => void;
};

const PLACEHOLDER = "/properties/placeholder-1.svg";

function GalleryTile({
  image,
  index,
  className,
  sizes,
  priority,
  onOpen,
}: {
  image: GalleryImage;
  index: number;
  className: string;
  sizes: string;
  priority?: boolean;
  onOpen: (index: number) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      className={`property-gallery-tile group relative overflow-hidden bg-sand-dark ${className}`}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        priority={priority}
        className="object-cover transition duration-300 group-hover:brightness-95"
        sizes={sizes}
      />
    </button>
  );
}

function PhotoLightbox({
  images,
  startIndex,
  initialGridView = false,
  onClose,
}: {
  images: GalleryImage[];
  startIndex: number;
  initialGridView?: boolean;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const [gridView, setGridView] = useState(initialGridView);

  const goPrev = useCallback(() => {
    setIndex((i) => (i <= 0 ? images.length - 1 : i - 1));
  }, [images.length]);

  const goNext = useCallback(() => {
    setIndex((i) => (i >= images.length - 1 ? 0 : i + 1));
  }, [images.length]);

  useEffect(() => {
    setIndex(startIndex);
    setGridView(initialGridView);
  }, [startIndex, initialGridView]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (!gridView && e.key === "ArrowLeft") goPrev();
      if (!gridView && e.key === "ArrowRight") goNext();
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [gridView, goNext, goPrev, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-ink/95"
      role="dialog"
      aria-modal="true"
      aria-label="Galería de fotos"
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3 text-white sm:px-6">
        <p className="text-sm font-medium">
          {gridView ? `${images.length} fotos` : `${index + 1} / ${images.length}`}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setGridView((v) => !v)}
            className="rounded-lg border border-white/30 px-3 py-1.5 text-sm hover:bg-white/10"
          >
            {gridView ? "Vista ampliada" : "Ver todas"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10"
            aria-label="Cerrar galería"
          >
            ✕
          </button>
        </div>
      </div>

      {gridView ? (
        <div className="flex-1 overflow-y-auto px-4 pb-8 sm:px-6">
          <div className="mx-auto grid max-w-5xl gap-3 sm:grid-cols-2">
            {images.map((img, i) => (
              <button
                key={`${img.src}-${i}`}
                type="button"
                onClick={() => {
                  setIndex(i);
                  setGridView(false);
                }}
                className="relative aspect-[4/3] overflow-hidden rounded-xl bg-sand-dark"
              >
                <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="50vw" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="relative flex flex-1 items-center justify-center px-4 pb-8 sm:px-14">
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-xl text-white hover:bg-white/25 sm:inline-flex"
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
            onClick={goNext}
            className="absolute right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-xl text-white hover:bg-white/25 sm:inline-flex"
            aria-label="Foto siguiente"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}

function ShowAllButton({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute bottom-4 right-4 z-10 rounded-lg border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-md transition hover:bg-sand"
    >
      Mostrar todas las fotos ({count})
    </button>
  );
}

function MobileShareButton({ propertyName }: { propertyName: string }) {
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const result = await shareUrl({
      title: propertyName,
      text: `Mira ${propertyName} en MS Vacations`,
      url,
    });
    if (result === "copied") setFeedback("Copiado");
    else if (result === "shared") setFeedback("Compartido");
    setTimeout(() => setFeedback(null), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink shadow-md backdrop-blur-sm"
      aria-label="Compartir"
    >
      {feedback ? (
        <span className="sr-only">{feedback}</span>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 3v12M7 8l5-5 5 5M5 21h14"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}

function MobilePhotoCarousel({
  images,
  propertyName,
  catalogHref,
  onOpenTour,
}: {
  images: GalleryImage[];
  propertyName: string;
  catalogHref: string;
  onOpenTour: (index: number) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function onScroll() {
      const container = scrollRef.current;
      if (!container) return;
      const slideWidth = container.offsetWidth * 0.92 + 8;
      const idx = Math.round(container.scrollLeft / slideWidth);
      setActiveIndex(Math.min(Math.max(idx, 0), images.length - 1));
    }

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [images.length]);

  return (
    <div className="relative -mx-4 sm:-mx-6">
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-4">
        <Link
          href={catalogHref}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink shadow-md backdrop-blur-sm"
          aria-label="Volver al catálogo"
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
        </Link>
        <MobileShareButton propertyName={propertyName} />
      </div>

      <div
        ref={scrollRef}
        className="scrollbar-none flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth px-[4vw]"
      >
        {images.map((img, i) => (
          <button
            key={`${img.src}-${i}`}
            type="button"
            onClick={() => onOpenTour(i)}
            className="relative aspect-[4/3] w-[92vw] shrink-0 snap-center overflow-hidden rounded-2xl bg-sand-dark"
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              priority={i === 0}
              className="object-cover"
              sizes="92vw"
            />
          </button>
        ))}
      </div>

      <div className="absolute bottom-4 right-6 rounded-lg bg-ink/70 px-2.5 py-1 text-xs font-medium text-white">
        {activeIndex + 1} / {images.length}
      </div>
    </div>
  );
}

export function PropertyPhotoGallery({
  images,
  propertyName,
  shareLink,
  catalogHref = "/propiedades",
  onOpenTour,
}: Props) {
  const [lightbox, setLightbox] = useState<{ index: number; grid: boolean } | null>(null);
  const [internalTour, setInternalTour] = useState<{ index: number } | null>(null);
  const [resolvedShareLink, setResolvedShareLink] = useState(shareLink ?? "");

  useEffect(() => {
    if (!shareLink && typeof window !== "undefined") {
      setResolvedShareLink(window.location.href);
    }
  }, [shareLink]);

  const galleryImages =
    images.length > 0
      ? images
      : [{ src: PLACEHOLDER, alt: `${propertyName} — imagen no disponible` }];

  const openLightbox = (index: number) => {
    setLightbox({ index, grid: false });
  };

  const openGridLightbox = () => {
    setLightbox({ index: 0, grid: true });
  };

  const count = galleryImages.length;
  const hasMany = count > 5;

  const handleOpenTour = (index: number) => {
    if (onOpenTour) {
      onOpenTour(index);
    } else {
      setInternalTour({ index });
    }
  };

  return (
    <div className="mt-0 lg:mt-6">
      <div className="lg:hidden">
        <MobilePhotoCarousel
          images={galleryImages}
          propertyName={propertyName}
          catalogHref={catalogHref}
          onOpenTour={handleOpenTour}
        />
      </div>

      <div className="relative hidden lg:block">
        {count === 1 && (
          <button
            type="button"
            onClick={() => openLightbox(0)}
            className="property-gallery-tile relative h-[28rem] w-full overflow-hidden rounded-2xl bg-sand-dark"
          >
            <Image
              src={galleryImages[0]!.src}
              alt={galleryImages[0]!.alt}
              fill
              priority
              className="object-cover"
              sizes="80vw"
            />
          </button>
        )}

        {count === 2 && (
          <div className="property-gallery-mosaic grid h-[28rem] grid-cols-2 gap-1 overflow-hidden rounded-2xl">
            {galleryImages.map((img, i) => (
              <GalleryTile
                key={`${img.src}-${i}`}
                image={img}
                index={i}
                className="h-full"
                sizes="40vw"
                priority={i === 0}
                onOpen={openLightbox}
              />
            ))}
          </div>
        )}

        {count === 3 && (
          <div className="property-gallery-mosaic grid h-[28rem] grid-cols-2 gap-1 overflow-hidden rounded-2xl">
            <GalleryTile
              image={galleryImages[0]!}
              index={0}
              className="row-span-2 h-full"
              sizes="40vw"
              priority
              onOpen={openLightbox}
            />
            <GalleryTile
              image={galleryImages[1]!}
              index={1}
              className="h-full"
              sizes="25vw"
              onOpen={openLightbox}
            />
            <GalleryTile
              image={galleryImages[2]!}
              index={2}
              className="h-full"
              sizes="25vw"
              onOpen={openLightbox}
            />
          </div>
        )}

        {count === 4 && (
          <div className="property-gallery-mosaic grid h-[28rem] grid-cols-2 grid-rows-2 gap-1 overflow-hidden rounded-2xl">
            {galleryImages.map((img, i) => (
              <GalleryTile
                key={`${img.src}-${i}`}
                image={img}
                index={i}
                className="h-full"
                sizes="30vw"
                priority={i === 0}
                onOpen={openLightbox}
              />
            ))}
          </div>
        )}

        {count >= 5 && (
          <div className="property-gallery-mosaic grid h-[28rem] grid-cols-4 grid-rows-2 gap-1 overflow-hidden rounded-2xl">
            <GalleryTile
              image={galleryImages[0]!}
              index={0}
              className="col-span-2 row-span-2 h-full"
              sizes="40vw"
              priority
              onOpen={openLightbox}
            />
            <GalleryTile
              image={galleryImages[1]!}
              index={1}
              className="col-start-3 row-start-1 h-full"
              sizes="20vw"
              onOpen={openLightbox}
            />
            <GalleryTile
              image={galleryImages[2]!}
              index={2}
              className="col-start-4 row-start-1 h-full"
              sizes="20vw"
              onOpen={openLightbox}
            />
            <GalleryTile
              image={galleryImages[3]!}
              index={3}
              className="col-start-3 row-start-2 h-full"
              sizes="20vw"
              onOpen={openLightbox}
            />
            <GalleryTile
              image={galleryImages[4]!}
              index={4}
              className="col-start-4 row-start-2 h-full"
              sizes="20vw"
              onOpen={openLightbox}
            />
          </div>
        )}

        {hasMany && <ShowAllButton count={count} onClick={openGridLightbox} />}
      </div>

      {lightbox !== null && (
        <PhotoLightbox
          images={galleryImages}
          startIndex={lightbox.index}
          initialGridView={lightbox.grid}
          onClose={() => setLightbox(null)}
        />
      )}

      {!onOpenTour && internalTour !== null && (
        <PropertyPhotoTour
          images={galleryImages}
          propertyName={propertyName}
          shareUrl={resolvedShareLink}
          onClose={() => setInternalTour(null)}
        />
      )}
    </div>
  );
}
