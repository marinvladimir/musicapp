export const LeftArrow = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    fill="none"
    stroke="none"
  >
    <g>
      <polygon
        points="10,32 40,10 40,24 56,24 56,40 40,40 40,54"
        fill="url(#rightArrowGradient)"
      />
      <defs>
        <linearGradient
          id="rightArrowGradient"
          x1="0%"
          y1="100%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" style={{ stopColor: "#6c63ff", stopOpacity: 1 }} />
          <stop
            offset="100%"
            style={{ stopColor: "#a3a0ff", stopOpacity: 1 }}
          />
        </linearGradient>
      </defs>
    </g>
  </svg>
);

export const RightArrow = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    fill="none"
    stroke="none"
  >
    <g>
      <polygon
        points="54,32 24,10 24,24 8,24 8,40 24,40 24,54"
        fill="url(#leftArrowGradient)"
      />
      <defs>
        <linearGradient
          id="leftArrowGradient"
          x1="100%"
          y1="100%"
          x2="0%"
          y2="0%"
        >
          <stop offset="0%" style={{ stopColor: "#6c63ff", stopOpacity: 1 }} />
          <stop
            offset="100%"
            style={{ stopColor: "#a3a0ff", stopOpacity: 1 }}
          />
        </linearGradient>
      </defs>
    </g>
  </svg>
);

export const LeftArrowSong = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

export const RightArrowSong = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

export const PlaySong = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

export const StopSong = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M6 19h4V5H6zm8-14v14h4V5h-4z" />
  </svg>
);

export const PauseSong = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M6 5h4v14H6z" />
    <path d="M14 5h4v14h-4z" />
  </svg>
);

export const InstagramIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37a4 4 0 1 0-4.63 4.63 4 4 0 0 0 4.63-4.63z" />
    <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
  </svg>
);

export const FacebookIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a4 4 0 0 0-4 4v3H8v4h3v8h4v-8h3l1-4h-4V6a1 1 0 0 1 1-1h3z" />
  </svg>
);

export const YouTubeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22.54 6.42a2.8 2.8 0 0 0-1.96-2C18.88 4 12 4 12 4s-6.88 0-8.58.42a2.8 2.8 0 0 0-1.96 2A29.94 29.94 0 0 0 1 12a29.94 29.94 0 0 0 .46 5.58 2.8 2.8 0 0 0 1.96 2c1.7.42 8.58.42 8.58.42s6.88 0 8.58-.42a2.8 2.8 0 0 0 1.96-2A29.94 29.94 0 0 0 23 12a29.94 29.94 0 0 0-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
  </svg>
);

export const CartIcon: React.FC<{ filled?: boolean }> = ({ filled }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill={filled ? "#b56cff" : "none"}
    stroke="#b56cff"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l1.68 12.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
  </svg>
);

export const VolumeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9v6h4l5 5V4l-5 5H3z" />
    <line x1="12" y1="12" x2="16" y2="12" />
    <line x1="14" y1="10" x2="16" y2="12" />
    <line x1="14" y1="14" x2="16" y2="12" />
  </svg>
);

export const LoopIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 10v6a2 2 0 0 1-2 2H7" />
    <polyline points="16 16 21 16 21 10" />
    <path d="M3 14V8a2 2 0 0 1 2-2h12" />
    <polyline points="8 8 3 8 3 14" />
  </svg>
);

export const ShuffleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="16 3 21 3 21 8" />
    <line x1="4" y1="20" x2="21" y2="3" />
    <polyline points="21 16 21 21 16 21" />
    <line x1="15" y1="15" x2="21" y2="21" />
    <line x1="4" y1="4" x2="9" y2="9" />
  </svg>
);
