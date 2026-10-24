import os
import sys
import uuid
import json
import shutil
from datetime import datetime
from typing import List, Dict, Any, Optional

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

from database import init_db, save_call, get_calls, get_call_by_id, delete_call, get_products, get_product_by_id
from sales_engine import SalesEngine
from summarizer import ConversationSummarizer
from llm_client import LLMClient

# Initialize DB
init_db()

app = FastAPI(title="AI Voice Sales Bot API", version="1.0.0")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

RECORDINGS_DIR = os.path.join(os.path.dirname(__file__), "recordings")
os.makedirs(RECORDINGS_DIR, exist_ok=True)

sales_engine = SalesEngine()
summarizer = ConversationSummarizer()
llm_client = LLMClient()

# Request Models
class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = []
    product_id: str = "flowpulse-crm"
    language: str = "en-US"

class SummarizeRequest(BaseModel):
    transcript: List[Dict[str, str]]
    product_id: str = "flowpulse-crm"
    language: str = "en-US"

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": "AI Voice Sales Bot",
        "timestamp": datetime.utcnow().isoformat(),
        "llm_configured": llm_client.is_configured()
    }

@app.get("/api/products")
def list_products():
    return get_products()

@app.get("/api/products/{product_id}")
def get_product(product_id: str):
    product = get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.post("/api/chat")
async def chat_interaction(req: ChatRequest):
    product = get_product_by_id(req.product_id)
    if not product:
        product = {"name": "FlowPulse AI CRM", "tagline": "Autonomous Sales Automation"}

    # Attempt LLM reply first if available
    llm_reply = await llm_client.generate_sales_reply(
        customer_message=req.message,
        history=req.history,
        product=product,
        language=req.language
    )

    if llm_reply:
        return {
            "text": llm_reply,
            "intent": "llm_generated",
            "source": "cloud_llm"
        }

    # Intelligent Sales Engine fallback
    result = sales_engine.generate_response(
        customer_message=req.message,
        history=req.history,
        product=product,
        language=req.language
    )
    result["source"] = "local_sales_engine"
    return result

@app.post("/api/summarize")
def summarize_conversation(req: SummarizeRequest):
    product = get_product_by_id(req.product_id)
    prod_name = product["name"] if product else "FlowPulse AI CRM"

    summary_result = summarizer.summarize(
        transcript=req.transcript,
        product_name=prod_name,
        language=req.language
    )
    return summary_result

@app.post("/api/calls/save")
async def save_call_record(
    call_data: str = Form(...),
    audio_file: Optional[UploadFile] = File(None)
):
    try:
        data = json.loads(call_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON data: {str(e)}")

    call_id = data.get("id") or str(uuid.uuid4())
    data["id"] = call_id

    # Handle recording file upload
    recording_filename = None
    if audio_file:
        file_ext = os.path.splitext(audio_file.filename)[1] if audio_file.filename else ".webm"
        if not file_ext:
            file_ext = ".webm"
        recording_filename = f"call_{call_id}{file_ext}"
        file_path = os.path.join(RECORDINGS_DIR, recording_filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(audio_file.file, buffer)
        data["recording_filename"] = recording_filename

    # If summary is not pre-computed, compute it
    if "sales_status" not in data or not data.get("sales_status"):
        prod_name = data.get("product_name", "FlowPulse AI CRM")
        summary_result = summarizer.summarize(
            transcript=data.get("transcript", []),
            product_name=prod_name,
            language=data.get("language", "en-US")
        )
        data.update(summary_result)

    saved_id = save_call(data)
    return {"status": "success", "id": saved_id, "recording_filename": recording_filename}

@app.get("/api/calls")
def list_calls():
    return get_calls()

@app.get("/api/calls/{call_id}")
def get_call(call_id: str):
    call = get_call_by_id(call_id)
    if not call:
        raise HTTPException(status_code=404, detail="Call record not found")
    return call

@app.delete("/api/calls/{call_id}")
def remove_call(call_id: str):
    call = get_call_by_id(call_id)
    if call and call.get("recording_filename"):
        file_path = os.path.join(RECORDINGS_DIR, call["recording_filename"])
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass
    success = delete_call(call_id)
    return {"status": "success" if success else "not_found"}

@app.get("/api/recordings/{filename}")
def stream_recording(filename: str):
    file_path = os.path.join(RECORDINGS_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Recording audio not found")
    media_type = "audio/wav" if filename.endswith(".wav") else "audio/webm"
    return FileResponse(
        file_path,
        media_type=media_type,
        headers={"Accept-Ranges": "bytes"}
    )

# Static mounting for production build if available
client_dist = os.path.join(os.path.dirname(__file__), "..", "client", "dist")
if os.path.exists(client_dist):
    app.mount("/", StaticFiles(directory=client_dist, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
