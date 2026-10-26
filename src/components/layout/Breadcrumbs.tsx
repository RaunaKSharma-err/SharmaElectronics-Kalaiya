import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export function Breadcrumbs({ items }: { items: { name: string; to?: string; params?: Record<string, string> }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5" aria-hidden />}
            {it.to ? <Link to={it.to as never} params={it.params as never} className="hover:text-foreground">{it.name}</Link>
              : <span aria-current="page" className="text-foreground">{it.name}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
