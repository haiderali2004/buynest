import Link from "next/link";
import { cn } from "@/lib/utils";

interface ProductPaginationProps {
  page: number;
  pageCount: number;
  buildHref: (page: number) => string;
}

function ProductPagination({ page, pageCount, buildHref }: ProductPaginationProps) {
  if (pageCount <= 1) return null;

  return (
    <nav className="mt-14 flex items-center justify-center gap-2" aria-label="Pagination">
      {Array.from({ length: pageCount }).map((_, index) => {
        const pageNum = index + 1;
        return (
          <Link
            key={pageNum}
            href={buildHref(pageNum)}
            aria-current={pageNum === page ? "page" : undefined}
            className={cn(
              "flex size-9 items-center justify-center border font-mono text-sm",
              pageNum === page
                ? "border-bottle bg-bottle text-paper"
                : "border-border text-foreground hover:border-bottle",
            )}
          >
            {pageNum}
          </Link>
        );
      })}
    </nav>
  );
}

export { ProductPagination };
