import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";

/** True once the persisted auth session has been read from localStorage. */
export function useAuthHydrated() {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const [ready, setReady] = useState(
    () => hasHydrated || useAuthStore.persist.hasHydrated(),
  );

  useEffect(() => {
    if (hasHydrated || useAuthStore.persist.hasHydrated()) {
      setReady(true);
      if (!hasHydrated) useAuthStore.setState({ hasHydrated: true });
      return;
    }

    return useAuthStore.persist.onFinishHydration(() => {
      useAuthStore.setState({ hasHydrated: true });
      setReady(true);
    });
  }, [hasHydrated]);

  return ready;
}
