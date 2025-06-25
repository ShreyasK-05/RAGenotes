
#  RAGenotes – AI-Powered Teacher-Student Platform for Sharing & Exploring Summarized Notes

**RAGenotes** is an intelligent teacher-student collaboration platform built using the MERN stack. It revolutionizes the way teachers share knowledge and students interact with study materials by leveraging AI technologies like **Whisper AI**, **LangChain**, and **RAG (Retrieval-Augmented Generation)** to convert voice into summarized documents and allow natural language querying over them.

---

##  Project Overview

RAGenotes transforms traditional teaching workflows with:
-  Voice-to-text conversion (real-time recording)
-  Summarized PDF generation using Whisper AI
- ‍ Teacher-side note sharing
- ‍ Student-side document upload & chatbot-based querying
-  Context-aware Q&A over custom documents using RAG

---

##  Features

###  Voice-Driven Summarization (Teacher)
- Real-time voice transcription using Whisper AI.
- Automatic note generation as summarized PDFs.
- Easy document management for teachers.

###  Share Notes with Students
- Teachers can share notes with individual students via email.
- Students receive exact copies of the original files.
- Role-based authorization ensures access control.

###  Upload + Ask (RAG Chatbot)
- Upload PDF or TXT study documents.
- Chunks and stores the document using LangChain & Chroma.
- Ask questions over the uploaded content using GPT-3.5 or GPT-4.
- Instant response with context-aware answers.

###  Secure Authentication
- Signup/Login with role-based access: `Teacher` or `Student`.
- Secure password hashing with bcrypt.
- JWT token-based route protection.

###  Real-Time Transcripts (Teacher Dashboard)
- Server-Sent Events (SSE) stream live transcription data to frontend.
- Python backend using `subprocess` spawns Whisper process.

###  Document Management (Teacher)
- Upload and manage PDFs.
- Share files directly with students.
- Files are stored and versioned with metadata.

---
##  Tech Stack

### Frontend
- **React.js** (Tailwind CSS, Context API)
- **Recorder & Transcript UIs**
- **File Sharing Dashboard**
- **RAG Chatbot UI**

### Backend (Node.js & Python)
- **Node.js** with Express for User/Auth/File routes
- **FastAPI** for RAG-based backend
- **MongoDB** via Mongoose
- **LangChain**, **ChromaDB**, **OpenAI (Whisper, GPT)**
- **Python subprocess** to run Whisper

---

##  Architecture

```txt
Client (React)
│
├── Voice Recorder (Whisper)
│   └── SSE Stream
│
├── File Upload & Chatbot (RAG)
│   └── FastAPI Server
│
├── Auth + File Share
│   └── Node.js Server
│
└── MongoDB (Users, PDFs)
````

---

##  How to Run

###  Node Backend (Auth + Upload)

```bash
cd server
npm install
node server.js
# Runs on http://localhost:5000
```

###  FastAPI RAG Backend

```bash
cd server
uvicorn rag_backend.main:app --reload --port 5000
# Ensure uploaded_docs and vector_db folders exist
```

###  React Frontend

```bash
cd client
npm install
npm run dev
# Runs on http://localhost:5173
```

---

##  RAG Chatbot Usage

### Upload File:

* Click "Upload Document" in chatbot UI.
* Supports `.pdf` and `.txt`.

### Ask Questions:

* Type natural language questions related to the uploaded document.
* Chatbot responds using LangChain's RetrievalQA.

---

##  Folder Structure

```
RAGenotes/
├── client/                   # React frontend
├── server/
│   ├── server.js             # Node backend
│   ├── rag_backend/
│   │   ├── main.py           # FastAPI app
│   │   ├── rag.py            # PDF/text loading & vector store
│   │   ├── ask.py            # Question answering logic
│   │   └── utils.py          # Helper utilities
│   ├── uploaded_docs/        # Uploaded files
│   └── vector_db/            # ChromaDB persistent store
```

---

##  Future Features

* Multiple file support per student
* Chat history with context window
* Session-based document mapping
* Support for Ollama/GPT4All embeddings
* File deletion and versioning
* Time-based live classroom transcription

---

##  Security

* Role-based document access
* JWT-based authentication
* File sanitization & access checks
* Secure MongoDB handling

---

## Credits

* Whisper AI – OpenAI
* LangChain – Retrieval and Embedding
* ChromaDB – Vector Store
* MERN Stack
* OpenRouteService (future integration for location-aware routing)

---

##  Contact

For collaboration or questions, reach out to:
 \[[shreyas2310140@ssn.edu.in](mailto:your-email@example.com)]

