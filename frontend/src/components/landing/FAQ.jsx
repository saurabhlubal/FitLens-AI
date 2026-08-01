import { useState } from "react";
import { ChevronDown } from "lucide-react";

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
    <section className="relative py-28 px-6">

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent" />

      <div className="relative max-w-5xl mx-auto">

        <div className="text-center mb-16">

          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-5 py-2 text-sm font-semibold text-emerald-400">
            Frequently Asked Questions
          </span>

          <h2 className="mt-6 text-5xl font-bold text-white">
            Got Questions?
          </h2>

          <p className="mt-5 text-gray-400 text-lg">
            Everything you need to know about FitLens AI.
          </p>

        </div>

        <div className="space-y-5">

          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden"
            >
              <button
                onClick={() =>
                  setOpenIndex(openIndex === index ? -1 : index)
                }
                className="w-full flex items-center justify-between p-7 text-left"
              >
                <span className="text-lg font-semibold text-white">
                  {faq.question}
                </span>

                <ChevronDown
                  className={`transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`transition-all duration-300 overflow-hidden ${
                  openIndex === index
                    ? "max-h-96 pb-7 px-7"
                    : "max-h-0"
                }`}
              >
                <p className="text-gray-400 leading-8">
                  {faq.answer}
                </p>
              </div>

            </div>
          ))}

        </div>

      </div>

    </section>
  );
}