import { z } from "zod";

export const indianPhoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain uppercase, lowercase, and a number",
  );

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Enter a valid email"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
    phoneNo: indianPhoneSchema,
    state: z.string().min(1, "State is required"),
    city: z.string().min(1, "City is required"),
    country: z.string().min(1, "Country is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must be a 6-digit number"),
});

export type OtpFormValues = z.infer<typeof otpSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const googleOnboardingSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNo: indianPhoneSchema,
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((value) => {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return false;
      return date <= new Date();
    }, "Date of birth cannot be in the future")
    .refine((value) => {
      const date = new Date(value);
      const now = new Date();
      const age =
        (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      return age >= 10;
    }, "You must be at least 10 years old"),
  address: z.string().optional(),
});

export type GoogleOnboardingFormValues = z.infer<typeof googleOnboardingSchema>;

export const verificationMethodSchema = z.object({
  method: z.enum(["email", "mobile"], {
    required_error: "Choose a verification method",
  }),
});

export type VerificationMethodFormValues = z.infer<
  typeof verificationMethodSchema
>;
