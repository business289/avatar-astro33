import { useRef, useState, useCallback } from "react";

export interface TTSHandle {
  speak: (text: string, lang?: string, onEnd?: () => void) => void;
  stop: () => void;
  speaking: boolean;
  supported: boolean;
  muted: boolean;
  toggleMute: () => void;
}

export function useTextToSpeech(): TTSHandle {
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  const pendingOnEndRef = useRef<(() => void) | null>(null);

  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  const speak = useCallback(
    (text: string, lang = "hi-IN", onEnd?: () => void) => {
      if (!supported) {
        onEnd?.();
        return;
      }
      window.speechSynthesis.cancel();
      pendingOnEndRef.current = onEnd || null;

      if (mutedRef.current) {
        setSpeaking(false);
        onEnd?.();
        pendingOnEndRef.current = null;
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.88;
      utterance.pitch = 0.92;

      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => {
        setSpeaking(false);
        pendingOnEndRef.current?.();
        pendingOnEndRef.current = null;
      };
      utterance.onerror = () => {
        setSpeaking(false);
        pendingOnEndRef.current?.();
        pendingOnEndRef.current = null;
      };

      window.speechSynthesis.speak(utterance);
      setSpeaking(true);
    },
    [supported]
  );

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    pendingOnEndRef.current?.();
    pendingOnEndRef.current = null;
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      mutedRef.current = next;
      if (next) {
        window.speechSynthesis?.cancel();
        setSpeaking(false);
      }
      return next;
    });
  }, []);

  return { speak, stop, speaking, supported, muted, toggleMute };
}
