import Link from "next/link";
import Image from "next/image";
import { NewsletterForm } from "@/components/layout/newsletter-form";

const FOOTER_COLUMNS = [
  {
    heading: "Shop",
    links: [
      { label: "New In", href: "/new-in" },
      { label: "All Products", href: "/products" },
      { label: "Sale", href: "/sale" },
      { label: "Gift Cards", href: "/gift-cards" },
    ],
  },
  {
    heading: "Help",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "Shipping & Returns", href: "/faq#shipping" },
      { label: "Size Guide", href: "/faq#sizing" },
      { label: "Track an Order", href: "/account/orders" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About BuyNest", href: "/about" },
      { label: "Careers", href: "/about#careers" },
      { label: "Sustainability", href: "/about#sustainability" },
    ],
  },
];

function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <div className="seam-line opacity-20" />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Image
              src="/logo.png"
              alt="BuyNest"
              width={108}
              height={59}
              className="h-14.75 w-auto brightness-0 invert"
            />
            <p className="mt-3 max-w-xs text-sm text-paper/70">
              Considered clothing, cut for the long run. Join the list for early access to new
              arrivals and seasonal restocks.
            </p>
            <div className="mt-5">
              <NewsletterForm />
            </div>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.heading}>
              <p className="font-mono text-[11px] tracking-wider text-paper/50 uppercase">
                {column.heading}
              </p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-paper/80 transition-colors hover:text-paper"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-paper/15 pt-6 font-mono text-[11px] text-paper/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} BuyNest. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/legal/privacy" className="hover:text-paper/80">
              Privacy Policy
            </Link>
            <Link href="/legal/terms" className="hover:text-paper/80">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
