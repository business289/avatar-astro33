import { authRequest } from "@/lib/authClient";
import { useAuthStore } from "@/store/authStore";
import type {
  AuthSession,
  AuthUser,
  CompleteProfilePayload,
  ForgotPasswordPayload,
  GoogleLoginPayload,
  LoginPayload,
  LoginResult,
  Msg91Config,
  RegisterPayload,
  ResendOtpPayload,
  ResetPasswordPayload,
  TokenPair,
  VerifyOtpPayload,
  VerifyPhonePayload,
} from "../types";

export const authApi = {
  register(payload: RegisterPayload) {
    return authRequest<null>("/auth/register", {
      method: "POST",
      body: payload,
      skipAuth: true,
    });
  },

  login(payload: LoginPayload) {
    return authRequest<LoginResult>("/auth/login", {
      method: "POST",
      body: payload,
      skipAuth: true,
    });
  },

  googleLogin(payload: GoogleLoginPayload) {
    return authRequest<AuthSession>("/auth/google", {
      method: "POST",
      body: payload,
      skipAuth: true,
    });
  },

  verifyOtp(payload: VerifyOtpPayload) {
    return authRequest<AuthSession>("/auth/verify-otp", {
      method: "POST",
      body: payload,
      skipAuth: true,
    });
  },

  resendOtp(payload: ResendOtpPayload) {
    return authRequest<null>("/auth/resend-otp", {
      method: "POST",
      body: payload,
      skipAuth: true,
    });
  },

  verifyPhone(payload: VerifyPhonePayload) {
    return authRequest<AuthSession>("/auth/verify-phone", {
      method: "POST",
      body: payload,
      skipAuth: true,
    });
  },

  getMsg91Config() {
    return authRequest<Msg91Config>("/auth/msg91-config", {
      skipAuth: true,
    });
  },

  forgotPassword(payload: ForgotPasswordPayload) {
    return authRequest<null>("/auth/forgot-password", {
      method: "POST",
      body: payload,
      skipAuth: true,
    });
  },

  resetPassword(payload: ResetPasswordPayload) {
    return authRequest<null>("/auth/reset-password", {
      method: "POST",
      body: payload,
      skipAuth: true,
    });
  },

  completeGoogleProfile(payload: CompleteProfilePayload) {
    return authRequest<AuthUser>("/auth/complete-profile", {
      method: "POST",
      body: payload,
    });
  },

  refresh(refreshToken: string) {
    return authRequest<TokenPair>("/auth/refresh", {
      method: "POST",
      body: { refreshToken },
      skipAuth: true,
    });
  },

  async logout() {
    const { refreshToken, logout: clearSession } = useAuthStore.getState();
    try {
      if (refreshToken) {
        await authRequest<null>("/auth/logout", {
          method: "POST",
          body: { refreshToken },
          skipAuth: true,
        });
      }
    } finally {
      clearSession();
    }
  },

  logoutAll() {
    return authRequest<null>("/auth/logout-all", {
      method: "POST",
    });
  },

  /** Backend has no /me endpoint — restore from the persisted Zustand session. */
  getCurrentUser(): AuthUser | null {
    return useAuthStore.getState().user as AuthUser | null;
  },
};
