import type { Metadata } from "next";
import { ContactForm } from "@/components/marketing/contact-form";

export const metadata: Metadata = {
  title: "Contact Us",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl text-foreground">Contact Us</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Questions about an order, sizing, or anything else — we read every message ourselves.
      </p>
      <div className="mt-8">
        <ContactForm />
      </div>
    </div>
  );
}
