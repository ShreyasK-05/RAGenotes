const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { spawn } = require('child_process');

// --- Import Models and Middleware ---
const User = require('./models/User');
const TeacherPDF = require('./models/TeacherPDF');
const auth = require('./middleware/auth');
const transcriptRoute = require('./routes/transcript');

// --- App Initialization ---
const app = express();
app.use(cors());
app.use(express.json());

// --- Database Connection ---
mongoose.connect('mongodb://127.0.0.1:27017/meeting-app')
  .then(() => console.log("MongoDB connected successfully."))
  .catch(err => console.error("MongoDB connection error:", err));

// --- Globals for SSE and Python Process ---
let clients = [];
let pythonProcess = null;

// --- Server-Sent Events (SSE) Route for Live Transcript ---
app.get('/transcript-stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  clients.push(res);
  req.on('close', () => {
    clients = clients.filter(c => c !== res);
  });
});

// --- Auth Routes ---
app.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect password' });
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, 'secret_key');
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// --- Real-time Recording Routes ---
app.post('/start-recording', (req, res) => {
  if (pythonProcess) {
    return res.status(400).send('Already recording');
  }

  pythonProcess = spawn('python', ['realtime_whisper.py', '123']); // Replace '123' with userId if needed

  pythonProcess.stdout.on('data', (data) => {
    const message = data.toString().trim();
    if (message) {
      clients.forEach(client => client.write(`data: ${message}\n\n`));
    }
  });

  pythonProcess.stderr.on('data', (err) => {
    console.error('Python error:', err.toString());
  });

  pythonProcess.on('exit', () => {
    pythonProcess = null;
  });

  res.send('Recording started');
});

// Stop Whisper recording
app.post('/stop-recording', (req, res) => {
  if (pythonProcess) {
    pythonProcess.kill();
    pythonProcess = null;
    res.send('Recording stopped');
  } else {
    res.status(400).send('No active recording');
  }
});


// --- PDF Management Routes ---
app.get('/my-pdfs', auth, async (req, res) => {
  try {
    const pdfs = await TeacherPDF.find({ userId: req.user.id })
      .select('-files')
      .sort({ createdAt: -1 });
    res.json(pdfs);
  } catch (err) {
    res.status(500).json({ message: 'Server error while fetching PDFs' });
  }
});

app.get('/pdf/:id', auth, async (req, res) => {
  try {
    const pdf = await TeacherPDF.findById(req.params.id);
    if (!pdf) {
      return res.status(404).json({ message: 'PDF not found' });
    }
    if (pdf.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${pdf.fileName}"`);
    res.send(pdf.files);
  } catch (err) {
    console.error("Error fetching PDF:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/share-file', auth, async (req, res) => {
  const { studentEmail, pdfId } = req.body;
  const teacherId = req.user.id;
  try {
    const student = await User.findOne({ email: studentEmail, role: 'student' });
    if (!student) {
      return res.status(404).json({ message: 'Student not found with that email' });
    }
    const originalPdf = await TeacherPDF.findOne({ _id: pdfId, userId: teacherId });
    if (!originalPdf) {
      return res.status(404).json({ message: 'PDF not found or you do not own it' });
    }
    const newSharedPdf = new TeacherPDF({
      userId: student._id,
      summary: originalPdf.summary,
      fileName: originalPdf.fileName,
      files: originalPdf.files,
    });
    await newSharedPdf.save();
    res.json({ message: `File shared successfully with ${student.name}` });
  } catch (err) {
    res.status(500).json({ message: 'Error sharing file' });
  }
});

// --- Transcript Saving Route ---
app.use('/', transcriptRoute);

// --- Start Server ---
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});