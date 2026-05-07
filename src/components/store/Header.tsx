import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-store";

export function Header() {
  const { setOpen, count } = useCart();
  return (
    <header className="fixed top-4 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto glass rounded-full flex items-center gap-1 sm:gap-2 px-2 py-2 shadow-lg backdrop-blur-xl">
        <Link
          to="/"
          className="font-display text-xs sm:text-sm tracking-[0.2em] font-semibold px-3 sm:px-4"
        >
          VAPE<span className="text-[oklch(0.75_0.18_320)]">·</span>HOUSE
        </Link>
        <a
          href="#inicio"
          className="text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-full hover:bg-white/5 transition text-muted-foreground hover:text-foreground"
        >
          Inicio
        </a>
        <a
          href="#catalogo"
          className="text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-full hover:bg-white/5 transition text-muted-foreground hover:text-foreground"
        >
          Catálogo
        </a>
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir carrito"
          className="relative h-9 w-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
        >
          <ShoppingBag className="size-4" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full text-[9px] font-semibold flex items-center justify-center bg-gradient-to-br from-[oklch(0.62_0.18_320)] to-[oklch(0.45_0.16_18)] text-white">
              {count}
            </span>
          )}
        </button>
      </nav>
    </header>
  );
}
