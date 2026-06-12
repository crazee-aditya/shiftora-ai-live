import RollButton from './RollButton';

const IMG_SMALL =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260516_090123_74be96d4-9c1b-40cf-932a-96f4f4babed3.png&w=1280&q=85';
const IMG_LARGE =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260516_090133_c157d30b-a99a-4477-bec1-a446149ec3f2.png&w=1280&q=85';

export default function About() {
  return (
    <section className="overflow-hidden bg-white pb-12 pt-16 sm:pb-16 sm:pt-20 lg:pb-24 lg:pt-32">
      <div className="mx-auto max-w-[1440px]">
        {/* Badge row */}
        <div className="mb-6 flex items-center gap-3 px-5 sm:mb-8 sm:px-8 lg:px-12">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-[11px] font-semibold text-white sm:h-7 sm:w-7 sm:text-[12px]">
            1
          </span>
          <span className="rounded-full border border-gray-200 px-3 py-1 text-[12px] font-medium text-gray-900 sm:px-4 sm:py-1.5 sm:text-[13px]">
            Introducing Shiftora
          </span>
        </div>

        {/* Heading */}
        <h2 className="mb-12 px-5 font-medium leading-[1.12] tracking-[-0.02em] text-gray-900 [font-size:clamp(1.5rem,4vw,3.2rem)] sm:mb-16 sm:px-8 lg:mb-28 lg:px-12">
          Senior-led engineering,
          <br />
          delivering measurable impact at scale.
        </h2>

        {/* Mobile / tablet layout */}
        <div className="px-5 sm:px-8 lg:hidden">
          <p className="text-[15px] font-medium leading-[1.6] text-gray-900 sm:text-[17px]">
            Through audit, senior-led engineering and live operations, we help
            enterprises turn AI into production systems with real, measurable
            operational impact.
          </p>
          <div className="mt-6">
            <RollButton label="About our work" />
          </div>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-5">
            <div className="overflow-hidden rounded-xl sm:w-[45%] sm:rounded-2xl">
              <img
                src={IMG_SMALL}
                alt="Shiftora engineering team at work"
                className="aspect-[438/346] h-full w-full object-cover grayscale"
                loading="lazy"
              />
            </div>
            <div className="overflow-hidden rounded-xl sm:w-[55%] sm:rounded-2xl">
              <img
                src={IMG_LARGE}
                alt="Shiftora systems in production"
                className="aspect-[900/600] h-full w-full object-cover grayscale"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Desktop layout */}
        <div className="hidden grid-cols-[26%_1fr_48%] items-end gap-6 px-12 lg:grid xl:gap-8">
          <div className="self-end overflow-hidden rounded-2xl">
            <img
              src={IMG_SMALL}
              alt="Shiftora engineering team at work"
              className="aspect-[438/346] h-full w-full object-cover grayscale"
              loading="lazy"
            />
          </div>
          <div className="flex justify-end self-start">
            <div>
              <p className="whitespace-nowrap text-[16px] leading-[1.65] text-gray-900 xl:text-[18px]">
                Through audit, senior-led engineering
                <br />
                and live operations, we help enterprises
                <br />
                turn AI into production systems with
                <br />
                real, measurable operational impact.
              </p>
              <div className="mt-8">
                <RollButton label="About our work" />
              </div>
            </div>
          </div>
          <div className="self-end overflow-hidden rounded-2xl">
            <img
              src={IMG_LARGE}
              alt="Shiftora systems in production"
              className="aspect-[3/2] h-full w-full object-cover grayscale"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
