import type { ReactNode } from "react";
import { Moon, Sparkles, Star, Sun, Sunrise, Sunset, Ban, CalendarDays } from "lucide-react";
import { formatClock, formatDuration, formatOffset, formatWithDay } from "@/lib/panchangFormat";
import type { PanchangData, PanchangSegment, TimeRange } from "@/types/panchang";

const cardClass = "rounded-2xl border border-[#C7A46A]/[0.18] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.35)]";
const cardStyle = { background: "linear-gradient(180deg, rgba(13,28,52,0.7) 0%, rgba(5,11,24,0.85) 100%)" };

const Card = ({ title, icon, children, testId }: { title: string; icon: ReactNode; children: ReactNode; testId?: string }) => (
  <section className={cardClass} style={cardStyle} data-testid={testId} aria-label={title}>
    <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C7A46A]">
      {icon}
      {title}
    </h3>
    {children}
  </section>
);

/** One Panchang element: the value at sunrise, with its end time and anything that follows before the next sunrise. */
const ElementCard = ({
  title, icon, segments, detail, testId,
}: {
  title: string;
  icon: ReactNode;
  segments: PanchangSegment[];
  detail?: (s: PanchangSegment) => string | undefined;
  testId: string;
}) => {
  const [current, ...later] = segments;
  return (
    <Card title={title} icon={icon} testId={testId}>
      <p className="text-2xl font-bold text-white">{current.name}</p>
      {detail?.(current) && <p className="text-sm text-white/55">{detail(current)}</p>}
      <dl className="mt-3 space-y-1 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-white/50">Starts</dt>
          <dd className="text-white/85">{formatWithDay(current.startsAt)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-white/50">Ends</dt>
          <dd className="font-semibold text-[#C7A46A]">{formatWithDay(current.endsAt)}</dd>
        </div>
      </dl>
      {later.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-white/10 pt-3 text-sm text-white/70">
          {later.map((s) => (
            <li key={s.startsAt.iso}>
              <span className="text-white/45">Then</span> <span className="font-medium text-white/90">{s.name}</span>{" "}
              <span className="text-white/45">until</span> {formatWithDay(s.endsAt)}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

const RangeRow = ({ label, range, tone, testId, note }: { label: string; range: TimeRange; tone: "bad" | "good"; testId: string; note?: string }) => (
  <li className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2" data-testid={testId}>
    <span className="flex items-center gap-2 text-sm font-medium text-white/90">
      <span className={`h-2 w-2 rounded-full ${tone === "bad" ? "bg-red-400" : "bg-emerald-400"}`} aria-hidden />
      {label}
    </span>
    <span className="text-sm tabular-nums text-white/80">
      {formatClock(range.start.time)} – {formatWithDay(range.end)}
    </span>
    {note && <span className="w-full pl-4 text-xs text-white/45">{note}</span>}
  </li>
);

const PanchangResults = ({ data }: { data: PanchangData }) => {
  return (
    <div className="space-y-6" data-testid="panchang-results">
      <div className={`${cardClass} text-center`} style={cardStyle}>
        <p className="text-sm text-white/55">
          {data.lunarMonth.adhika ? "Adhika " : ""}
          {data.lunarMonth.name} · {data.tithi[0].paksha} Paksha
        </p>
        <p className="mt-1 text-lg text-white/90" data-testid="panchang-summary">{data.summary}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card title="Vara (weekday)" icon={<CalendarDays className="h-4 w-4" />} testId="element-vara">
          <p className="text-2xl font-bold text-white">{data.vara.name}</p>
          <p className="text-sm text-white/55">
            {data.vara.sanskritName} · ruled by {data.vara.lord}
          </p>
          <p className="mt-3 text-sm text-white/50">Runs sunrise to sunrise.</p>
        </Card>
        <ElementCard
          title="Tithi" icon={<Moon className="h-4 w-4" />} testId="element-tithi"
          segments={data.tithi}
          detail={(s) => `${(s as (typeof data.tithi)[number]).paksha} Paksha · tithi ${s.number} of 30`}
        />
        <ElementCard
          title="Nakshatra" icon={<Star className="h-4 w-4" />} testId="element-nakshatra"
          segments={data.nakshatra}
          detail={(s) => `Ruled by ${(s as (typeof data.nakshatra)[number]).lord}`}
        />
        <ElementCard title="Yoga" icon={<Sparkles className="h-4 w-4" />} testId="element-yoga" segments={data.yoga} detail={(s) => `Yoga ${s.number} of 27`} />
        <ElementCard title="Karana" icon={<Sun className="h-4 w-4" />} testId="element-karana" segments={data.karana} detail={(s) => `Half-tithi ${s.number} of 60`} />
        <Card title="Sun" icon={<Sunrise className="h-4 w-4" />} testId="sun-times">
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="flex items-center gap-1.5 text-white/50"><Sunrise className="h-4 w-4" /> Sunrise</dt>
              <dd className="font-semibold text-white" data-testid="sunrise">{formatClock(data.sun.sunrise.time)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="flex items-center gap-1.5 text-white/50"><Sunset className="h-4 w-4" /> Sunset</dt>
              <dd className="font-semibold text-white" data-testid="sunset">{formatClock(data.sun.sunset.time)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-white/50">Daylight</dt>
              <dd className="text-white/85">{formatDuration(data.sun.dayLengthMinutes)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-white/50">Time zone</dt>
              <dd className="text-white/85" data-testid="timezone">{data.location.timezone} ({formatOffset(data.utcOffsetMinutes)})</dd>
            </div>
          </dl>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card title="Inauspicious periods" icon={<Ban className="h-4 w-4" />} testId="inauspicious">
          <ul className="divide-y divide-white/10">
            <RangeRow label="Rahu Kalam" range={data.rahuKalam} tone="bad" testId="rahu-kalam" />
            <RangeRow label="Yamaganda" range={data.yamaganda} tone="bad" testId="yamaganda" />
            <RangeRow label="Gulika Kalam" range={data.gulika} tone="bad" testId="gulika" />
          </ul>
        </Card>
        <Card title="Auspicious period" icon={<Sparkles className="h-4 w-4" />} testId="auspicious">
          <ul>
            <RangeRow label="Abhijit Muhurta" range={data.abhijitMuhurta} tone="good" testId="abhijit" note={data.abhijitMuhurta.note} />
          </ul>
        </Card>
      </div>

      <p className="text-center text-xs leading-relaxed text-white/40" data-testid="method-note">
        Calculated from astronomical positions ({data.calculation.engine}) using the {data.calculation.ayanamsa} ayanamsa
        ({data.calculation.ayanamsaDegrees.toFixed(4)}°), {data.calculation.lunarMonthSystem} lunar months and sunrise-based
        days at the selected location. Times may differ by a minute or two from other almanacs.
      </p>
    </div>
  );
};

export default PanchangResults;
