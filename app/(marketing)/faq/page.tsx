import type { Metadata } from "next";
import Link from "next/link";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

export const metadata: Metadata = {
  title: "FAQ",
};

const FAQ_ITEMS = [
  {
    question: "How long does shipping take?",
    answer:
      "Most orders arrive within 4–7 business days. You'll get a confirmation email as soon as your order ships, and you can check its status any time from your account's order history.",
  },
  {
    question: "Is shipping free?",
    answer: `Orders over Rs ${FREE_SHIPPING_THRESHOLD.toLocaleString("en-PK")} ship free. Below that, a flat shipping rate applies and is shown at checkout before you pay.`,
  },
  {
    question: "What's your return policy?",
    answer:
      "You can return anything within 30 days of delivery, as long as it's unworn with tags attached. Contact us with your order number and we'll send return instructions.",
  },
  {
    question: "How do I find my size?",
    answer:
      "Each product page lists the sizes currently in stock for that item. If a size you want shows as unavailable, it's sold out rather than hidden — we don't restock every style.",
  },
  {
    question: "Is checkout secure?",
    answer:
      "Yes — payments are processed by Safepay, and we never see or store your card details directly.",
  },
  {
    question: "Can I track an existing order?",
    answer:
      "If you created an account at checkout, sign in and visit your order history for status and details. Guest orders can be tracked via the confirmation email link.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl text-foreground">Frequently Asked Questions</h1>
      <div className="mt-8">
        <FaqAccordion items={FAQ_ITEMS} />
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        Didn&rsquo;t find what you needed?{" "}
        <Link href="/contact" className="text-bottle hover:underline">
          Get in touch
        </Link>
        .
      </p>
    </div>
  );
}
