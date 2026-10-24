const API_BASE = '/api';

export async function fetchProducts() {
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function sendChatMessage(message, history, productId, language) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      history,
      product_id: productId,
      language
    })
  });
  if (!res.ok) throw new Error('Failed to send chat message');
  return res.json();
}

export async function generateSummary(transcript, productId, language) {
  const res = await fetch(`${API_BASE}/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transcript,
      product_id: productId,
      language
    })
  });
  if (!res.ok) throw new Error('Failed to generate summary');
  return res.json();
}

export async function saveCallRecord(callData, audioBlob) {
  const formData = new FormData();
  formData.append('call_data', JSON.stringify(callData));
  if (audioBlob) {
    formData.append('audio_file', audioBlob, `recording_${Date.now()}.webm`);
  }

  const res = await fetch(`${API_BASE}/calls/save`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error('Failed to save call record');
  return res.json();
}

export async function fetchCalls() {
  const res = await fetch(`${API_BASE}/calls`);
  if (!res.ok) throw new Error('Failed to fetch calls');
  return res.json();
}

export async function fetchCallById(id) {
  const res = await fetch(`${API_BASE}/calls/${id}`);
  if (!res.ok) throw new Error('Failed to fetch call details');
  return res.json();
}

export async function deleteCall(id) {
  const res = await fetch(`${API_BASE}/calls/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete call');
  return res.json();
}
