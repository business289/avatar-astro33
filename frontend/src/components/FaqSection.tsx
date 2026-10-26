import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";

const faqs = [
  {
    question: "What can I explore on Spiritual?",
    answer:
      "Spiritual brings astrology and spiritual guidance together in one place. You can explore Birth Charts, Tarot Readings, Name Analysis, Palm Reading, Compatibility, Daily Horoscope, AI Guru guidance, Live Darshan, and devotional experiences.",
  },
  {
    question: "How does the Spiritual Birth Chart work?",
    answer:
      "Enter your birth details to generate your personalized birth chart. Spiritual uses your birth information to present planetary positions and astrology-based insights in an easy-to-understand format.",
  },
  {
    question: "Can I use Spiritual without knowing much about astrology?",
    answer:
      "Yes. Spiritual is designed for both beginners and people who already follow astrology. Our tools explain insights in a simple way so you can explore your chart, predictions, and spiritual guidance without needing advanced astrology knowledge.",
  },
  {
    question: "What is AI Guru on Spiritual?",
    answer:
      "AI Guru is your conversational spiritual guide. You can ask questions about astrology, life situations, spirituality, and personal guidance and receive AI-powered responses based on the information available to the experience.",
  },
  {
    question: "Can I get a daily horoscope on Spiritual?",
    answer:
      "Yes. Spiritual provides daily horoscope guidance based on your zodiac sign, helping you explore themes and insights for your day.",
  },
  {
    question: "What other spiritual experiences are available?",
    answer:
      "Along with astrology tools, Spiritual includes Live Darshan, temples, festivals, Daily Aarti, spiritual books, Puja & Remedies, and Mantras & Chants, bringing multiple spiritual experiences together in one platform.",
  },
];

const FaqSection = () => (
  <section className="relative z-10 w-full py-10 md:py-14">
    <div className="container relative mx-auto px-4 md:px-6">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-14">
        <div className="text-center lg:text-left">
          <p className="font-ui text-[13px] font-semibold tracking-[0.25em] uppercase text-[#C7A46A] mb-2">
            Questions, Answered
          </p>
          <h2 className="font-heading font-semibold tracking-[0.02em] normal-case leading-[1.2] text-[1.75rem] sm:text-[2rem] lg:text-[2.125rem] text-white">
            Start Your Journey
            <br />
            With <span className="text-[#C7A46A]">Clarity.</span>
          </h2>
        </div>

        <AccordionPrimitive.Root
          type="single"
          collapsible
          defaultValue="faq-0"
          className="w-full"
        >
          {faqs.map((faq, i) => (
            <AccordionPrimitive.Item
              key={faq.question}
              value={`faq-${i}`}
              className="border-b border-white/10 group"
            >
              <AccordionPrimitive.Header>
                <AccordionPrimitive.Trigger className="flex w-full items-center justify-between gap-4 py-4 text-left">
                  <span className="font-ui font-semibold text-white text-[1.0625rem] leading-snug sm:text-[1.125rem]">
                    {faq.question}
                  </span>
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 group-data-[state=open]:border-transparent group-data-[state=open]:bg-[#C7A46A] border-white/15 text-white/70 group-data-[state=open]:text-[#1a0f08]"
                  >
                    <Plus className="w-3.5 h-3.5 transition-transform duration-300 group-data-[state=open]:rotate-45" />
                  </span>
                </AccordionPrimitive.Trigger>
              </AccordionPrimitive.Header>
              <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                <p className="font-ui text-white/60 text-[0.9375rem] leading-[1.65] pb-4 pr-10">
                  {faq.answer}
                </p>
              </AccordionPrimitive.Content>
            </AccordionPrimitive.Item>
          ))}
        </AccordionPrimitive.Root>
      </div>
    </div>
  </section>
);

export default FaqSection;
