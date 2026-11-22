-- WAJIB backup sebelum menjalankan migrasi:
-- mysqldump --single-transaction --routines --triggers -u <user> -p sigap > sigap-sebelum-002.sql
-- Jalankan dari root repository dengan: mysql -u <user> -p sigap < server/db/migrations/002_revisi_skema_erd.sql
-- Pastikan dump dapat dibaca dan simpan salinannya di luar server sebelum melanjutkan.

USE sigap;

-- Lokasi pengaduan setelah migrasi mengikuti warga.id_blok. Nilai reports.block_id
-- yang berbeda dari blok profil tidak disimpan karena kolom tersebut tidak ada di ERD target.
SELECT COUNT(*) AS jumlah_pengaduan_dengan_blok_berbeda_dari_profil
FROM reports r JOIN users u ON u.id=r.user_id
WHERE NOT (r.block_id <=> u.block_id);

-- Pastikan relasi lama dapat direpresentasikan oleh FK peran yang baru.
DELIMITER //
DROP PROCEDURE IF EXISTS pra_verifikasi_migrasi_erd//
CREATE PROCEDURE pra_verifikasi_migrasi_erd()
BEGIN
  IF EXISTS (SELECT 1 FROM reports r JOIN users u ON u.id=r.user_id WHERE u.role<>'warga') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Ada pengaduan milik akun yang role lamanya bukan warga; selesaikan pemetaan akun sebelum migrasi.';
  END IF;
  IF EXISTS (SELECT 1 FROM articles a JOIN users u ON u.id=a.author_id WHERE u.role<>'admin') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Ada artikel yang penulisnya bukan admin; selesaikan pemetaan penulis sebelum migrasi.';
  END IF;
END//
CALL pra_verifikasi_migrasi_erd()//
DROP PROCEDURE pra_verifikasi_migrasi_erd//
DELIMITER ;

CREATE TABLE IF NOT EXISTS blok (
  id_blok INT AUTO_INCREMENT PRIMARY KEY,
  nama_blok VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS admin (
  id_admin INT AUTO_INCREMENT PRIMARY KEY, nama VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE, no_telepon VARCHAR(30), kata_sandi VARCHAR(255) NOT NULL,
  tanggal_dibuat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS warga (
  id_warga INT AUTO_INCREMENT PRIMARY KEY, nama VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE, no_telepon VARCHAR(30), kata_sandi VARCHAR(255) NOT NULL,
  nomor_rumah VARCHAR(50), tanggal_dibuat TIMESTAMP DEFAULT CURRENT_TIMESTAMP, id_blok INT,
  CONSTRAINT fk_warga_blok FOREIGN KEY (id_blok) REFERENCES blok(id_blok) ON DELETE SET NULL,
  INDEX idx_warga_blok (id_blok)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS petugas (
  id_petugas INT AUTO_INCREMENT PRIMARY KEY, nama VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE, no_telepon VARCHAR(30), kata_sandi VARCHAR(255) NOT NULL,
  tanggal_dibuat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS kategori_sampah (
  id_kategori INT AUTO_INCREMENT PRIMARY KEY, nama_kategori VARCHAR(100) NOT NULL,
  deskripsi TEXT, panduan_penanganan TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS pengaduan (
  id_pengaduan INT AUTO_INCREMENT PRIMARY KEY, nomor_tiket VARCHAR(50) NOT NULL UNIQUE,
  patokan_lokasi TEXT, foto VARCHAR(255), status ENUM('Menunggu','Sedang Diproses','Selesai') NOT NULL DEFAULT 'Menunggu',
  waktu_diproses DATETIME NULL, waktu_selesai DATETIME NULL, foto_bukti VARCHAR(255) NULL,
  tanggal_dibuat TIMESTAMP DEFAULT CURRENT_TIMESTAMP, id_warga INT NOT NULL, id_kategori INT NOT NULL, id_petugas INT NULL,
  CONSTRAINT fk_pengaduan_warga FOREIGN KEY (id_warga) REFERENCES warga(id_warga) ON DELETE RESTRICT,
  CONSTRAINT fk_pengaduan_kategori FOREIGN KEY (id_kategori) REFERENCES kategori_sampah(id_kategori) ON DELETE RESTRICT,
  CONSTRAINT fk_pengaduan_petugas FOREIGN KEY (id_petugas) REFERENCES petugas(id_petugas) ON DELETE SET NULL,
  INDEX idx_pengaduan_status (status), INDEX idx_pengaduan_warga (id_warga), INDEX idx_pengaduan_tanggal_dibuat (tanggal_dibuat)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS artikel (
  id_artikel INT AUTO_INCREMENT PRIMARY KEY, judul VARCHAR(200) NOT NULL, slug VARCHAR(200) NOT NULL UNIQUE,
  isi LONGTEXT NOT NULL, gambar_sampul VARCHAR(255) NULL,
  tanggal_dibuat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tanggal_diperbarui TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  id_admin INT NOT NULL,
  CONSTRAINT fk_artikel_admin FOREIGN KEY (id_admin) REFERENCES admin(id_admin) ON DELETE RESTRICT,
  INDEX idx_artikel_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS jadwal_pengangkutan (
  id_jadwal INT AUTO_INCREMENT PRIMARY KEY, hari ENUM('Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu') NOT NULL,
  jam_mulai TIME NOT NULL, jam_selesai TIME NOT NULL, jenis_sampah VARCHAR(100) NOT NULL, catatan TEXT, id_blok INT NOT NULL,
  CONSTRAINT fk_jadwal_blok FOREIGN KEY (id_blok) REFERENCES blok(id_blok) ON DELETE RESTRICT,
  INDEX idx_jadwal_blok (id_blok), INDEX idx_jadwal_hari (hari)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO blok (id_blok, nama_blok) SELECT id, name FROM blocks;
INSERT INTO admin (id_admin,nama,email,no_telepon,kata_sandi,tanggal_dibuat)
  SELECT id,name,email,phone,password_hash,created_at FROM users WHERE role='admin';
INSERT INTO warga (id_warga,nama,email,no_telepon,kata_sandi,nomor_rumah,tanggal_dibuat,id_blok)
  SELECT id,name,email,phone,password_hash,house_number,created_at,block_id FROM users WHERE role='warga';
INSERT INTO petugas (id_petugas,nama,email,no_telepon,kata_sandi,tanggal_dibuat)
  SELECT id,name,email,phone,password_hash,created_at FROM users WHERE role='petugas';
INSERT INTO kategori_sampah (id_kategori,nama_kategori,deskripsi,panduan_penanganan)
  SELECT id,name,description,handling_instruction FROM waste_categories;
INSERT INTO pengaduan (id_pengaduan,nomor_tiket,patokan_lokasi,foto,status,waktu_diproses,waktu_selesai,foto_bukti,tanggal_dibuat,id_warga,id_kategori,id_petugas)
  SELECT r.id,r.ticket_number,r.landmark,r.photo_path,r.status,r.processed_at,r.completed_at,r.proof_photo_path,r.created_at,
         r.user_id,r.category_id,CASE WHEN p.id_petugas IS NULL THEN NULL ELSE r.handled_by END
  FROM reports r
  LEFT JOIN petugas p ON p.id_petugas=r.handled_by;
INSERT INTO artikel (id_artikel,judul,slug,isi,gambar_sampul,tanggal_dibuat,tanggal_diperbarui,id_admin)
  SELECT a.id,a.title,a.slug,a.content,a.cover_path,a.created_at,a.updated_at,a.author_id FROM articles a;
INSERT INTO jadwal_pengangkutan (id_jadwal,hari,jam_mulai,jam_selesai,jenis_sampah,catatan,id_blok)
  SELECT id,day_of_week,time_start,time_end,waste_type,notes,block_id FROM pickup_schedules;

-- Jangan menghapus tabel lama jika jumlah baris sumber dan tujuan tidak sama.
DELIMITER //
DROP PROCEDURE IF EXISTS verifikasi_migrasi_erd//
CREATE PROCEDURE verifikasi_migrasi_erd()
BEGIN
  IF (SELECT COUNT(*) FROM blocks) <> (SELECT COUNT(*) FROM blok)
    OR (SELECT COUNT(*) FROM users WHERE role='admin') <> (SELECT COUNT(*) FROM admin)
    OR (SELECT COUNT(*) FROM users WHERE role='warga') <> (SELECT COUNT(*) FROM warga)
    OR (SELECT COUNT(*) FROM users WHERE role='petugas') <> (SELECT COUNT(*) FROM petugas)
    OR (SELECT COUNT(*) FROM waste_categories) <> (SELECT COUNT(*) FROM kategori_sampah)
    OR (SELECT COUNT(*) FROM reports) <> (SELECT COUNT(*) FROM pengaduan)
    OR (SELECT COUNT(*) FROM articles) <> (SELECT COUNT(*) FROM artikel)
    OR (SELECT COUNT(*) FROM pickup_schedules) <> (SELECT COUNT(*) FROM jadwal_pengangkutan) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Verifikasi jumlah baris gagal; tabel lama dipertahankan.';
  END IF;
END//
CALL verifikasi_migrasi_erd()//
DROP PROCEDURE verifikasi_migrasi_erd//
DELIMITER ;

-- DROP hanya dijalankan setelah verifikasi di atas berhasil.
DROP TABLE reports;
DROP TABLE articles;
DROP TABLE pickup_schedules;
DROP TABLE waste_categories;
DROP TABLE users;
DROP TABLE blocks;
