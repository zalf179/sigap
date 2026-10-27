# SIGAP AI waste classifier

This backend-only FastAPI service runs the Hugging Face `Darshan764/waste-classification-v2` EfficientNet model. It does not serve or use the `~/ai-waste/index.html` frontend.

The Python environment lives in this directory. Start the service from the SIGAP project root:

```sh
cd /home/zalfy/sigap/server/ai-waste
.venv/bin/python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Create the environment and install dependencies if needed with `python3 -m venv .venv` followed by `.venv/bin/python -m pip install -r requirements.txt`.

The service validates at startup that every model output label has an Indonesian name, category, and item-specific tip in `waste-classes.json`, and that the loaded model has the configured output count. The SIGAP Express backend calls `POST http://127.0.0.1:8000/api/v1/identify` automatically. Food scraps/coffee grounds/eggshells/tea bags map to `Organik`, aerosol cans to `B3`, clothing, shoes, small plastic cutlery, straws, plastic trash bags, and styrofoam to `Residu`, and other listed recyclable materials to `Anorganik`. Set `AI_WASTE_URL` in `server/.env` if the service runs elsewhere, and `AI_WASTE_TIMEOUT_MS` to override the default 300-second first-load allowance. The image upload field is `file`; allowed formats are JPEG, PNG, and WebP up to 5 MB.
