import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthSubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
}

export function AuthSubmitButton({
  loading,
  loadingText = "Please wait…",
  children,
  className,
  disabled,
  type = "submit",
  ...props
}: AuthSubmitButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        // Utilities rather than the .btn-cosmic components-layer class, so these
        // always sort after preflight. Note the `_/_` in the arbitrary shadow
        // values: a bare `/` there reads as Tailwind's opacity-modifier
        // separator and the candidate is silently dropped from the build.
        "flex w-full items-center justify-center gap-2 rounded-xl py-3.5",
        "bg-gradient-to-br from-gold to-gold-dim text-cosmic-dark",
        "font-display text-sm font-semibold uppercase tracking-widest",
        "shadow-[0_4px_20px_hsl(var(--gold)_/_0.3)] transition-all duration-300",
        "hover:-translate-y-0.5 hover:shadow-[0_6px_30px_hsl(var(--gold)_/_0.5)]",
        "disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0",
        className,
      )}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
