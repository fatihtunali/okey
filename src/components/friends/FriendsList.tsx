'use client';

import { useFriends, useRemoveFriend, useInviteFriend } from '@/hooks/useFriends';
import { cn } from '@/lib/utils';

interface FriendsListProps {
  onInviteSent?: () => void;
}

export function FriendsList({ onInviteSent }: FriendsListProps) {
  const { data: friends, isLoading, error, refetch } = useFriends();
  const removeFriend = useRemoveFriend();
  const inviteToGame = useInviteFriend();

  const handleRemove = async (friendId: string) => {
    if (!confirm('Bu arkadaşı silmek istediğinize emin misiniz?')) return;

    try {
      await removeFriend.mutateAsync(friendId);
      refetch();
    } catch (err) {
      console.error('Failed to remove friend:', err);
    }
  };

  const handleInvite = async (userId: string, gameId: string) => {
    try {
      await inviteToGame.mutateAsync({ userId, gameId });
      onInviteSent?.();
    } catch (err) {
      console.error('Failed to invite friend:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-400">
        Arkadaşlar yüklenirken hata oluştu
      </div>
    );
  }

  if (!friends || friends.length === 0) {
    return (
      <div className="text-center py-8 text-white/50">
        Henüz arkadaşınız yok
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {friends.map((friend) => (
        <div
          key={friend.id}
          className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-stone-900 font-bold">
                {friend.user.name?.[0]?.toUpperCase() || '?'}
              </div>
              <span
                className={cn(
                  'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-stone-900',
                  friend.isOnline ? 'bg-green-500' : 'bg-gray-500'
                )}
              />
            </div>
            <div>
              <p className="text-white font-medium">{friend.user.name}</p>
              <p className="text-xs text-white/50">
                {friend.isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {friend.isOnline && (
              <button
                onClick={() => {
                  // TODO: Get current game ID
                  // handleInvite(friend.id, 'current-game-id');
                }}
                className="p-2 text-amber-400 hover:bg-amber-500/20 rounded-lg transition"
                title="Oyuna davet et"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
            <button
              onClick={() => handleRemove(friend.user.id)}
              className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition"
              title="Arkadaşlıktan çıkar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
