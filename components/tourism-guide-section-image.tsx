import Image from "next/image";
import type { TourismSectionImage } from "@/lib/tourism-guide";

const ASPECT_DIMENSIONS = {
  "16/9": { width: 1280, height: 720 },
  "4/3": { width: 1200, height: 900 },
} as const;

type Props = {
  image: TourismSectionImage;
  priority?: boolean;
  className?: string;
};

export function TourismGuideSectionImage({ image, priority = false, className = "" }: Props) {
  const aspect = image.aspect ?? "4/3";
  const { width, height } = ASPECT_DIMENSIONS[aspect];

  return (
    <figure className={`overflow-hidden rounded-2xl bg-sand-dark ${className}`}>
      <Image
        src={image.src}
        alt={image.alt}
        width={width}
        height={height}
        priority={priority}
        className="h-auto w-full object-cover"
        sizes="(max-width: 768px) 100vw, 768px"
      />
    </figure>
  );
}
