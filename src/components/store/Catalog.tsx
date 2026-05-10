import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type Product } from "./ProductCard";
import { Search } from "lucide-react";

type Category = { id: string; name: string; slug: string };

export function Catalog() {
  const [active, setActive] = React.useState<string>("all");
  const [q, setQ] = React.useState("");

  const { data: cats = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("id,name");
      if (error) throw error;
      return (data || []).map(c => ({ ...c, slug: c.name.toLowerCase() })) as Category[];
    },
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*") // Seleccionamos todo para evitar errores de columnas faltantes
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching products:", error);
        throw error;
      }
      
      return (data || []).map(p => ({
        ...p,
        id: p.id,
        name: p.name,
        price: Number(p.price), // Aseguramos que el precio sea número
        puff_count: p.puffs || p.puff_count,
        stock_count: p.stock_quantity || p.stock_count || 0,
        image_url: p.image_url,
        featured: p.featured || false,
        stock_status: (p.stock_quantity || p.stock_count) > 0 ? 'in_stock' : 'out_of_stock'
      })) as (Product & { category_id: string | null })[];
    },
  });

  const filtered = products.filter((p) => {
    const stock = Number(p.stock_count ?? 0);
    const hasStock = stock > 0;
    const okCat = active === "all" || p.category_id === active;
    const okQ = q.trim() === "" || p.name.toLowerCase().includes(q.toLowerCase());
    return hasStock && okCat && okQ;
  });

  return (
    <section id="catalogo" className="relative pt-8 sm:pt-12 pb-10 sm:pb-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col items-center text-center mb-10">
          <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Catálogo</span>
          <h2 className="font-display text-3xl sm:text-5xl font-semibold mt-3">Encontrá tu vape</h2>
        </div>

        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nombre o sabor..."
              className="w-full glass rounded-full h-12 pl-11 pr-5 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[oklch(0.62_0.18_320)] transition"
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <button className="btn-ghost-pill" data-active={active === "all"} onClick={() => setActive("all")}>
            Todos
          </button>
          {cats.map((c) => (
            <button
              key={c.id}
              className="btn-ghost-pill"
              data-active={active === c.id}
              onClick={() => setActive(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p>No hay productos disponibles que coincidan con la búsqueda.</p>
            {products.length === 0 && <p className="text-xs mt-2">La base de datos parece estar vacía para el cliente.</p>}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
