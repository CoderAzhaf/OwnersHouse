import React, { useState, useEffect } from 'react';
import { User } from '../types/game';
import { Crown, Zap, Star, Check, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

interface MembershipStoreProps {
  user: User;
  onClose: () => void;
}

interface Membership {
  id: string;
  name: string;
  ohis_price: number;
  features: string[];
}

interface UserMembership {
  id: string;
  membership_id: string;
  status: string;
  expires_at: string;
}

const DEFAULT_MEMBERSHIPS: Membership[] = [
  {
    id: '1',
    name: 'House Plus',
    ohis_price: 500000000,
    features: ['Access to exclusive weapons', '2x OHIS earning rate', 'Priority support']
  },
  {
    id: '2',
    name: 'House Pro',
    ohis_price: 500000000000,
    features: ['All House Plus features', '5x OHIS earning rate', 'Custom profile themes', 'Early access to new features']
  },
  {
    id: '3',
    name: 'House MAX',
    ohis_price: 500000000000000,
    features: ['All House Pro features', '10x OHIS earning rate', 'Exclusive game modes', 'VIP badge', 'Direct line to admins']
  }
];

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

const formatOhis = (ohis: number): string => {
  if (ohis >= 1e15) {
    return `${(ohis / 1e15).toFixed(0)} Trillion`;
  } else if (ohis >= 1e12) {
    return `${(ohis / 1e12).toFixed(0)} Billion`;
  } else if (ohis >= 1e9) {
    return `${(ohis / 1e9).toFixed(0)} Million`;
  } else if (ohis >= 1e6) {
    return `${(ohis / 1e6).toFixed(1)}M`;
  }
  return ohis.toLocaleString();
};

export const MembershipStore: React.FC<MembershipStoreProps> = ({ user, onClose }) => {
  const [memberships, setMemberships] = useState<Membership[]>(DEFAULT_MEMBERSHIPS);
  const [userMembership, setUserMembership] = useState<UserMembership | null>(null);

  useEffect(() => {
    loadUserMembership();
  }, [user.id]);

  const loadUserMembership = async () => {
    try {
      const { data, error } = await supabase
        .from('user_memberships')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) {
        console.error('Error loading user membership:', error);
      }
      if (data) {
        setUserMembership(data);
      }
    } catch (error) {
      console.error('Error loading user membership:', error);
    }
  };

  const handleSubscribe = async (membershipId: string) => {
    const membership = memberships.find(m => m.id === membershipId);
    if (!membership) return;

    const userHasEnoughOhis = user.ohis === Infinity || (typeof user.ohis === 'number' && user.ohis >= membership.ohis_price);
    if (!userHasEnoughOhis) {
      alert(`You need ${formatOhis(membership.ohis_price)} OHIS to subscribe to ${membership.name}.`);
      return;
    }

    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    try {
      const realMembershipId = membershipId === '1' ? '6b9b3ebf-f6db-4e7c-94f4-2011d0e90f96' : membershipId === '2' ? '1a22072a-d21e-45ef-a8bc-761d885f06ec' : '02730941-634f-451a-8c87-8ac4ee856502';

      const { error } = await supabase
        .from('user_memberships')
        .insert({
          user_id: user.id,
          membership_id: realMembershipId,
          status: 'active',
          expires_at: expiresAt.toISOString()
        });

      if (error) throw error;

      await loadUserMembership();
      alert(`Successfully subscribed to ${membership.name}!`);
    } catch (error) {
      console.error('Error subscribing:', error);
      alert('Failed to subscribe. Please try again.');
    }
  };

  const handleCancelSubscription = async () => {
    if (!userMembership) return;

    try {
      const { error } = await supabase
        .from('user_memberships')
        .update({ status: 'cancelled' })
        .eq('id', userMembership.id);

      if (error) throw error;

      await loadUserMembership();
      alert('Subscription cancelled successfully.');
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Failed to cancel subscription.');
    }
  };

  const getMembershipIcon = (name: string) => {
    if (name.includes('Plus')) return Crown;
    if (name.includes('Pro')) return Zap;
    if (name.includes('MAX')) return Star;
    return Crown;
  };

  const getMembershipColor = (name: string) => {
    if (name.includes('Plus')) return 'blue';
    if (name.includes('Pro')) return 'purple';
    if (name.includes('MAX')) return 'yellow';
    return 'blue';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-gray-800 rounded-lg p-6 max-w-6xl w-full mx-4 my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white">Membership Plans</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-500/50 rounded-lg">
          <p className="text-yellow-300 font-semibold">
            Your OHIS: <span className="text-yellow-400">{user.ohis === Infinity ? '∞' : formatOhis(user.ohis as number)}</span>
          </p>
        </div>

        {userMembership && (
          <div className="mb-6 p-4 bg-green-900/30 border border-green-500/50 rounded-lg">
            <p className="text-green-400 font-semibold">
              Active Membership - Expires: {new Date(userMembership.expires_at).toLocaleDateString()}
            </p>
            <button
              onClick={handleCancelSubscription}
              className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
            >
              Cancel Subscription
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {memberships.map((membership) => {
            const Icon = getMembershipIcon(membership.name);
            const color = getMembershipColor(membership.name);
            const isSubscribed = userMembership?.membership_id === membership.id;
            const canAfford = user.ohis === Infinity || (typeof user.ohis === 'number' && user.ohis >= membership.ohis_price);

            return (
              <div
                key={membership.id}
                className={`bg-gray-700 rounded-lg p-6 border-2 ${
                  color === 'blue' ? 'border-blue-500/50' :
                  color === 'purple' ? 'border-purple-500/50' :
                  'border-yellow-500/50'
                } ${isSubscribed ? 'ring-2 ring-green-500' : ''}`}
              >
                <div className="flex items-center justify-center mb-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    color === 'blue' ? 'bg-blue-600' :
                    color === 'purple' ? 'bg-purple-600' :
                    'bg-yellow-600'
                  }`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white text-center mb-2">
                  {membership.name}
                </h3>

                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-white">
                    {formatOhis(membership.ohis_price)}
                  </div>
                  <p className="text-yellow-300 text-sm mt-1">OHIS</p>
                </div>

                <ul className="space-y-3 mb-6">
                  {membership.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(membership.id)}
                  disabled={isSubscribed || !canAfford}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    isSubscribed
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : !canAfford
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : color === 'blue'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : color === 'purple'
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  }`}
                >
                  {isSubscribed ? 'Current Plan' : !canAfford ? 'Insufficient OHIS' : 'Subscribe Now'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-8 p-4 bg-gray-700 rounded-lg">
          <p className="text-gray-300 text-sm text-center">
            All memberships grant 1 year of membership. Cancel anytime with no hidden fees.
          </p>
        </div>
      </div>
    </div>
  );
};
