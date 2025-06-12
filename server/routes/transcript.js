const express = require('express');
const router = express.Router();
const TeacherPDF = require('../models/TeacherPDF');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

router.post('/save-transcript', async (req, res) => {
  const { userId, text } = req.body;
  if (!userId || !text) {
    return res.status(400).json({ message: 'User ID and text are required.' });
  }

  try {
    // Create new PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const fontSize = 12;
    const lineHeight = 16;
    const maxLineWidth = width - 100;
    const lines = wrapText(text, font, fontSize, maxLineWidth);

    let y = height - 50;

    for (let line of lines) {
      if (y < 50) {
        // Add a new page if needed
        const newPage = pdfDoc.addPage();
        y = height - 50;
      }
      page.drawText(line, {
        x: 50,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
      y -= lineHeight;
    }

    const pdfBytes = await pdfDoc.save();

    const newDoc = new TeacherPDF({
      userId,
      summary: text.slice(0, 200),
      fileName: `Transcript_${new Date().toISOString().split('T')[0]}.pdf`,
      files: Buffer.from(pdfBytes),
    });

    await newDoc.save();
    console.log(`✅ PDF saved for userId: ${userId}`);
    res.json({ message: '✅ Transcript saved as PDF in MongoDB' });
  } catch (err) {
    console.error("❌ Error saving transcript:", err);
    res.status(500).json({ message: 'Failed to save PDF transcript' });
  }
});

function wrapText(text, font, fontSize, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';

  for (let word of words) {
    const testLine = line + word + ' ';
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);

    if (testWidth > maxWidth) {
      lines.push(line.trim());
      line = word + ' ';
    } else {
      line = testLine;
    }
  }
  if (line.trim() !== '') {
    lines.push(line.trim());
  }
  return lines;
}

module.exports = router;
