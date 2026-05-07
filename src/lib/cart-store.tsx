import * as React from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  qty: number;
};

type Ctx = {
  items: CartItem[];
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (i: Omit<CartItem, "qty">) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  total: number;
  count: number;
};

const CartCtx = React.createContext<Ctx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("vh_cart");
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);
  React.useEffect(() => {
    try { localStorage.setItem("vh_cart", JSON.stringify(items)); } catch {}
  }, [items]);

  const add: Ctx["add"] = (i) =>
    setItems((prev) => {
      const ex = prev.find((p) => p.id === i.id);
      if (ex) return prev.map((p) => (p.id === i.id ? { ...p, qty: p.qty + 1 } : p));
      return [...prev, { ...i, qty: 1 }];
    });
  const remove: Ctx["remove"] = (id) => setItems((p) => p.filter((x) => x.id !== id));
  const setQty: Ctx["setQty"] = (id, qty) =>
    setItems((p) => p.map((x) => (x.id === id ? { ...x, qty: Math.max(1, qty) } : x)));
  const clear = () => setItems([]);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartCtx.Provider value={{ items, open, setOpen, add, remove, setQty, clear, total, count }}>
      {children}
    </CartCtx.Provider>
  );
}

export function useCart() {
  const c = React.useContext(CartCtx);
  if (!c) throw new Error("useCart must be inside CartProvider");
  return c;
}
