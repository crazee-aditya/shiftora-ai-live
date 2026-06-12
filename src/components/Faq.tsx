import { useState } from 'react';
import { Plus } from 'lucide-react';
import ContactForm from './ContactForm';
import RollButton from './RollButton';
import { CAL_BOOKING_URL } from '../constants';

const FAQ_ITEMS = [
  {
    question: 'Are these custom-tailored implementations?',
    answer:
      'Yes. Every Shiftora system is built from the ground up around your stack, data, and operating model, never an off-the-shelf template dropped on top.',
  },
  {
    question: 'What does an engagement cost?',
    answer:
      "Pricing is scoped per engagement. We size it during a custom discovery call, once we understand the workflows in play. There's no generic price list, because there's no generic build.",
  },
  {
    question: 'Do you work with companies globally?',
    answer:
      'Yes. We partner with enterprises worldwide, not only the USA, UAE, or India. Delivery is remote-first and senior-led, wherever you operate.',
  },
  {
    question: 'How fast can a system go live?',
    answer:
      'Most engagements move from scope to a live production system in weeks, not quarters.',
  },
  {
    question: 'Do you replace our team?',
    answer:
      'No, we augment it. Our systems act as decision-support and execution layers that let your existing team operate like a much larger one.',
  },
];

function FaqItem({
  question,
  answer,
  open,
  onToggle,
}: {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-6 py-6 text-left"
      >
        <span className="text-[16px] font-medium text-gray-900 sm:text-[18px]">
          {question}
        </span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-300 text-gray-900">
          <Plus
            size={14}
            className={`transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
              open ? 'rotate-45' : ''
            }`}
          />
        </span>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <p className="max-w-2xl pb-6 text-[14px] leading-relaxed text-gray-600 sm:text-[15px]">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-white pt-20 lg:pt-28">
      {/* ---------------- FAQ ---------------- */}
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[40%_1fr] lg:gap-16">
          <div>
            <p className="text-[13px] tracking-wide text-gray-500">{'// FAQ'}</p>
            <h2 className="mt-4 font-medium leading-[1.1] tracking-[-0.02em] text-gray-900 [font-size:clamp(1.75rem,4.5vw,3rem)]">
              Questions, answered.
            </h2>
          </div>
          <div className="border-t border-gray-200">
            {FAQ_ITEMS.map((item, i) => (
              <FaqItem
                key={item.question}
                question={item.question}
                answer={item.answer}
                open={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ---------------- Contact / Book a call ---------------- */}
      <div
        id="contact"
        className="mx-auto max-w-[1440px] px-5 pb-20 pt-20 sm:px-8 lg:px-12 lg:pb-28 lg:pt-28"
      >
        <div className="mb-12 text-center">
          <p className="text-[13px] uppercase tracking-widest text-gray-500">
            {'// Book a call'}
          </p>
          <h2 className="mt-4 font-medium leading-[1.1] tracking-[-0.02em] text-gray-900 [font-size:clamp(1.75rem,5vw,3.25rem)]">
            See what AI could do inside your company.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-600">
            A short conversation with the Shiftora team to find the workflows
            where a custom system would deliver immediate impact.
          </p>
          <div className="mt-8 flex justify-center">
            <RollButton label="Book a 30-min call" href={CAL_BOOKING_URL} />
          </div>
          <p className="mt-10 text-[12px] uppercase tracking-widest text-gray-400">
            Or share your details and we'll reach out
          </p>
        </div>
        <ContactForm />
      </div>

      {/* ---------------- Footer ---------------- */}
      <footer className="border-t border-gray-200">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 text-[12px] text-gray-400 sm:px-8 lg:px-12">
          <span>© 2026 Shiftora.ai</span>
          <span>shiftora.ai</span>
        </div>
      </footer>
    </section>
  );
}
