import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MailCheck } from "lucide-react";
import { AuthLayout } from "../components/AuthLayout";
import { AuthTextField } from "../components/AuthTextField";
import { AuthSubmitButton } from "../components/AuthSubmitButton";
import { useForgotPasswordMutation } from "../hooks/useAuthMutations";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "../schemas/authSchemas";
import { safeZodResolver } from "../utils/safeZodResolver";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const mutation = useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: safeZodResolver<ForgotPasswordFormValues>(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (values: ForgotPasswordFormValues) => {
    await mutation.mutateAsync({ email: values.email.trim().toLowerCase() });
    setSent(true);
  });

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email and we'll send a secure reset link."
    >
      {sent ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 text-center"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10">
            <MailCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-lg tracking-wider text-foreground">
              Check your inbox
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              If an account exists for{" "}
              <span className="text-foreground">{getValues("email")}</span>, a
              password reset link is on its way. The link expires in one hour.
            </p>
          </div>
          <Link
            to="/login"
            className="btn-cosmic inline-flex rounded-xl px-6 py-3 text-sm font-semibold tracking-widest"
          >
            Back to Sign In
          </Link>
        </motion.div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <AuthTextField
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <AuthSubmitButton
            loading={mutation.isPending}
            loadingText="Sending link…"
          >
            Send Reset Link
          </AuthSubmitButton>
          <p className="text-center text-sm text-muted-foreground">
            Remembered it?{" "}
            <Link
              to="/login"
              className="font-medium text-primary transition-colors hover:text-primary/80"
            >
              Sign in
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
