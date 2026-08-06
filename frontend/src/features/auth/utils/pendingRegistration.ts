const PENDING_REGISTRATION_KEY = "auth:pending-registration";

export interface PendingRegistrationData {
  email: string;
  phoneNo: string;
}

export function savePendingRegistration(data: PendingRegistrationData) {
  sessionStorage.setItem(PENDING_REGISTRATION_KEY, JSON.stringify(data));
}

export function loadPendingRegistration(): PendingRegistrationData | null {
  try {
    const raw = sessionStorage.getItem(PENDING_REGISTRATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingRegistrationData;
    if (!parsed?.email || !parsed?.phoneNo) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingRegistration() {
  sessionStorage.removeItem(PENDING_REGISTRATION_KEY);
}
