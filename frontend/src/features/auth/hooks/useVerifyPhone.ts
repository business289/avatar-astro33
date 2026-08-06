// Bridges the MSG91 widget to the backend's POST /auth/verify-phone.

import { useCallback } from "react";
import { toast } from "sonner";
import { useVerifyPhoneMutation } from "./useAuthMutations";

interface UseVerifyPhoneResult {
  verifyPhone: (accessToken: string) => Promise<void>;
  handleWidgetError: (message: string) => void;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  isSuccess: boolean;
}

export function useVerifyPhone(email: string): UseVerifyPhoneResult {
  const mutation = useVerifyPhoneMutation();

  const verifyPhone = useCallback(
    async (accessToken: string) => {
      await mutation.mutateAsync({ email, accessToken });
    },
    [email, mutation],
  );

  const handleWidgetError = useCallback((message: string) => {
    toast.error(message);
  }, []);

  const clearError = useCallback(() => mutation.reset(), [mutation]);

  return {
    verifyPhone,
    handleWidgetError,
    loading: mutation.isPending,
    error: mutation.error
      ? mutation.error instanceof Error
        ? mutation.error.message
        : "Phone verification failed."
      : null,
    clearError,
    isSuccess: mutation.isSuccess,
  };
}
