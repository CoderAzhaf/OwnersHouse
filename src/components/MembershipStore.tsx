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
  monthly_price: number;
  yearly_price: number;
  features: string[];
}

interface UserMembership {
  id: string;
  membership_id: string;
  billing_cycle: 'monthly' | 'yearly';
  status: string;
  expires_at: string;
}

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

export const MembershipStore: React.FC<MembershipStoreProps> = ({ user, onClose }) => {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [userMembership, setUserMembership] = useState<UserMembership | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCycle, setSelectedCycle] = useState<{ [key: string]: 'monthly' | 'yearly' }>({});

  useEffect(() => {
    loadMemberships();
    loadUserMembership();
  }, []);

  const loadMemberships = async () => {
    try {
      const { data, error } = await supabase
        .from('memberships')
        .select('*')
        .order('monthly_price', { ascending: true });

      if (error) throw error;
      if (data) {
        setMemberships(data);
        const cycles: { [key: string]: 'monthly' | 'yearly' } = {};
        data.forEach((m: Membership) => {
          cycles[m.id] = 'monthly';
        });
        setSelectedCycle(cycles);
      }
    } catch (error) {
      console.error('Error loading memberships:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserMembership = async () => {
    try {
      const { data, error } = await supabase
        .from('user_memberships')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setUserMembership(data);
      }
    } catch (error) {
      console.error('Error loading user membership:', error);
    }
  };

  const handleSubscribe = async (membershipId: string) => {
    const cycle = selectedCycle[membershipId];
    const membership = memberships.find(m => m.id === membershipId);
    if (!membership) return;

    const expiresAt = new Date();
    if (cycle === 'monthly') {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    try {
      const { error } = await supabase
        .from('user_memberships')
        .insert({
          user_id: user.id,
          membership_id: membershipId,
          billing_cycle: cycle,
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

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-8">
          <p className="text-white">Loading memberships...</p>
        </div>
      </div>
    );
  }

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
            const cycle = selectedCycle[membership.id] || 'monthly';
            const price = cycle === 'monthly' ? membership.monthly_price : membership.yearly_price;
            const isSubscribed = userMembership?.membership_id === membership.id;

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
                  <div className="flex justify-center space-x-2 mb-2">
                    <button
                      onClick={() => setSelectedCycle({ ...selectedCycle, [membership.id]: 'monthly' })}
                      className={`px-3 py-1 rounded ${
                        cycle === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setSelectedCycle({ ...selectedCycle, [membership.id]: 'yearly' })}
                      className={`px-3 py-1 rounded ${
                        cycle === 'yearly' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
                      }`}
                    >
                      Yearly
                    </button>
                  </div>

                  <div className="text-4xl font-bold text-white">
                    ${price}
                    <span className="text-lg text-gray-400">/{cycle === 'monthly' ? 'mo' : 'yr'}</span>
                  </div>

                  {cycle === 'yearly' && (
                    <p className="text-green-400 text-sm mt-1">
                      Save ${(membership.monthly_price * 12 - membership.yearly_price).toFixed(2)}/year
                    </p>
                  )}
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
                  disabled={isSubscribed}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    isSubscribed
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : color === 'blue'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : color === 'purple'
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  }`}
                >
                  {isSubscribed ? 'Current Plan' : 'Subscribe Now'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-8 p-4 bg-gray-700 rounded-lg">
          <p className="text-gray-300 text-sm text-center">
            All memberships include access to exclusive features and enhanced gameplay.
            Cancel anytime with no hidden fees.
          </p>
        </div>
      </div>
    </div>
  );
};
