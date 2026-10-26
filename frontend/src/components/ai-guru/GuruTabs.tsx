import { motion } from "framer-motion";
import { MessageCircle, Mic, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GuruTab } from "./GuruSidebar";

interface GuruTabsProps {
  activeTab: GuruTab;
  onChange: (tab: GuruTab) => void;
  reportReady: boolean;
  reportGenerating: boolean;
}

const TABS: { key: GuruTab; label: string; icon: typeof MessageCircle }[] = [
  { key: "consultation", label: "Consultation Mode", icon: MessageCircle },
  { key: "voice", label: "Voice Consultation", icon: Mic },
  { key: "report", label: "Diagnosis & Remedy Report", icon: FileText },
];

const GuruTabs = ({ activeTab, onChange, reportReady, reportGenerating }: GuruTabsProps) => (
  <div className="flex gap-1 overflow-x-auto border-b border-white/[0.08] bg-[#09090B]/60 px-4 md:px-6" role="tablist">
    {TABS.map(({ key, label, icon: Icon }) => (
      <button
        key={key}
        role="tab"
        aria-selected={activeTab === key}
        onClick={() => onChange(key)}
        className={cn(
          "relative flex shrink-0 items-center gap-2 px-4 py-3.5 text-sm font-medium text-[#6B7280] transition-colors hover:text-[#A3A3B2]",
          activeTab === key && "text-[#C7A46A]",
        )}
      >
        <Icon className="h-4 w-4" />
        {label}
        {key === "report" && reportReady && (
          <span className="rounded-full border border-[#C7A46A]/35 bg-[#C7A46A]/15 px-2 py-0.5 text-[10px] text-[#C7A46A]">
            Ready
          </span>
        )}
        {key === "report" && reportGenerating && (
          <span className="rounded-full border border-[#C7A46A]/35 bg-[#C7A46A]/15 px-2 py-0.5 text-[10px] text-[#C7A46A]">
            Generating…
          </span>
        )}
        {activeTab === key && (
          <motion.div
            layoutId="guru-tab-underline"
            className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-[#C7A46A] shadow-[0_0_8px_rgba(199,164,106,0.7)]"
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
          />
        )}
      </button>
    ))}
  </div>
);

export default GuruTabs;
