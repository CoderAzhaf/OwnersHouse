import React, { useState } from 'react';
import { User, GameState } from '../types/game';
import { Shield, UserX, AlertTriangle, Coins, Crown, Swords, Settings, Plus, Trash2 } from 'lucide-react';

interface AdminPanelProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  currentUser: User;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  updateUserHealth: (userId: string, amount: number) => void;
}

function AdminPanel({ users, setUsers, currentUser, gameState, setGameState, updateUserHealth }: AdminPanelProps) {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [actionAmount, setActionAmount] = useState<number>(0);
  const [banDuration, setBanDuration] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [newWeapon, setNewWeapon] = useState({
    name: '',
    description: '',
    price: 0,
    damage: 0,
    range: 0,
    icon: 'sword'
  });
  const [newGameMode, setNewGameMode] = useState<string>('');
  const [notification, setNotification] = useState<string>('');

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleBanUser = () => {
    if (!selectedUser) return;
    
    setUsers(prev => prev.map(user => 
      user.id === selectedUser 
        ? { 
            ...user, 
            banned: true, 
            banExpiry: banDuration ? new Date(Date.now() + parseInt(banDuration) * 24 * 60 * 60 * 1000).toISOString() : undefined
          }
        : user
    ));
    
    showNotification(`User banned ${banDuration ? `for ${banDuration} days` : 'permanently'}`);
  };

  const handleWarnUser = () => {
    if (!selectedUser) return;
    
    setUsers(prev => prev.map(user => 
      user.id === selectedUser 
        ? { ...user, warnings: user.warnings + 1 }
        : user
    ));
    
    showNotification('User warned successfully');
  };

  const handleGiveOhis = () => {
    if (!selectedUser || actionAmount <= 0) return;
    
    setUsers(prev => prev.map(user => 
      user.id === selectedUser 
        ? { ...user, ohis: user.ohis === Infinity ? Infinity : user.ohis + actionAmount }
        : user
    ));
    
    showNotification(`Gave ${actionAmount.toLocaleString()} OHIS to user`);
  };

  const handleRemoveOhis = () => {
    if (!selectedUser || actionAmount <= 0) return;
    
    setUsers(prev => prev.map(user => 
      user.id === selectedUser 
        ? { ...user, ohis: user.ohis === Infinity ? Infinity : Math.max(0, user.ohis - actionAmount) }
        : user
    ));
    
    showNotification(`Removed ${actionAmount.toLocaleString()} OHIS from user`);
  };

  const handleGiveHealth = () => {
    if (!selectedUser || actionAmount <= 0) return;
    
    updateUserHealth(selectedUser, actionAmount);
    showNotification(`Gave ${actionAmount} health to user`);
  };

  const handleRemoveHealth = () => {
    if (!selectedUser || actionAmount <= 0) return;
    
    updateUserHealth(selectedUser, -actionAmount);
    showNotification(`Removed ${actionAmount} health from user`);
  };

  const handleResetGuardHealth = () => {
    setGameState(prev => ({
      ...prev,
      guardHealth: prev.maxGuardHealth
    }));
    showNotification('Guard health reset to full');
  };

  const handleToggleAdmin = () => {
    if (!selectedUser) return;
    
    setUsers(prev => prev.map(user => 
      user.id === selectedUser 
        ? { ...user, isAdmin: !user.isAdmin, role: user.isAdmin ? 'player' : 'admin' }
        : user
    ));
    
    showNotification('Admin status toggled');
  };

  const handleUnbanUser = () => {
    if (!selectedUser) return;
    
    setUsers(prev => prev.map(user => 
      user.id === selectedUser 
        ? { ...user, banned: false, banExpiry: undefined }
        : user
    ));
    
    showNotification('User unbanned successfully');
  };

  const handleAddWeapon = () => {
    if (!newWeapon.name.trim() || newWeapon.price <= 0) return;
    
    const weaponToAdd = {
      id: Date.now().toString(),
      name: newWeapon.name,
      description: newWeapon.description,
      price: newWeapon.price,
      damage: newWeapon.damage,
      range: newWeapon.range,
      icon: newWeapon.icon
    };
    
    setGameState(prev => ({
      ...prev,
      weapons: [...prev.weapons, weaponToAdd]
    }));
    
    setNewWeapon({
      name: '',
      description: '',
      price: 0,
      damage: 0,
      range: 0,
      icon: 'sword'
    });
    showNotification('Weapon added successfully');
  };

  const handleRemoveWeapon = (weaponId: string) => {
    setGameState(prev => ({
      ...prev,
      weapons: prev.weapons.filter(w => w.id !== weaponId)
    }));
    
    showNotification('Weapon removed successfully');
  };

  const handleAddGameMode = () => {
    if (!newGameMode.trim()) return;
    
    setGameState(prev => ({
      ...prev,
      gameModes: [...prev.gameModes, newGameMode.trim()]
    }));
    
    setNewGameMode('');
    showNotification('Game mode added successfully');
  };

  const handleRemoveGameMode = (mode: string) => {
    setGameState(prev => ({
      ...prev,
      gameModes: prev.gameModes.filter(m => m !== mode)
    }));
    
    showNotification('Game mode removed successfully');
  };

  const selectedUserData = users.find(u => u.id === selectedUser);

  return (
    <div className="space-y-6">
      <div className="bg-black/30 backdrop-blur-md p-6 rounded-lg border border-purple-500/30">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Control Panel</h1>
        <p className="text-purple-300">Manage users, weapons, and game modes</p>
      </div>

      {/* User Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-black/30 backdrop-blur-md p-6 rounded-lg border border-blue-500/30">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <Shield className="h-6 w-6 mr-2" />
            User Management
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select User
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Select a user...</option>
                {users.filter(u => u.id !== currentUser.id && u.role !== 'founder').map(user => (
                  <option key={user.id} value={user.id}>
                    {user.username} ({user.role})
                  </option>
                ))}
              </select>
            </div>

            {selectedUserData && (
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <h3 className="font-semibold text-white mb-2">User Info</h3>
                <p className="text-gray-300 text-sm">Full Name: {selectedUserData.fullName}</p>
                <p className="text-gray-300 text-sm">OHIS: {selectedUserData.ohis === Infinity ? '∞' : selectedUserData.ohis.toLocaleString()}</p>
                <p className="text-gray-300 text-sm">Health: {selectedUserData.health === Infinity ? '∞' : selectedUserData.health} HP</p>
                {currentUser.role === 'founder' && (
                  <p className="text-gray-300 text-sm">Password: {selectedUserData.password}</p>
                )}
                <p className="text-gray-300 text-sm">Warnings: {selectedUserData.warnings}</p>
                <p className="text-gray-300 text-sm">Status: {selectedUserData.banned ? 'Banned' : 'Active'}</p>
                <p className="text-gray-300 text-sm">Admin: {selectedUserData.isAdmin ? 'Yes' : 'No'}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleBanUser}
                disabled={!selectedUser}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center"
              >
                <UserX className="h-4 w-4 mr-1" />
                Ban
              </button>
              
              <button
                onClick={handleUnbanUser}
                disabled={!selectedUser}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Unban
              </button>
              
              <button
                onClick={handleWarnUser}
                disabled={!selectedUser}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center"
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                Warn
              </button>
              
              <button
                onClick={handleToggleAdmin}
                disabled={!selectedUser}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center"
              >
                <Crown className="h-4 w-4 mr-1" />
                Admin
              </button>
            </div>
          </div>
        </div>

        {/* OHIS Management */}
        <div className="bg-black/30 backdrop-blur-md p-6 rounded-lg border border-yellow-500/30">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <Coins className="h-6 w-6 mr-2" />
            OHIS & Health Management
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
              <input
                type="number"
                value={actionAmount}
                onChange={(e) => setActionAmount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                placeholder="Enter amount..."
              />
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <h3 className="col-span-2 text-white font-medium mb-2">OHIS Actions</h3>
              <button
                onClick={handleGiveOhis}
                disabled={!selectedUser || actionAmount <= 0}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Give OHIS
              </button>
              
              <button
                onClick={handleRemoveOhis}
                disabled={!selectedUser || actionAmount <= 0}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Remove OHIS
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              <h3 className="col-span-2 text-white font-medium mb-2">Health Actions</h3>
              <button
                onClick={handleGiveHealth}
                disabled={!selectedUser || actionAmount <= 0}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Give Health
              </button>
              
              <button
                onClick={handleRemoveHealth}
                disabled={!selectedUser || actionAmount <= 0}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Remove Health
              </button>
            </div>
            
            <div className="border-t border-gray-600 pt-4">
              <h3 className="text-white font-medium mb-2">Guard Management</h3>
              <div className="bg-gray-800/50 p-3 rounded-lg mb-2">
                <p className="text-gray-300 text-sm">Guard Health: {gameState.guardHealth}/{gameState.maxGuardHealth}</p>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(gameState.guardHealth / gameState.maxGuardHealth) * 100}%` }}
                  />
                </div>
              </div>
              <button
                onClick={handleResetGuardHealth}
                className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                Reset Guard Health
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ban Duration (days)
              </label>
              <input
                type="number"
                value={banDuration}
                onChange={(e) => setBanDuration(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                placeholder="Leave empty for permanent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Reason
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                rows={3}
                placeholder="Optional reason..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Game Content Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weapons Management */}
        <div className="bg-black/30 backdrop-blur-md p-6 rounded-lg border border-red-500/30">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <Swords className="h-6 w-6 mr-2" />
            Weapons Management
          </h2>
          
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Weapon Name</label>
                <input
                  type="text"
                  value={newWeapon.name}
                  onChange={(e) => setNewWeapon({...newWeapon, name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                  placeholder="Weapon name..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <input
                  type="text"
                  value={newWeapon.description}
                  onChange={(e) => setNewWeapon({...newWeapon, description: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                  placeholder="Weapon description..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Price (OHIS)</label>
                  <input
                    type="number"
                    value={newWeapon.price}
                    onChange={(e) => setNewWeapon({...newWeapon, price: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                    placeholder="Price..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Damage</label>
                  <input
                    type="number"
                    value={newWeapon.damage}
                    onChange={(e) => setNewWeapon({...newWeapon, damage: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                    placeholder="Damage..."
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Range</label>
                  <input
                    type="number"
                    value={newWeapon.range}
                    onChange={(e) => setNewWeapon({...newWeapon, range: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                    placeholder="Range..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Icon</label>
                  <select
                    value={newWeapon.icon}
                    onChange={(e) => setNewWeapon({...newWeapon, icon: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="sword">Sword</option>
                    <option value="zap">Lightning</option>
                    <option value="shield">Shield</option>
                    <option value="target">Target</option>
                  </select>
                </div>
              </div>
              
              <button
                onClick={handleAddWeapon}
                disabled={!newWeapon.name.trim() || newWeapon.price <= 0}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Weapon
              </button>
            </div>

            <div className="space-y-2">
              {gameState.weapons.map((weapon) => (
                <div key={weapon.id} className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg">
                  <div>
                    <span className="text-white font-medium">{weapon.name}</span>
                    <p className="text-gray-400 text-sm">{weapon.price.toLocaleString()} OHIS | Damage: {weapon.damage} | Range: {weapon.range}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveWeapon(weapon.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Game Modes Management */}
        <div className="bg-black/30 backdrop-blur-md p-6 rounded-lg border border-green-500/30">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <Settings className="h-6 w-6 mr-2" />
            Game Modes
          </h2>
          
          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newGameMode}
                onChange={(e) => setNewGameMode(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                placeholder="New game mode..."
              />
              <button
                onClick={handleAddGameMode}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              {gameState.gameModes.map((mode) => (
                <div key={mode} className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-white">{mode}</span>
                    {mode === gameState.currentMode && (
                      <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">Active</span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setGameState(prev => ({ ...prev, currentMode: mode }))}
                      className="text-green-400 hover:text-green-300 transition-colors text-sm"
                    >
                      Set Active
                    </button>
                    <button
                      onClick={() => handleRemoveGameMode(mode)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-black/30 backdrop-blur-md p-6 rounded-lg border border-gray-500/30">
        <h2 className="text-2xl font-bold text-white mb-4">All Users</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-4 py-2 text-gray-300">Username</th>
                <th className="px-4 py-2 text-gray-300">Full Name</th>
                <th className="px-4 py-2 text-gray-300">Role</th>
                <th className="px-4 py-2 text-gray-300">OHIS</th>
                <th className="px-4 py-2 text-gray-300">Health</th>
                <th className="px-4 py-2 text-gray-300">Status</th>
                <th className="px-4 py-2 text-gray-300">Warnings</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-gray-700">
                  <td className="px-4 py-2 text-white">{user.username}</td>
                  <td className="px-4 py-2 text-gray-300">{user.fullName}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.role === 'founder' ? 'bg-gold-600 text-black' :
                      user.role === 'admin' ? 'bg-purple-600 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-yellow-400">
                    {user.ohis === Infinity ? '∞' : user.ohis.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-green-400">
                    {user.health === Infinity ? '∞' : user.health} HP
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.banned ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                    }`}>
                      {user.banned ? 'BANNED' : 'ACTIVE'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-300">{user.warnings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 bg-green-600/90 backdrop-blur-md text-white px-6 py-3 rounded-lg border border-green-500/50 z-50">
          {notification}
        </div>
      )}
    </div>
  );
}

export default AdminPanel;