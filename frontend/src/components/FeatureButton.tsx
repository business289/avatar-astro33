import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface FeatureButtonProps {
  to: string;
  label: string;
  className?: string;
  /** "sm" is the compact size used inside the homepage showcase. */
  size?: "md" | "sm";
}

const sizes = {
  md: "h-10 gap-2 px-5 text-sm",
  sm: "h-9 gap-1.5 px-4 text-[0.9rem]",
};

/** Filled gold call-to-action (dark navy label for contrast). */
const FeatureButton = ({ to, label, className = "", size = "md" }: FeatureButtonProps) => (
  <Link
    to={to}
    className={`group/fbtn inline-flex items-center rounded-full bg-brand-accent font-ui font-semibold text-[#081426] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_22px_rgba(199,164,106,0.45)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${sizes[size]} ${className}`}
  >
    {label}
    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/fbtn:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover/fbtn:translate-x-0" />
  </Link>
);

export default FeatureButton;
