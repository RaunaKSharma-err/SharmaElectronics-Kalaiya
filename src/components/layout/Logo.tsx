import { Link } from "@tanstack/react-router";

export function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const text = tone === "dark" ? "text-ink-foreground" : "text-foreground";
  return (
    <Link to="/" className={`group inline-flex items-center gap-2.5 ${text}`} aria-label="Sharma Electronics — home">
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
        <rect x="2" y="2" width="28" height="28" rx="8" className="fill-primary" />
        <path d="M21 10.5c-1.2-1-2.9-1.5-4.8-1.5-3 0-5.2 1.5-5.2 3.8 0 4.9 9.6 2.9 9.6 7 0 1.6-1.7 2.7-4.3 2.7-2 0-3.8-.6-5.3-1.8" fill="none" strokeWidth="2.4" strokeLinecap="round" className="stroke-primary-foreground" />
        <circle cx="23.5" cy="8.5" r="2" className="fill-cyan" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="text-[0.95rem] font-extrabold tracking-[0.18em]">SHARMA</span>
        <span className="mt-0.5 text-[0.6rem] font-semibold tracking-[0.42em] opacity-70">ELECTRONICS</span>
      </span>
    </Link>
  );
}
