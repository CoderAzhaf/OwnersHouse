import React from 'react';
import { User, Weapon } from '../types/game';
import { Sword, Zap, Shield, Target, X } from 'lucide-react';

interface WeaponStoreProps {
  user: User;
  weapons: Weapon[];
  onPurchase: (weaponId: string) => void;
  onClose: () => void;
}

const weaponIcons = {
  sword: Sword,
  zap: Zap,
  shield: Shield,
  target: Target,
};

export const WeaponStore: React.FC<WeaponStoreProps> = ({ user, weapons, onPurchase, onClose }) => {
  const availableWeapons = weapons.filter(weapon => !user.weapons.includes(weapon.id));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Weapon Store</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4 p-4 bg-gray-700 rounded-lg">
          <p className="text-white text-lg">Your OHIS: <span className="text-yellow-400 font-bold">{user.ohis.toLocaleString()}</span></p>
        </div>

        {availableWeapons.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-lg">You own all available weapons!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableWeapons.map((weapon) => {
              const IconComponent = weaponIcons[weapon.icon as keyof typeof weaponIcons] || Sword;
              const canAfford = user.ohis >= weapon.price;

              return (
                <div key={weapon.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{weapon.name}</h3>
                      <p className="text-yellow-400 font-bold">{weapon.price.toLocaleString()} OHIS</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-3">{weapon.description}</p>
                  
                  <div className="mb-4">
                    <p className="text-gray-400 text-xs">Damage: <span className="text-red-400">{weapon.damage}</span></p>
                    <p className="text-gray-400 text-xs">Range: <span className="text-blue-400">{weapon.range}</span></p>
                  </div>

                  <button
                    onClick={() => onPurchase(weapon.id)}
                    disabled={!canAfford}
                    className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                      canAfford
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? 'Purchase' : 'Insufficient OHIS'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-700 rounded-lg">
          <h3 className="text-white font-semibold mb-2">Your Weapons:</h3>
          {user.weapons.length === 0 ? (
            <p className="text-gray-400">No weapons owned</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {user.weapons.map((weaponId) => {
                const weapon = weapons.find(w => w.id === weaponId);
                if (!weapon) return null;
                const IconComponent = weaponIcons[weapon.icon as keyof typeof weaponIcons] || Sword;
                
                return (
                  <div key={weaponId} className="flex items-center bg-gray-600 rounded-lg px-3 py-1">
                    <IconComponent className="w-4 h-4 text-white mr-2" />
                    <span className="text-white text-sm">{weapon.name}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};