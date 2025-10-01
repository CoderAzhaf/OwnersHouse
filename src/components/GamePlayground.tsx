import React, { useState, useEffect, useCallback } from 'react';
import { User, GameState, Player } from '../types/game';
import { Shield, Zap, Eye, Users, Target, Coins } from 'lucide-react';

interface GamePlaygroundProps {
  currentUser: User;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  updateUserOhis: (userId: string, amount: number) => void;
  updateUserHealth: (userId: string, amount: number) => void;
}

function GamePlayground({ currentUser, gameState, setGameState, updateUserOhis, updateUserHealth }: GamePlaygroundProps) {
  const [playerPosition, setPlayerPosition] = useState({ x: 10, y: 90 });
  const [isJailed, setIsJailed] = useState(false);
  const [lastSlideTime, setLastSlideTime] = useState(0);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [selectedWeapon, setSelectedWeapon] = useState<string | null>(null);

  const addNotification = (message: string) => {
    setNotifications(prev => [...prev, message]);
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 3000);
  };

  const handleSlide = useCallback(() => {
    const now = Date.now();
    if (now - lastSlideTime < 1000) return; // Cooldown
    
    setLastSlideTime(now);
    updateUserOhis(currentUser.id, 5000);
    addNotification('+5,000 OHIS for sliding!');
    
    // Move player forward
    setPlayerPosition(prev => ({
      ...prev,
      x: Math.min(prev.x + 10, 90)
    }));
  }, [lastSlideTime, currentUser.id, updateUserOhis]);

  const handleMovement = useCallback((direction: string) => {
    if (isJailed) return;
    
    setPlayerPosition(prev => {
      let newX = prev.x;
      let newY = prev.y;
      
      switch (direction) {
        case 'up':
          newY = Math.max(prev.y - 5, 5);
          break;
        case 'down':
          newY = Math.min(prev.y + 5, 95);
          break;
        case 'left':
          newX = Math.max(prev.x - 5, 5);
          break;
        case 'right':
          newX = Math.min(prev.x + 5, 95);
          break;
      }
      
      return { x: newX, y: newY };
    });
  }, [isJailed]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          handleMovement('up');
          break;
        case 's':
        case 'arrowdown':
          handleMovement('down');
          break;
        case 'a':
        case 'arrowleft':
          handleMovement('left');
          break;
        case 'd':
        case 'arrowright':
          handleMovement('right');
          break;
        case ' ':
          e.preventDefault();
          handleSlide();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleMovement, handleSlide]);

  // Guard movement logic
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        guardPosition: {
          x: 50 + Math.sin(Date.now() / 2000) * 30,
          y: 50 + Math.cos(Date.now() / 3000) * 20
        }
      }));
    }, 100);

    return () => clearInterval(interval);
  }, [setGameState]);

  // Check for guard collision
  useEffect(() => {
    const guardDistance = Math.sqrt(
      Math.pow(playerPosition.x - gameState.guardPosition.x, 2) +
      Math.pow(playerPosition.y - gameState.guardPosition.y, 2)
    );
    
    if (guardDistance < 8 && !isJailed && !selectedWeapon) {
      setIsJailed(true);
      addNotification('You\'ve been caught! You\'re in jail!');
    }
  }, [playerPosition, gameState.guardPosition, isJailed, selectedWeapon]);

  const escapeJail = () => {
    setIsJailed(false);
    setPlayerPosition({ x: 10, y: 90 });
    addNotification('You\'ve been rescued from jail!');
  };

  const useWeapon = (weapon: string) => {
    setSelectedWeapon(weapon);
    addNotification(`Using ${weapon}!`);
    
    // Find the weapon data to get its damage value
    const weaponData = gameState.weapons.find(w => w.name === weapon);
    if (weaponData && weaponData.damage > 0) {
      // Damage the guard based on weapon damage
      setGameState(prev => ({
        ...prev,
        guardHealth: Math.max(0, prev.guardHealth - weaponData.damage)
      }));
      addNotification(`Guard took ${weaponData.damage} damage!`);
    }
    
    setTimeout(() => {
      setSelectedWeapon(null);
    }, 5000);
  };

  // Guard health regeneration
  useEffect(() => {
    // Check if guard was defeated and reward player
    if (gameState.guardHealth === 0) {
      updateUserOhis(currentUser.id, 100000000); // 100 Million OHIS
      addNotification('🎉 GUARD DEFEATED! +100,000,000 OHIS REWARD!');
      
      // Reset guard health after rewarding
      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          guardHealth: prev.maxGuardHealth
        }));
        addNotification('Guard has respawned!');
      }, 3000);
      
      return; // Don't regenerate health if guard is defeated
    }
    
    const interval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        guardHealth: Math.min(prev.maxGuardHealth, prev.guardHealth + 1)
      }));
    }, 2000); // Regenerate 1 HP every 2 seconds

    return () => clearInterval(interval);
  }, [setGameState, gameState.guardHealth, currentUser.id, updateUserOhis]);

  const handlePurchaseWeapon = (weaponId: string) => {
    const weapon = gameState.weapons.find(w => w.id === weaponId);
    if (!weapon || currentUser.ohis < weapon.price || currentUser.weapons.includes(weaponId)) {
      return;
    }
    
    const updatedUser = {
      ...currentUser,
      ohis: currentUser.ohis - weapon.price,
      weapons: [...currentUser.weapons, weaponId]
    };
    
    updateUserOhis(currentUser.id, -weapon.price);
  };

  return (
    <div className="space-y-6">
      {/* Game Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-black/30 backdrop-blur-md p-4 rounded-lg border border-blue-500/30">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-400" />
            <span className="text-white font-medium">Players Online</span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">1</p>
        </div>
        
        <div className="bg-black/30 backdrop-blur-md p-4 rounded-lg border border-green-500/30">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-green-400" />
            <span className="text-white font-medium">Game Mode</span>
          </div>
          <p className="text-xl font-bold text-white mt-2">{gameState.currentMode}</p>
        </div>
        
        <div className="bg-black/30 backdrop-blur-md p-4 rounded-lg border border-red-500/30">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-red-400" />
            <span className="text-white font-medium">Player Status</span>
          </div>
          <p className="text-xl font-bold text-white mt-2">{isJailed ? 'Jailed' : 'Active'}</p>
        </div>
        
        <div className="bg-black/30 backdrop-blur-md p-4 rounded-lg border border-orange-500/30">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-orange-400" />
            <span className="text-white font-medium">Guard Health</span>
          </div>
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xl font-bold text-white">{gameState.guardHealth}/{gameState.maxGuardHealth}</span>
              <span className="text-sm text-gray-400">
                {Math.round((gameState.guardHealth / gameState.maxGuardHealth) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(gameState.guardHealth / gameState.maxGuardHealth) * 100}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className="bg-black/30 backdrop-blur-md p-4 rounded-lg border border-yellow-500/30">
          <div className="flex items-center space-x-2">
            <Coins className="h-5 w-5 text-yellow-400" />
            <span className="text-white font-medium">OHIS</span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            {currentUser.ohis === Infinity ? '∞' : currentUser.ohis.toLocaleString()}
          </p>
        </div>
        
        <div className="bg-black/30 backdrop-blur-md p-4 rounded-lg border border-green-500/30">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-400" />
            <span className="text-white font-medium">Your Health</span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            {currentUser.health === Infinity ? '∞' : currentUser.health} HP
          </p>
        </div>
      </div>

      {/* Game Area */}
      <div className="bg-black/30 backdrop-blur-md rounded-lg border border-blue-500/30 p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Owner's House Playground</h2>
        
        <div className="relative w-full h-96 bg-gradient-to-br from-green-900/50 to-green-700/50 rounded-lg border-2 border-green-500/50 overflow-hidden">
          {/* Entrances */}
          <div className="absolute top-0 left-1/4 w-8 h-4 bg-blue-500 rounded-b-lg">
            <span className="text-xs text-white absolute -top-6 left-0 w-8 text-center">Entry 1</span>
          </div>
          <div className="absolute top-0 right-1/4 w-8 h-4 bg-blue-500 rounded-b-lg">
            <span className="text-xs text-white absolute -top-6 left-0 w-8 text-center">Entry 2</span>
          </div>
          <div className="absolute bottom-0 left-1/4 w-8 h-4 bg-blue-500 rounded-t-lg">
            <span className="text-xs text-white absolute -bottom-6 left-0 w-8 text-center">Entry 3</span>
          </div>
          <div className="absolute bottom-0 right-1/4 w-8 h-4 bg-blue-500 rounded-t-lg">
            <span className="text-xs text-white absolute -bottom-6 left-0 w-8 text-center">Entry 4</span>
          </div>
          
          {/* Guard */}
          <div 
            className={`absolute w-8 h-8 rounded-full border-2 transition-all duration-100 ease-linear ${
              gameState.guardHealth > 50 ? 'bg-red-600 border-red-400' :
              gameState.guardHealth > 25 ? 'bg-orange-600 border-orange-400' :
              'bg-yellow-600 border-yellow-400'
            }`}
            style={{ 
              left: `${gameState.guardPosition.x}%`, 
              top: `${gameState.guardPosition.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <Shield className="h-4 w-4 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            {/* Guard health bar */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-700 rounded">
              <div 
                className="h-1 bg-red-500 rounded transition-all duration-300"
                style={{ width: `${(gameState.guardHealth / gameState.maxGuardHealth) * 100}%` }}
              />
            </div>
          </div>
          
          {/* Player */}
          {!isJailed && (
            <div 
              className={`absolute w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                selectedWeapon === 'Invisibility Cloak' 
                  ? 'bg-blue-400/50 border-blue-300/50' 
                  : 'bg-blue-600 border-blue-400'
              }`}
              style={{ 
                left: `${playerPosition.x}%`, 
                top: `${playerPosition.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {selectedWeapon === 'Speed Boost' && (
                <Zap className="h-3 w-3 text-yellow-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              )}
            </div>
          )}
          
          {/* Jail */}
          <div className="absolute top-4 right-4 w-16 h-16 bg-gray-800 border-2 border-gray-600 rounded">
            <span className="text-xs text-white absolute -top-6 left-0 w-16 text-center">Jail</span>
            {isJailed && (
              <div className="w-4 h-4 bg-blue-600 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            )}
          </div>
        </div>
      </div>

      {/* Controls and Weapons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="bg-black/30 backdrop-blur-md p-6 rounded-lg border border-blue-500/30">
          <h3 className="text-xl font-bold text-white mb-4">Controls</h3>
          <div className="space-y-2 text-sm text-gray-300">
            <p><span className="font-semibold text-white">WASD / Arrow Keys:</span> Move</p>
            <p><span className="font-semibold text-white">Space:</span> Slide (5,000 OHIS)</p>
            <p><span className="font-semibold text-white">Goal:</span> Avoid the guard and slide as much as possible!</p>
          </div>
          
          {isJailed && (
            <button
              onClick={escapeJail}
              className="mt-4 w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Escape Jail (Rescued)
            </button>
          )}
        </div>

        {/* Weapons */}
        <div className="bg-black/30 backdrop-blur-md p-6 rounded-lg border border-purple-500/30">
          <h3 className="text-xl font-bold text-white mb-4">Weapons & Power-ups</h3>
          <div className="space-y-2">
            {gameState.weapons.map((weapon) => (
              <button
                key={weapon.id}
                onClick={() => useWeapon(weapon.name)}
                disabled={selectedWeapon === weapon.name || !currentUser.weapons?.includes(weapon.id)}
                className={`w-full p-3 rounded-lg text-left transition-all ${
                  selectedWeapon === weapon.name
                    ? 'bg-purple-600 text-white'
                    : currentUser.weapons?.includes(weapon.id)
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white'
                    : 'bg-gray-900 text-gray-500 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {weapon.icon === 'shield' && <Shield className="h-4 w-4" />}
                  {weapon.icon === 'zap' && <Zap className="h-4 w-4" />}
                  {weapon.icon === 'eye' && <Eye className="h-4 w-4" />}
                  <div>
                    <div className="flex items-center justify-between">
                      <span>{weapon.name}</span>
                      {weapon.damage > 0 && (
                        <span className="text-red-400 text-sm ml-2">-{weapon.damage} HP</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{weapon.description}</p>
                    {!currentUser.weapons?.includes(weapon.id) && (
                      <span className="block text-xs text-red-400">Not owned - Visit Weapon Store</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {notifications.map((notification, index) => (
          <div
            key={index}
            className="bg-green-600/90 backdrop-blur-md text-white px-4 py-2 rounded-lg border border-green-500/50 animate-slide-in-right"
          >
            {notification}
          </div>
        ))}
      </div>
    </div>
  );
}

export default GamePlayground;