import { NewsletterForm } from "@/components/layout/newsletter-form";

function NewsletterBand() {
  return (
    <section className="border-t border-border bg-paper">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 px-4 py-16 text-center sm:px-6">
        <p className="font-display text-2xl text-foreground">Join the list</p>
        <p className="text-sm text-muted-foreground">
          Early access to new arrivals, seasonal restocks, and the occasional honest opinion
          about what&rsquo;s actually worth buying.
        </p>
        <NewsletterForm />
      </div>
    </section>
  );
}

export { NewsletterBand };
