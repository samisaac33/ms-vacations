type Props = {
  currentStep: number;
  totalSteps?: number;
};

export function BookingProgressBar({ currentStep, totalSteps = 4 }: Props) {
  return (
    <div
      className="flex gap-1"
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
    >
      {Array.from({ length: totalSteps }, (_, i) => (
        <span
          key={i}
          className={`h-1 flex-1 rounded-full ${i < currentStep ? "bg-ocean" : "bg-sand-dark"}`}
        />
      ))}
    </div>
  );
}
