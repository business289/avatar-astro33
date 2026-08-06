import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { AuthLayout } from "../components/AuthLayout";
import { AuthTextField } from "../components/AuthTextField";
import { AuthSubmitButton } from "../components/AuthSubmitButton";
import { StateSelect } from "../components/StateSelect";
import { useCompleteGoogleProfileMutation } from "../hooks/useAuthMutations";
import {
  googleOnboardingSchema,
  type GoogleOnboardingFormValues,
} from "../schemas/authSchemas";
import { safeZodResolver } from "../utils/safeZodResolver";

export default function GoogleOnboardingPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const mutation = useCompleteGoogleProfileMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GoogleOnboardingFormValues>({
    resolver: safeZodResolver<GoogleOnboardingFormValues>(
      googleOnboardingSchema,
    ),
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      phoneNo: user?.phoneNo ?? "",
      state: user?.state ?? "",
      city: user?.city ?? "",
      country: user?.country || "India",
      dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.slice(0, 10) : "",
      address: "",
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }
    if (user?.profileCompleted) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, user?.profileCompleted, navigate]);

  const onSubmit = handleSubmit(async (values) => {
    await mutation.mutateAsync({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      phoneNo: values.phoneNo.trim(),
      state: values.state.trim(),
      country: (values.country || "India").trim(),
      city: values.city.trim(),
      dateOfBirth: values.dateOfBirth,
    });
    navigate("/", { replace: true });
  });

  return (
    <AuthLayout
      title="Complete Your Profile"
      subtitle="A few details help our team personalize your experience. This step can't be skipped."
    >
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onSubmit={onSubmit}
        className="space-y-4"
        noValidate
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AuthTextField
            label="First Name"
            autoComplete="given-name"
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <AuthTextField
            label="Last Name"
            autoComplete="family-name"
            error={errors.lastName?.message}
            {...register("lastName")}
          />
        </div>

        <AuthTextField
          label="Phone Number"
          type="tel"
          inputMode="numeric"
          maxLength={10}
          placeholder="10-digit Indian mobile"
          autoComplete="tel-national"
          error={errors.phoneNo?.message}
          {...register("phoneNo")}
        />

        <AuthTextField
          label="Date of Birth"
          type="date"
          error={errors.dateOfBirth?.message}
          {...register("dateOfBirth")}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StateSelect error={errors.state?.message} {...register("state")} />
          <AuthTextField
            label="City"
            autoComplete="address-level2"
            error={errors.city?.message}
            {...register("city")}
          />
        </div>

        <AuthTextField
          label="Country"
          autoComplete="country-name"
          error={errors.country?.message}
          {...register("country")}
        />

        <AuthTextField
          label="Address (optional)"
          autoComplete="street-address"
          error={errors.address?.message}
          {...register("address")}
        />

        <AuthSubmitButton
          loading={mutation.isPending}
          loadingText="Saving…"
          className="mt-2"
        >
          Continue
        </AuthSubmitButton>
      </motion.form>
    </AuthLayout>
  );
}
