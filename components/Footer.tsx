export function Footer() {
  return (
    <footer className="mt-auto w-full py-10 text-center">
      <p className="font-sans text-[11px] tracking-[0.08em] text-rosewood/70">
        Built with{" "}
        <span aria-hidden="true" className="text-accent">
          ♥
        </span>{" "}
        by{" "}
        <a
          href="https://cfweddings.live"
          className="underline decoration-rosewood/30 underline-offset-2 hover:text-rosewood"
        >
          CF Weddings
        </a>{" "}
        · @cfweddingslive
      </p>
    </footer>
  );
}
