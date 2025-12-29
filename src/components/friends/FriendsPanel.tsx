'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { FriendsList } from './FriendsList';
import { FriendRequests } from './FriendRequests';
import { AddFriendForm } from './AddFriendForm';
import { useFriendRequests } from '@/hooks/useFriends';

type Tab = 'friends' | 'requests';

export function FriendsPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('friends');
  const { data: requests } = useFriendRequests();
  const requestCount = requests?.length || 0;

  return (
    <div className="bg-stone-900/90 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10">
        <h2 className="text-lg font-bold text-white">Arkadaşlar</h2>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab('friends')}
          className={cn(
            'flex-1 py-3 text-sm font-medium transition',
            activeTab === 'friends'
              ? 'text-amber-400 border-b-2 border-amber-400'
              : 'text-white/60 hover:text-white'
          )}
        >
          Arkadaşlarım
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={cn(
            'flex-1 py-3 text-sm font-medium transition relative',
            activeTab === 'requests'
              ? 'text-amber-400 border-b-2 border-amber-400'
              : 'text-white/60 hover:text-white'
          )}
        >
          Talepler
          {requestCount > 0 && (
            <span className="absolute top-2 right-1/4 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {requestCount}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {activeTab === 'friends' ? (
          <div className="space-y-4">
            <AddFriendForm />
            <FriendsList />
          </div>
        ) : (
          <FriendRequests />
        )}
      </div>
    </div>
  );
}
