create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(auth.uid(), 'admin')
$$;

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  brand text,
  category text not null,
  short_description text,
  description text,
  price_npr numeric(12,2) not null check (price_npr >= 0),
  original_price_npr numeric(12,2) check (original_price_npr is null or original_price_npr >= 0),
  sku text check (sku is null or length(trim(sku)) > 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0),
  image_url text,
  gallery text[] not null default '{}',
  specifications jsonb not null default '{}'::jsonb,
  features jsonb not null default '[]'::jsonb,
  tags text[] not null default '{}',
  is_featured boolean not null default false,
  is_new boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index products_sku_unique on public.products (lower(sku)) where sku is not null;
create index products_category_idx on public.products (category);
create index products_brand_idx on public.products (brand);
create index products_active_idx on public.products (is_active) where is_active;
create index products_search_idx on public.products using gin (to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(brand,'') || ' ' || coalesce(sku,'')));

grant select on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;

create policy "Public reads active products" on public.products for select to anon, authenticated using (is_active or public.is_admin());
create policy "Admins insert products" on public.products for insert to authenticated with check (public.is_admin());
create policy "Admins update products" on public.products for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete products" on public.products for delete to authenticated using (public.is_admin());

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();

create or replace function public.products_normalise() returns trigger language plpgsql set search_path = public as $$
begin
  new.sku := nullif(trim(new.sku), '');
  new.brand := nullif(trim(new.brand), '');
  new.slug := lower(trim(new.slug));
  return new;
end $$;
create trigger products_normalise before insert or update on public.products for each row execute function public.products_normalise();

create or replace function public.adjust_stock(_product_id uuid, _delta integer default null, _set integer default null)
returns integer language plpgsql security invoker set search_path = public as $$
declare result integer;
begin
  if not public.is_admin() then raise exception 'Not authorized' using errcode = '42501'; end if;
  if _set is not null then
    if _set < 0 then raise exception 'Stock cannot be negative'; end if;
    update public.products set stock_quantity = _set where id = _product_id returning stock_quantity into result;
  else
    update public.products set stock_quantity = stock_quantity + coalesce(_delta,0)
      where id = _product_id and stock_quantity + coalesce(_delta,0) >= 0 returning stock_quantity into result;
    if result is null then raise exception 'Stock cannot go below zero'; end if;
  end if;
  return result;
end $$;
revoke execute on function public.adjust_stock(uuid, integer, integer) from public, anon;
grant execute on function public.adjust_stock(uuid, integer, integer) to authenticated;

create policy "Admins upload product images" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin());
create policy "Admins update product images" on storage.objects for update to authenticated using (bucket_id = 'product-images' and public.is_admin());
create policy "Admins delete product images" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and public.is_admin());

insert into public.products (name, slug, brand, category, short_description, description, price_npr, stock_quantity, low_stock_threshold, image_url, specifications, tags, is_featured, features, is_new) values
('Frost-Free Double Door Refrigerator 340L', 'frost-free-double-door-refrigerator-340l', 'Samsung', 'refrigerators', '340L frost-free fridge with inverter compressor.', 'A spacious double-door refrigerator for medium to large families, with frost-free cooling and an energy-saving inverter compressor.', 89999, 10, 5, 'seed/cat-fridge.jpg', '{"Capacity":"340 L","Type":"Frost-free, double door","Compressor":"Digital inverter","Finish":"Stainless look"}'::jsonb, ARRAY['fridge','double door','inverter']::text[], true, '["Frost-free cooling","Inverter compressor","Toughened glass shelves"]'::jsonb, false),
('Single Door Refrigerator 190L', 'single-door-refrigerator-190l', 'LG', 'refrigerators', 'Compact direct-cool fridge for small families.', 'A compact, direct-cool single-door refrigerator suited for small families and kitchens.', 32499, 10, 5, 'seed/cat-fridge.jpg', '{"Capacity":"190 L","Type":"Direct cool, single door"}'::jsonb, ARRAY['fridge','single door']::text[], false, '[]'::jsonb, false),
('Front Load Washing Machine 8kg', 'front-load-washing-machine-8kg', 'LG', 'washing-machines', '8kg fully automatic front loader.', 'Fully automatic front-load washing machine with multiple wash programs and quiet operation.', 74999, 10, 5, 'seed/cat-washer.jpg', '{"Capacity":"8 kg","Type":"Front load, fully automatic","Spin speed":"1400 RPM"}'::jsonb, ARRAY['washer','front load']::text[], true, '["Steam wash","Inverter motor","Child lock"]'::jsonb, true),
('Top Load Washing Machine 7kg', 'top-load-washing-machine-7kg', 'Whirlpool', 'washing-machines', '7kg fully automatic top loader.', 'Easy-to-use top-load washing machine for everyday laundry.', 42999, 3, 5, 'seed/cat-washer.jpg', '{"Capacity":"7 kg","Type":"Top load, fully automatic"}'::jsonb, ARRAY['washer','top load']::text[], false, '[]'::jsonb, false),
('Semi-Automatic Washing Machine 8kg', 'semi-automatic-washing-machine-8kg', 'Videocon', 'washing-machines', 'Twin-tub, water-efficient washer.', 'Twin-tub semi-automatic washing machine — practical and water efficient.', 24999, 10, 5, 'seed/cat-washer.jpg', '{"Capacity":"8 kg","Type":"Semi-automatic twin tub"}'::jsonb, ARRAY['washer','semi automatic']::text[], false, '[]'::jsonb, false),
('55" 4K Smart LED TV', 'smart-led-tv-55-inch-4k', 'Sony', 'televisions', '55-inch 4K HDR smart television.', 'A 55-inch 4K smart TV with HDR, built-in apps and slim bezels for a cinematic living room.', 109999, 10, 5, 'seed/cat-tv.jpg', '{"Screen size":"55 inch","Resolution":"4K UHD","Smart TV":"Yes","Ports":"3× HDMI, 2× USB"}'::jsonb, ARRAY['tv','4k','smart tv']::text[], true, '["4K HDR picture","Built-in streaming apps","Voice remote"]'::jsonb, false),
('43" Full HD Smart TV', 'smart-led-tv-43-inch', 'Xiaomi', 'televisions', '43-inch Full HD smart TV.', 'Full HD smart TV ideal for bedrooms and smaller living rooms.', 44999, 10, 5, 'seed/cat-tv.jpg', '{"Screen size":"43 inch","Resolution":"Full HD"}'::jsonb, ARRAY['tv','smart tv']::text[], false, '[]'::jsonb, false),
('32" HD LED TV', 'led-tv-32-inch', 'CG', 'televisions', '32-inch HD Ready LED TV.', 'Reliable 32-inch HD Ready LED television.', 21999, 10, 5, 'seed/cat-tv.jpg', '{"Screen size":"32 inch","Resolution":"HD Ready"}'::jsonb, ARRAY['tv','led']::text[], false, '[]'::jsonb, false),
('Inverter Split AC 1.5 Ton', 'inverter-split-ac-1-5-ton', 'Daikin', 'air-conditioners', '1.5 ton inverter split air conditioner.', 'Energy-efficient inverter split AC for medium rooms, built for hot summers.', 98999, 0, 5, 'seed/cat-ac.jpg', '{"Capacity":"1.5 Ton","Type":"Inverter split","Refrigerant":"R32"}'::jsonb, ARRAY['ac','inverter']::text[], true, '["Fast cooling","Inverter energy saving","Sleep mode"]'::jsonb, false),
('Inverter Split AC 1 Ton', 'inverter-split-ac-1-ton', 'Gree', 'air-conditioners', '1 ton inverter AC for small rooms.', 'Compact inverter split AC for bedrooms and small offices.', 72999, 0, 5, 'seed/cat-ac.jpg', '{"Capacity":"1 Ton","Type":"Inverter split"}'::jsonb, ARRAY['ac']::text[], false, '[]'::jsonb, false),
('5G Smartphone 8GB/128GB', 'smartphone-5g-128gb', 'Samsung', 'smartphones', '5G phone with 50MP camera.', 'A balanced 5G smartphone with a bright display, 50MP camera and all-day battery.', 38999, 10, 5, 'seed/cat-phone.jpg', '{"RAM":"8 GB","Storage":"128 GB","Camera":"50 MP","Battery":"5000 mAh"}'::jsonb, ARRAY['phone','5g']::text[], true, '[]'::jsonb, true),
('Budget Smartphone 4GB/64GB', 'smartphone-budget-64gb', 'Redmi', 'smartphones', 'Affordable everyday smartphone.', 'Affordable smartphone for calls, social media and everyday use.', 15999, 10, 5, 'seed/cat-phone.jpg', '{"RAM":"4 GB","Storage":"64 GB","Battery":"5000 mAh"}'::jsonb, ARRAY['phone']::text[], false, '[]'::jsonb, false),
('Laptop Core i5 16GB/512GB', 'laptop-core-i5-16gb', 'HP', 'laptops-computers', '14-inch laptop for study and office.', 'A slim 14-inch laptop with fast SSD storage for study, office and everyday work.', 92999, 3, 5, 'seed/cat-laptop.jpg', '{"Processor":"Intel Core i5","RAM":"16 GB","Storage":"512 GB SSD","Display":"14 inch FHD"}'::jsonb, ARRAY['laptop']::text[], true, '[]'::jsonb, false),
('Mixer Grinder 750W', 'mixer-grinder-750w', 'Bajaj', 'kitchen-appliances', '3-jar 750W mixer grinder.', 'Powerful mixer grinder with three stainless steel jars.', 7499, 10, 5, 'seed/cat-kitchen.jpg', '{"Power":"750 W","Jars":"3 stainless steel"}'::jsonb, ARRAY['mixer','kitchen']::text[], true, '[]'::jsonb, false),
('Convection Microwave 25L', 'microwave-oven-25l', 'LG', 'kitchen-appliances', '25L convection microwave oven.', 'Convection microwave for reheating, grilling and baking.', 26999, 10, 5, 'seed/cat-kitchen.jpg', '{"Capacity":"25 L","Type":"Convection"}'::jsonb, ARRAY['microwave','kitchen']::text[], false, '[]'::jsonb, false),
('Electric Rice Cooker 1.8L', 'rice-cooker-1-8l', 'Baltra', 'kitchen-appliances', '1.8L rice cooker with warm mode.', 'Simple, reliable electric rice cooker with keep-warm function.', 3999, 10, 5, 'seed/cat-kitchen.jpg', '{"Capacity":"1.8 L"}'::jsonb, ARRAY['rice cooker']::text[], false, '[]'::jsonb, false),
('Pedestal Fan 400mm', 'pedestal-fan-400mm', 'Usha', 'fans-cooling', 'Height-adjustable pedestal fan.', 'Strong airflow pedestal fan with adjustable height and oscillation.', 5499, 10, 5, 'seed/cat-fan.jpg', '{"Sweep":"400 mm","Speeds":"3"}'::jsonb, ARRAY['fan']::text[], false, '[]'::jsonb, false),
('Ceiling Fan 1200mm', 'ceiling-fan-1200mm', 'Crompton', 'fans-cooling', 'High-speed ceiling fan.', 'High-speed ceiling fan for bedrooms and living rooms.', 4299, 10, 5, 'seed/cat-fan.jpg', '{"Sweep":"1200 mm"}'::jsonb, ARRAY['fan','ceiling']::text[], true, '[]'::jsonb, false),
('Wireless Earbuds with ANC', 'wireless-earbuds-anc', 'boAt', 'earbuds-headphones', 'Noise-cancelling true wireless earbuds.', 'True wireless earbuds with active noise cancellation and a pocketable charging case.', 4999, 10, 5, 'seed/cat-audio.jpg', '{"Battery":"Up to 30 hrs with case","Connectivity":"Bluetooth 5.3"}'::jsonb, ARRAY['earbuds','tws']::text[], true, '[]'::jsonb, false),
('Over-Ear Wireless Headphones', 'over-ear-headphones', 'Sony', 'earbuds-headphones', 'Comfortable wireless headphones.', 'Over-ear wireless headphones with rich sound and long battery life.', 14999, 3, 5, 'seed/cat-audio.jpg', '{"Battery":"Up to 50 hrs"}'::jsonb, ARRAY['headphones']::text[], false, '[]'::jsonb, false),
('Portable Bluetooth Speaker', 'portable-bluetooth-speaker', 'JBL', 'speakers-audio', 'Water-resistant portable speaker.', 'Rugged portable Bluetooth speaker with punchy bass.', 8999, 10, 5, 'seed/cat-speaker.jpg', '{"Water resistance":"IPX7","Battery":"Up to 12 hrs"}'::jsonb, ARRAY['speaker','bluetooth']::text[], false, '[]'::jsonb, false),
('2.1 Channel Soundbar', 'soundbar-2-1', 'Sony', 'speakers-audio', 'Soundbar with wireless subwoofer.', 'Upgrade your TV sound with a 2.1 channel soundbar.', 24999, 10, 5, 'seed/cat-speaker.jpg', '{"Channels":"2.1","Connectivity":"HDMI ARC, Bluetooth"}'::jsonb, ARRAY['soundbar']::text[], true, '[]'::jsonb, false),
('Steam Iron 2000W', 'steam-iron-2000w', 'Philips', 'small-home-appliances', 'Non-stick steam iron.', 'Powerful steam iron with non-stick soleplate.', 3499, 10, 5, 'seed/cat-small.jpg', '{"Power":"2000 W"}'::jsonb, ARRAY['iron']::text[], false, '[]'::jsonb, false),
('Electric Kettle 1.5L', 'electric-kettle-1-5l', 'Prestige', 'small-home-appliances', 'Stainless steel kettle.', 'Quick-boil stainless steel electric kettle with auto shut-off.', 1999, 10, 5, 'seed/cat-small.jpg', '{"Capacity":"1.5 L"}'::jsonb, ARRAY['kettle']::text[], false, '[]'::jsonb, false),
('4-Socket Extension Board', 'extension-board-4-socket', 'Anchor', 'electrical-accessories', 'Surge-protected extension board.', '4-socket extension board with surge protection and long cable.', 999, 10, 5, 'seed/cat-accessories.jpg', '{"Sockets":"4","Cable":"3 m"}'::jsonb, ARRAY['extension']::text[], false, '[]'::jsonb, false),
('LED Bulb 12W (Pack of 2)', 'led-bulb-12w-pack', 'Philips', 'electrical-accessories', 'Energy-saving LED bulbs.', 'Bright, energy-saving 12W LED bulbs.', 499, 10, 5, 'seed/cat-accessories.jpg', '{}'::jsonb, ARRAY['bulb','led']::text[], false, '[]'::jsonb, false),
('Home Inverter 1100VA', 'home-inverter-1100va', 'Luminous', 'other-electronics', 'Power backup inverter.', 'Home power backup inverter for lights, fans and TV during load shedding.', 18999, 0, 5, 'seed/cat-other.jpg', '{"Capacity":"1100 VA"}'::jsonb, ARRAY['inverter','power backup']::text[], false, '[]'::jsonb, false);