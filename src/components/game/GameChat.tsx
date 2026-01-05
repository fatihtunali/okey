'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '@/lib/socket';
import { cn } from '@/lib/utils';

interface GameChatProps {
  gameId: string;
  playerId: string;
  playerName: string;
}

const QUICK_REACTIONS = ['👍', '👏', '😄', '😮', '🤔', '😅', '🎉', '💪'];

export function GameChat({ gameId, playerId, playerName }: GameChatProps) {
  const { chatMessages, sendMessage, sendReaction, isConnected } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [showReactions, setShowReactions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !isConnected) return;

    sendMessage(gameId, playerId, playerName, message.trim());
    setMessage('');
  };

  const handleSendReaction = (reaction: string) => {
    if (!isConnected) return;
    sendReaction(gameId, playerId, reaction);
    setShowReactions(false);
  };

  const unreadCount = isOpen ? 0 : chatMessages.length;

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-4 right-4 z-50',
          'w-14 h-14 rounded-full',
          'bg-gradient-to-br from-amber-500 to-amber-600',
          'shadow-lg shadow-amber-500/30',
          'flex items-center justify-center',
          'text-2xl',
          'hover:scale-110 transition-transform'
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        💬
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </motion.button>

      {/* Quick Reactions Bar */}
      <AnimatePresence>
        {showReactions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-4 z-50 flex gap-2 bg-stone-800/95 backdrop-blur-sm rounded-xl p-2 border border-white/10 shadow-xl"
          >
            {QUICK_REACTIONS.map((reaction) => (
              <button
                key={reaction}
                onClick={() => handleSendReaction(reaction)}
                className="text-2xl hover:scale-125 transition-transform p-1"
              >
                {reaction}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reactions Toggle */}
      <motion.button
        onClick={() => setShowReactions(!showReactions)}
        className={cn(
          'fixed bottom-4 right-20 z-50',
          'w-12 h-12 rounded-full',
          'bg-stone-700/80 backdrop-blur-sm border border-white/10',
          'flex items-center justify-center',
          'text-xl',
          'hover:bg-stone-600/80 transition-colors'
        )}
        whileTap={{ scale: 0.95 }}
      >
        😊
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className={cn(
              'fixed bottom-20 right-4 z-50',
              'w-80 h-96',
              'bg-stone-900/95 backdrop-blur-sm',
              'rounded-2xl border border-white/10',
              'shadow-2xl shadow-black/50',
              'flex flex-col overflow-hidden'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-stone-800/50">
              <div className="flex items-center gap-2">
                <span className="text-lg">💬</span>
                <span className="font-bold text-white">Sohbet</span>
                {isConnected && (
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {chatMessages.length === 0 ? (
                <div className="text-center text-white/40 py-8">
                  <p>Henüz mesaj yok</p>
                  <p className="text-sm mt-1">İlk mesajı sen yaz!</p>
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'rounded-lg px-3 py-2',
                      msg.playerId === playerId
                        ? 'bg-amber-600/30 ml-8'
                        : 'bg-white/10 mr-8'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-amber-400">
                        {msg.playerId === playerId ? 'Sen' : msg.playerName}
                      </span>
                      <span className="text-[10px] text-white/30">
                        {new Date(msg.timestamp).toLocaleTimeString('tr-TR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-white/90">{msg.message}</p>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-stone-800/50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={isConnected ? 'Mesaj yaz...' : 'Bağlanıyor...'}
                  disabled={!isConnected}
                  className={cn(
                    'flex-1 px-3 py-2 rounded-lg',
                    'bg-white/10 border border-white/10',
                    'text-white placeholder-white/40',
                    'focus:outline-none focus:ring-2 focus:ring-amber-500/50',
                    'text-sm',
                    'disabled:opacity-50'
                  )}
                  maxLength={200}
                />
                <button
                  type="submit"
                  disabled={!message.trim() || !isConnected}
                  className={cn(
                    'px-4 py-2 rounded-lg',
                    'bg-amber-500 text-stone-900 font-bold',
                    'hover:bg-amber-400 transition-colors',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  ➤
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
