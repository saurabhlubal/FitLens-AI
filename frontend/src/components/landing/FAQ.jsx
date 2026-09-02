import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "How does FitLens AI analyze my posture?",
    answer:
      "FitLens AI uses advanced computer vision and pose estimation models to detect your body joints in real time and provide posture feedback during workouts.",
  },
  {
    question: "Do I need any wearable sensors?",
    answer:
      "No. Everything works directly through your device's camera. No watches, sensors, or additional hardware are required.",
  },
  {
    question: "Which exercises are supported?",
    answer:
      "Initially, FitLens AI will support Push-ups, Squats, Planks, Lunges, Bicep Curls, and more. Additional exercises will be added over time.",
  },
  {
    question: "Is my camera footage stored?",
    answer:
      "No. Your workout is processed locally whenever possible. We prioritize user privacy and never store your camera feed without permission.",
  },
  {
    question: "Can beginners use FitLens AI?",
    answer:
      "Absolutely. Whether you're a beginner or an experienced athlete, the AI provides easy-to-understand guidance and form correction.",
  },
  {
    question: "Is FitLens AI free?",
    answer:
      "The project starts with a free version featuring core AI workout analysis. Premium features may be introduced in the future.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="relative py-28 sm:py-32 px-6">
      <div className="relative max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="inline-block rounded-full border border-[#B8F23A]/30 bg-[#B8F23A]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#B8F23A]">
            Frequently Asked Questions
          </span>

          <h2 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-[#F5F5F0]">
            Got Questions?
          </h2>

          <p className="mt-5 text-[#A8A8A2] text-base sm:text-lg leading-relaxed">
            Everything you need to know about FitLens AI.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? "border-[#B8F23A]/35 bg-[#0e110a]"
                    : "border-white/[0.08] bg-[#0c0c0e] hover:border-white/15"
                }`}
              >
                <button
                  onClick={() =>
                    setOpenIndex(isOpen ? -1 : index)
                  }
                  className="w-full flex items-center justify-between p-6 sm:p-7 text-left gap-4"
                >
                  <span className="text-base sm:text-lg font-bold text-[#F5F5F0]">
                    {faq.question}
                  </span>

                  <ChevronDown
                    size={20}
                    className={`shrink-0 text-[#B8F23A] transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pb-7 px-6 sm:px-7 pt-1 border-t border-white/[0.04]">
                        <p className="text-[#A8A8A2] text-sm sm:text-base leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}