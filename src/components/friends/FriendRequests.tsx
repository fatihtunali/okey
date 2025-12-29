'use client';

import { useFriendRequests, useAcceptFriendRequest, useRejectFriendRequest } from '@/hooks/useFriends';

interface FriendRequestsProps {
  onRequestHandled?: () => void;
}

export function FriendRequests({ onRequestHandled }: FriendRequestsProps) {
  const { data: requests, isLoading, error, refetch } = useFriendRequests();
  const acceptFriend = useAcceptFriendRequest();
  const rejectFriend = useRejectFriendRequest();

  const handleAccept = async (friendshipId: string) => {
    try {
      await acceptFriend.mutateAsync(friendshipId);
      refetch();
      onRequestHandled?.();
    } catch (err) {
      console.error('Failed to accept friend request:', err);
    }
  };

  const handleReject = async (friendshipId: string) => {
    try {
      await rejectFriend.mutateAsync(friendshipId);
      refetch();
      onRequestHandled?.();
    } catch (err) {
      console.error('Failed to reject friend request:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-400 text-sm">
        Talepler yüklenirken hata oluştu
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="text-center py-4 text-white/50 text-sm">
        Bekleyen arkadaşlık talebi yok
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {requests.map((request) => (
        <div
          key={request.id}
          className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-stone-900 font-bold">
              {request.sender.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p className="text-white font-medium">{request.sender.name}</p>
              <p className="text-xs text-amber-300">Arkadaşlık talebi</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAccept(request.id)}
              disabled={acceptFriend.isPending}
              className="p-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg transition disabled:opacity-50"
              title="Kabul et"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              onClick={() => handleReject(request.id)}
              disabled={rejectFriend.isPending}
              className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition disabled:opacity-50"
              title="Reddet"
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
