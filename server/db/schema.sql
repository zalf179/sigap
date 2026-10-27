CREATE DATABASE IF NOT EXISTS sigap CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sigap;

CREATE TABLE IF NOT EXISTS blocks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(30),
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('warga','petugas','admin') NOT NULL DEFAULT 'warga',
  block_id INT,
  house_number VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_block FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE SET NULL,
  INDEX idx_users_role (role),
  INDEX idx_users_block (block_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS waste_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  handling_instruction TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_number VARCHAR(50) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  block_id INT NOT NULL,
  landmark TEXT,
  category_id INT NOT NULL,
  photo_path VARCHAR(255),
  status ENUM('Menunggu','Sedang Diproses','Selesai') NOT NULL DEFAULT 'Menunggu',
  handled_by INT NULL,
  processed_at DATETIME NULL,
  completed_at DATETIME NULL,
  proof_photo_path VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reports_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_reports_block FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE RESTRICT,
  CONSTRAINT fk_reports_category FOREIGN KEY (category_id) REFERENCES waste_categories(id) ON DELETE RESTRICT,
  CONSTRAINT fk_reports_handled_by FOREIGN KEY (handled_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_reports_status (status),
  INDEX idx_reports_user (user_id),
  INDEX idx_reports_block (block_id),
  INDEX idx_reports_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  content LONGTEXT NOT NULL,
  cover_path VARCHAR(255) NULL,
  author_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_articles_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_articles_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pickup_schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  block_id INT NOT NULL,
  day_of_week ENUM('Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu') NOT NULL,
  time_start TIME NOT NULL,
  time_end TIME NOT NULL,
  waste_type VARCHAR(100) NOT NULL,
  notes TEXT,
  CONSTRAINT fk_pickup_block FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE RESTRICT,
  INDEX idx_pickup_block (block_id),
  INDEX idx_pickup_day (day_of_week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
