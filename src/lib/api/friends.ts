import { getApi, postApi, deleteApi } from './client';

export interface Friend {
  id: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    rating: number;
    isVip: boolean;
  };
  isOnline: boolean;
  currentGameId: string | null;
}

export interface FriendRequest {
  id: string;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
    rating: number;
    isVip: boolean;
  };
  createdAt: string;
}

export async function getFriends(): Promise<Friend[]> {
  return getApi<Friend[]>('/api/friends');
}

export async function getFriendRequests(): Promise<FriendRequest[]> {
  return getApi<FriendRequest[]>('/api/friends/requests');
}

export async function sendFriendRequest(userId: string): Promise<{ success: boolean; id: string }> {
  return postApi('/api/friends/request', { userId });
}

export async function acceptFriendRequest(friendshipId: string): Promise<{ success: boolean }> {
  return postApi(`/api/friends/friendships/${friendshipId}/accept`);
}

export async function rejectFriendRequest(friendshipId: string): Promise<{ success: boolean }> {
  return postApi(`/api/friends/friendships/${friendshipId}/reject`);
}

export async function removeFriend(userId: string): Promise<{ success: boolean }> {
  return deleteApi(`/api/friends/${userId}`);
}

export async function inviteFriend(userId: string, gameId: string): Promise<{ success: boolean; roomCode: string | null }> {
  return postApi(`/api/friends/${userId}/invite`, { gameId });
}
