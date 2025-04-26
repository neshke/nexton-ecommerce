
-- Create Categories table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Products table
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    sale_price DECIMAL(10, 2),
    image_url VARCHAR(255),
    additional_images JSON,
    stock_quantity INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Insert some sample categories
INSERT INTO categories (name, slug, description) VALUES
('Electronics', 'electronics', 'Electronic devices and accessories'),
('Clothing', 'clothing', 'Fashionable apparel for all occasions'),
('Home & Kitchen', 'home-kitchen', 'Products for your home and kitchen');

-- Insert some sample products
INSERT INTO products (category_id, name, slug, description, price, stock_quantity, is_featured) VALUES
(1, 'Smartphone XYZ', 'smartphone-xyz', 'Latest smartphone with advanced features', 699.99, 50, 1),
(1, 'Laptop Pro', 'laptop-pro', 'Powerful laptop for professionals', 1299.99, 25, 1),
(2, 'Denim Jeans', 'denim-jeans', 'Classic blue denim jeans', 49.99, 100, 0),
(3, 'Coffee Maker', 'coffee-maker', 'Automatic coffee maker with timer', 89.99, 30, 1);
