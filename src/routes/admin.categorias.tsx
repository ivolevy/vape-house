import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Upload } from "lucide-react";

export const Route = createFileRoute("/admin/categorias")({
  component: CategoriesAdmin,
});

type Category = { id: string; name: string; created_at: string };

function CategoriesAdmin() {
  const qc = useQueryClient();
  const [name, setName] = React.useState("");
  const { data: cats = [] } = useQuery({
    queryKey: ["admin-cats-full"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) throw error;
      return data as Category[];
    },
  });

  const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const { error } = await supabase.from("categories").insert({
      name: name.trim()
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
    const { error } = await supabase.from("categories").update({ name: newName }).eq("id", c.id);
    if (error) toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-cats-full"] });
    qc.invalidateQueries({ queryKey: ["categories"] });
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold mb-8">Categorías</h1>
      <div className="flex gap-3 mb-6">
        <form onSubmit={add} className="glass rounded-2xl p-5 flex-1 flex gap-3">
          <input
            value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Nombre de la categoría"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[oklch(0.62_0.18_320)]"
          />
          <button className="btn-premium inline-flex items-center gap-2"><Plus className="size-4" /> Agregar</button>
        </form>
        <div className="glass rounded-2xl p-5 flex items-center">
          <label className="btn-ghost-pill inline-flex items-center gap-2 cursor-pointer">
            <Upload className="size-4" /> Importar Excel/CSV
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = async (evt) => {
                  try {
                    const bstr = evt.target?.result;
                    const wb = XLSX.read(bstr, { type: "binary" });
                    const wsname = wb.SheetNames[0];
                    const ws = wb.Sheets[wsname];
                    const data = XLSX.utils.sheet_to_json(ws) as any[];
                    let imported = 0;
                    for (const row of data) {
                      const cname = row.nombre || row.Name || row.name;
                      if (cname) {
                        const { error } = await supabase.from("categories").insert({
                          name: cname, slug: slugify(cname), sort_order: cats.length + imported + 1
                        });
                        if (!error) imported++;
                      }
                    }
                    toast.success(`Importadas ${imported} categorías`);
                    qc.invalidateQueries({ queryKey: ["admin-cats-full"] });
                    qc.invalidateQueries({ queryKey: ["categories"] });
                  } catch (err) {
                    toast.error("Error al importar");
                  }
                };
                reader.readAsBinaryString(file);
              }}
            />
          </label>
        </div>
      </div>

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
