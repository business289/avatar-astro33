import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { AuthSubmitButton } from "./AuthSubmitButton";

const RESEND_COOLDOWN_SECONDS = 60;

interface OtpFormProps {
  email: string;
  loading?: boolean;
  resending?: boolean;
  onSubmit: (otp: string) => void;
  onResend: () => void;
  /** When true, skip auto-submit on 6 digits and wait for button. */
  requireConfirm?: boolean;
}

export function OtpForm({
  email,
  loading,
  resending,
  onSubmit,
  onResend,
  requireConfirm = false,
}: OtpFormProps) {
  const [otp, setOtp] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SECONDS);
  const [submittedValue, setSubmittedValue] = useState<string | null>(null);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [secondsLeft]);

  useEffect(() => {
    if (requireConfirm) return;
    if (otp.length === 6 && otp !== submittedValue && !loading) {
      setSubmittedValue(otp);
      onSubmit(otp);
    }
  }, [otp, requireConfirm, submittedValue, loading, onSubmit]);

  const handleResend = () => {
    if (secondsLeft > 0 || resending) return;
    onResend();
    setSecondsLeft(RESEND_COOLDOWN_SECONDS);
    setOtp("");
    setSubmittedValue(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <p className="text-center text-sm text-muted-foreground">
        Enter the 6-digit code sent to{" "}
        <span className="text-foreground">{email}</span>
      </p>

      <div className="flex justify-center">
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={setOtp}
          disabled={loading}
          autoFocus
          containerClassName="gap-2"
        >
          <InputOTPGroup className="gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <InputOTPSlot
                key={index}
                index={index}
                className="h-12 w-11 rounded-xl border border-border/50 bg-background/40 text-lg font-medium text-foreground first:rounded-xl first:border-l last:rounded-xl data-[active=true]:border-primary data-[active=true]:ring-2 data-[active=true]:ring-primary/40"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>

      {requireConfirm ? (
        <AuthSubmitButton
          loading={loading}
          loadingText="Verifying…"
          disabled={otp.length !== 6}
          onClick={(e) => {
            e.preventDefault();
            if (otp.length === 6) onSubmit(otp);
          }}
        >
          Verify OTP
        </AuthSubmitButton>
      ) : (
        loading && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Verifying…
          </div>
        )
      )}

      <div className="text-center text-sm text-muted-foreground">
        {secondsLeft > 0 ? (
          <span>
            Resend available in{" "}
            <span className="tabular-nums text-foreground">{secondsLeft}s</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="font-medium text-primary transition-colors hover:text-primary/80 disabled:opacity-60"
          >
            {resending ? "Sending…" : "Resend OTP"}
          </button>
        )}
      </div>
    </motion.div>
  );
}
