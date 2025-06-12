import React from 'react';
import MainLayout from '../components/MainLayout';

const TeacherDashboard = () => {
  // Function to get the token from localStorage
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
                // ✅ Send the token for authentication
                'Authorization': `Bearer ${token}`
            }
        });
        const message = await response.text();
        alert(message);
    } catch (err) {
        alert('Error starting recording.');
    }
  };

  const stopRecording = async () => {
    try {
        const response = await fetch('http://localhost:5000/stop-recording', { method: 'POST' });
        const message = await response.text();
        alert(message);
    } catch (err) {
        alert('Error stopping recording.');
    }
  };

  return (
    <MainLayout>
      <div className="p-6 bg-white rounded shadow-md w-full max-w-xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4 text-blue-800">Start Class Recording</h1>
        <button
          onClick={startRecording}
          className="bg-green-500 text-white px-4 py-2 rounded mr-4 hover:bg-green-600"
        >
          Start Recording
        </button>
        <button
          onClick={stopRecording}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Stop Recording
        </button>
      </div>
    </MainLayout>
  );
};

export default TeacherDashboard;