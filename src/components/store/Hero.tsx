
import { ShoppingCart, CreditCard, MessageCircle, ArrowDown } from "lucide-react";

export function Hero() {
  const steps = [
    {
      icon: <ShoppingCart className="size-4 text-foreground/80" />,
      title: "1. Carrito",
      description: "Agrega tus productos",
    },
    {
      icon: <CreditCard className="size-4 text-foreground/80" />,
      title: "2. Checkout",
      description: "Elige envío y pago",
    },
    {
      icon: <MessageCircle className="size-4 text-foreground/80" />,
      title: "3. WhatsApp",
      description: "Finaliza tu pedido",
    },
  ];

  return (
    <section className="relative pt-24 sm:pt-28 pb-4 sm:pb-6">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 text-center relative">
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-semibold leading-[0.95] tracking-tight">
          <span className="text-gradient">Los mejores vapes,</span>
          <br />
          <span className="text-foreground">directo a tu puerta.</span>
        </h1>
        <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
          Puntos de retiro en Palermo y Recoleta. Envios a todo Caba y Argentina.
        </p>

        {/* Purchase Tutorial - Minimalist */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10 max-w-3xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center gap-3 text-left">
              <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                {step.icon}
              </div>
              <div>
                <h3 className="text-xs font-medium text-foreground">{step.title}</h3>
                <p className="text-[10px] text-muted-foreground leading-tight">{step.description}</p>
              </div>
            </div>
          ))}
        </div>



      </div>
    </section>
  );
}


