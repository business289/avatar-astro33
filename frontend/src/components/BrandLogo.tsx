import { Link } from "react-router-dom";

/**
 * Path of the real My Bhagya logo, served from `frontend/public`.
 *
 * No My Bhagya logo file exists in this repository yet, so this is `null` and
 * the navbar keeps showing the existing wordmark. To switch the site over,
 * add the optimized logo (transparent PNG, SVG or WebP) and set the path, for
 * example: `"/images/brand/my-bhagya-logo.png"`. Nothing else needs to change.
 */
export const BRAND_LOGO_SRC: string | null = null;

export const BRAND_NAME = "My Bhagya";

interface BrandLogoProps {
  className?: string;
}

/** Site logo, linked to the homepage. Used top-left in the navbar. */
const BrandLogo = ({ className = "" }: BrandLogoProps) => {
  if (BRAND_LOGO_SRC) {
    return (
      <Link to="/" aria-label={`${BRAND_NAME} home`} className={`flex items-center select-none ${className}`}>
        <img
          src={BRAND_LOGO_SRC}
          alt={BRAND_NAME}
          // Height-driven so the artwork keeps its own proportions and transparency.
          className="h-8 w-auto max-w-[9.5rem] object-contain md:h-10 md:max-w-[12rem]"
          decoding="async"
        />
      </Link>
    );
  }

  // Fallback until the real logo file is added: the existing wordmark.
  return (
    <Link to="/" className={`group flex items-center gap-2 select-none ${className}`}>
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-5 w-5 text-brand-accent transition-transform duration-500 group-hover:rotate-90"
      >
        <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" />
      </svg>
      <span className="font-brand text-lg font-normal tracking-[0.18em] text-brand-accent">SPIRITUAL</span>
    </Link>
  );
};

export default BrandLogo;
