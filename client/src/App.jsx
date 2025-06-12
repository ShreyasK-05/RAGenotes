import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signup from '../pages/Signup';
import Login from '../pages/Login';
import TeacherDashboard from '../pages/TeacherDashboard';
import ShareFiles from '../pages/ShareFiles';
import MyPDFs from '../pages/MyPDFs';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/share-files" element={<ShareFiles />} />
        <Route path="/my-moms" element={<MyPDFs />} />
        {/* Fallback route to redirect unknown paths to Signup */}
        <Route path="*" element={<Navigate to="/signup" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
