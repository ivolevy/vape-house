import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import WebSocket from 'ws';

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

async function seed() {
  console.log('Ensuring Vapes category exists...');
  let { data: catData, error: catErr } = await supabase.from('categories').select('id').eq('name', 'Vapes').single();
  if (catErr) {
    const { data: newCat, error: nErr } = await supabase.from('categories').insert({ name: 'Vapes', slug: 'vapes' }).select().single();
    if (nErr) {
        console.error('Failed to create category:', nErr);
        // Fallback to first cat
        const { data: firstCat } = await supabase.from('categories').select('id').limit(1).single();
        catData = firstCat;
    } else {
        catData = newCat;
    }
  }
  
  const categoryId = catData?.id;
  console.log('Using category ID:', categoryId);

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
    
    const { error: insertErr } = await supabase.from('products').insert({
      name: prod.name,
      description: prod.desc,
      category_id: categoryId,
      price: prod.price,
      puff_count: prod.puff_count,
      stock_count: prod.stock_count,
      image_url: publicUrl,
      featured: true
    });
    
    if (insertErr) {
      console.error('Insert Error:', insertErr);
    } else {
      console.log(`Successfully added ${prod.name}`);
    }
  }
  console.log('Done!');
}

seed();
