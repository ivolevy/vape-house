import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatARS } from "@/lib/format";
import { Pencil, Plus, Trash2, X, Upload } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export const Route = createFileRoute("/admin/")({
  component: ProductsAdmin,
});

type Category = { id: string; name: string };
type Product = {
  id: string;
  name: string;
  description: string | null;
  category_id: string | null;
  price: number;
  puffs: number | null; // Correct column
  stock_quantity: number; // Correct column
  image_url: string | null;
  created_at: string;
};

// Internal type for UI mapping
type UIProduct = Product & {
  puff_count: number | null;
  stock_count: number;
  stock_status: string | null;
  featured: boolean;
};

function ProductsAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = React.useState<Partial<UIProduct> | null>(null);
  const [search, setSearch] = React.useState("");
  const [filterCat, setFilterCat] = React.useState<string>("all");

  const { data: cats = [] } = useQuery({
    queryKey: ["admin-cats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("id,name");
      if (error) throw error;
      return data as Category[];
    },
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      
      return data.map(p => ({
        ...p,
        puff_count: (p as any).puffs || (p as any).puff_count || 0,
        stock_count: (p as any).stock_quantity || (p as any).stock_count || 0,
        stock_status: (p as any).stock_quantity > 0 ? 'available' : 'out_of_stock',
        featured: (p as any).featured || false
      })) as UIProduct[];
    },
  });

  const filtered = products.filter((p) =>
    (filterCat === "all" || p.category_id === filterCat) &&
    (search.trim() === "" || p.name.toLowerCase().includes(search.toLowerCase()))
  );

  const del = async (id: string) => {
    if (!confirm("¿Eliminar producto?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Eliminado");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold">Productos</h1>
          <p className="text-sm text-muted-foreground mt-1">{products.length} productos en total</p>
        </div>
        <div className="flex items-center gap-3">
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
                    
                    toast.info(`Procesando ${data.length} productos...`);
                    
                    let imported = 0;
                    for (const row of data) {
                      const payload = {
                        name: row.nombre || row.Name || row.name,
                        price: Number(row.precio || row.Price || row.price) || 0,
                        stock_count: Number(row.stock || row.Stock || row.stock_count) || 0,
                        puff_count: Number(row.puffs || row.Puffs || row.pitadas) || null,
                        description: row.descripcion || row.Description || row.description || null,
                      };
                      
                      if (payload.name) {
                        const { error } = await supabase.from("products").insert(payload);
                        if (!error) imported++;
                      }
                    }
                    
                    toast.success(`Importación finalizada: ${imported} productos añadidos.`);
                    qc.invalidateQueries({ queryKey: ["admin-products"] });
                  } catch (err) {
                    toast.error("Error al procesar el archivo");
                    console.error(err);
                  }
                };
                reader.readAsBinaryString(file);
              }}
            />
          </label>
          <button onClick={() => setEditing({})} className="btn-premium inline-flex items-center gap-2">
            <Plus className="size-4" /> Nuevo producto
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          placeholder="Buscar producto..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[oklch(0.62_0.18_320)]"
        />
        <select
          value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm"
        >
          <option value="all">Todas las categorías</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-widest text-muted-foreground">
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-4">Producto</th>
                <th className="text-left px-5 py-4">Categoría</th>
                <th className="text-right px-5 py-4">Precio</th>
                <th className="text-right px-5 py-4">Stock</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">Cargando…</td></tr>}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">Sin productos</td></tr>
              )}
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-white/5 overflow-hidden flex items-center justify-center shrink-0">
                        {p.image_url && <img src={p.image_url} alt="" className="w-full h-full object-contain" />}
                      </div>
                      <div>
                        <p className="font-medium">{p.name}</p>
                        {p.puff_count && <p className="text-xs text-muted-foreground">{p.puff_count} puffs</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{cats.find((c) => c.id === p.category_id)?.name ?? "—"}</td>
                  <td className="px-5 py-4 text-right">{formatARS(p.price)}</td>
                  <td className="px-5 py-4 text-right">{p.stock_count}</td>
                  <td className="px-5 py-4 text-center">
                    {p.featured && <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 mr-1">Destacado</span>}
                    {p.stock_status === "last_unit" && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[oklch(0.45_0.16_18)]/40">Última</span>}
                    {p.stock_status === "out_of_stock" && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[oklch(0.4_0.18_25)]/40">Sin stock</span>}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => setEditing(p)} className="p-2 rounded-lg hover:bg-white/5"><Pencil className="size-4" /></button>
                    <button onClick={() => del(p.id)} className="p-2 rounded-lg hover:bg-white/5 text-[oklch(0.7_0.2_25)]"><Trash2 className="size-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && <ProductModal initial={editing} cats={cats} onClose={() => setEditing(null)} />}
    </div>
  );
}

function ProductModal({
  initial, cats, onClose,
}: { initial: Partial<Product>; cats: Category[]; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = React.useState<Partial<Product>>({
    stock_count: 0, price: 0, featured: false, stock_status: "available", ...initial,
  });
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  const onUpload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("products").upload(path, file, { upsert: true });
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data } = supabase.storage.from("products").getPublicUrl(path);
    setForm((f) => ({ ...f, image_url: data.publicUrl }));
    setUploading(false);
  };

  const save = async () => {
    setSaving(true);
    const payload = {
      name: form.name?.trim() || "",
      description: form.description ?? null,
      category_id: form.category_id || null,
      price: Number(form.price) || 0,
      puffs: form.puff_count ? Number(form.puff_count) : null,
      stock_quantity: Number(form.stock_count) || 0,
      image_url: form.image_url || null,
    };
    const res = form.id
      ? await supabase.from("products").update(payload).eq("id", form.id)
      : await supabase.from("products").insert(payload);
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    toast.success("Guardado");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative glass-strong rounded-3xl w-full max-w-lg p-7 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute right-4 top-4 h-9 w-9 rounded-full hover:bg-white/5 flex items-center justify-center"><X className="size-4" /></button>
        <h2 className="font-display text-2xl font-semibold mb-6">{form.id ? "Editar producto" : "Nuevo producto"}</h2>

        <div className="space-y-4">
          <Field label="Nombre">
            <input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Imagen">
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
                {form.image_url && <img src={form.image_url} alt="" className="w-full h-full object-contain" />}
              </div>
              <label className="cursor-pointer btn-ghost-pill inline-flex items-center gap-2">
                <Upload className="size-3.5" /> {uploading ? "Subiendo..." : "Subir imagen"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
              </label>
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Precio (ARS)">
              <input type="number" min={0} value={form.price ?? 0} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className={inputCls} />
            </Field>
            <Field label="Puffs">
              <input type="number" min={0} value={form.puff_count ?? ""} onChange={(e) => setForm({ ...form, puff_count: e.target.value ? Number(e.target.value) : null })} className={inputCls} />
            </Field>
            <Field label="Stock">
              <input type="number" min={0} value={form.stock_count ?? 0} onChange={(e) => setForm({ ...form, stock_count: Number(e.target.value) })} className={inputCls} />
            </Field>
            <Field label="Categoría">
              <select value={form.category_id || ""} onChange={(e) => setForm({ ...form, category_id: e.target.value || null })} className={inputCls}>
                <option value="">Sin categoría</option>
                {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm pt-2">
            <input type="checkbox" checked={!!form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            Destacado
          </label>
        </div>

        <button disabled={saving || !form.name} onClick={save} className="btn-premium w-full mt-6 disabled:opacity-30">
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}

const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[oklch(0.62_0.18_320)]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">{label}</span>
      {children}
    </label>
  );
}
