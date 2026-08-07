import { useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { OtpForm } from "../components/OtpForm";
import {
  useResendOtpMutation,
  useVerifyOtpMutation,
} from "../hooks/useAuthMutations";
import type { OtpType, VerifyOtpLocationState } from "../types";
import { getPostAuthPath } from "../utils/postAuthRedirect";
import {
  clearPendingRegistration,
  loadPendingRegistration,
} from "../utils/pendingRegistration";

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as VerifyOtpLocationState | null;
  const pending = loadPendingRegistration();

  const email = state?.email ?? pending?.email ?? "";
  const type: OtpType = state?.type ?? "REGISTER";

  const verifyMutation = useVerifyOtpMutation();
  const resendMutation = useResendOtpMutation();

  const subtitle = useMemo(() => {
    if (type === "LOGIN") {
      return "Your account needs verification before you can continue.";
    }
    return "Enter the code we emailed you to finish registration.";
  }, [type]);

  useEffect(() => {
    if (!email) {
      navigate("/login", { replace: true });
    }
  }, [email, navigate]);

  if (!email) return null;

  const handleSubmit = async (otp: string) => {
    const session = await verifyMutation.mutateAsync({ email, otp, type });
    clearPendingRegistration();
    navigate(getPostAuthPath(session.user), { replace: true });
  };

  const handleResend = () => {
    void resendMutation.mutateAsync({ email, type });
  };

  return (
    <AuthLayout title="Verify OTP" subtitle={subtitle}>
      <OtpForm
        email={email}
        loading={verifyMutation.isPending}
        resending={resendMutation.isPending}
        onSubmit={(otp) => void handleSubmit(otp)}
        onResend={handleResend}
      />

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Wrong email?{" "}
        <Link
          to={type === "REGISTER" ? "/register" : "/login"}
          className="font-medium text-primary transition-colors hover:text-primary/80"
        >
          Go back
        </Link>
      </p>
    </AuthLayout>
  );
}
