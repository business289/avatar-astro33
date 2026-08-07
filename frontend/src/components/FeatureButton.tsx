import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface FeatureButtonProps {
  to: string;
  label: string;
  className?: string;
}

const FeatureButton = ({ to, label, className = "" }: FeatureButtonProps) => (
  <Link
    to={to}
    className={`group/fbtn inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-['Inter'] text-sm font-semibold text-[#0b0f1a] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(232,147,95,0.5)] ${className}`}
    style={{ background: "linear-gradient(135deg, #f2a35f, #d9895f)" }}
  >
    {label}
    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/fbtn:translate-x-1" />
  </Link>
);

export default FeatureButton;
