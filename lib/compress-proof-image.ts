const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;
const MAX_BYTES = 5 * 1024 * 1024;

export type CompressedProof = {
  file: File;
  previewUrl: string;
};

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen."));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("No se pudo comprimir la imagen."));
          return;
        }
        resolve(blob);
      },
      type,
      quality,
    );
  });
}

async function compressImageFile(file: File): Promise<CompressedProof> {
  const img = await loadImageFromFile(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo procesar la imagen.");
  ctx.drawImage(img, 0, 0, width, height);

  const outputType = file.type === "image/png" ? "image/jpeg" : file.type;
  const blob = await canvasToBlob(canvas, outputType, JPEG_QUALITY);

  if (blob.size > MAX_BYTES) {
    throw new Error("La imagen sigue siendo muy grande. Prueba con otra foto.");
  }

  const baseName = file.name.replace(/\.[^.]+$/, "") || "comprobante";
  const ext = outputType === "image/webp" ? "webp" : outputType === "image/png" ? "png" : "jpg";
  const compressed = new File([blob], `${baseName}.${ext}`, { type: outputType });
  return { file: compressed, previewUrl: URL.createObjectURL(compressed) };
}

export async function prepareProofFile(file: File): Promise<CompressedProof> {
  if (file.type === "application/pdf") {
    if (file.size > MAX_BYTES) {
      throw new Error("El PDF supera el límite de 5 MB.");
    }
    return { file, previewUrl: "" };
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Formato no permitido. Use JPG, PNG, WEBP o PDF.");
  }

  if (file.size <= MAX_BYTES && file.type !== "image/png") {
    return { file, previewUrl: URL.createObjectURL(file) };
  }

  return compressImageFile(file);
}

export function revokeProofPreviewUrl(url: string) {
  if (url) URL.revokeObjectURL(url);
}
