import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-store";

export function Header() {
  const { setOpen, count } = useCart();
  return (
    <header className="fixed top-4 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto glass rounded-full flex items-center justify-between w-full max-w-xl px-2 py-2 shadow-lg backdrop-blur-xl">
        <div className="flex-shrink-0">
          <Link
            to="/"
            className="font-display text-xs sm:text-sm tracking-[0.2em] font-semibold px-3 sm:px-4 text-foreground"
          >
            VAPE<span className="text-[oklch(0.75_0.18_320)]">·</span>HOUSE
          </Link>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-4 hidden sm:flex">
          <a
            href="#catalogo"
            className="text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-full hover:bg-white/5 transition text-muted-foreground hover:text-foreground"
          >
            Catálogo
          </a>
        </div>

        <div className="flex-shrink-0 px-2 flex items-center gap-2">
          {/* Mobile links */}
          <div className="flex items-center gap-1 sm:hidden">
            <a
              href="#catalogo"
              className="text-[10px] px-2 py-1 rounded-full text-muted-foreground hover:text-foreground"
            >
              Catálogo
            </a>
          </div>
          
          <button
            onClick={() => setOpen(true)}
            aria-label="Abrir carrito"
            className="relative h-9 w-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition border border-white/10"
          >
            <ShoppingBag className="size-4 text-foreground" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full text-[9px] font-semibold flex items-center justify-center bg-gradient-to-br from-[oklch(0.62_0.18_320)] to-[oklch(0.45_0.16_18)] text-white shadow-sm">
                {count}
              </span>
            )}
          </button>
        </div>
      </nav>
    </header>
  );
}
