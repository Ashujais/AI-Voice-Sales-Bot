import os
import httpx
import json
from typing import List, Dict, Any, Optional

class LLMClient:
    def __init__(self):
        self.openrouter_key = os.environ.get("OPENROUTER_API_KEY", "")
        self.gemini_key = os.environ.get("GEMINI_API_KEY", "")
        self.openai_key = os.environ.get("OPENAI_API_KEY", "")

    def is_configured(self) -> bool:
        return bool(self.openrouter_key or self.gemini_key or self.openai_key)

    async def generate_sales_reply(self, customer_message: str, history: List[Dict[str, str]], product: Dict[str, Any], language: str) -> Optional[str]:
        """
        Attempts to call OpenRouter / OpenAI / Gemini if configured.
        Returns None if not configured or on failure, so caller falls back to SalesEngine.
        """
        if not self.is_configured():
            return None

        system_prompt = f"""
You are an expert, empathetic, highly persuasive AI Voice Sales Executive selling '{product.get('name', 'FlowPulse AI CRM')}'.
Product details:
- Tagline: {product.get('tagline', '')}
- Description: {product.get('description', '')}
- Target: {product.get('target_audience', '')}
- Pricing: {product.get('pricing_tiers', '')}
- Features: {product.get('key_features', '')}
- Objections: {product.get('common_objections', '')}

Rules:
1. Speak concisely in natural spoken language (maximum 2 to 3 sentences per response) because this is a real-time voice call.
2. Be warm, confident, and consultative. Never sound like a robotic script.
3. Answer the customer's question directly, validate their concern, and smoothly bridge to a call-to-action (booking a quick demo, starting a 14-day free trial, or answering another question).
4. Language instruction: Respond in {language}. If English, speak fluent conversational English. If Hindi, speak polite Hindi. If Telugu, speak polite Telugu.
"""

        messages = [{"role": "system", "content": system_prompt}]
        for turn in history[-6:]:
            role = "assistant" if turn.get("speaker") == "bot" else "user"
            messages.append({"role": role, "content": turn.get("text", "")})
        messages.append({"role": "user", "content": customer_message})

        try:
            if self.openrouter_key:
                async with httpx.AsyncClient(timeout=6.0) as client:
                    resp = await client.post(
                        "https://openrouter.ai/api/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {self.openrouter_key}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "model": "google/gemini-2.0-flash-exp:free",
                            "messages": messages,
                            "max_tokens": 120,
                            "temperature": 0.7
                        }
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        reply = data["choices"][0]["message"]["content"].strip()
                        if reply:
                            return reply
        except Exception:
            pass

        return None
