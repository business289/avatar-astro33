import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function SolarSystem() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    document.title = "3D Solar System Explorer | Spiritual AI";
    return () => {
      document.title = "Spiritual AI";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Back button overlay */}
      <div className="absolute top-4 left-4 z-10">
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/70 hover:text-white transition-colors text-sm font-display tracking-wider"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.12)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>

      <iframe
        ref={iframeRef}
        src="/solar-system/index.html"
        className="w-full h-full border-0"
        title="3D Solar System Explorer"
        allow="autoplay"
      />
    </div>
  );
}
