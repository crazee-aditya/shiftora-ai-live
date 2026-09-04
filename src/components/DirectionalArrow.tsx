interface DirectionalArrowProps {
  className?: string;
}

export function DirectionalArrow({ className = '' }: DirectionalArrowProps) {
  return (
    <svg
      className={`directional-arrow ${className}`.trim()}
      viewBox="32.75 -150.5 124.375 124.375"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M157.125-146.125c-6.582 13.583-9.875 28.583-9.875 45 0 5.75.5 10.875 1.5 15.375l-6.125 6.375c-5.582-11-8.833-23.707-9.75-38.125L41.5-26.125l-8.75-8.75 91.375-91.375c-14.418-.832-27.125-4.043-38.125-9.625l6.375-6.25c4.582 1 9.707 1.5 15.375 1.5 16.417 0 31.457-3.292 45.125-9.875Z" />
    </svg>
  );
}
