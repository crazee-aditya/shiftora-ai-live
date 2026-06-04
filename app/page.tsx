import { Wordmark } from "@/components/Wordmark";
import { ComingSoonHero } from "@/components/ComingSoonHero";
import { Watermark } from "@/components/Watermark";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/Reveal";
import { CONTACT_EMAIL } from "@/data/site";

export default function Page() {
  return (
    <>
      <Wordmark />
      <ComingSoonHero />

      <Watermark words={["SHIFT", "THE", "ORDINARY"]} minHeight="120vh">
        <Reveal stagger className="flex max-w-prose flex-col gap-5">
          <Eyebrow>What is next</Eyebrow>
          <p className="text-body text-black">
            We are rebuilding shiftora.ai. The full site is on the way, with our
            work, services, and case studies.
          </p>
          <p className="text-mute text-sm">
            For anything in the meantime, write to{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-black underline underline-offset-4 hover:no-underline"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </Reveal>
      </Watermark>
    </>
  );
}
