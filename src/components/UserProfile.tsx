import React from 'react';
import { User } from '../types/game';
import { Crown, Shield, Users, Calendar, AlertTriangle, Coins } from 'lucide-react';

interface UserProfileProps {
  currentUser: User;
  users: User[];
}

function UserProfile({ currentUser, users }: UserProfileProps) {
  const joinDate = new Date(currentUser.joinDate).toLocaleDateString();
  const userRank = users
    .filter(u => u.ohis !== Infinity)
    .sort((a, b) => b.ohis - a.ohis)
    .findIndex(u => u.id === currentUser.id) + 1;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-black/30 backdrop-blur-md p-6 rounded-lg border border-blue-500/30">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-4xl font-bold text-white">
              {currentUser.username.charAt(0).toUpperCase()}
            </span>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{currentUser.fullName}</h1>
              {currentUser.role === 'founder' && (
                <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-1 rounded-full text-sm font-bold flex items-center">
                  <Crown className="h-4 w-4 mr-1" />
                  FOUNDER & CEO
                </span>
              )}
              {currentUser.role === 'admin' && (
                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                  <Shield className="h-4 w-4 mr-1" />
                  ADMIN
                </span>
              )}
            </div>
            <p className="text-gray-300 text-lg">@{currentUser.username}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="flex items-center text-gray-400">
                <Calendar className="h-4 w-4 mr-1" />
                Joined {joinDate}
              </span>
              {currentUser.ohis !== Infinity && (
                <span className="flex items-center text-gray-400">
                  <Users className="h-4 w-4 mr-1" />
                  Rank #{userRank}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-black/30 backdrop-blur-md p-6 rounded-lg border border-yellow-500/30">
          <div className="flex items-center justify-between mb-2">
            <Coins className="h-8 w-8 text-yellow-400" />
            <span className="text-2xl font-bold text-white">
              {currentUser.ohis === Infinity ? '∞' : currentUser.ohis.toLocaleString()}
            </span>
          </div>
          <p className="text-yellow-300 font-medium">Total OHIS</p>
          <p className="text-gray-400 text-sm mt-1">Game currency earned</p>
        </div>

        <div className="bg-black/30 backdrop-blur-md p-6 rounded-lg border border-red-500/30">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="h-8 w-8 text-red-400" />
            <span className="text-2xl font-bold text-white">{currentUser.warnings}</span>
          </div>
          <p className="text-red-300 font-medium">Warnings</p>
          <p className="text-gray-400 text-sm mt-1">Admin warnings received</p>
        </div>

        <div className="bg-black/30 backdrop-blur-md p-6 rounded-lg border border-green-500/30">
          <div className="flex items-center justify-between mb-2">
            <Shield className="h-8 w-8 text-green-400" />
            <span className="text-2xl font-bold text-white">{currentUser.health === Infinity ? '∞' : currentUser.health} HP</span>
          </div>
          <p className="text-green-300 font-medium">Health Points</p>
          <p className="text-gray-400 text-sm mt-1">Current health level</p>
        </div>

        <div className="bg-black/30 backdrop-blur-md p-6 rounded-lg border border-blue-500/30">
          <div className="flex items-center justify-between mb-2">
            <Shield className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">
              {currentUser.banned ? 'Banned' : 'Active'}
            </span>
          </div>
          <p className="text-blue-300 font-medium">Account Status</p>
          <p className="text-gray-400 text-sm mt-1">Current account state</p>
        </div>

        <div className="bg-black/30 backdrop-blur-md p-6 rounded-lg border border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <Crown className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold text-white capitalize">{currentUser.role}</span>
          </div>
          <p className="text-purple-300 font-medium">Role</p>
          <p className="text-gray-400 text-sm mt-1">Access level</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-black/30 backdrop-blur-md p-6 rounded-lg border border-gray-500/30">
        <h2 className="text-2xl font-bold text-white mb-4">Account Information</h2>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-700">
            <span className="text-gray-300">Username</span>
            <span className="text-white font-medium">{currentUser.username}</span>
          </div>
          
          <div className="flex justify-between items-center py-3 border-b border-gray-700">
            <span className="text-gray-300">Full Name</span>
            <span className="text-white font-medium">{currentUser.fullName}</span>
          </div>
          
          <div className="flex justify-between items-center py-3 border-b border-gray-700">
            <span className="text-gray-300">Role</span>
            <span className="text-white font-medium capitalize">{currentUser.role}</span>
          </div>
          
          <div className="flex justify-between items-center py-3 border-b border-gray-700">
            <span className="text-gray-300">Health Points</span>
            <span className="text-green-400 font-medium">
              {currentUser.health === Infinity ? '∞' : currentUser.health} HP
            </span>
          </div>
          
          <div className="flex justify-between items-center py-3 border-b border-gray-700">
            <span className="text-gray-300">Admin Privileges</span>
            <span className={`font-medium ${currentUser.isAdmin ? 'text-green-400' : 'text-red-400'}`}>
              {currentUser.isAdmin ? 'Yes' : 'No'}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-3 border-b border-gray-700">
            <span className="text-gray-300">Account Status</span>
            <span className={`font-medium ${currentUser.banned ? 'text-red-400' : 'text-green-400'}`}>
              {currentUser.banned ? 'Banned' : 'Active'}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-3">
            <span className="text-gray-300">Member Since</span>
            <span className="text-white font-medium">{joinDate}</span>
          </div>
        </div>
      </div>

      {/* Founder Special Section */}
      {currentUser.role === 'founder' && (
        <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 backdrop-blur-md p-6 rounded-lg border border-yellow-500/50">
          <h2 className="text-2xl font-bold text-yellow-300 mb-4 flex items-center">
            <Crown className="h-6 w-6 mr-2" />
            Founder & CEO Privileges
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/30 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Infinite OHIS</h3>
              <p className="text-gray-300 text-sm">Unlimited game currency for testing and rewards</p>
            </div>
            
            <div className="bg-black/30 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Full Admin Access</h3>
              <p className="text-gray-300 text-sm">Complete control over users, weapons, and game modes</p>
            </div>
            
            <div className="bg-black/30 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Ban & Warn Powers</h3>
              <p className="text-gray-300 text-sm">Ability to moderate and manage all users</p>
            </div>
            
            <div className="bg-black/30 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Content Creation</h3>
              <p className="text-gray-300 text-sm">Create and manage weapons, game modes, and features</p>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="bg-black/30 backdrop-blur-md p-6 rounded-lg border border-blue-500/30">
        <h2 className="text-2xl font-bold text-white mb-4">Top Players</h2>
        
        <div className="space-y-3">
          {users
            .filter(u => u.ohis !== Infinity)
            .sort((a, b) => b.ohis - a.ohis)
            .slice(0, 10)
            .map((user, index) => (
              <div 
                key={user.id} 
                className={`flex items-center justify-between p-3 rounded-lg ${
                  user.id === currentUser.id ? 'bg-blue-600/30 border border-blue-500/50' : 'bg-gray-800/30'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                  <div>
                    <p className="text-white font-medium">{user.username}</p>
                    <p className="text-gray-400 text-sm">{user.fullName}</p>
                  </div>
                </div>
                <span className="text-yellow-400 font-bold">
                  {user.ohis.toLocaleString()} OHIS
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;