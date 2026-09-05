type Props = {
  children: React.ReactNode;
  title?: string;
};

export function AdminCalendarShell({ children, title }: Props) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 text-zinc-900">
      {title && (
        <div className="border-b border-zinc-200 bg-surface px-4 py-3 sm:px-6">
          <h1 className="mx-auto max-w-[1600px] text-lg font-semibold capitalize">{title}</h1>
        </div>
      )}
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">{children}</div>
    </div>
  );
}
