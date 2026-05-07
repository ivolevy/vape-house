import heroImg from "@/assets/hero-vape.png";

export function Hero() {
  return (
    <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 text-center relative">
        <div className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-8">
          <span className="h-px w-8 bg-white/20" /> Argentina · 2026 <span className="h-px w-8 bg-white/20" />
        </div>
        <h1 className="font-display text-5xl sm:text-7xl md:text-8xl font-semibold leading-[0.95] tracking-tight">
          <span className="text-gradient">LA EVOLUCIÓN</span>
          <br />
          <span className="text-foreground">DEL VAPEO</span>
        </h1>
        <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
          Los mejores vapes, directo a tu puerta. Curado con obsesión por la calidad.
        </p>
        <div className="mt-10 flex justify-center">
          <a href="#catalogo" className="btn-premium inline-flex items-center gap-2 text-sm">
            Ver catálogo →
          </a>
        </div>

        <div className="relative mt-16 sm:mt-20 flex justify-center">
          <div className="absolute inset-0 -z-10 blur-3xl opacity-60"
               style={{ background: "radial-gradient(closest-side, oklch(0.55 0.22 320 / 0.45), transparent 70%)" }} />
          <img
            src={heroImg}
            alt="Vape premium"
            width={520}
            height={520}
            className="w-[260px] sm:w-[360px] md:w-[460px] h-auto animate-drift drop-shadow-[0_30px_60px_rgba(120,40,180,0.35)]"
          />
        </div>
      </div>
    </section>
  );
}
