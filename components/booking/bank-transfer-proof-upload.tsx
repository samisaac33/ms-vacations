"use client";

import { useRef, useState } from "react";
import {
  PROOF_IMAGE_ACCEPT,
  PROOF_IMAGE_HELPER,
  PROOF_MAX_BYTES,
  PROOF_MAX_MB,
  prepareProofFile,
  revokeProofPreviewUrl,
} from "@/lib/compress-proof-image";

type Props = {
  disabled?: boolean;
  onReady: (file: File | null, previewUrl: string | null) => void;
};

const buttonPrimary =
  "flex h-11 w-full items-center justify-center rounded-xl bg-ocean px-4 text-sm font-semibold text-white transition-colors hover:bg-ocean-dark disabled:opacity-50";
const buttonSecondary =
  "flex h-11 flex-1 items-center justify-center rounded-xl border border-sand-dark px-4 text-sm font-semibold text-ink transition-colors hover:bg-sand/50 disabled:opacity-50";

export function BankTransferProofUpload({ disabled = false, onReady }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openFilePicker() {
    if (!disabled && !loading) inputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Formato no permitido. Use JPG, PNG o WEBP.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    if (file.size > PROOF_MAX_BYTES) {
      setError(`El archivo supera el límite de ${PROOF_MAX_MB} MB.`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setLoading(true);
    try {
      if (previewUrl) revokeProofPreviewUrl(previewUrl);
      const prepared = await prepareProofFile(file);
      setPreviewUrl(prepared.previewUrl || null);
      setFileName(prepared.file.name);
      onReady(prepared.file, prepared.previewUrl || null);
    } catch (err) {
      onReady(null, null);
      setPreviewUrl(null);
      setFileName(null);
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
    setError(null);
    onReady(null, null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const hasFile = Boolean(fileName);

  return (
    <div className="space-y-3 rounded-2xl border border-sand-dark bg-sand/30 p-4">
      <p className="text-sm font-medium text-ink">Subir comprobante</p>
      <p className="text-xs text-muted">{PROOF_IMAGE_HELPER}</p>

      <div
        role={!hasFile && !loading ? "button" : undefined}
        tabIndex={!hasFile && !loading ? 0 : undefined}
        onClick={!hasFile && !loading ? openFilePicker : undefined}
        onKeyDown={
          !hasFile && !loading
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openFilePicker();
                }
              }
            : undefined
        }
        className={`flex min-h-[140px] items-center justify-center overflow-hidden rounded-xl border border-dashed border-sand-dark bg-white ${
          !hasFile && !loading ? "cursor-pointer hover:bg-sand/20" : ""
        }`}
      >
        {loading ? (
          <p className="text-sm text-muted">Procesando imagen…</p>
        ) : previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Vista previa del comprobante" className="max-h-48 w-full object-contain" />
        ) : (
          <p className="px-4 text-center text-sm text-muted">Toca para elegir una imagen</p>
        )}
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}

      {hasFile ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <button type="button" disabled={disabled || loading} onClick={openFilePicker} className={buttonSecondary}>
              Cambiar imagen
            </button>
            <button type="button" disabled={disabled || loading} onClick={handleClear} className={buttonSecondary}>
              Quitar
            </button>
          </div>
          <button type="button" disabled={disabled || loading} onClick={openFilePicker} className={buttonPrimary}>
            Subir imagen
          </button>
        </div>
      ) : (
        <button type="button" disabled={disabled || loading} onClick={openFilePicker} className={buttonPrimary}>
          Subir imagen
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={PROOF_IMAGE_ACCEPT}
        className="hidden"
        disabled={disabled || loading}
        onChange={handleFileChange}
      />
    </div>
  );
}
