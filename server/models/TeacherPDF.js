const mongoose = require('mongoose');

const TeacherPDFSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  // ✅ Changed field name back to 'files' as requested
  files: {
    type: Buffer,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('TeacherPDF', TeacherPDFSchema);