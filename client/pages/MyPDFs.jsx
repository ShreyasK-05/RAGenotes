import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import { Eye } from 'lucide-react';

const MyPDFs = () => {
  const [pdfs, setPdfs] = useState([]);
  const [error, setError] = useState('');

  const getToken = () => localStorage.getItem('token');

  useEffect(() => {
    const fetchPdfs = async () => {
      const token = getToken();
      if (!token) {
        setError('You are not logged in.');
        return;
      }
      try {
        const response = await fetch('http://localhost:5000/my-pdfs', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch PDFs.');
        const data = await response.json();
        setPdfs(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchPdfs();
  }, []);

  const viewPdf = (pdfId) => {
    const token = getToken();
    // Open the PDF in a new tab by constructing the URL
    window.open(`http://localhost:5000/pdf/${pdfId}?token=${token}`, '_blank');
  };


  return (
    <MainLayout>
      <div className="p-6 bg-white rounded shadow-md w-full max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-blue-800">My Generated PDFs</h1>
        {error && <p className="text-red-500">{error}</p>}
        <div className="space-y-3">
          {pdfs.length > 0 ? (
            pdfs.map((pdf) => (
              <div key={pdf._id} className="flex justify-between items-center p-3 border rounded">
                <span>{pdf.fileName}</span>
                <button
                  onClick={() => window.open(`http://localhost:5000/pdf/${pdf._id}`, '_blank')}
                  className="p-2 rounded hover:bg-blue-100"
                  title="View PDF"
                >
                  <Eye size={20} className="text-blue-600" />
                </button>
              </div>
            ))
          ) : (
            <p>You have not generated any PDFs yet.</p>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default MyPDFs;