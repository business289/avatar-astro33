/** Auth types mirrored from the Express/Prisma backend responses. */

export type AuthProvider = "LOCAL" | "GOOGLE";

export type OtpType = "REGISTER" | "LOGIN";

export type RoleName = "USER" | "ADMIN" | "SUPERADMIN" | "SUPER_ADMIN" | string;

export interface AuthRole {
  id: string;
  name: RoleName;
  description: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface UserRoleMapping {
  id: string;
  userId: string;
  roleId: string;
  assignedAt: string;
  assignedBy: string | null;
  role: AuthRole;
}

/** Safe user object returned by the backend (password stripped). */
export interface AuthUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phoneNo: string | null;
  address: string | null;
  gender: string | null;
  state: string | null;
  country: string | null;
  city: string | null;
  dateOfBirth: string | null;
  profileImage: string | null;
  profileImagePublicId: string | null;
  email: string;
  googleId: string | null;
  authProvider: AuthProvider;
  profileCompleted: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
  userRoleMappings?: UserRoleMapping[];
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequiresVerification {
  requiresVerification: true;
}

export type LoginResult = AuthSession | LoginRequiresVerification;

export function isAuthSession(data: unknown): data is AuthSession {
  if (!data || typeof data !== "object") return false;
  const value = data as Record<string, unknown>;
  return (
    typeof value.accessToken === "string" &&
    typeof value.refreshToken === "string" &&
    typeof value.user === "object" &&
    value.user !== null
  );
}

export interface Msg91Config {
  widgetId: string;
  tokenAuth: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNo: string;
  state: string;
  country: string;
  city: string;
  referralCode?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
  type: OtpType;
}

export interface ResendOtpPayload {
  email: string;
  type: OtpType;
}

export interface VerifyPhonePayload {
  email: string;
  accessToken: string;
}

export interface GoogleLoginPayload {
  idToken: string;
  referralCode?: string;
}

export interface CompleteProfilePayload {
  firstName: string;
  lastName: string;
  phoneNo: string;
  state: string;
  country: string;
  city: string;
  dateOfBirth: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

/** Location state passed into /verify-otp */
export interface VerifyOtpLocationState {
  email: string;
  type: OtpType;
  phoneNo?: string;
}

/** Pending registration data for verification method step */
export interface PendingRegistration {
  email: string;
  phoneNo: string;
}
