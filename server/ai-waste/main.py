"""Backend-only image classification API for the SIGAP Express backend."""

import io
import json
import logging
from pathlib import Path
from threading import Lock

from fastapi import FastAPI, File, HTTPException, UploadFile
import torch
from PIL import Image, UnidentifiedImageError
from transformers import AutoImageProcessor, SiglipForImageClassification

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
_processor = None
_classifier = None
_classifier_lock = Lock()


def get_classifier():
    global _processor, _classifier
    if _classifier is None:
        with _classifier_lock:
            if _classifier is None:
                print(f"Memuat model klasifikasi {MODEL_ID}...", flush=True)
                _processor = AutoImageProcessor.from_pretrained(MODEL_ID)
                _classifier = SiglipForImageClassification.from_pretrained(MODEL_ID)
                _classifier.eval()
                print("Model klasifikasi siap.", flush=True)
    return _processor, _classifier


def label_for_index(id2label, index: int) -> str | None:
    return id2label.get(index) or id2label.get(str(index))


def validate_model_output(model) -> None:
    id2label = getattr(model.config, "id2label", None) or {}
    model_labels = {label for label in id2label.values() if label}
    if not model_labels:
        raise RuntimeError("Model tidak menyertakan daftar label (id2label) pada konfigurasinya.")

    missing = sorted(set(LABELS) - model_labels)
    extra = sorted(model_labels - set(LABELS))
    if missing or extra:
        raise RuntimeError(
            "Label model tidak cocok dengan model-config.json. "
            f"Kurang: {missing or '-'}. Berlebih: {extra or '-'}."
        )


@app.on_event("startup")
def load_and_validate_model() -> None:
    try:
        _, model = get_classifier()
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
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except (UnidentifiedImageError, OSError, ValueError):
        raise HTTPException(status_code=400, detail="File bukan gambar yang valid.")

    try:
        processor, model = get_classifier()
        inputs = processor(images=image, return_tensors="pt")
        with torch.no_grad():
            logits = model(**inputs).logits
        probabilities = torch.nn.functional.softmax(logits, dim=1)[0].cpu()
    except Exception as error:
        print(f"Klasifikasi gambar gagal: {error!r}", flush=True)
        raise HTTPException(status_code=503, detail="Model identifikasi sampah gagal memproses gambar.")

    id2label = model.config.id2label or {}
    if probabilities.numel() != len(id2label):
        raise HTTPException(status_code=503, detail="Jumlah keluaran model tidak cocok dengan daftar label.")

    top_count = min(3, probabilities.numel())
    top_probabilities, top_indices = torch.topk(probabilities, top_count)
    top3 = []
    for probability, index in zip(top_probabilities.tolist(), top_indices.tolist()):
        label = label_for_index(id2label, index)
        if not label:
            raise HTTPException(status_code=503, detail="Label hasil model tidak dikenali.")
        mapping = CLASS_MAPPINGS.get(label) or {}
        confidence_text = f"{probability * 100:.2f}%".replace(".", ",")
        top3.append({
            "model_label": label,
            "label_display": mapping.get("label_display") or label,
            "category": mapping.get("category"),
            "handling_instruction": mapping.get("handling_instruction"),
            "confidence": float(probability),
            "confidence_text": confidence_text,
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
