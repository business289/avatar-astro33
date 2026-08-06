import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthSubmitButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
        "btn-cosmic flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold tracking-widest disabled:cursor-not-allowed disabled:opacity-70",
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
