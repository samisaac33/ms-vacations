import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingFlowExportCard } from "@/components/booking-flow-export-card";
import { getBookingFlowStep } from "@/lib/booking-flow-steps";

type Props = {
  params: Promise<{ step: string }>;
};

export function generateStaticParams() {
  return [{ step: "1" }, { step: "2" }, { step: "3" }];
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { step: stepId } = await props.params;
  const step = getBookingFlowStep(stepId);
  if (!step) return { title: "Exportar contenido" };
  return {
    title: `Export — Paso ${step.step}`,
    robots: { index: false, follow: false },
  };
}

export default async function BookingFlowExportPage(props: Props) {
  const { step: stepId } = await props.params;
  if (!getBookingFlowStep(stepId)) notFound();

  return (
    <main className="flex min-h-screen items-start justify-center bg-[#faf8f4]">
      <BookingFlowExportCard step={stepId} />
    </main>
  );
}
