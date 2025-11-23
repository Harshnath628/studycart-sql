-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  category TEXT NOT NULL,
  color TEXT,
  storage INTEGER,
  specs JSONB,
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_images table
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(product_id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create carts table
CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(product_id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cart_id, product_id)
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (e-commerce site)
CREATE POLICY "Products are viewable by everyone"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "Product images are viewable by everyone"
  ON public.product_images FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create a cart"
  ON public.carts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view their cart"
  ON public.carts FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update their cart"
  ON public.carts FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can create cart items"
  ON public.cart_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view cart items"
  ON public.cart_items FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update cart items"
  ON public.cart_items FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete cart items"
  ON public.cart_items FOR DELETE
  USING (true);

-- Create indexes for performance
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX idx_carts_session_id ON public.carts(session_id);
CREATE INDEX idx_cart_items_cart_id ON public.cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON public.cart_items(product_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_carts_updated_at
  BEFORE UPDATE ON public.carts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample products
INSERT INTO public.products (name, slug, description, price, category, color, storage, specs, stock_quantity) VALUES
('iPhone 15 Pro Max', 'iphone-15-pro-max', 'The ultimate iPhone with A17 Pro chip, titanium design, and advanced camera system', 1199.00, 'Smartphones', 'Natural Titanium', 256, '{"chip": "A17 Pro", "display": "6.7-inch Super Retina XDR", "camera": "48MP Main"}', 50),
('MacBook Pro 16"', 'macbook-pro-16', 'Supercharged by M3 Pro or M3 Max chip for exceptional performance', 2499.00, 'Laptops', 'Space Black', 512, '{"chip": "M3 Pro", "display": "16.2-inch Liquid Retina XDR", "memory": "18GB"}', 30),
('iPad Pro 12.9"', 'ipad-pro-12-9', 'The ultimate iPad experience with M2 chip and stunning display', 1099.00, 'Tablets', 'Silver', 256, '{"chip": "M2", "display": "12.9-inch Liquid Retina XDR", "connectivity": "Wi-Fi 6E"}', 40),
('AirPods Pro (2nd Gen)', 'airpods-pro-2', 'Active Noise Cancellation and Adaptive Audio for immersive sound', 249.00, 'Audio', 'White', NULL, '{"chip": "H2", "anc": "Active Noise Cancellation", "battery": "Up to 6 hours"}', 100),
('Apple Watch Ultra 2', 'apple-watch-ultra-2', 'The most rugged and capable Apple Watch for extreme athletes', 799.00, 'Wearables', 'Titanium', NULL, '{"chip": "S9", "display": "49mm Retina", "battery": "Up to 36 hours"}', 25),
('Mac Studio', 'mac-studio', 'Outrageous performance with M2 Max or M2 Ultra chip', 1999.00, 'Desktops', 'Silver', 512, '{"chip": "M2 Max", "memory": "32GB", "ports": "Multiple Thunderbolt 4"}', 15),
('iPhone 15', 'iphone-15', 'A total powerhouse with A16 Bionic chip and advanced camera system', 799.00, 'Smartphones', 'Pink', 128, '{"chip": "A16 Bionic", "display": "6.1-inch Super Retina XDR", "camera": "48MP Main"}', 75),
('MacBook Air 15"', 'macbook-air-15', 'Impressively big. Impossibly thin with M2 chip', 1299.00, 'Laptops', 'Midnight', 256, '{"chip": "M2", "display": "15.3-inch Liquid Retina", "memory": "8GB"}', 45);

-- Insert sample product images (using placeholder URLs - you can replace with real images)
INSERT INTO public.product_images (product_id, image_url, is_primary, sort_order)
SELECT product_id, 'https://images.unsplash.com/photo-1592286927505-2fd0c8f0e155?w=800', true, 0
FROM public.products WHERE slug = 'iphone-15-pro-max';

INSERT INTO public.product_images (product_id, image_url, is_primary, sort_order)
SELECT product_id, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', true, 0
FROM public.products WHERE slug = 'macbook-pro-16';

INSERT INTO public.product_images (product_id, image_url, is_primary, sort_order)
SELECT product_id, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800', true, 0
FROM public.products WHERE slug = 'ipad-pro-12-9';

INSERT INTO public.product_images (product_id, image_url, is_primary, sort_order)
SELECT product_id, 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800', true, 0
FROM public.products WHERE slug = 'airpods-pro-2';

INSERT INTO public.product_images (product_id, image_url, is_primary, sort_order)
SELECT product_id, 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800', true, 0
FROM public.products WHERE slug = 'apple-watch-ultra-2';

INSERT INTO public.product_images (product_id, image_url, is_primary, sort_order)
SELECT product_id, 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=800', true, 0
FROM public.products WHERE slug = 'mac-studio';

INSERT INTO public.product_images (product_id, image_url, is_primary, sort_order)
SELECT product_id, 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800', true, 0
FROM public.products WHERE slug = 'iphone-15';

INSERT INTO public.product_images (product_id, image_url, is_primary, sort_order)
SELECT product_id, 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800', true, 0
FROM public.products WHERE slug = 'macbook-air-15';