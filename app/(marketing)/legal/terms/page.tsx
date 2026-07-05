import type { Metadata } from "next";
import Link from "next/link";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <p className="font-mono text-xs tracking-wider text-bottle uppercase">Legal</p>
      <h1 className="mt-3 font-display text-3xl text-foreground">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: June 2026</p>

      <div className="mt-8 rounded-sm border border-line-strong bg-secondary px-4 py-3 text-sm text-foreground">
        This is a template reflecting how this store actually operates — it isn&rsquo;t a
        substitute for review by a lawyer before you rely on it for a real business.
      </div>

      <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="font-display text-lg text-foreground">1. Acceptance of terms</h2>
          <p className="mt-2">
            By using this site or placing an order, you agree to these terms. If you don&rsquo;t
            agree to them, please don&rsquo;t use the site.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground">2. Accounts</h2>
          <p className="mt-2">
            You&rsquo;re responsible for keeping your account password confidential and for any
            activity that happens under your account. You can check out as a guest without
            creating a password — see our{" "}
            <Link href="/legal/privacy" className="text-bottle hover:underline">
              Privacy Policy
            </Link>{" "}
            for how that works.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground">3. Orders and pricing</h2>
          <p className="mt-2">
            All prices are listed in Pakistani Rupees (PKR) and include any applicable taxes
            unless stated otherwise. We try to keep pricing and stock information accurate, but
            errors can happen — if an item&rsquo;s price or availability was wrong when you
            ordered it, we&rsquo;ll contact you before charging you anything different from what
            you saw at checkout.
          </p>
          <p className="mt-2">
            Placing an order is an offer to buy; we accept that offer once your payment is
            confirmed. We may decline or cancel an order — for example if an item turns out to be
            out of stock — in which case we won&rsquo;t charge you, or we&rsquo;ll refund you in
            full.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground">4. Payment</h2>
          <p className="mt-2">
            Payments are processed securely by Safepay. We never see or store your full card
            details. By placing an order, you confirm you&rsquo;re authorized to use the payment
            method provided.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground">5. Shipping</h2>
          <p className="mt-2">
            Orders over Rs {FREE_SHIPPING_THRESHOLD.toLocaleString("en-PK")} ship free; a flat
            rate applies below that threshold, shown at checkout before you pay. Delivery times
            are estimates, not guarantees — delays can happen once a package is with the courier.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground">6. Returns and refunds</h2>
          <p className="mt-2">
            You can request a return within 30 days of delivery for unworn items with tags
            attached, from your account&rsquo;s order history. Once we&rsquo;ve received and
            inspected a returned item, we&rsquo;ll process your refund to your original payment
            method. See our{" "}
            <Link href="/faq" className="text-bottle hover:underline">
              FAQ
            </Link>{" "}
            for more detail.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground">7. Intellectual property</h2>
          <p className="mt-2">
            Everything on this site — including text, graphics, and the BuyNest name — belongs to
            us or our licensors and may not be copied or reused without permission.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground">8. Limitation of liability</h2>
          <p className="mt-2">
            We aren&rsquo;t liable for indirect or consequential losses arising from your use of
            this site, to the fullest extent the law allows. Nothing in these terms limits any
            right you have that can&rsquo;t legally be limited.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground">9. Governing law</h2>
          <p className="mt-2">These terms are governed by the laws of Pakistan.</p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground">10. Changes to these terms</h2>
          <p className="mt-2">
            If these terms change, we&rsquo;ll update the date at the top of this page.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground">11. Contact</h2>
          <p className="mt-2">
            Questions about these terms?{" "}
            <Link href="/contact" className="text-bottle hover:underline">
              Get in touch
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
