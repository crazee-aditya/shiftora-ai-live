import { ArrowRight } from 'lucide-react';

interface RollButtonProps {
  label: string;
  className?: string;
  textSize?: string;
  circleSize?: string;
  onClick?: () => void;
  /** When set, renders as a link (opens in a new tab) instead of a button. */
  href?: string;
}

/**
 * Black pill button with the signature text-roll hover animation:
 * the label is duplicated in a flex-col, and on hover the column
 * translates -50% vertically inside an overflow-hidden window.
 * The arrow sits in a white circle and rotates -45deg on hover.
 */
export default function RollButton({
  label,
  className = '',
  textSize = 'text-[13px] sm:text-[14px]',
  circleSize = 'w-7 h-7 sm:w-8 sm:h-8',
  onClick,
  href,
}: RollButtonProps) {
  const classes = `group inline-flex items-center gap-3 bg-gray-900 hover:bg-black text-white ${textSize} font-medium rounded-full pl-5 sm:pl-6 pr-2 py-2 transition-colors duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${className}`;

  const content = (
    <>
      <span className="relative block overflow-hidden h-[20px]">
        <span className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-1/2">
          <span className="flex h-[20px] items-center">{label}</span>
          <span className="flex h-[20px] items-center" aria-hidden="true">
            {label}
          </span>
        </span>
      </span>
      <span
        className={`flex ${circleSize} items-center justify-center rounded-full bg-white text-gray-900 transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]`}
      >
        <ArrowRight
          size={14}
          className="transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-rotate-45"
        />
      </span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className={classes}
      >
        {content}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={classes}>
      {content}
    </button>
  );
}
