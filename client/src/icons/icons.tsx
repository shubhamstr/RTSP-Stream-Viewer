import React from 'react'

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number
}

interface BaseSvgProps extends IconProps {
  defaultSize?: number
  children: React.ReactNode
}

const BaseSvg: React.FC<BaseSvgProps> = ({
  size,
  defaultSize = 16,
  children,
  ...props
}) => {
  const s = size ?? defaultSize
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  )
}

// ─── App / Nav ────────────────────────────────────────────────────────────────

export const VideoIcon: React.FC<IconProps> = (props) => (
  <BaseSvg defaultSize={20} {...props}>
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </BaseSvg>
)

export const SunIcon: React.FC<IconProps> = (props) => (
  <BaseSvg defaultSize={16} {...props}>
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </BaseSvg>
)

export const MoonIcon: React.FC<IconProps> = (props) => (
  <BaseSvg defaultSize={16} {...props}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </BaseSvg>
)

// ─── Actions ──────────────────────────────────────────────────────────────────

export const PlusCircleIcon: React.FC<IconProps> = (props) => (
  <BaseSvg defaultSize={15} {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </BaseSvg>
)

export const TrashIcon: React.FC<IconProps> = (props) => (
  <BaseSvg defaultSize={13} {...props}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6M9 6V4h6v2" />
  </BaseSvg>
)

export const CloseIcon: React.FC<IconProps> = (props) => (
  <BaseSvg defaultSize={13} {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </BaseSvg>
)

export const CheckIcon: React.FC<IconProps> = (props) => (
  <BaseSvg defaultSize={13} {...props}>
    <polyline points="20 6 9 17 4 12" />
  </BaseSvg>
)

// ─── Player Controls ──────────────────────────────────────────────────────────

export const PlayIcon: React.FC<IconProps> = (props) => (
  <BaseSvg defaultSize={13} {...props}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </BaseSvg>
)

export const PauseIcon: React.FC<IconProps> = (props) => (
  <BaseSvg defaultSize={13} {...props}>
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </BaseSvg>
)

export const FullscreenIcon: React.FC<IconProps> = (props) => (
  <BaseSvg defaultSize={13} {...props}>
    <polyline points="15 3 21 3 21 9" />
    <polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </BaseSvg>
)

export const PipIcon: React.FC<IconProps> = (props) => (
  <BaseSvg defaultSize={13} {...props}>
    <path d="M21 9V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" />
    <rect x="12" y="13" width="10" height="7" rx="1" />
  </BaseSvg>
)

export const SideBySideIcon = PipIcon

export const RefreshIcon: React.FC<IconProps> = (props) => (
  <BaseSvg defaultSize={13} {...props}>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </BaseSvg>
)

export const GearIcon: React.FC<IconProps> = (props) => (
  <BaseSvg defaultSize={13} {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </BaseSvg>
)
