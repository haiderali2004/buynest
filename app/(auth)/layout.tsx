import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-canvas-weave flex min-h-dvh flex-col items-center justify-center px-4 py-6">
      <Link href="/" aria-label="BuyNest home" className="mb-4">
        <Image
          src="/logo.png"
          alt="BuyNest"
          width={165}
          height={90}
          priority
          className="h-22.5 w-auto"
        />
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
