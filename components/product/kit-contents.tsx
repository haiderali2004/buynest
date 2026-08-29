function KitContents({ kitContents }: { kitContents: string | null }) {
  const items = (kitContents ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (items.length === 0) return null;

  return (
    <div className="mt-16 border-t border-border pt-10">
      <h2 className="font-display text-2xl text-foreground">What&rsquo;s Included</h2>
      <ul className="mt-6 flex flex-col gap-2.5">
        {items.map((item, index) => (
          <li key={index} className="flex items-baseline gap-2.5 text-sm text-foreground">
            <span aria-hidden="true" className="text-brass">
              —
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export { KitContents };
