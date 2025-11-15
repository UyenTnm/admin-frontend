import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export function Card(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={`rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/60 backdrop-blur shadow-sm ${props.className ?? ""}`}
    />
  );
}

export function Button({
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition ${className}`}
    />
  );
}

export function ButtonPrimary({
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 border border-transparent bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition ${className}`}
    />
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-neutral-200/60 dark:bg-neutral-800/60 ${className}`}
    />
  );
}

export function AnimatedCounter({
  value,
  duration = 0.8,
}: {
  value: number;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const from = display;
    const to = value;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / (duration * 1000));
      setDisplay(Math.round(from + (to - from) * p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span>{display.toLocaleString()}</span>;
}

export function PageFade({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  );
}

export function ParallaxHero({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    container: undefined,
    target: ref,
    offset: ["start start", "end start"],
  });
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-950 p-6 sm:p-8 mb-4"
    >
      <motion.div
        style={{ y: y2 }}
        className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-gradient-to-tr from-violet-400/30 to-indigo-400/30 blur-3xl"
      />
      <motion.div
        style={{ y: y1 }}
        className="pointer-events-none absolute -left-16 -bottom-24 h-64 w-64 rounded-full bg-gradient-to-tr from-emerald-400/20 to-teal-400/20 blur-3xl"
      />
      <div className="relative">
        <h1 className="text-2xl sm:text-3xl font-semibold">{title}</h1>
        {subtitle && (
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
