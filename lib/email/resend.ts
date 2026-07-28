import { Resend } from "resend";
import { getEffectiveNotificationEmail } from "@/lib/admin-settings";

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim());
}

export async function getAdminNotificationEmail(): Promise<string | undefined> {
  return getEffectiveNotificationEmail();
}

function textToHtml(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<div style="font-family:sans-serif;line-height:1.5;color:#1a1a1a">${escaped.replace(/\n/g, "<br>")}</div>`;
}

export async function sendEmail(params: {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  attachments?: { filename: string; content: Buffer | string }[];
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isResendConfigured()) {
    console.info("[email] Resend no configurado, omitiendo:", params.subject);
    return { ok: false, error: "Resend no configurado" };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const attachments = params.attachments?.map((item) => ({
    filename: item.filename,
    content: item.content,
  }));

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: params.to,
    subject: params.subject,
    text: params.text,
    html: params.html ?? textToHtml(params.text),
    attachments,
  });

  if (error) {
    console.error("[email] Error al enviar:", error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
