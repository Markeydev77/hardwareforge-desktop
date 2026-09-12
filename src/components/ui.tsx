import * as React from "react";
import { cn } from "@/lib/utils";

/* Male UI primitivy v jednom subore - su to len obalky nad Tailwindom,
   samostatne subory by tu boli rezia bez uzitku. Zlozitejsie prvky
   (Dialog, Select) su vedla, postavene nad Radixom. */

const BUTTON_VARIANTS = {
  primary:
    "bg-[var(--accent)] text-[var(--accent-fg)] hover:brightness-110 border border-transparent",
  secondary:
    "bg-[var(--surface)] text-[var(--text)] border border-[var(--border-strong)] hover:bg-[var(--surface-hover)]",
  ghost: "bg-transparent text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] border border-transparent",
  danger: "bg-red-500/12 text-red-300 border border-red-500/35 hover:bg-red-500/20",
} as const;

const BUTTON_SIZES = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-9.5 px-4 text-sm gap-2",
  icon: "h-9 w-9 justify-center",
} as const;

export function Button({
  variant = "secondary",
  size = "md",
  className,
  ...props
}: React.ComponentProps<"button"> & {
  variant?: keyof typeof BUTTON_VARIANTS;
  size?: keyof typeof BUTTON_SIZES;
}) {
  return (
    <button
      className={cn(
        "focus-ring inline-flex cursor-pointer items-center rounded-lg font-medium transition-all",
        "disabled:pointer-events-none disabled:opacity-50",
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        className,
      )}
      {...props}
    />
  );
}

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("card p-5", className)} {...props} />;
}

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "focus-ring h-9.5 w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-subtle)] px-3 text-sm",
        "placeholder:text-[var(--text-muted)] disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "focus-ring w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-subtle)] px-3 py-2 text-sm",
        "placeholder:text-[var(--text-muted)]",
        className,
      )}
      {...props}
    />
  );
}

/** Natívny select - pre jednoduche vybery netreba Radix. */
export function NativeSelect({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "focus-ring h-9.5 w-full cursor-pointer rounded-lg border border-[var(--border-strong)] bg-[var(--bg-subtle)] px-3 text-sm",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn("mb-1.5 block text-xs font-medium text-[var(--text-muted)]", className)}
      {...props}
    />
  );
}

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-[var(--text-muted)]">{hint}</p>}
    </div>
  );
}

export function Badge({
  className,
  dot,
  children,
}: {
  className?: string;
  dot?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        className,
      )}
    >
      {dot && (
        <span
          className="size-1.5 shrink-0 rounded-full"
          style={{ background: dot }}
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}

export function Progress({ value, className }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]", className)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      {icon && <div className="text-[var(--text-muted)] opacity-60">{icon}</div>}
      <div>
        <p className="font-medium">{title}</p>
        {description && (
          <p className="mt-1 max-w-sm text-sm text-[var(--text-muted)]">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function Stat({
  label,
  value,
  sub,
  className,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("card p-4", className)}>
      <p className="text-[11px] font-medium tracking-wide text-[var(--text-muted)] uppercase">
        {label}
      </p>
      <p className="tabular mt-1.5 text-2xl leading-none font-semibold">{value}</p>
      {sub && <p className="mt-1.5 text-xs text-[var(--text-muted)]">{sub}</p>}
    </div>
  );
}
