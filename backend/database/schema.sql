-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fast text search

-- Users table with cashback
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  language_code TEXT DEFAULT 'ru',
  cashback_balance DECIMAL(10, 2) DEFAULT 0.00,
  total_spent DECIMAL(10, 2) DEFAULT 0.00,
  total_orders INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_kk TEXT,
  description TEXT,
  description_kk TEXT,
  price DECIMAL(10, 2) NOT NULL,
  sale_price DECIMAL(10, 2),
  category TEXT NOT NULL,
  brand TEXT,
  images TEXT[], -- URLs to images (WebP format)
  featured BOOLEAN DEFAULT false,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product variants (sizes and colors)
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  color_hex TEXT,
  stock_quantity INTEGER DEFAULT 0,
  UNIQUE(product_id, size, color)
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  telegram_id BIGINT NOT NULL,
  order_number TEXT UNIQUE NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  cashback_earned DECIMAL(10, 2) DEFAULT 0.00,
  status TEXT DEFAULT 'pending', -- pending, confirmed, delivering, completed, cancelled
  payment_status TEXT DEFAULT 'awaiting', -- awaiting, screenshot_awaited, verification, paid, failed
  payment_screenshot TEXT, -- Telegram file_id
  delivery_address TEXT NOT NULL,
  phone TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cashback transactions
CREATE TABLE cashback_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  order_id UUID REFERENCES orders(id),
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL, -- 'earned', 'used', 'expired'
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_orders_telegram_id ON orders(telegram_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_name_trgm ON products USING gin(name gin_trgm_ops);
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_cashback_user_id ON cashback_transactions(user_id);

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  count INTEGER;
BEGIN
  SELECT COUNT(*) INTO count FROM orders 
  WHERE DATE(created_at) = CURRENT_DATE;
  
  new_number := 'FS-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || 
                LPAD((count + 1)::TEXT, 3, '0');
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger for order number
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_order
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION set_order_number();

-- Function to increment cashback
CREATE OR REPLACE FUNCTION increment_cashback(
  p_user_id UUID,
  p_amount DECIMAL
)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET cashback_balance = cashback_balance + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrease stock
CREATE OR REPLACE FUNCTION decrease_stock(
  p_product_id UUID,
  p_size TEXT,
  p_color TEXT,
  p_quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE product_variants
  SET stock_quantity = stock_quantity - p_quantity
  WHERE product_id = p_product_id
    AND size = p_size
    AND color = p_color;
    
  -- Update product in_stock status
  UPDATE products
  SET in_stock = EXISTS (
    SELECT 1 FROM product_variants
    WHERE product_id = p_product_id
    AND stock_quantity > 0
  )
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql;
