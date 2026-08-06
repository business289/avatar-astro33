import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { PasswordField } from "../components/PasswordField";
import { AuthSubmitButton } from "../components/AuthSubmitButton";
import { useResetPasswordMutation } from "../hooks/useAuthMutations";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "../schemas/authSchemas";
import { safeZodResolver } from "../utils/safeZodResolver";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = useMemo(() => params.get("token")?.trim() ?? "", [params]);
  const mutation = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: safeZodResolver<ResetPasswordFormValues>(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  if (!token) {
    return (
      <AuthLayout
        title="Invalid Link"
        subtitle="This password reset link is missing or incomplete."
      >
        <Link
          to="/forgot-password"
          className="btn-cosmic flex w-full items-center justify-center rounded-xl py-3.5 text-sm font-semibold tracking-widest"
        >
          Request a new link
        </Link>
      </AuthLayout>
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    await mutation.mutateAsync({ token, password: values.password });
    navigate("/login", { replace: true });
  });

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Choose a strong new password for your account."
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <PasswordField
          label="New Password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <PasswordField
          label="Confirm Password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        <AuthSubmitButton
          loading={mutation.isPending}
          loadingText="Updating…"
        >
          Update Password
        </AuthSubmitButton>
      </form>
    </AuthLayout>
  );
}
