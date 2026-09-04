interface DirectionalArrowProps {
  className?: string;
}

export function DirectionalArrow({ className = '' }: DirectionalArrowProps) {
  return (
    <svg
      className={`directional-arrow ${className}`.trim()}
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M3.5 12.5 12.5 3.5M5 3.5h7.5V11" />
    </svg>
  );
}
