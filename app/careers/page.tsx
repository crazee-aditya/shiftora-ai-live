import type { Metadata } from "next";
import { Watermark } from "@/components/Watermark";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/Reveal";
import { roles } from "@/data/careers";
import { CONTACT_EMAIL } from "@/data/site";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Open roles at Shiftora AI across the UAE, India, and the USA. To apply, write to info@shiftora.ai.",
};

export default function CareersPage() {
  return (
    <>
      <Watermark words={["CAREERS"]} minHeight="70vh">
        <Reveal stagger className="flex max-w-prose flex-col gap-5">
          <Eyebrow>Work with us</Eyebrow>
          <h1 className="font-display text-display text-black">Open roles</h1>
          <p className="text-body text-black">
            We are a founder led firm hiring across the UAE, India, and the USA.
          </p>
        </Reveal>
      </Watermark>

      <section aria-label="Open roles" className="pb-[clamp(5rem,12vh,12rem)]">
        <div className="container-page">
          <ul className="border-line border-t">
            {roles.map((role) => {
              const subject = encodeURIComponent(`Application: ${role.title}`);
              return (
                <li key={role.id} className="border-line border-b">
                  <a
                    href={`mailto:${CONTACT_EMAIL}?subject=${subject}`}
                    className="group flex flex-col gap-3 py-8 transition-colors duration-300 hover:bg-black hover:text-white md:flex-row md:items-baseline md:justify-between md:px-6"
                  >
                    <span className="font-display text-2xl leading-tight md:text-3xl">
                      {role.title}
                    </span>
                    <span className="text-mute flex flex-col gap-1 transition-colors duration-300 group-hover:text-white/80 md:flex-row md:items-baseline md:gap-10">
                      <span className="md:w-64">{role.comp}</span>
                      <span className="md:w-44 md:text-right">
                        {role.location}
                      </span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>

          <p className="text-mute mt-8 text-sm">
            To apply, please write to{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-black underline underline-offset-4 hover:no-underline"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}
