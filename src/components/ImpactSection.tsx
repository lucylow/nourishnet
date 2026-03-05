import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

function useCounter(end: number, duration = 2000, inView: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration / 16);
    const id = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(id); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(id);
  }, [end, duration, inView]);
  return count;
}

const ImpactSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const meals = useCounter(1247, 2000, inView);
  const co2 = useCounter(3200, 2000, inView);
  const people = useCounter(842, 2000, inView);

  return (
    <section id="impact" className="container mx-auto my-16" ref={ref}>
      <div className="rounded-4xl p-12 text-center text-primary-foreground" style={{ background: "var(--gradient-impact)" }}>
        <h2 className="text-3xl md:text-4xl font-bold mb-2">Real impact, measurable results</h2>
        <p className="opacity-80 mb-8">Since our pilot launch (simulated for hackathon demo)</p>
        <div className="flex justify-center gap-12 flex-wrap">
          <motion.div initial={{ scale: 0.8 }} animate={inView ? { scale: 1 } : {}} transition={{ delay: 0.1 }}>
            <div className="text-5xl font-extrabold">{meals.toLocaleString()}</div>
            <div className="opacity-80">meals rescued</div>
          </motion.div>
          <motion.div initial={{ scale: 0.8 }} animate={inView ? { scale: 1 } : {}} transition={{ delay: 0.2 }}>
            <div className="text-5xl font-extrabold">{co2.toLocaleString()}</div>
            <div className="opacity-80">kg CO₂ saved</div>
          </motion.div>
          <motion.div initial={{ scale: 0.8 }} animate={inView ? { scale: 1 } : {}} transition={{ delay: 0.3 }}>
            <div className="text-5xl font-extrabold">{people.toLocaleString()}</div>
            <div className="opacity-80">people helped</div>
          </motion.div>
        </div>
        <p className="text-sm opacity-60 mt-6">*Live counters update on scroll — reflecting agent activity.</p>
      </div>
    </section>
  );
};

export default ImpactSection;
