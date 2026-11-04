const $ = (id) => document.getElementById(id);
const recordButton = $("recordButton");
const statusEl = $("status");
const hintEl = $("hint");
const transcriptEl = $("transcript");
const copyButton = $("copyButton");
const micOrb = $("micOrb");
const apiKeyInput = $("apiKey");
const saveKeyButton = $("saveKey");
let mediaRecorder = null;
let audioChunks = [];
let recording = false;
let stream = null;
let lastTranscript = "";

function setStatus(status, hint) {
  statusEl.textContent = status;
  hintEl.textContent = hint || "";
}
function setRecording(active) {
  recording = active;
  micOrb.classList.toggle("recording", active);
  recordButton.classList.toggle("stop", active);
  recordButton.textContent = active ? "Stop & transcribe" : "Start dictation";
}
async function startRecording() {
  if (recording) return;
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
    setStatus("Microphone unavailable", "This system does not support browser audio recording.");
    return;
  }
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks = [];
    const preferred = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find(type => MediaRecorder.isTypeSupported(type));
    mediaRecorder = new MediaRecorder(stream, preferred ? { mimeType: preferred } : undefined);
    mediaRecorder.ondataavailable = (event) => { if (event.data.size) audioChunks.push(event.data); };
    mediaRecorder.onstop = transcribeRecording;
    mediaRecorder.start();
    setRecording(true);
    setStatus("Listening…", "Speak clearly. Your audio is sent only when you stop.");
  } catch (error) {
    setStatus("Microphone permission needed", error.message || "Allow microphone access and try again.");
  }
}
async function stopRecording() {
  if (!recording || !mediaRecorder) return;
  setRecording(false);
  setStatus("Transcribing…", "Turning your recording into text.");
  mediaRecorder.stop();
  if (stream) stream.getTracks().forEach(track => track.stop());
  stream = null;
}
async function transcribeRecording() {
  try {
    const blob = new Blob(audioChunks, { type: mediaRecorder.mimeType || "audio/webm" });
    const bytes = await blob.arrayBuffer();
    const result = await window.visor.transcribe(bytes, blob.type);
    showTranscript(result.text);
    setStatus("Done — transcript pasted", "Your text is also on the clipboard.");
  } catch (error) {
    setStatus("Transcription failed", error.message || "Please try again.");
  }
}
function showTranscript(text) {
  lastTranscript = text;
  transcriptEl.textContent = text;
  transcriptEl.classList.remove("empty");
  copyButton.disabled = false;
}
recordButton.addEventListener("click", () => recording ? stopRecording() : startRecording());
copyButton.addEventListener("click", async () => {
  if (!lastTranscript) return;
  await navigator.clipboard.writeText(lastTranscript);
  copyButton.textContent = "Copied!";
  setTimeout(() => { copyButton.textContent = "Copy text"; }, 1200);
});
saveKeyButton.addEventListener("click", async () => {
  try {
    await window.visor.saveApiKey(apiKeyInput.value);
    apiKeyInput.value = "";
    $("keyState").textContent = "KEY SAVED";
    setStatus("API key saved", "You can start dictating now.");
  } catch (error) {
    setStatus("Could not save key", error.message);
  }
});
$("closeButton").addEventListener("click", () => window.visor.minimize());
window.visor.onShortcutToggle(() => recording ? stopRecording() : startRecording());
window.visor.onTranscriptionComplete(showTranscript);

(async () => {
  if (navigator.platform.toLowerCase().includes("mac")) $("shortcutLabel").textContent = "⌘";
  try {
    const key = await window.visor.getApiKey();
    $("keyState").textContent = key ? "KEY SAVED" : "API KEY NOT SET";
  } catch (_) {}
})();
