import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/categorias")({
  component: CategoriesAdmin,
});

type Category = { id: string; name: string; slug: string; sort_order: number };

function CategoriesAdmin() {
  const qc = useQueryClient();
  const [name, setName] = React.useState("");
  const { data: cats = [] } = useQuery({
    queryKey: ["admin-cats-full"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return data as Category[];
    },
  });

  const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const { error } = await supabase.from("categories").insert({
      name: name.trim(), slug: slugify(name), sort_order: cats.length + 1,
    });
    if (error) return toast.error(error.message);
    setName(""); toast.success("Categoría creada");
    qc.invalidateQueries({ queryKey: ["admin-cats-full"] });
    qc.invalidateQueries({ queryKey: ["categories"] });
    qc.invalidateQueries({ queryKey: ["admin-cats"] });
  };

  const del = async (id: string) => {
    if (!confirm("¿Eliminar categoría?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-cats-full"] });
    qc.invalidateQueries({ queryKey: ["categories"] });
  };

  const rename = async (c: Category, newName: string) => {
    const { error } = await supabase.from("categories").update({ name: newName, slug: slugify(newName) }).eq("id", c.id);
    if (error) toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-cats-full"] });
    qc.invalidateQueries({ queryKey: ["categories"] });
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold mb-8">Categorías</h1>
      <form onSubmit={add} className="glass rounded-2xl p-5 flex gap-3 mb-6">
        <input
          value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Nombre de la categoría"
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[oklch(0.62_0.18_320)]"
        />
        <button className="btn-premium inline-flex items-center gap-2"><Plus className="size-4" /> Agregar</button>
      </form>

      <div className="glass rounded-2xl divide-y divide-white/5">
        {cats.map((c) => (
          <div key={c.id} className="flex items-center gap-3 px-5 py-3">
            <input
              defaultValue={c.name}
              onBlur={(e) => e.target.value !== c.name && rename(c, e.target.value)}
              className="flex-1 bg-transparent text-sm focus:outline-none"
            />
            <span className="text-xs text-muted-foreground">{c.slug}</span>
            <button onClick={() => del(c.id)} className="p-2 rounded-lg hover:bg-white/5 text-[oklch(0.7_0.2_25)]"><Trash2 className="size-4" /></button>
          </div>
        ))}
        {cats.length === 0 && <p className="text-center py-12 text-sm text-muted-foreground">Sin categorías</p>}
      </div>
    </div>
  );
}
