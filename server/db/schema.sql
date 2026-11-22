CREATE DATABASE IF NOT EXISTS sigap CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sigap;

CREATE TABLE IF NOT EXISTS blok (
  id_blok INT AUTO_INCREMENT PRIMARY KEY,
  nama_blok VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin (
  id_admin INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  no_telepon VARCHAR(30),
  kata_sandi VARCHAR(255) NOT NULL,
  tanggal_dibuat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS warga (
  id_warga INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  no_telepon VARCHAR(30),
  kata_sandi VARCHAR(255) NOT NULL,
  nomor_rumah VARCHAR(50),
  tanggal_dibuat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  id_blok INT,
  CONSTRAINT fk_warga_blok FOREIGN KEY (id_blok) REFERENCES blok(id_blok) ON DELETE SET NULL,
  INDEX idx_warga_blok (id_blok)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS petugas (
  id_petugas INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  no_telepon VARCHAR(30),
  kata_sandi VARCHAR(255) NOT NULL,
  tanggal_dibuat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS kategori_sampah (
  id_kategori INT AUTO_INCREMENT PRIMARY KEY,
  nama_kategori VARCHAR(100) NOT NULL,
  deskripsi TEXT,
  panduan_penanganan TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pengaduan (
  id_pengaduan INT AUTO_INCREMENT PRIMARY KEY,
  nomor_tiket VARCHAR(50) NOT NULL UNIQUE,
  patokan_lokasi TEXT,
  foto VARCHAR(255),
  status ENUM('Menunggu','Sedang Diproses','Selesai') NOT NULL DEFAULT 'Menunggu',
  waktu_diproses DATETIME NULL,
  waktu_selesai DATETIME NULL,
  foto_bukti VARCHAR(255) NULL,
  tanggal_dibuat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  id_warga INT NOT NULL,
  id_kategori INT NOT NULL,
  id_petugas INT NULL,
  CONSTRAINT fk_pengaduan_warga FOREIGN KEY (id_warga) REFERENCES warga(id_warga) ON DELETE RESTRICT,
  CONSTRAINT fk_pengaduan_kategori FOREIGN KEY (id_kategori) REFERENCES kategori_sampah(id_kategori) ON DELETE RESTRICT,
  CONSTRAINT fk_pengaduan_petugas FOREIGN KEY (id_petugas) REFERENCES petugas(id_petugas) ON DELETE SET NULL,
  INDEX idx_pengaduan_status (status),
  INDEX idx_pengaduan_warga (id_warga),
  INDEX idx_pengaduan_tanggal_dibuat (tanggal_dibuat)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS artikel (
  id_artikel INT AUTO_INCREMENT PRIMARY KEY,
  judul VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  isi LONGTEXT NOT NULL,
  gambar_sampul VARCHAR(255) NULL,
  tanggal_dibuat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tanggal_diperbarui TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  id_admin INT NOT NULL,
  CONSTRAINT fk_artikel_admin FOREIGN KEY (id_admin) REFERENCES admin(id_admin) ON DELETE RESTRICT,
  INDEX idx_artikel_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS jadwal_pengangkutan (
  id_jadwal INT AUTO_INCREMENT PRIMARY KEY,
  hari ENUM('Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu') NOT NULL,
  jam_mulai TIME NOT NULL,
  jam_selesai TIME NOT NULL,
  jenis_sampah VARCHAR(100) NOT NULL,
  catatan TEXT,
  id_blok INT NOT NULL,
  CONSTRAINT fk_jadwal_blok FOREIGN KEY (id_blok) REFERENCES blok(id_blok) ON DELETE RESTRICT,
  INDEX idx_jadwal_blok (id_blok),
  INDEX idx_jadwal_hari (hari)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
