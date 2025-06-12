import sys
import sounddevice as sd
import numpy as np
import whisper
import queue
import threading
import time
import torch
import requests

# --- Check for User ID Argument ---
if len(sys.argv) < 2:
    print("Error: Missing userId. Usage: python realtime_whisper.py <userId>")
    sys.exit(1)

user_id = sys.argv[1]

# --- Constants and Globals ---
MODEL_NAME = "small"
SAMPLE_RATE = 16000
CHUNK_SIZE = 1024
BUFFER_DURATION_S = 5
BUFFER_SIZE = BUFFER_DURATION_S * SAMPLE_RATE

audio_queue = queue.Queue()
stop_event = threading.Event()
final_text = ""

# ✅ Make the audio buffer global so the main thread can access it
audio_buffer = np.array([], dtype=np.float32)

# --- Model Loading ---
try:
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = whisper.load_model(MODEL_NAME, device=device)
    print(f"Whisper model '{MODEL_NAME}' loaded on {device}.")
except Exception as e:
    print(f"Error loading Whisper model: {e}")
    exit()

# --- Audio and Transcription Functions ---
def audio_callback(indata, frames, time_info, status):
    if status:
        print(f"Audio stream status: {status}", flush=True)
    audio_queue.put(indata.copy())

def transcribe_audio():
    global final_text, audio_buffer  # Declare that we're using the global variables

    while not stop_event.is_set():
        try:
            chunk = audio_queue.get(timeout=1)
            # Append new audio chunk to the global buffer
            audio_buffer = np.concatenate((audio_buffer, chunk.flatten()))

            # Transcribe if the buffer is full
            if len(audio_buffer) >= BUFFER_SIZE:
                audio_data = audio_buffer.astype(np.float32)
                result = model.transcribe(audio_data, fp16=(device=="cuda"), language="en")
                transcribed_text = result["text"].strip()

                if transcribed_text:
                    print(f"Transcription: {transcribed_text}", flush=True)
                    final_text += transcribed_text + " "

                # Clear the buffer after processing
                audio_buffer = np.array([], dtype=np.float32)

        except queue.Empty:
            continue
        except Exception as e:
            print(f"Error during transcription: {e}", flush=True)


# --- Main Execution ---
if __name__ == "__main__":
    transcription_thread = threading.Thread(target=transcribe_audio)
    transcription_thread.start()

    print("Recording started. Press Ctrl+C to stop.")

    try:
        with sd.InputStream(samplerate=SAMPLE_RATE, channels=1, dtype='float32',
                              blocksize=CHUNK_SIZE, callback=audio_callback):
            while not stop_event.is_set():
                time.sleep(0.5)

    except KeyboardInterrupt:
        print("\nStopping transcription process...")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
    finally:
        # Gracefully stop all threads and processes
        stop_event.set()
        transcription_thread.join()
        print("Transcription thread stopped.")

        # ✅ --- CRITICAL FIX ---
        # Process any leftover audio in the buffer after the recording loop has stopped.
        # This ensures the last few words spoken are captured.
        if audio_buffer.size > 0:
            print(f"Processing final {audio_buffer.size / SAMPLE_RATE:.2f} seconds of audio...")
            audio_data = audio_buffer.astype(np.float32)
            result = model.transcribe(audio_data, fp16=(device=="cuda"), language="en")
            transcribed_text = result["text"].strip()
            if transcribed_text:
                print(f"Final Transcription Snippet: {transcribed_text}", flush=True)
                final_text += transcribed_text + " "

        print("Final transcription complete.")

        # ✅ Send the complete transcript to the backend to summarize, convert to PDF, and store in MongoDB
        if final_text.strip():
            try:
                print("📤 Sending final transcript to the backend...")
                response = requests.post("http://localhost:5000/save-transcript", json={
                    "userId": user_id,
                    "text": final_text.strip()
                })
                if response.status_code == 200:
                    print("Transcript sent successfully to backend and saved as PDF in MongoDB.")
                else:
                    print(f"⚠️ Failed to send transcript. Status: {response.status_code} - {response.text}")
            except Exception as e:
                print(f"Error sending transcript request: {e}")
        else:
            print("No text was transcribed. Nothing to send to backend.")
