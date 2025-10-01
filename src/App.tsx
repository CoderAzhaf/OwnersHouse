import React, { useState, useEffect } from 'react';
import { Shield, Users, Settings, Coins, Swords, Timer, AlertTriangle } from 'lucide-react';
import AuthSystem from './components/AuthSystem';
import GamePlayground from './components/GamePlayground';
import AdminPanel from './components/AdminPanel';
import UserProfile from './components/UserProfile';
import { WeaponStore } from './components/WeaponStore';
import { User, GameState } from './types/game';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    jailedPlayers: [],
    guardPosition: { x: 50, y: 50 },
    guardHealth: 100,
    maxGuardHealth: 100,
    weapons: [
      {
        id: 'smoke-bomb',
        name: 'Smoke Bomb',
        description: 'Creates a smoke screen to hide from guards',
        price: 10000,
        damage: 15,
        range: 5,
        icon: 'shield'
      },
      {
        id: 'speed-boost',
        name: 'Speed Boost',
        description: 'Increases movement speed for 10 seconds',
        price: 15000,
        damage: 10,
        range: 0,
        icon: 'zap'
      },
      {
        id: 'invisibility-cloak',
        name: 'Invisibility Cloak',
        description: 'Become invisible to guards for 5 seconds',
        price: 25000,
        damage: 30,
        range: 0,
        icon: 'shield'
      }
    ],
    gameModes: ['Classic', 'Speed Run', 'Team Battle'],
    currentMode: 'Classic'
  });
  
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      username: 'Mohammed Azhafuddin',
      password: 'qBAO5214',
      fullName: 'Mohammed Azhafuddin',
      role: 'founder',
      ohis: Infinity,
      health: Infinity,
      isAdmin: true,
      joinDate: new Date().toISOString(),
      banned: false,
      warnings: 0,
      weapons: []
    },
    {
      id: '2',
      username: 'demo',
      password: 'demo123',
      fullName: 'Demo Player',
      role: 'player',
      ohis: 5000,
      health: 100,
      isAdmin: false,
      joinDate: new Date().toISOString(),
      banned: false,
      warnings: 0,
      weapons: []
    }
  ]);

  const [currentView, setCurrentView] = useState<'game' | 'admin' | 'profile' | 'store'>('game');

  // Load user data from localStorage on component mount
  useEffect(() => {
    const savedUsers = localStorage.getItem('ownersHouseUsers');
    const savedGameState = localStorage.getItem('ownersHouseGameState');
    
    if (savedUsers) {
      try {
        const parsedUsers = JSON.parse(savedUsers);
        // Ensure all users have required properties
        const validatedUsers = parsedUsers.map((user: any) => ({
          ...user,
          weapons: user.weapons || []
        }));
        setUsers(validatedUsers);
      } catch (error) {
        console.error('Error loading saved users:', error);
      }
    }
    
    if (savedGameState) {
      try {
        const parsedGameState = JSON.parse(savedGameState);
        setGameState(prev => ({
          ...prev,
          ...parsedGameState,
          guardPosition: prev.guardPosition, // Keep current guard position
          guardHealth: prev.guardHealth // Keep current guard health
        }));
      } catch (error) {
        console.error('Error loading saved game state:', error);
      }
    }
  }, []);

  // Save users to localStorage whenever users state changes
  useEffect(() => {
    localStorage.setItem('ownersHouseUsers', JSON.stringify(users));
  }, [users]);

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('ownersHouseGameState', JSON.stringify(gameState));
  }, [gameState]);
  const handleLogin = (user: User) => {
    // Find the most up-to-date user data
    const currentUserData = users.find(u => u.id === user.id);
    if (currentUserData) {
      // Ensure the user has all required properties
      const validatedUser = {
        ...currentUserData,
        weapons: currentUserData.weapons || []
      };
      setCurrentUser(validatedUser);
    } else {
      // Fallback to the passed user if not found in users array
      const validatedUser = {
        ...user,
        weapons: user.weapons || []
      };
      setCurrentUser(validatedUser);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('game');
  };

  const updateUserOhis = (userId: string, amount: number) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, ohis: user.ohis === Infinity ? Infinity : user.ohis + amount }
        : user
    ));
    
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => prev ? 
        { ...prev, ohis: prev.ohis === Infinity ? Infinity : prev.ohis + amount }
        : null
      );
    }
  };

  const updateUserHealth = (userId: string, amount: number) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, health: user.health === Infinity ? Infinity : Math.max(0, user.health + amount) }
        : user
    ));
    
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => prev ? 
        { ...prev, health: prev.health === Infinity ? Infinity : Math.max(0, prev.health + amount) }
        : null
      );
    }
  };

  const handlePurchaseWeapon = (weaponId: string) => {
    const weapon = gameState.weapons.find(w => w.id === weaponId);
    if (!weapon || !currentUser || currentUser.ohis < weapon.price || currentUser.weapons?.includes(weaponId)) {
      return;
    }
    
    updateUserOhis(currentUser.id, -weapon.price);
    
    setUsers(prev => prev.map(user => 
      user.id === currentUser.id 
        ? { ...user, weapons: [...(user.weapons || []), weaponId] }
        : user
    ));
    
    setCurrentUser(prev => prev ? 
      { ...prev, weapons: [...(prev.weapons || []), weaponId] }
      : null
    );
  };

  if (!currentUser) {
    return <AuthSystem users={users} onLogin={handleLogin} setUsers={setUsers} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-md border-b border-blue-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-blue-400" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Owner's House
              </h1>
            </div>
            
            <nav className="flex items-center space-x-6">
              <button
                onClick={() => setCurrentView('game')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  currentView === 'game' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                Game
              </button>
              
              <button
                onClick={() => setCurrentView('store')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  currentView === 'store' ? 'bg-green-600 text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                <Swords className="h-4 w-4 inline mr-2" />
                Weapon Store
              </button>
              
              {currentUser.isAdmin && (
                <button
                  onClick={() => setCurrentView('admin')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    currentView === 'admin' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Settings className="h-4 w-4 inline mr-2" />
                  Admin
                </button>
              )}
              
              <button
                onClick={() => setCurrentView('profile')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  currentView === 'profile' ? 'bg-green-600 text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                Profile
              </button>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-yellow-600/20 px-3 py-1 rounded-lg">
                <Coins className="h-4 w-4 text-yellow-400" />
                <span className="text-yellow-300 font-semibold">
                  {currentUser.ohis === Infinity ? '∞' : currentUser.ohis.toLocaleString()} OHIS
                </span>
              </div>
              
              <div className="flex items-center space-x-2 bg-red-600/20 px-3 py-1 rounded-lg">
                <Shield className="h-4 w-4 text-red-400" />
                <span className="text-red-300 font-semibold">
                  {currentUser.health === Infinity ? '∞' : currentUser.health} HP
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {currentUser.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-white font-medium">{currentUser.username}</span>
                {currentUser.role === 'founder' && (
                  <span className="bg-gradient-to-r from-gold-400 to-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
                    FOUNDER
                  </span>
                )}
              </div>
              
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'game' && (
          <GamePlayground 
            currentUser={currentUser}
            gameState={gameState}
            setGameState={setGameState}
            updateUserOhis={updateUserOhis}
            updateUserHealth={updateUserHealth}
          />
        )}
        
        {currentView === 'admin' && currentUser.isAdmin && (
          <AdminPanel 
            users={users}
            setUsers={setUsers}
            currentUser={currentUser}
            gameState={gameState}
            setGameState={setGameState}
            updateUserHealth={updateUserHealth}
          />
        )}
        
        {currentView === 'profile' && (
          <UserProfile 
            currentUser={currentUser}
            users={users}
          />
        )}
        
        {currentView === 'store' && (
          <WeaponStore 
            user={currentUser}
            weapons={gameState.weapons}
            onPurchase={handlePurchaseWeapon}
            onClose={() => setCurrentView('game')}
          />
        )}
      </main>
    </div>
  );
}

export default App;