import React, { useState } from 'react';
import { User } from '../types/game';
import { Shield, UserPlus, LogIn } from 'lucide-react';

interface AuthSystemProps {
  users: User[];
  onLogin: (user: User) => void;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

function AuthSystem({ users, onLogin, setUsers }: AuthSystemProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      // Login
     console.log('Attempting login with:', formData.username, formData.password);
     console.log('Available users:', users.map(u => ({ username: u.username, password: u.password })));
     
      const user = users.find(u => 
        u.username === formData.username && u.password === formData.password
      );
      
     console.log('Found user:', user);
     
      if (!user) {
        setError('Invalid username or password');
        return;
      }
      
      if (user.banned) {
        setError('Your account has been banned');
        return;
      }
      
      onLogin(user);
    } else {
      // Register
      if (!formData.username || !formData.password || !formData.fullName) {
        setError('All fields are required');
        return;
      }
      
      if (users.some(u => u.username === formData.username)) {
        setError('Username already exists');
        return;
      }
      
      const newUser: User = {
        id: Date.now().toString(),
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName,
        role: 'player',
        ohis: 1000,
        health: 100,
        isAdmin: false,
        joinDate: new Date().toISOString(),
        banned: false,
        warnings: 0,
        weapons: []
      };
      
      setUsers(prev => [...prev, newUser]);
      onLogin(newUser);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
      <div className="bg-black/50 backdrop-blur-md p-8 rounded-2xl border border-blue-500/30 w-full max-w-md">
        <div className="text-center mb-8">
          <Shield className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Owner's House
          </h1>
          <p className="text-gray-300 mt-2">Sneak, Slide, Survive</p>
        </div>

        <div className="flex mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 px-4 rounded-l-lg transition-all ${
              isLogin ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'
            }`}
          >
            <LogIn className="h-4 w-4 inline mr-2" />
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 px-4 rounded-r-lg transition-all ${
              !isLogin ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'
            }`}
          >
            <UserPlus className="h-4 w-4 inline mr-2" />
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter your password"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="Enter your full name"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-600/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all font-medium"
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Welcome to Owner's House - The ultimate stealth playground game
          </p>
          <div className="mt-4 p-3 bg-blue-600/20 border border-blue-500/30 rounded-lg">
            <p className="text-blue-300 text-xs font-medium mb-1">Demo Accounts:</p>
            <p className="text-gray-300 text-xs">Player: demo / demo123</p>
            <p className="text-gray-300 text-xs">Admin access available after registration</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthSystem;