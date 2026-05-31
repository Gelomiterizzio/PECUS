import * as React from 'react';

export interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

/**
 * Logo de PECUS — marca tipo "anillo de telemetría" con punto de pulso.
 * Usa currentColor para adaptarse a temas claro/oscuro.
 */
export function Logo({ size = 28, ...props }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="PECUS"
      {...props}
    >
      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path
        d="M5 17h5l2.5-6 3.5 11 2.5-7H27"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="27" cy="6" r="3" fill="currentColor" />
    </svg>
  );
}
