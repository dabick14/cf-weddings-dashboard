export function ExportAction({ secretKey }: { secretKey: string }) {
  const href = `/api/guests/csv?k=${encodeURIComponent(secretKey)}`;

  return (
    <div className="mt-20 sm:mt-24 flex justify-center border-t border-accent/15 pt-8">
      <a
        href={href}
        className="font-sans text-xs tracking-wide text-rosewood/80 underline decoration-rosewood/30 underline-offset-4 transition hover:text-rosewood"
      >
        Export guest list (CSV)
      </a>
    </div>
  );
}
