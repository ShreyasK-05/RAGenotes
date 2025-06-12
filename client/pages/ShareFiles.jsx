import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';

const ShareFiles = () => {
  const [pdfs, setPdfs] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const getToken = () => localStorage.getItem('token');

  // Fetch the teacher's own PDFs to populate the dropdown
  useEffect(() => {
    const fetchPdfs = async () => {
      const token = getToken();
      try {
        const response = await fetch('http://localhost:5000/my-pdfs', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch your PDFs.');
        const data = await response.json();
        setPdfs(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchPdfs();
  }, []);

  const handleShare = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!selectedPdf || !studentEmail) {
      setError('Please select a file and enter a student email.');
      return;
    }

    const token = getToken();
    try {
      const response = await fetch('http://localhost:5000/share-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ pdfId: selectedPdf, studentEmail })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Sharing failed.');
      setMessage(data.message);
      // Reset form
      setSelectedPdf('');
      setStudentEmail('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <MainLayout>
      <div className="p-6 bg-white rounded shadow-md w-full max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-blue-800">Share a File</h1>
        {error && <p className="text-red-500 bg-red-100 p-3 rounded">{error}</p>}
        {message && <p className="text-green-700 bg-green-100 p-3 rounded">{message}</p>}
        <form onSubmit={handleShare} className="space-y-4 mt-4">
          <div>
            <label htmlFor="pdf-select" className="block font-medium text-gray-700">Select a File to Share:</label>
            <select
              id="pdf-select"
              value={selectedPdf}
              onChange={(e) => setSelectedPdf(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
              required
            >
              <option value="" disabled>-- Select a PDF --</option>
              {pdfs.map(pdf => (
                <option key={pdf._id} value={pdf._id}>{pdf.fileName}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="student-email" className="block font-medium text-gray-700">Student's Email:</label>
            <input
              type="email"
              id="student-email"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
              placeholder="student@example.com"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Share File
          </button>
        </form>
      </div>
    </MainLayout>
  );
};

export default ShareFiles;