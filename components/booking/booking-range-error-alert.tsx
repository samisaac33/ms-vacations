type Props = {
  message: string;
  className?: string;
};

export function BookingRangeErrorAlert({ message, className = "" }: Props) {
  return (
    <p
      className={`rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 ${className}`.trim()}
      role="alert"
    >
      {message}
    </p>
  );
}
