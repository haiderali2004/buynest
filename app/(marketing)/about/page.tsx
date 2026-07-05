import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <section>
        <p className="font-mono text-xs tracking-wider text-bottle uppercase">About BuyNest</p>
        <h1 className="mt-3 font-display text-3xl text-foreground">
          Considered clothing, cut for the long run.
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
          BuyNest started from a simple frustration: most clothing is designed to be replaced,
          not worn. We build a small, deliberate range of shirts, knitwear, and outerwear from
          honest materials — the kind of pieces you reach for because they fit well and hold up,
          not because they were the cheapest thing in the feed.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          We&rsquo;d rather make fewer things well than chase every trend. Every product page
          tells you what something is actually made of and how to look after it, because that
          information shouldn&rsquo;t be hard to find.
        </p>
      </section>

      <section id="careers" className="mt-16 border-t border-border pt-10">
        <h2 className="font-display text-2xl text-foreground">Careers</h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          We&rsquo;re a small team and we hire rarely, but well. We don&rsquo;t have open roles
          listed right now — when we do, they&rsquo;ll appear here first, before anywhere else.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          If you think you&rsquo;d be a good fit for what we&rsquo;re building, you&rsquo;re
          welcome to introduce yourself through our{" "}
          <a href="/contact" className="text-bottle hover:underline">
            contact page
          </a>
          .
        </p>
      </section>

      <section id="sustainability" className="mt-16 border-t border-border pt-10">
        <h2 className="font-display text-2xl text-foreground">Sustainability</h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          The most sustainable garment is the one you keep wearing. That&rsquo;s the real reason
          we focus on durable materials and timeless cuts rather than seasonal drops — clothes
          that last reduce waste more reliably than any single material choice.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          We&rsquo;re still early in formalizing supply chain commitments, and we&rsquo;d rather
          say that plainly than overstate what we&rsquo;ve done so far.
        </p>
      </section>
    </div>
  );
}
