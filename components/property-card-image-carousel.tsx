"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

const CATALOG_CARD_MAX_IMAGES = 10;
const TAP_MOVE_THRESHOLD_PX = 8;

const IMAGE_SIZES = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";
const PLACEHOLDER = "/properties/placeholder-1.svg";

type GalleryImage = { src: string; alt: string };

type Props = {
  images: GalleryImage[];
  propertyName: string;
  detailHref: string;
  children?: ReactNode;
};

function resolveSlides(images: GalleryImage[], propertyName: string): GalleryImage[] {
  const fromCatalog = images.slice(0, CATALOG_CARD_MAX_IMAGES);
  if (fromCatalog.length > 0) return fromCatalog;
  return [{ src: PLACEHOLDER, alt: `${propertyName} — imagen no disponible` }];
}

function CarouselDots({ count, activeIndex }: { count: number; activeIndex: number }) {
  if (count <= 1) return null;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5"
      aria-hidden
    >
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full transition-opacity ${
            i === activeIndex ? "bg-white opacity-100" : "bg-white/45"
          }`}
        />
      ))}
    </div>
  );
}

function CarouselSlide({
  image,
  propertyName,
  priority,
}: {
  image: GalleryImage;
  propertyName: string;
  priority?: boolean;
}) {
  return (
    <div className="relative h-full w-full shrink-0 snap-center snap-always">
      <Image
        src={image.src}
        alt={image.alt || propertyName}
        fill
        priority={priority}
        className="object-cover object-[center_62%]"
        sizes={IMAGE_SIZES}
      />
    </div>
  );
}

export function PropertyCardImageCarousel({
  images,
  propertyName,
  detailHref,
  children,
}: Props) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const pointerStartX = useRef<number | null>(null);
  const userScrolled = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = resolveSlides(images, propertyName);
  const isCarousel = slides.length > 1;

  useEffect(() => {
    if (!isCarousel) return;
    const el = scrollRef.current;
    if (!el) return;

    function onScroll() {
      userScrolled.current = true;
      const container = scrollRef.current;
      if (!container) return;
      const slideWidth = container.offsetWidth;
      if (slideWidth <= 0) return;
      const idx = Math.round(container.scrollLeft / slideWidth);
      setActiveIndex(Math.min(Math.max(idx, 0), slides.length - 1));
    }

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [isCarousel, slides.length]);

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    pointerStartX.current = event.clientX;
    userScrolled.current = false;
  }

  function handleClick(event: React.MouseEvent<HTMLDivElement>) {
    const startX = pointerStartX.current;
    pointerStartX.current = null;

    if (startX != null && Math.abs(event.clientX - startX) >= TAP_MOVE_THRESHOLD_PX) {
      return;
    }
    if (userScrolled.current) {
      userScrolled.current = false;
      return;
    }
    router.push(detailHref);
  }

  return (
    <div
      className="relative aspect-[16/10] w-full shrink-0 cursor-pointer overflow-hidden bg-sand-dark"
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      role="link"
      tabIndex={0}
      aria-label={`Ver fotos de ${propertyName}`}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(detailHref);
        }
      }}
    >
      {isCarousel ? (
        <div
          ref={scrollRef}
          className="scrollbar-none flex h-full snap-x snap-mandatory overflow-x-auto"
        >
          {slides.map((image, i) => (
            <CarouselSlide
              key={`${image.src}-${i}`}
              image={image}
              propertyName={propertyName}
              priority={i === 0}
            />
          ))}
        </div>
      ) : (
        <CarouselSlide image={slides[0]!} propertyName={propertyName} priority />
      )}

      {children ? (
        <div className="pointer-events-none absolute inset-0">{children}</div>
      ) : null}

      <CarouselDots count={slides.length} activeIndex={activeIndex} />
    </div>
  );
}
