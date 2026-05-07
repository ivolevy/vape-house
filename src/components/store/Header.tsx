import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-store";

export function Header() {
  const { setOpen, count } = useCart();
  return (
    <header className="fixed top-0 inset-x-0 z-40">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-5 flex items-center justify-between">
        <Link to="/" className="font-display text-lg sm:text-xl tracking-[0.25em] font-semibold">
          VAPE<span className="text-[oklch(0.75_0.18_320)]">·</span>HOUSE
        </Link>
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir carrito"
          className="relative h-11 w-11 rounded-full glass flex items-center justify-center hover:border-[oklch(0.62_0.18_320)] transition"
        >
          <ShoppingBag className="size-5" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full text-[10px] font-semibold flex items-center justify-center bg-gradient-to-br from-[oklch(0.62_0.18_320)] to-[oklch(0.45_0.16_18)] text-white">
              {count}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
