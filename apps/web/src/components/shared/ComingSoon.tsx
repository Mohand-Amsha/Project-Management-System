import Link from "next/link";
import { Construction } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}

/** Placeholder for pages that are planned but not built yet. */
export function ComingSoon({
  title,
  description = "This page hasn't been built yet.",
  backHref,
  backLabel = "Go back",
}: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <Construction className="h-10 w-10 text-muted-foreground" />
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
      {backHref && (
        <Link href={backHref} className="text-sm text-primary hover:underline">
          {backLabel}
        </Link>
      )}
    </div>
  );
}
