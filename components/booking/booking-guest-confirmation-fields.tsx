import Link from "next/link";
import { Input, Label } from "@/components/ui/input";

type Props = {
  guestEmail: string;
  onEmailChange: (email: string) => void;
  termsAccepted: boolean;
  onTermsChange: (accepted: boolean) => void;
  emailInputId?: string;
};

export function BookingGuestConfirmationFields({
  guestEmail,
  onEmailChange,
  termsAccepted,
  onTermsChange,
  emailInputId = "wizard-email",
}: Props) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor={emailInputId}>Correo electrónico</Label>
        <Input
          id={emailInputId}
          type="email"
          required
          autoComplete="email"
          placeholder="tu@correo.com"
          value={guestEmail}
          onChange={(e) => onEmailChange(e.target.value)}
          className="mt-2"
        />
        <p className="mt-1.5 text-xs text-muted">Enviaremos la confirmación a este correo.</p>
      </div>

      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => onTermsChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-sand-dark accent-ocean"
        />
        <span className="text-sm leading-relaxed text-ink">
          Acepto los{" "}
          <Link href="/terminos" className="text-ocean underline underline-offset-2">
            términos y condiciones
          </Link>{" "}
          y la{" "}
          <Link href="/cancelaciones" className="text-ocean underline underline-offset-2">
            política de cancelaciones
          </Link>
          .
        </span>
      </label>
    </div>
  );
}
