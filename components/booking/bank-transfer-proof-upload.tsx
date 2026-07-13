"use client";

import { useRef, useState } from "react";
import { prepareProofFile, revokeProofPreviewUrl } from "@/lib/compress-proof-image";

type Props = {
  disabled?: boolean;
  onReady: (file: File | null, previewUrl: string | null) => void;
};

export function BankTransferProofUpload({ disabled = false, onReady }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      if (previewUrl) revokeProofPreviewUrl(previewUrl);
      const prepared = await prepareProofFile(file);
      setPreviewUrl(prepared.previewUrl || null);
      setFileName(prepared.file.name);
      setIsPdf(prepared.file.type === "application/pdf");
      onReady(prepared.file, prepared.previewUrl || null);
    } catch (err) {
      onReady(null, null);
      setPreviewUrl(null);
      setFileName(null);
      setIsPdf(false);
      setError(err instanceof Error ? err.message : "No se pudo procesar el archivo.");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleClear() {
    if (previewUrl) revokeProofPreviewUrl(previewUrl);
    setPreviewUrl(null);
    setFileName(null);
    setIsPdf(false);
    setError(null);
    onReady(null, null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-3 rounded-2xl border border-sand-dark bg-sand/30 p-4">
      <p className="text-sm font-medium text-ink">Subir comprobante</p>
      <p className="text-xs text-muted">JPG, PNG, WEBP o PDF. Las imágenes se comprimen automáticamente.</p>

      <div className="flex min-h-[140px] items-center justify-center overflow-hidden rounded-xl border border-dashed border-sand-dark bg-white">
        {loading ? (
          <p className="text-sm text-muted">Comprimiendo…</p>
        ) : previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Vista previa del comprobante" className="max-h-48 w-full object-contain" />
        ) : isPdf && fileName ? (
          <div className="px-4 text-center">
            <p className="text-sm font-medium text-ink">{fileName}</p>
            <p className="mt-1 text-xs text-muted">PDF listo para enviar</p>
          </div>
        ) : (
          <p className="px-4 text-center text-sm text-muted">La vista previa aparecerá aquí</p>
        )}
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled || loading}
          onClick={() => inputRef.current?.click()}
          className="flex h-11 flex-1 items-center justify-center rounded-xl bg-ocean px-4 text-sm font-semibold text-white transition-colors hover:bg-ocean-dark disabled:opacity-50"
        >
          {fileName ? "Cambiar imagen" : "Subir comprobante"}
        </button>
        {fileName && (
          <button
            type="button"
            disabled={disabled || loading}
            onClick={handleClear}
            className="h-11 rounded-xl border border-sand-dark px-4 text-sm font-semibold text-ink hover:bg-sand/50"
          >
            Quitar
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        disabled={disabled || loading}
        onChange={handleFileChange}
      />
    </div>
  );
}
