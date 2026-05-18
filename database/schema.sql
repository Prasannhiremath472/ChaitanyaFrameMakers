-- ============================================================
-- ChaitanyaFrameMakers - Complete MySQL Database Schema
-- Production-Ready with Relations, Indexes & Constraints
-- ============================================================

CREATE DATABASE IF NOT EXISTS chaitanya_framemakers
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE chaitanya_framemakers;

-- ─────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────
CREATE TABLE users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(180) NOT NULL UNIQUE,
  phone         VARCHAR(20),
  password_hash VARCHAR(255),
  role          ENUM('customer','admin') NOT NULL DEFAULT 'customer',
  is_verified   TINYINT(1) NOT NULL DEFAULT 0,
  avatar        VARCHAR(500),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role  (role)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- OTP VERIFICATIONS
-- ─────────────────────────────────────────
CREATE TABLE otp_verifications (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email      VARCHAR(180) NOT NULL,
  otp        VARCHAR(10)  NOT NULL,
  purpose    ENUM('register','login','reset') NOT NULL DEFAULT 'login',
  expires_at DATETIME     NOT NULL,
  used       TINYINT(1)   NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email_otp (email, otp)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- CATEGORIES
-- ─────────────────────────────────────────
CREATE TABLE categories (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  slug        VARCHAR(140) NOT NULL UNIQUE,
  description TEXT,
  image       VARCHAR(500),
  parent_id   INT UNSIGNED,
  sort_order  INT NOT NULL DEFAULT 0,
  is_active   TINYINT(1)  NOT NULL DEFAULT 1,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_slug      (slug),
  INDEX idx_parent_id (parent_id),
  INDEX idx_active    (is_active)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- PRODUCTS
-- ─────────────────────────────────────────
CREATE TABLE products (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name             VARCHAR(255) NOT NULL,
  slug             VARCHAR(280) NOT NULL UNIQUE,
  sku              VARCHAR(80)  NOT NULL UNIQUE,
  description      LONGTEXT,
  short_desc       VARCHAR(500),
  price            DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  sale_price       DECIMAL(10,2),
  cost_price       DECIMAL(10,2),
  stock            INT NOT NULL DEFAULT 0,
  low_stock_alert  INT NOT NULL DEFAULT 5,
  category_id      INT UNSIGNED,
  brand            VARCHAR(120),
  material         VARCHAR(120),
  dimensions       VARCHAR(120),
  weight           DECIMAL(8,2),
  color_options    JSON,
  size_options     JSON,
  is_customizable  TINYINT(1) NOT NULL DEFAULT 0,
  is_featured      TINYINT(1) NOT NULL DEFAULT 0,
  is_bestseller    TINYINT(1) NOT NULL DEFAULT 0,
  is_trending      TINYINT(1) NOT NULL DEFAULT 0,
  is_active        TINYINT(1) NOT NULL DEFAULT 1,
  meta_title       VARCHAR(255),
  meta_desc        VARCHAR(500),
  meta_keywords    VARCHAR(500),
  rating_avg       DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  rating_count     INT NOT NULL DEFAULT 0,
  views            INT NOT NULL DEFAULT 0,
  tags             JSON,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_slug        (slug),
  INDEX idx_category    (category_id),
  INDEX idx_featured    (is_featured),
  INDEX idx_bestseller  (is_bestseller),
  INDEX idx_trending    (is_trending),
  INDEX idx_active      (is_active),
  FULLTEXT idx_search   (name, description, tags)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- PRODUCT IMAGES
-- ─────────────────────────────────────────
CREATE TABLE product_images (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NOT NULL,
  image_url  VARCHAR(500) NOT NULL,
  alt_text   VARCHAR(255),
  sort_order INT NOT NULL DEFAULT 0,
  is_primary TINYINT(1)  NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product (product_id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- ADDRESSES
-- ─────────────────────────────────────────
CREATE TABLE addresses (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  label       VARCHAR(60),
  full_name   VARCHAR(120) NOT NULL,
  phone       VARCHAR(20)  NOT NULL,
  line1       VARCHAR(255) NOT NULL,
  line2       VARCHAR(255),
  city        VARCHAR(100) NOT NULL,
  state       VARCHAR(100) NOT NULL,
  pincode     VARCHAR(10)  NOT NULL,
  country     VARCHAR(80)  NOT NULL DEFAULT 'India',
  is_default  TINYINT(1)  NOT NULL DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- COUPONS
-- ─────────────────────────────────────────
CREATE TABLE coupons (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code            VARCHAR(40)  NOT NULL UNIQUE,
  description     VARCHAR(255),
  discount_type   ENUM('percent','flat') NOT NULL DEFAULT 'percent',
  discount_value  DECIMAL(10,2) NOT NULL,
  min_order_value DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  max_discount    DECIMAL(10,2),
  usage_limit     INT,
  used_count      INT NOT NULL DEFAULT 0,
  valid_from      DATE,
  valid_until     DATE,
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_code   (code),
  INDEX idx_active (is_active)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- ORDERS
-- ─────────────────────────────────────────
CREATE TABLE orders (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_number      VARCHAR(30)   NOT NULL UNIQUE,
  user_id           INT UNSIGNED,
  guest_email       VARCHAR(180),
  status            ENUM('pending','confirmed','processing','shipped','delivered','cancelled','refunded')
                    NOT NULL DEFAULT 'pending',
  payment_status    ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  payment_method    VARCHAR(50),
  razorpay_order_id VARCHAR(120),
  razorpay_pay_id   VARCHAR(120),
  subtotal          DECIMAL(10,2) NOT NULL,
  discount          DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  shipping_charge   DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  tax               DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total             DECIMAL(10,2) NOT NULL,
  coupon_id         INT UNSIGNED,
  address_snapshot  JSON,
  notes             TEXT,
  tracking_number   VARCHAR(120),
  shipped_at        DATETIME,
  delivered_at      DATETIME,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE SET NULL,
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL,
  INDEX idx_user        (user_id),
  INDEX idx_status      (status),
  INDEX idx_pay_status  (payment_status),
  INDEX idx_order_num   (order_number)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- ORDER ITEMS
-- ─────────────────────────────────────────
CREATE TABLE order_items (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id        INT UNSIGNED NOT NULL,
  product_id      INT UNSIGNED,
  product_name    VARCHAR(255) NOT NULL,
  product_sku     VARCHAR(80),
  product_image   VARCHAR(500),
  quantity        INT          NOT NULL,
  unit_price      DECIMAL(10,2) NOT NULL,
  total_price     DECIMAL(10,2) NOT NULL,
  customization   JSON,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_order   (order_id),
  INDEX idx_product (product_id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- CART
-- ─────────────────────────────────────────
CREATE TABLE cart_items (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       INT UNSIGNED NOT NULL,
  product_id    INT UNSIGNED NOT NULL,
  quantity      INT          NOT NULL DEFAULT 1,
  customization JSON,
  added_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_product (user_id, product_id),
  INDEX idx_user (user_id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- WISHLIST
-- ─────────────────────────────────────────
CREATE TABLE wishlists (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  added_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uq_wish (user_id, product_id),
  INDEX idx_user (user_id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- REVIEWS
-- ─────────────────────────────────────────
CREATE TABLE reviews (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id  INT UNSIGNED NOT NULL,
  user_id     INT UNSIGNED,
  guest_name  VARCHAR(120),
  rating      TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title       VARCHAR(255),
  body        TEXT,
  images      JSON,
  is_approved TINYINT(1) NOT NULL DEFAULT 0,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE SET NULL,
  INDEX idx_product  (product_id),
  INDEX idx_approved (is_approved)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- BANNERS / SLIDERS
-- ─────────────────────────────────────────
CREATE TABLE banners (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(255),
  subtitle    VARCHAR(500),
  image       VARCHAR(500) NOT NULL,
  link        VARCHAR(500),
  position    ENUM('hero','mid','bottom','popup') NOT NULL DEFAULT 'hero',
  sort_order  INT NOT NULL DEFAULT 0,
  is_active   TINYINT(1)  NOT NULL DEFAULT 1,
  starts_at   DATETIME,
  ends_at     DATETIME,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- OFFERS / PROMOTIONS
-- ─────────────────────────────────────────
CREATE TABLE offers (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  image       VARCHAR(500),
  discount    DECIMAL(5,2),
  product_id  INT UNSIGNED,
  category_id INT UNSIGNED,
  starts_at   DATETIME,
  ends_at     DATETIME,
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id)  REFERENCES products(id)   ON DELETE SET NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- NEWSLETTER SUBSCRIPTIONS
-- ─────────────────────────────────────────
CREATE TABLE newsletter_subscribers (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email      VARCHAR(180) NOT NULL UNIQUE,
  is_active  TINYINT(1)  NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- RECENTLY VIEWED
-- ─────────────────────────────────────────
CREATE TABLE recently_viewed (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  viewed_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uq_viewed (user_id, product_id),
  INDEX idx_user (user_id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- BLOGS
-- ─────────────────────────────────────────
CREATE TABLE blogs (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  slug        VARCHAR(280) NOT NULL UNIQUE,
  excerpt     VARCHAR(500),
  body        LONGTEXT,
  cover_image VARCHAR(500),
  author_id   INT UNSIGNED,
  tags        JSON,
  is_published TINYINT(1) NOT NULL DEFAULT 0,
  published_at DATETIME,
  meta_title  VARCHAR(255),
  meta_desc   VARCHAR(500),
  views       INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_slug      (slug),
  INDEX idx_published (is_published)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- CONTACT MESSAGES
-- ─────────────────────────────────────────
CREATE TABLE contact_messages (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(120) NOT NULL,
  email      VARCHAR(180) NOT NULL,
  phone      VARCHAR(20),
  subject    VARCHAR(255),
  message    TEXT NOT NULL,
  is_read    TINYINT(1) NOT NULL DEFAULT 0,
  replied_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- CUSTOM UPLOADS (Photo Customization)
-- ─────────────────────────────────────────
CREATE TABLE custom_uploads (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED,
  file_name  VARCHAR(255) NOT NULL,
  file_path  VARCHAR(500) NOT NULL,
  file_size  INT,
  mime_type  VARCHAR(80),
  product_id INT UNSIGNED,
  order_id   INT UNSIGNED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE SET NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE SET NULL
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- SEED DATA
-- ─────────────────────────────────────────

-- Admin user (password: Admin@1234)
INSERT INTO users (name, email, phone, password_hash, role, is_verified) VALUES
('Admin', 'admin@chaitanyaframes.com', '9999999999',
 '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TqzneflfijxivzsGdhsl5StLfzNG', 'admin', 1);

-- Categories
INSERT INTO categories (name, slug, description, sort_order) VALUES
('Personalized Photo Frames', 'personalized-photo-frames', 'Custom photo frames with your memories', 1),
('LED Frames',                'led-frames',                'Glowing LED illuminated frames',        2),
('Acrylic Frames',            'acrylic-frames',            'Modern crystal-clear acrylic frames',   3),
('Wooden Frames',             'wooden-frames',             'Handcrafted premium wooden frames',     4),
('Glass Frames',              'glass-frames',              'Elegant glass photo frames',            5),
('Canvas Wall Art',           'canvas-wall-art',           'Premium canvas prints for walls',       6),
('Couple Gifts',              'couple-gifts',              'Beautiful gifts for couples',           7),
('Birthday Gifts',            'birthday-gifts',            'Celebrate birthdays with style',        8),
('Anniversary Gifts',         'anniversary-gifts',         'Mark your milestones with love',        9),
('Festival Gifts',            'festival-gifts',            'Festive gifting collections',           10),
('Corporate Gifts',           'corporate-gifts',           'Premium corporate gifting',             11),
('Kids Gifts',                'kids-gifts',                'Fun and creative gifts for kids',       12),
('Customized Name Frames',    'customized-name-frames',    'Frames with personalized names',        13),
('Resin Art Gifts',           'resin-art-gifts',           'Handmade resin art pieces',             14),
('Photo Collage Frames',      'photo-collage-frames',      'Multi-photo collage frames',            15),
('Home Decor',                'home-decor',                'Elegant home decoration items',         16);

-- Sample Products
INSERT INTO products (name, slug, sku, description, short_desc, price, sale_price, stock, category_id,
  is_customizable, is_featured, is_bestseller, is_trending, rating_avg, rating_count, tags) VALUES
('Eternal Love LED Frame', 'eternal-love-led-frame', 'SKU-LED-001',
 'A stunning LED illuminated frame that makes your cherished memories glow with warmth. Premium quality with adjustable brightness.',
 'Glowing LED frame for your special memories', 1299.00, 999.00, 50, 2, 1, 1, 1, 1, 4.8, 124,
 '["led", "couple", "anniversary", "gift", "glow"]'),

('Royal Wooden Collage Frame', 'royal-wooden-collage-frame', 'SKU-WD-001',
 'Handcrafted solid wood collage frame holding 6 photos. Rustic charm meets modern elegance.',
 'Premium 6-photo wooden collage frame', 1899.00, 1499.00, 35, 4, 1, 1, 1, 0, 4.9, 87,
 '["wooden", "collage", "rustic", "handcrafted"]'),

('Crystal Acrylic Name Frame', 'crystal-acrylic-name-frame', 'SKU-AC-001',
 'Personalized crystal-clear acrylic frame with laser-engraved name. A perfect gift for any occasion.',
 'Crystal acrylic personalized name frame', 799.00, 649.00, 80, 3, 1, 1, 0, 1, 4.7, 203,
 '["acrylic", "personalized", "name", "crystal"]'),

('Canvas Wall Portrait', 'canvas-wall-portrait', 'SKU-CV-001',
 'Gallery-quality canvas print of your favorite photo. UV-protected inks ensure colors last decades.',
 'Premium gallery canvas wall print', 2499.00, 1999.00, 25, 6, 1, 1, 1, 1, 4.9, 56,
 '["canvas", "wall-art", "portrait", "gallery"]'),

('Anniversary Glass Frame', 'anniversary-glass-frame', 'SKU-GL-001',
 'Elegant glass frame with gold-foil anniversary text. A timeless keepsake for couples.',
 'Gold-foil anniversary glass frame', 999.00, 799.00, 60, 9, 1, 0, 1, 0, 4.6, 78,
 '["glass", "anniversary", "couple", "gold"]'),

('Birthday Resin Art Gift', 'birthday-resin-art-gift', 'SKU-RS-001',
 'Handmade resin art piece with your photo embedded. Each piece is unique and one-of-a-kind.',
 'Handmade resin art with photo embed', 1599.00, 1299.00, 20, 14, 1, 1, 0, 1, 4.8, 45,
 '["resin", "birthday", "handmade", "art"]'),

('Kids Rainbow Photo Frame', 'kids-rainbow-photo-frame', 'SKU-KD-001',
 'Colorful and durable photo frame for kids rooms. Includes fun stickers for personalization.',
 'Colorful kids photo frame with stickers', 499.00, 399.00, 100, 12, 0, 0, 1, 1, 4.5, 167,
 '["kids", "colorful", "fun", "rainbow"]'),

('Corporate Silver Frame', 'corporate-silver-frame', 'SKU-CP-001',
 'Professional silver-finish frame ideal for corporate gifting. Laser engraving available.',
 'Premium silver corporate photo frame', 1499.00, 1199.00, 40, 11, 1, 0, 0, 0, 4.7, 32,
 '["corporate", "silver", "professional", "engraved"]');

-- Product Images
INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES
(1, '/uploads/products/led-frame-1.jpg',      1, 0),
(1, '/uploads/products/led-frame-2.jpg',      0, 1),
(2, '/uploads/products/wooden-frame-1.jpg',   1, 0),
(2, '/uploads/products/wooden-frame-2.jpg',   0, 1),
(3, '/uploads/products/acrylic-frame-1.jpg',  1, 0),
(4, '/uploads/products/canvas-print-1.jpg',   1, 0),
(5, '/uploads/products/glass-frame-1.jpg',    1, 0),
(6, '/uploads/products/resin-art-1.jpg',      1, 0),
(7, '/uploads/products/kids-frame-1.jpg',     1, 0),
(8, '/uploads/products/corp-frame-1.jpg',     1, 0);

-- Sample Coupons
INSERT INTO coupons (code, description, discount_type, discount_value, min_order_value, max_discount, usage_limit, valid_until) VALUES
('WELCOME10', 'Welcome discount - 10% off',        'percent', 10.00, 299.00, 200.00, 1000, '2026-12-31'),
('FLAT200',   'Flat Rs.200 off on orders above 999','flat',   200.00, 999.00, 200.00, 500,  '2026-12-31'),
('LOVE25',    '25% off on couple gifts',            'percent', 25.00, 499.00, 500.00, 200,  '2026-12-31'),
('CORP15',    '15% off on corporate orders',        'percent', 15.00, 1999.00,1000.00,100,  '2026-12-31');

-- Sample Banners
INSERT INTO banners (title, subtitle, image, link, position, sort_order) VALUES
('Memories That Last Forever',    'Explore our premium photo frames collection',      '/uploads/banners/hero-1.jpg', '/products', 'hero', 1),
('Personalised Gifts for Everyone','Create something unique and heartfelt',            '/uploads/banners/hero-2.jpg', '/products?category=couple-gifts', 'hero', 2),
('Festival Season Special',        'Up to 40% off on selected items',                  '/uploads/banners/hero-3.jpg', '/products?tag=festival', 'hero', 3),
('LED Frame Collection',           'New arrivals — Frames that glow like your memories','/uploads/banners/mid-1.jpg',  '/products?category=led-frames', 'mid', 1);

-- Sample Blog
INSERT INTO blogs (title, slug, excerpt, body, is_published, published_at, author_id) VALUES
('Top 10 Photo Frame Gift Ideas for 2026',
 'top-10-photo-frame-gift-ideas-2026',
 'Discover the most thoughtful photo frame gifts for your loved ones this year.',
 '<p>Photo frames are timeless gifts that capture precious memories...</p>', 1, NOW(), 1),
('How to Choose the Perfect LED Frame',
 'how-to-choose-perfect-led-frame',
 'LED frames bring your memories to life. Here''s how to pick the right one.',
 '<p>LED frames come in various sizes and styles...</p>', 1, NOW(), 1);
