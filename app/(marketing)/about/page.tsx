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
          Supplies for curious minds.
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
          BuyNest started from a simple observation: the best learning happens hands-on — with a
          notebook that lies flat, a pen that doesn&rsquo;t skip, a lab kit that actually works the
          first time. We stock a deliberate range of stationery, art and craft supplies, science
          kits, and educational tools for students, teachers, hobbyists, and anyone who&rsquo;d
          rather build and make than just consume.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          We&rsquo;d rather stock fewer things well than chase every trend. Every product page
          tells you what something is actually made of and how to look after it, because that
          information shouldn&rsquo;t be hard to find — whether you&rsquo;re outfitting a
          classroom, a studio, or a home lab.
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
          The most sustainable notebook is the one that gets filled, not tossed half-used. That&rsquo;s
          part of why we favor recycled and responsibly sourced paper, refillable pens, and
          durable lab and craft tools over disposable, single-use alternatives wherever we can.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          We&rsquo;re still early in formalizing supply chain commitments, and we&rsquo;d rather
          say that plainly than overstate what we&rsquo;ve done so far.
        </p>
      </section>
    </div>
  );
}
