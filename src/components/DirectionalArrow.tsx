interface DirectionalArrowProps {
  className?: string;
}

export function DirectionalArrow({ className = '' }: DirectionalArrowProps) {
  return (
    <svg
      className={`directional-arrow ${className}`.trim()}
      viewBox="0 0 256 256"
      aria-hidden="true"
      focusable="false"
    >
      <path
        transform="matrix(.96 0 0 1 -11.5 224)"
        d="M19.199 19.969 220.414-182.016 222.977-128h7.421c.512-31.23 2.305-48.64 7.68-79.359-30.719 5.375-48.125 7.168-79.36 7.679v7.422l54.016 2.563L11.777 12.543Z"
      />
    </svg>
  );
}
