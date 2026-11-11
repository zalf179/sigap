# SIGAP AI waste classifier

Layanan FastAPI ini menjalankan model Hugging Face
`prithivMLmods/Augmented-Waste-Classifier-SigLIP2`, yaitu model klasifikasi
gambar berbasis `google/siglip2-base-patch16-224` yang sudah di-fine-tune untuk
10 kelas sampah. Layanan ini hanya dipakai oleh backend Express SIGAP dan tidak
menyajikan frontend.

## Model

- Arsitektur: SigLIP2-base patch16-224 + classification head
- Framework: PyTorch / Transformers
- Input: 224 x 224 x 3
- Jumlah kelas: 10 (`Battery`, `Biological`, `Cardboard`, `Clothes`, `Glass`,
  `Metal`, `Paper`, `Plastic`, `Shoes`, `Trash`)
- Lisensi: Apache-2.0

Pemetaan kelas model ke kategori SIGAP ada di `waste-classes.json`:

- `Battery` -> `B3`
- `Biological` -> `Organik`
- `Clothes`, `Shoes`, `Trash` -> `Residu`
- `Cardboard`, `Glass`, `Metal`, `Paper`, `Plastic` -> `Anorganik`

Saat startup, layanan memvalidasi bahwa semua label model memiliki mapping dan
jumlah keluaran model cocok dengan `model-config.json`.

## Menjalankan

Lingkungan Python berada di direktori ini. Jalankan dari root project SIGAP:

```sh
cd /home/zalfy/sigap/server/ai-waste
.venv/bin/python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Buat environment dan pasang dependensi jika perlu:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
```

Model diunduh saat startup pertama sehingga proses awal bisa lebih lama.
Backend Express memanggil `POST http://127.0.0.1:8000/api/v1/identify` secara
otomatis. Atur `AI_WASTE_URL` di `server/.env` jika layanan berjalan di tempat
lain, dan `AI_WASTE_TIMEOUT_MS` untuk mengubah batas waktu tunggu (default 300
detik). Field upload gambar adalah `file`; format yang diterima JPEG, PNG, dan
WebP maksimal 5 MB.
