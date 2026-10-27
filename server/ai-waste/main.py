"""Backend-only image classification API for the SIGAP Express backend."""

import io
import json
import logging
import os
from pathlib import Path
from threading import Lock

from fastapi import FastAPI, File, HTTPException, UploadFile
import numpy as np
from PIL import Image, UnidentifiedImageError

os.environ.setdefault("KERAS_BACKEND", "tensorflow")

BASE_DIR = Path(__file__).resolve().parent
with (BASE_DIR / "model-config.json").open(encoding="utf-8") as config_file:
    MODEL_CONFIG = json.load(config_file)
with (BASE_DIR / "waste-classes.json").open(encoding="utf-8") as mapping_file:
    CLASS_MAPPINGS = json.load(mapping_file)

MODEL_ID = MODEL_CONFIG["provider"]
LABELS = tuple(MODEL_CONFIG["labels"])
MAX_IMAGE_BYTES = 5 * 1024 * 1024
LOGGER = logging.getLogger("sigap.ai-waste")

MISSING_MAPPINGS = sorted(set(LABELS) - CLASS_MAPPINGS.keys())
if MISSING_MAPPINGS:
    message = "Mapping kelas sampah belum lengkap untuk label model: " + ", ".join(MISSING_MAPPINGS)
    LOGGER.critical(message)
    raise RuntimeError(message)

EXTRA_MAPPINGS = sorted(CLASS_MAPPINGS.keys() - set(LABELS))
if EXTRA_MAPPINGS:
    LOGGER.warning("Mapping kelas tidak dipakai model ini: %s", ", ".join(EXTRA_MAPPINGS))

app = FastAPI(title="SIGAP AI Waste Service", version="1.0")
_classifier = None
_classifier_lock = Lock()


def get_classifier():
    global _classifier
    if _classifier is None:
        with _classifier_lock:
            if _classifier is None:
                print(f"Memuat model klasifikasi {MODEL_ID}...", flush=True)
                import keras

                _classifier = keras.saving.load_model(f"hf://{MODEL_ID}")
                print("Model klasifikasi siap.", flush=True)
    return _classifier


def validate_model_output(model) -> None:
    output_shape = model.output_shape
    if isinstance(output_shape, list) or not output_shape or output_shape[-1] != len(LABELS):
        raise RuntimeError(
            f"Jumlah keluaran model ({output_shape}) tidak cocok dengan "
            f"{len(LABELS)} label pada model-config.json."
        )


@app.on_event("startup")
def load_and_validate_model() -> None:
    try:
        model = get_classifier()
        validate_model_output(model)
        LOGGER.info("Model %s siap dengan %s label dan mapping lengkap.", MODEL_ID, len(LABELS))
    except Exception:
        LOGGER.exception("Gagal memuat atau memvalidasi model AI sampah %s.", MODEL_ID)
        raise


@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL_ID}


@app.post("/api/v1/identify")
async def identify(file: UploadFile = File(...)):
    if file.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(status_code=400, detail="Hanya menerima gambar JPEG, PNG, atau WebP.")

    contents = await file.read(MAX_IMAGE_BYTES + 1)
    if not contents:
        raise HTTPException(status_code=400, detail="File gambar kosong.")
    if len(contents) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Ukuran gambar maksimal 5MB.")

    try:
        image = Image.open(io.BytesIO(contents))
        image.verify()
        image = Image.open(io.BytesIO(contents)).convert("RGB").resize((224, 224))
    except (UnidentifiedImageError, OSError, ValueError):
        raise HTTPException(status_code=400, detail="File bukan gambar yang valid.")

    try:
        model_input = np.expand_dims(np.asarray(image, dtype=np.float32), axis=0)
        results = get_classifier().predict(model_input, verbose=0)
    except Exception as error:
        print(f"Klasifikasi gambar gagal: {error!r}", flush=True)
        raise HTTPException(status_code=503, detail="Model identifikasi sampah gagal memproses gambar.")

    probabilities = np.asarray(results)[0]
    if probabilities.size != len(LABELS):
        raise HTTPException(status_code=503, detail="Jumlah keluaran model tidak cocok dengan daftar label.")
    top_indices = np.argsort(probabilities)[-3:][::-1]
    top3 = []
    for index in top_indices:
        label = LABELS[int(index)]
        mapping = CLASS_MAPPINGS.get(label)
        top3.append({
            "model_label": label,
            "label_display": mapping.get("label_display") if mapping else None,
            "category": mapping.get("category") if mapping else None,
            "handling_instruction": mapping.get("handling_instruction") if mapping else None,
            "confidence": float(probabilities[index]),
            "confidence_text": f"{float(probabilities[index]) * 100:.2f}%".replace(".", ","),
        })

    best = top3[0]
    return {
        "status": "success",
        "provider": MODEL_ID,
        "asli_dari_model": best["model_label"],
        "model_label": best["model_label"],
        "label_display": best["label_display"],
        "kategori_sampah": best["category"],
        "handling_instruction": best["handling_instruction"],
        "confidence": best["confidence"],
        "confidence_text": best["confidence_text"],
        "akurasi": best["confidence_text"],
        "top3": top3,
    }
