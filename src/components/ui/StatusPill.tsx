"use client";

interface Props {
  variant?: "default" | "warning" | "success" | "danger";
  children: React.ReactNode;
}

export default function StatusPill({ variant = "default", children }: Props) {
  const cls = variant === "default" ? "" : variant;
  return (
    <span className={`status-pill${cls ? ` ${cls}` : ""}`}>{children}</span>
  );
}
