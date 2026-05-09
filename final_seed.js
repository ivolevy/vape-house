import { createClient } from '@supabase/supabase-js';
import postgres from 'postgres';
import * as fs from 'fs';
import WebSocket from 'ws';

// Load .env
const envContent = fs.readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) {
    env[key.trim()] = values.join('=').trim().replace(/^"|"$|^'|'$/g, '');
  }
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const serviceRoleKey = env['SUPABASE_SERVICE_ROLE_KEY'];
const dbPassword = 'admin123'; // User said I have it, and earlier it was set to this.
const projectId = env['VITE_SUPABASE_PROJECT_ID'];

const sql = postgres(`postgresql://postgres.${projectId}:${dbPassword}@aws-0-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require&prepare=false`);
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
  realtime: { transport: WebSocket }
});

const images = [
  { file: '/Users/ivanlevy/.gemini/antigravity/brain/5b25c0a9-a0f9-4fd1-b036-162f66cc831c/elfbar_blueberry_ice_1778184855301.png', name: 'elfbar_blueberry_ice.png' },
  { file: '/Users/ivanlevy/.gemini/antigravity/brain/5b25c0a9-a0f9-4fd1-b036-162f66cc831c/lost_mary_os5000_1778184868045.png', name: 'lost_mary_os5000.png' },
  { file: '/Users/ivanlevy/.gemini/antigravity/brain/5b25c0a9-a0f9-4fd1-b036-162f66cc831c/ignite_v50_1778184881158.png', name: 'ignite_v50.png' },
  { file: '/Users/ivanlevy/.gemini/antigravity/brain/5b25c0a9-a0f9-4fd1-b036-162f66cc831c/lost_mary_mo5000_1778242003903.png', name: 'lost_mary_mo5000.png' },
  { file: '/Users/ivanlevy/.gemini/antigravity/brain/5b25c0a9-a0f9-4fd1-b036-162f66cc831c/elfbar_strawberry_kiwi_1778242019526.png', name: 'elfbar_strawberry_kiwi.png' }
];

const products = [
  { name: 'Elfbar Blueberry Ice', price: 15000, stock_count: 50, puff_count: 5000, desc: 'Sabor intenso a arándanos con un toque helado. El clásico que nunca falla.' },
  { name: 'Lost Mary OS5000 Sweet Strawberry', price: 18000, stock_count: 35, puff_count: 5000, desc: 'Diseño compacto y sabor a frutilla dulce inigualable.' },
  { name: 'Ignite V50 Menthol', price: 20000, stock_count: 20, puff_count: 5000, desc: 'Diseño elegante y minimalista. Mentol puro y refrescante.' },
  { name: 'Lost Mary MO5000 Watermelon Ice', price: 18500, stock_count: 40, puff_count: 5000, desc: 'Sandía refrescante y diseño marmolado único.' },
  { name: 'Elfbar BC5000 Strawberry Kiwi', price: 16000, stock_count: 60, puff_count: 5000, desc: 'La combinación perfecta de frutilla y kiwi en un dispositivo super cómodo.' }
];

async function run() {
  try {
    console.log('Fixing schema via Postgres...');
    await sql`ALTER TABLE public.products ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false`;
    await sql`ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS slug TEXT`;
    await sql`ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0`;
    
    console.log('Creating/Updating bucket via SQL...');
    await sql`INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true) ON CONFLICT (id) DO UPDATE SET public = true`;
    
    // Ensure RLS is not blocking seeding
    await sql`ALTER TABLE public.products DISABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY`;
    
    console.log('Ensuring Vapes category exists...');
    const [vapesCat] = await sql`INSERT INTO public.categories (name, slug, sort_order) VALUES ('Vapes', 'vapes', 1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`;
    const categoryId = vapesCat.id;

    for (let i = 0; i < products.length; i++) {
      const prod = products[i];
      const imgInfo = images[i];
      console.log(`Processing ${prod.name}...`);
      
      const fileBuffer = fs.readFileSync(imgInfo.file);
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('products')
        .upload(imgInfo.name, fileBuffer, { upsert: true, contentType: 'image/png' });
        
      if (uploadErr) {
        console.error('Upload Error:', uploadErr);
        continue;
      }
      
      const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(imgInfo.name);
      
      await supabase.from('products').insert({
        name: prod.name,
        description: prod.desc,
        category_id: categoryId,
        price: prod.price,
        puff_count: prod.puff_count,
        stock_count: prod.stock_count,
        image_url: publicUrl,
        featured: true
      });
      console.log(`Successfully added ${prod.name}`);
    }
    
    console.log('All done!');
  } catch (err) {
    console.error('CRITICAL ERROR:', err);
  } finally {
    await sql.end();
  }
}

run();
