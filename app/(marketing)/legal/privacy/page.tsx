import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <p className="font-mono text-xs tracking-wider text-bottle uppercase">Legal</p>
      <h1 className="mt-3 font-display text-3xl text-foreground">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: June 2026</p>

      <div className="mt-8 rounded-sm border border-line-strong bg-secondary px-4 py-3 text-sm text-foreground">
        This is a template describing exactly what this site&rsquo;s code actually collects and
        does — it isn&rsquo;t a substitute for review by a lawyer familiar with Pakistani data
        protection law before you rely on it for a real business.
      </div>

      <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="font-display text-lg text-foreground">1. Information we collect</h2>
          <p className="mt-2">When you create an account, place an order, or contact us, we collect:</p>
          <ul className="mt-2 list-disc pl-5">
            <li>Your name, email address, and phone number</li>
            <li>Shipping and billing addresses</li>
            <li>Order history — items purchased, quantities, prices, and order status</li>
            <li>Messages you send us through the contact form</li>
            <li>Your email address if you subscribe to our newsletter</li>
          </ul>
          <p className="mt-2">
            We do <strong>not</strong> collect or store your card number, expiry date, or CVV.
            Card details are entered directly on our payment processor&rsquo;s (Safepay) own
            secure page and never pass through our servers.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground">2. Guest checkout</h2>
          <p className="mt-2">
            You don&rsquo;t need to create a password to check out. If you check out without
            signing in, we create an anonymous account behind the scenes solely to attach your
            order to a record we can look up — it has no password and can&rsquo;t be used to sign
            in anywhere else.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground">3. Cookies and local storage</h2>
          <p className="mt-2">
            We use cookies to keep you signed in. Your shopping cart and wishlist are stored in
            your browser&rsquo;s local storage, not on our servers, until you check out — so on a
            shared or public computer, signing out won&rsquo;t necessarily clear items you added
            to your cart.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground">4. How we use your information</h2>
          <ul className="mt-2 list-disc pl-5">
            <li>To process and fulfil your orders, including shipping and customer support</li>
            <li>To send order confirmations and status updates by email</li>
            <li>To process returns and refunds</li>
            <li>To respond to messages you send through our contact form</li>
            <li>To send newsletter updates, only if you&rsquo;ve subscribed</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground">5. Who we share it with</h2>
          <p className="mt-2">We share the minimum information necessary with:</p>
          <ul className="mt-2 list-disc pl-5">
            <li>
              <strong>Safepay</strong> — to process payments. They receive your order amount and
              your billing details; we never see your card information.
            </li>
            <li>
              <strong>Supabase</strong> — our database and authentication provider, which stores
              your account and order data on our behalf.
            </li>
            <li>
              <strong>Resend</strong> — to deliver transactional emails (order confirmations,
              shipping updates, return updates).
            </li>
          </ul>
          <p className="mt-2">
            We don&rsquo;t sell your information to third parties, and we don&rsquo;t use it for
            advertising.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground">6. Data retention</h2>
          <p className="mt-2">
            We keep order records for as long as needed for accounting, warranty, and legal
            purposes. You can ask us to delete your account information at any time, though we may
            need to retain order records that are legally required to be kept.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground">7. Your rights</h2>
          <p className="mt-2">
            You can review and update your name and phone number from your account page at any
            time. To request a copy of your data, ask us to correct it, or ask us to delete your
            account, <Link href="/contact" className="text-bottle hover:underline">contact us</Link>.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground">8. Children</h2>
          <p className="mt-2">
            This site is not directed at children, and we don&rsquo;t knowingly collect
            information from anyone under 18.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground">9. Changes to this policy</h2>
          <p className="mt-2">
            If this policy changes, we&rsquo;ll update the date at the top of this page.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-foreground">10. Contact</h2>
          <p className="mt-2">
            Questions about this policy or your data?{" "}
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
