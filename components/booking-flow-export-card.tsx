import Image from "next/image";
import { notFound } from "next/navigation";
import {
  bookingFlowScreenshotPath,
  getBookingFlowStep,
} from "@/lib/booking-flow-steps";

type Props = {
  step: string;
};

export function BookingFlowExportCard({ step: stepId }: Props) {
  const step = getBookingFlowStep(stepId);
  if (!step) notFound();

  const screenshot = bookingFlowScreenshotPath(step.imageBase, "light");

  return (
    <div
      id="booking-flow-export"
      className="relative flex flex-col items-center overflow-hidden bg-gradient-to-b from-[#faf8f4] to-[#e6f7f9]"
      style={{ width: 1080, height: 1350 }}
    >
      <div className="flex w-full flex-col items-center px-16 pt-14">
        <span className="rounded-full bg-[#009dad] px-5 py-2 text-lg font-bold text-white shadow-md">
          Paso {step.step}
        </span>
        <h1 className="font-display mt-6 text-center text-4xl font-semibold tracking-tight text-[#1a2b2b]">
          {step.title}
        </h1>
      </div>

      <div className="mt-10 w-[420px] overflow-hidden rounded-[2.75rem] border border-[#efe6d8] bg-[#faf8f4]/80 p-3 shadow-xl ring-1 ring-black/5">
        <div className="overflow-hidden rounded-[2.25rem] bg-white">
          <Image
            src={screenshot}
            alt={step.alt}
            width={780}
            height={1688}
            className="h-auto w-full"
            priority
          />
        </div>
      </div>

      <p className="mt-10 max-w-[720px] px-12 text-center text-2xl leading-relaxed text-[#5c6b6b]">
        {step.description}
      </p>

      <p className="absolute bottom-10 text-lg font-semibold tracking-wide text-[#009dad]">
        MS VACATIONS
      </p>
    </div>
  );
}
