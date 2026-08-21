import Link from "next/link";
import Image from "next/image";
import { Reveal, RevealStagger } from "@/components/shared/reveal";

const DEPARTMENTS = [
  {
    num: "01",
    name: "Stationery & Office",
    description: "Notebooks, pens, and paper — everything a desk needs to run smoothly.",
    href: "/categories/notebooks-paper",
    image: "/departments/stationery.png",
  },
  {
    num: "02",
    name: "Craft & Hobby",
    description: "Paint, pencils, and materials for the things you make by hand.",
    href: "/categories/art-craft",
    image: "/departments/craft.png",
  },
  {
    num: "03",
    name: "Science & Education",
    description: "Lab kits, models, and tools built for hands-on discovery.",
    href: "/categories/science-lab-kits",
    image: "/departments/science.png",
  },
];

function Departments() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal>
        <p className="font-mono text-xs tracking-wider text-brass uppercase">The Departments</p>
        <h2 className="mt-2 font-display text-2xl text-foreground sm:text-3xl">
          Three aisles. One nest.
        </h2>
      </Reveal>

      <RevealStagger className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3" as="div">
        {DEPARTMENTS.map((dept) => (
          <Link
            key={dept.name}
            href={dept.href}
            className="group relative block aspect-3/4 overflow-hidden border border-border"
          >
            <Image
              src={dept.image}
              alt=""
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#152720]/90 via-[#152720]/25 to-transparent" />
            <div className="absolute inset-x-5 bottom-5 z-10">
              <span className="font-mono text-[11px] tracking-wider text-brass uppercase">
                {dept.num}
              </span>
              <h3 className="mt-1 font-display text-xl text-white">{dept.name}</h3>
              <p className="mt-1.5 max-w-[26ch] text-sm text-white/80">{dept.description}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 border-b border-brass pb-0.5 font-mono text-xs font-medium text-white">
                Shop {dept.name.split(" ")[0]} →
              </span>
            </div>
          </Link>
        ))}
      </RevealStagger>
    </section>
  );
}

export { Departments };
