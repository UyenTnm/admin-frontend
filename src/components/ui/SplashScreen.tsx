import { BRAND } from "../../config/brand";

export function SplashScreen() {
  return (
    <div
      className="fixed inset-0 z-[200] grid place-items-center text-white"
      style={{
        background:
          "radial-gradient(1200px 600px at 20% -10%, rgba(255,255,255,.08), transparent 60%), radial-gradient(1200px 600px at 120% 110%, rgba(255,255,255,.06), transparent 60%), linear-gradient(120deg, var(--brand-primary), var(--brand-secondary))",
      }}
    >
      <div className="splash-fade flex flex-col items-center gap-4 px-4">
        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-md">
          <picture>
            {BRAND.assets.illoWebp ? (
              <source srcSet={BRAND.assets.illoWebp} type="image/webp" />
            ) : null}
            <img
              src={BRAND.assets.illoPng}
              alt={BRAND.name}
              className="h-28 w-auto splash-float select-none pointer-events-none"
              draggable={false}
            />
          </picture>
        </div>
        <div className="text-center">
          <div className="text-2xl font-semibold tracking-wide">
            {BRAND.name}
          </div>
          <div className="text-sm/relaxed opacity-80">Loading dashboard…</div>
        </div>

        <div className="w-48 h-[3px] rounded-full bg-white/25 overflow-hidden">
          <div className="h-full w-1/2 bg-white/80 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
