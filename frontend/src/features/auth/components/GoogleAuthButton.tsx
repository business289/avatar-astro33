import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { useGoogleIdentity } from "../hooks/useGoogleIdentity";

interface GoogleAuthButtonProps {
  onCredential: (idToken: string) => void;
  disabled?: boolean;
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.94-2.92l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.95H1.26v3.09A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28a7.2 7.2 0 0 1 0-4.56V6.63H1.26a12 12 0 0 0 0 10.74l4.01-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.26 6.63l4.01 3.09C6.22 6.88 8.87 4.77 12 4.77z"
      />
    </svg>
  );
}

export function GoogleAuthButton({
  onCredential,
  disabled,
}: GoogleAuthButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { ready, error, renderButton } = useGoogleIdentity(onCredential);

  useEffect(() => {
    if (!disabled) {
      renderButton(containerRef.current);
    }
  }, [renderButton, disabled, ready]);

  // Google renders its button into a cross-origin iframe, so its width has to be
  // re-synced whenever our container resizes or the hit area drifts off.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || disabled || !ready) return;

    const observer = new ResizeObserver(() => renderButton(el));
    observer.observe(el);
    return () => observer.disconnect();
  }, [renderButton, disabled, ready]);

  if (error) {
    return (
      <p className="rounded-xl border border-border/40 bg-background/40 px-4 py-3 text-center text-xs text-muted-foreground">
        {error}
      </p>
    );
  }

  return (
    <div className="relative w-full">
      <button
        type="button"
        tabIndex={-1}
        disabled={!ready || disabled}
        className="pointer-events-none flex w-full items-center justify-center gap-3 rounded-xl border border-border/40 bg-background/30 py-3.5 text-sm font-semibold tracking-widest text-foreground backdrop-blur transition-colors hover:border-primary/50 hover:bg-background/50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {!ready ? (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        ) : (
          <>
            <GoogleIcon className="h-4 w-4" />
            CONTINUE WITH GOOGLE
          </>
        )}
      </button>

      {/* Google's real button sits on top, effectively invisible but fully
          interactive, so the click is a genuine user gesture on their iframe.
          A synthetic .click() forwarded into it is rejected by GSI. */}
      <div
        ref={containerRef}
        className="absolute inset-0 z-10 overflow-hidden opacity-[0.001]"
        style={{ colorScheme: "light" }}
      />
    </div>
  );
}
