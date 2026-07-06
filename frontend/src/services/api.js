/**
 * API service — communicates with the FastAPI backend.
 */
import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000, // 60s for AI processing
});

/**
 * Upload an image for emergency analysis.
 */
export async function analyzeEmergency(file, language = 'en') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);
  const { data } = await api.post('/emergency/analyze', formData);
  return data;
}

/**
 * Upload a medicine image for explanation.
 */
export async function explainMedicine(file, language = 'en') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);
  const { data } = await api.post('/medicine/explain', formData);
  return data;
}

/**
 * Upload a medical report for summarization.
 */
export async function summarizeReport(file, language = 'en') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);
  const { data } = await api.post('/reports/summarize', formData);
  return data;
}

/**
 * Find nearby hospitals.
 */
export async function findHospitals(lat, lng, radius = 5000) {
  const { data } = await api.get('/hospitals/nearby', {
    params: { lat, lng, radius },
  });
  return data;
}

/**
 * Generate an SOS message.
 */
export async function generateSOS(situation, latitude, longitude, language = 'en') {
  const { data } = await api.post('/sos/generate', {
    situation,
    latitude,
    longitude,
    language,
  });
  return data;
}

/**
 * Send a voice chat message.
 */
export async function voiceChat(message, language = 'en') {
  const { data } = await api.post('/sos/voice-chat', {
    message,
    language,
  });
  return data;
}

export default api;
