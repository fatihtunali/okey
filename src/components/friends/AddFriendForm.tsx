'use client';

import { useState } from 'react';
import { useSendFriendRequest } from '@/hooks/useFriends';

interface AddFriendFormProps {
  onRequestSent?: () => void;
}

export function AddFriendForm({ onRequestSent }: AddFriendFormProps) {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const sendRequest = useSendFriendRequest();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!identifier.trim()) {
      setError('Kullanıcı adı veya e-posta girin');
      return;
    }

    try {
      await sendRequest.mutateAsync(identifier.trim());
      setIdentifier('');
      setSuccess(true);
      onRequestSent?.();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError((err as Error).message || 'Talep gönderilemedi');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="Kullanıcı adı veya e-posta"
          className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={sendRequest.isPending}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-900 font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sendRequest.isPending ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          )}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {success && (
        <p className="text-sm text-green-400">Arkadaşlık talebi gönderildi!</p>
      )}
    </form>
  );
}
