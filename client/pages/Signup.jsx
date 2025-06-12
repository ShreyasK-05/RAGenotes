import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Select Role');
  const [role, setRole] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setRole(role);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/signup', {
        name, email, password, role,
      });

      if (response.status === 201) {
        alert('Signup successful!');
        navigate('/login');
      }
    } catch (error) {
      alert(`Signup failed: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="grid place-items-center min-h-screen bg-white">
      <div className="bg-white px-8 py-10 rounded-3xl border-2 border-blue-200 w-full max-w-md shadow-xl">
        <h5 className="text-2xl font-bold text-blue-700">Minutes of Meeting</h5>
        <p className="font-medium text-lg text-blue-500 mt-4">Please enter your details</p>

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="relative inline-block w-full" ref={dropdownRef}>
            <button
              type="button"
              onClick={toggleDropdown}
              className="w-full bg-blue-600 px-3 py-2 text-sm rounded-md text-white"
            >
              {selectedRole}
            </button>
            <div className={`${isOpen ? 'block' : 'hidden'} absolute text-black w-full mt-2 bg-white shadow-md rounded z-10`}>
              {['Teacher', 'Student'].map((r) => (
                <div key={r} className="px-4 py-2 hover:bg-blue-100 cursor-pointer" onClick={() => handleRoleSelect(r)}>
                  {r}
                </div>
              ))}
            </div>
          </div>

          <input className="w-full text-black mt-4 p-2 border rounded" type="text" placeholder="Name" onChange={e => setName(e.target.value)} />
          <input className="w-full text-black mt-2 p-2 border rounded" type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} />
          <input className="w-full text-black mt-2 p-2 border rounded" type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />

          <button type="submit" className="w-full mt-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">Sign Up</button>
        </form>

        <p className="text-blue-600 text-center mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-800 font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;

