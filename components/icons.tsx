import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
};

export function HomeIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="m3 11 9-8 9 8"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9.5 21v-6h5v6"/></svg>;
}

export function UsersIcon(props: IconProps) {
  return <svg {...base} {...props}><circle cx="9" cy="8" r="3.25"/><path d="M3.5 20v-1.5A5.5 5.5 0 0 1 9 13h.5a5.5 5.5 0 0 1 5.5 5.5V20"/><path d="M15.5 5.25a3.2 3.2 0 0 1 0 6.15M18 13.5a5 5 0 0 1 2.5 4.35V20"/></svg>;
}

export function ShieldIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M12 3 20 6v5.5c0 4.9-3.25 8-8 9.5-4.75-1.5-8-4.6-8-9.5V6l8-3Z"/><path d="m8.5 12 2.25 2.25 4.75-5"/></svg>;
}

export function LedgerIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v5h4M9 12h6M9 16h6"/></svg>;
}

export function SettingsIcon(props: IconProps) {
  return <svg {...base} {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.86 2.86-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21H9.55v-.1A1.7 1.7 0 0 0 8.5 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.86-2.86.06-.06A1.7 1.7 0 0 0 4.1 15a1.7 1.7 0 0 0-1.5-1H2.5V10h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.34-1.88L3.7 7.06 6.56 4.2l.06.06A1.7 1.7 0 0 0 8.5 4.6a1.7 1.7 0 0 0 1-1.5V3h4.05v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.86 2.86-.06.06A1.7 1.7 0 0 0 18.95 9a1.7 1.7 0 0 0 1.5 1h.1v4h-.1a1.7 1.7 0 0 0-1.05 1Z"/></svg>;
}

export function MenuIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M4 7h16M4 12h16M4 17h16"/></svg>;
}

export function CloseIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="m5 5 14 14M19 5 5 19"/></svg>;
}

export function ArrowIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M4 12h15M14 6l6 6-6 6"/></svg>;
}

export function InfoIcon(props: IconProps) {
  return <svg {...base} {...props}><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.25v.1"/></svg>;
}

export function LogoutIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M10 5H5v14h5M14 8l4 4-4 4M8 12h10"/></svg>;
}
