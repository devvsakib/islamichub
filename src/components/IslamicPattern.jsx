import { useId } from 'react';

export function IslamicPattern({ className = '', opacity = 0.04, color = 'currentColor' }) {
  const patternId = useId();
  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id={patternId} x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          {/* 8-pointed star */}
          <g fill={color} fillOpacity={opacity}>
            <polygon points="40,5 45,25 65,20 50,35 65,50 45,45 40,65 35,45 15,50 30,35 15,20 35,25" />
            <circle cx="40" cy="40" r="8" fill="none" stroke={color} strokeOpacity={opacity * 2} strokeWidth="1" />
            <circle cx="0" cy="0" r="4" />
            <circle cx="80" cy="0" r="4" />
            <circle cx="0" cy="80" r="4" />
            <circle cx="80" cy="80" r="4" />
          </g>
          {/* Connecting lines */}
          <g stroke={color} strokeOpacity={opacity * 1.5} strokeWidth="0.5" fill="none">
            <line x1="0" y1="40" x2="80" y2="40" />
            <line x1="40" y1="0" x2="40" y2="80" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

export function StarPattern({ className = '' }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`${className}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <polygon
        points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35"
        fill="currentColor"
      />
    </svg>
  );
}

export function MoonIcon({ className = '', size = 24 }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="currentColor"
        d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"
      />
    </svg>
  );
}

export function CrescentStar({ className = '', size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d="M14 4a10 10 0 1 0 0 20A10 10 0 0 0 14 4zm0 2a8 8 0 0 1 7.94 7.16A6 6 0 0 1 16 7.5a6 6 0 0 1-2-.34A8.001 8.001 0 0 1 14 6z" opacity="0.9"/>
      <polygon fill="currentColor" points="24,4 25.5,8.5 30,9 26.5,12.5 27.5,17 24,14.5 20.5,17 21.5,12.5 18,9 22.5,8.5" />
    </svg>
  );
}
