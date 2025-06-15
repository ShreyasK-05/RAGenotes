import React, { useState } from 'react';
import MainLayout from '../components/MainLayout';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import LiveTranscriptBox from '../components/LiveTranscriptBox';

const TeacherDashboard = () => {
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const getToken = () => localStorage.getItem('token');

  const startRecording = async () => {
    const token = getToken();
    if (!token) {
      alert('You must be logged in to start a recording.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/start-recording', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const eventSource = new EventSource('http://localhost:5000/transcript-stream');
      eventSource.onmessage = (e) => {
        setTranscript((prev) => prev + e.data + ' ');
      };
      eventSource.onerror = () => eventSource.close();

      setIsRecording(true);
      alert(await response.text());
    } catch (err) {
      alert('Error starting recording.');
    }
  };

  const stopRecording = async () => {
    try {
      const response = await fetch('http://localhost:5000/stop-recording', {
        method: 'POST',
      });
      alert(await response.text());
      setIsRecording(false);
    } catch (err) {
      alert('Error stopping recording.');
    }
  };

  const handleDownloadPdf = () => {
  if (!transcript || transcript.trim() === '') {
    alert('No transcript available to generate PDF.');
    return;
  }

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt', // points, easier for text positioning
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 40;
  const maxLineWidth = pageWidth - margin * 2;
  const lineHeight = 14;

  // Split transcript text into lines that fit the page width
  const lines = pdf.splitTextToSize(transcript, maxLineWidth);

  let cursorY = margin;

  // Add lines to PDF page, adding new pages as needed
  for (let i = 0; i < lines.length; i++) {
    if (cursorY + lineHeight > pageHeight - margin) {
      pdf.addPage();
      cursorY = margin;
    }
    pdf.text(lines[i], margin, cursorY);
    cursorY += lineHeight;
  }

  pdf.save('transcript.pdf');
};


  return (
    <MainLayout>
      <div className="p-6 bg-white rounded shadow-md w-full max-w-3xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4 text-blue-800">Start Class Recording</h1>
        <button
          onClick={startRecording}
          className="bg-green-500 text-white px-4 py-2 rounded mr-4 hover:bg-green-600"
          disabled={isRecording}
        >
          Start Recording
        </button>
        <button
          onClick={stopRecording}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          disabled={!isRecording}
        >
          Stop Recording
        </button>

        <div id="transcript-box">
          <LiveTranscriptBox text={transcript} />
        </div>

        <div className="mt-6">
          <button
            onClick={handleDownloadPdf}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Download PDF
          </button>

        </div>
      </div>
    </MainLayout>
  );
};

export default TeacherDashboard;
