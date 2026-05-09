-- Insert the 'products' bucket into the storage.buckets table
insert into storage.buckets (id, name, public)
values ('products', 'products', true);

-- Allow public read access so the frontend can display images
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'products' );

-- Allow authenticated users (like admin) to insert images
create policy "Auth Insert"
on storage.objects for insert
with check ( bucket_id = 'products' and auth.role() = 'authenticated' );

-- Allow authenticated users to update their uploaded images
create policy "Auth Update"
on storage.objects for update
using ( bucket_id = 'products' and auth.role() = 'authenticated' );

-- Allow authenticated users to delete images
create policy "Auth Delete"
on storage.objects for delete
using ( bucket_id = 'products' and auth.role() = 'authenticated' );
