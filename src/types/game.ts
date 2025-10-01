export interface User {
  id: string;
  username: string;
  password: string;
  fullName: string;
  role: 'founder' | 'admin' | 'player';
  ohis: number;
  health: number;
  isAdmin: boolean;
  joinDate: string;
  banned: boolean;
  banExpiry?: string;
  warnings: number;
  weapons?: string[];
}

export interface Weapon {
  id: string;
  name: string;
  description: string;
  price: number;
  damage: number;
  range: number;
  icon: string;
}

export interface Player {
  id: string;
  username: string;
  position: { x: number; y: number };
  isJailed: boolean;
  hasWeapon?: string;
  isInvisible?: boolean;
  speedBoost?: boolean;
}

export interface GameState {
  players: Player[];
  jailedPlayers: Player[];
  guardPosition: { x: number; y: number };
  guardHealth: number;
  maxGuardHealth: number;
  weapons: Weapon[];
  gameModes: string[];
  currentMode: string;
}

export interface AdminAction {
  type: 'ban' | 'warn' | 'give_ohis' | 'remove_ohis' | 'make_admin' | 'remove_admin';
  targetUserId: string;
  amount?: number;
  duration?: string;
  reason?: string;
}