import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";
import { useSite } from "@/lib/siteContent";

export default function HowToOrder() {
  const { how_to_order } = useSite();
  return (
    <motion.ol
      className="grid gap-4 md:grid-cols-3 md:gap-6"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15 } } }}
    >
      {how_to_order.map((step, i) => (
        <motion.li
          key={step.title}
          variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } } }}
          className="relative rounded-[1.75rem] bg-white/70 p-7 md:p-8"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-wine font-brand text-xl text-blush">{i + 1}</span>
          <h3 className="mt-5 font-brand text-2xl text-wine">{step.title}</h3>
          <p className="mt-2 leading-relaxed text-ink-soft">{step.text}</p>
        </motion.li>
      ))}
    </motion.ol>
  );
}
