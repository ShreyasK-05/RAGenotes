import React, { useState } from 'react';
import axios from 'axios';

export default function UploadAudio() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return setMessage("Please select a file.");
    const formData = new FormData();
    formData.append('audio', file);

    try {
      const res = await axios.post('http://localhost:5000/upload-audio', formData);
      setMessage(res.data.message);
    } catch (err) {
      console.error(err);
      setMessage("Upload failed.");
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="bg-white p-10 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">Upload Lecture Audio</h2>
        <input type="file" accept="audio/*" onChange={handleChange} className="mb-4 w-full" />
        <button onClick={handleUpload} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">
          Upload File
        </button>
        {message && <p className="mt-4 text-center text-blue-600">{message}</p>}
      </div>
    </div>
  );
}
