import { Truck, ShieldCheck, MessageCircle } from "lucide-react";
const items = [
  { icon: Truck, title: "Envíos rápidos", desc: "A todo el país en 24/72hs." },
  { icon: ShieldCheck, title: "Productos originales", desc: "100% verificados y sellados." },
  { icon: MessageCircle, title: "Atención personalizada", desc: "Te asesoramos por WhatsApp." },
];
export function Benefits() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 grid sm:grid-cols-3 gap-4 sm:gap-6">
        {items.map((it) => (
          <div key={it.title} className="glass rounded-2xl p-7 text-center">
            <div className="mx-auto h-11 w-11 rounded-full flex items-center justify-center bg-white/5 border border-white/10 mb-4">
              <it.icon className="size-5" />
            </div>
            <h3 className="font-display text-base font-semibold tracking-wide uppercase">{it.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{it.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
