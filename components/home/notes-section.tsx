import { Reveal, RevealStagger } from "@/components/shared/reveal";
import { cn } from "@/lib/utils";

const NOTES = [
  "No mystery materials. Every listing states exactly what it's made of and how to look after it.",
  "Curated, not mass-stocked. If it's listed here, it's because we'd actually recommend it.",
  "One store for the whole list — notebooks next to lab kits next to watercolor pans.",
  "Straightforward pricing. No fake “was” prices, no countdown-timer tricks.",
];

function NotesSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal>
        <p className="font-mono text-xs tracking-wider text-brass uppercase">Notes From The Nest</p>
        <h2 className="mt-2 font-display text-2xl text-foreground sm:text-3xl">
          What we stand for
        </h2>
      </Reveal>

      <RevealStagger className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {NOTES.map((note, index) => (
          <div
            key={note}
            className={cn(
              "relative border border-border bg-paper p-6",
              index % 2 === 0 ? "-rotate-1" : "rotate-1",
            )}
          >
            <span className="absolute -top-1.5 left-5 size-3 rounded-full bg-brass shadow" />
            <p className="font-display text-base leading-relaxed text-foreground">{note}</p>
          </div>
        ))}
      </RevealStagger>
    </section>
  );
}

export { NotesSection };
