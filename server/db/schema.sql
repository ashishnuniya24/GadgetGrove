-- Enable UUID extension for id generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1️⃣ Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(32),
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2️⃣ Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Sample product data
INSERT INTO products (name, description, price, image_url)
VALUES
('Smartphone X', 'Latest smartphone with amazing features.', 699.99, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80'),
('Wireless Headphones', 'Experience music like never before.', 199.99, 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=400&q=80'),
('Smartwatch Pro', 'Track your fitness and stay connected.', 299.99, 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=400&q=80'),
('Bluetooth Speaker', 'Portable speaker with deep bass.', 89.99, 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRUMWWfCCCUBxR5v4EixLjBt_KyAII0O0zZ0kTbsy4WZfw46D1KtYiuIWVn8UQFVIdyP6IqKUWcgQTiNpEdLQs7erXE10gC2nXGhThO9ebLk4HFVW8GNoRSRQ'),
('Gaming Laptop', 'High performance laptop for gaming.', 1299.99, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80');

-- 3️⃣ Cart Items Table
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    UNIQUE(user_id, product_id)
);

-- 4️⃣ Wishlist Table
CREATE TABLE IF NOT EXISTS wishlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE(user_id, product_id)
);

-- 5️⃣ Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    total_price DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(100) NOT NULL DEFAULT 'Card Payment',
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6️⃣ Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL
);

-- 7️⃣ Product Comments Table
CREATE TABLE IF NOT EXISTS product_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 8️⃣ Comment Likes Table
CREATE TABLE IF NOT EXISTS comment_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID REFERENCES product_comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- 9️⃣ Feedback / Report Table
CREATE TABLE IF NOT EXISTS feedback_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES product_comments(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);