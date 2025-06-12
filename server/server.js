const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt =require('jsonwebtoken');
const { spawn } = require('child_process');

const User = require('./models/User');
const TeacherPDF = require('./models/TeacherPDF');
const auth = require('./middleware/auth'); // Import auth middleware
const transcriptRoute = require('./routes/transcript');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/meeting-app');

let pythonProcess;

// Signup Route (Unchanged)
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

// Login Route (Updated to add more user info to token)
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect password' });

    // Sign token with user ID, email, and role for easier access on the frontend/backend
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, 'secret_key');
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ Use the 'auth' middleware to protect this route
app.post('/start-recording', auth, (req, res) => {
  // ✅ Get the user's ID from the decoded token (attached by the auth middleware)
  const userId = req.user.id;
  if (!userId) {
    return res.status(400).json({ message: "User ID not found in token." });
  }

  // ✅ Pass the userId to the Python script as a command-line argument
  pythonProcess = spawn('python', ['realtime_whisper.py', userId]);

  pythonProcess.stdout.on('data', (data) => console.log(`${data.toString()}`));
  pythonProcess.stderr.on('data', (data) => console.error(`Python Error: ${data.toString()}`));
  pythonProcess.on('close', (code) => console.log(`Python process exited with code ${code}`));

  res.send('🎙️ Recording started...');
});

// Stop Recording Route (Unchanged)
app.post('/stop-recording', (req, res) => {
  if (pythonProcess) {
    pythonProcess.kill('SIGINT');
    pythonProcess = null;
    res.send('Recording stopped');
  } else {
    res.status(400).send('No active recording');
  }
});

// --- New PDF Management Routes ---

// 1. Get all PDFs for the logged-in user
app.get('/my-pdfs', auth, async (req, res) => {
  try {
    const pdfs = await TeacherPDF.find({ userId: req.user.id })
      .select('-files') // Exclude the large file buffer data
      .sort({ createdAt: -1 }); // Show newest first
    res.json(pdfs);
  } catch (err) {
    res.status(500).json({ message: 'Server error while fetching PDFs' });
  }
});

// 2. Get a specific PDF to view/download
app.get('/pdf/:id', auth, async (req, res) => {
    try {
        const pdf = await TeacherPDF.findById(req.params.id);

        if (!pdf) {
             return res.status(404).json({ message: 'PDF not found' });
        }
        
        // A simple authorization check (expand as needed for shared files)
        if (pdf.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${pdf.fileName}"`);
        res.send(pdf.files); // ✅ Send the correct field 'files'
    } catch (err) {
        console.error("Error fetching PDF:", err);
        res.status(500).json({ message: 'Server error' });
    }
});


// 3. Share a PDF with a student
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

    // Create a new PDF document for the student
    const newSharedPdf = new TeacherPDF({
      userId: student._id,
      summary: originalPdf.summary,
      fileName: originalPdf.fileName,
      files: originalPdf.files, // ✅ Copy the correct field
    });

    await newSharedPdf.save();
    res.json({ message: `File shared successfully with ${student.name}` });
  } catch (err) {
    res.status(500).json({ message: 'Error sharing file' });
  }
});

app.use('/', transcriptRoute); // Use the transcript saving route

app.listen(5000, () => console.log('Server running on http://localhost:5000'));