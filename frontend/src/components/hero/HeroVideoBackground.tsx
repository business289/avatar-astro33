import { useEffect, useRef, useState } from "react";

/** Existing project asset (already used by the previous hero card). */
export const HERO_VIDEO_SRC = "/images/temples/Solar_system.mp4";
/** First frame of the video above, so the poster and the video start identically. */
export const HERO_POSTER_SRC = "/images/hero/solar-system-poster.jpg";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

// Fade the media out at the bottom edge so it blends into the page below
// (and softens the generator watermark in the video's bottom-right corner).
const FADE_MASK = "linear-gradient(to bottom, #000 0%, #000 78%, transparent 100%)";

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && !!window.matchMedia?.(REDUCED_MOTION_QUERY).matches,
  );

  useEffect(() => {
    const query = window.matchMedia?.(REDUCED_MOTION_QUERY);
    if (!query) return;
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);

  return reduced;
}

/** True when the user asked the browser to save data; the video is then skipped. */
function prefersSavedData(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return !!connection?.saveData;
}

/**
 * Decorative full-bleed background for the homepage hero. It never takes
 * pointer input and is hidden from assistive technology. With reduced motion
 * (or data-saver) only the poster image is shown and the video is not fetched.
 */
const HeroVideoBackground = () => {
  const reducedMotion = usePrefersReducedMotion();
  const [saveData] = useState(prefersSavedData);
  const staticOnly = reducedMotion || saveData;
  const videoRef = useRef<HTMLVideoElement>(null);

  // Autoplay needs the muted *attribute* in some browsers; React only sets the property.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.defaultMuted = true;
    video.muted = true;
  }, [staticOnly]);

  // Stop decoding while the hero is scrolled out of view.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        Promise.resolve(video.play?.()).catch(() => undefined);
      } else {
        video.pause?.();
      }
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, [staticOnly]);

  return (
    <div
      aria-hidden="true"
      data-testid="hero-media"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ WebkitMaskImage: FADE_MASK, maskImage: FADE_MASK }}
    >
      {staticOnly ? (
        <img src={HERO_POSTER_SRC} alt="" className="h-full w-full object-cover object-center" />
      ) : (
        <video
          ref={videoRef}
          src={HERO_VIDEO_SRC}
          poster={HERO_POSTER_SRC}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          disablePictureInPicture
          disableRemotePlayback
          tabIndex={-1}
          className="h-full w-full object-cover object-center"
        />
      )}
    </div>
  );
};

export default HeroVideoBackground;
