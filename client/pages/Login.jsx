import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/login', {
        email, password,
      });

      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      alert('Login successful!');
      if (user.role === 'Teacher') {
        navigate('/teacher-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (error) {
      alert(`Login failed: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="grid place-items-center min-h-screen bg-white">
      <div className="bg-white px-6 py-10 rounded-3xl border-2 border-blue-200 w-full max-w-md shadow-xl">
        <h5 className="text-2xl font-bold text-blue-700">Welcome Back</h5>
        <p className="text-lg text-blue-500 mt-4">Please enter your details</p>

        <form className="mt-3" onSubmit={handleLogin}>
          <input
            className="w-full p-2 mt-2 border rounded text-black"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full text-black p-2 mt-2 border rounded"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="w-full mt-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">Log In</button>
        </form>

        <p className="text-sm text-blue-600 mt-4">
          Don’t have an account?{' '}
          <Link to="/signup" className="text-blue-800 font-semibold">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
