import { Link } from "@tanstack/react-router";

export function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const text = tone === "dark" ? "text-ink-foreground" : "text-foreground";
  return (
    <Link to="/" className={`group inline-flex items-center gap-2.5 ${text}`} aria-label="Sharma Electronics — home">
     <img src="/SEK.png" alt="SEK" className="h-7 w-7" />
      <span className="flex flex-col leading-none">
        <span className="text-[0.95rem] font-extrabold tracking-[0.18em]">SHARMA</span>
        <span className="mt-0.5 text-[0.6rem] font-semibold tracking-[0.42em] opacity-70">ELECTRONICS</span>
      </span>
    </Link>
  );
}
