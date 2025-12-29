'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { AuthModal, UserMenu } from '@/components/auth';
import { Lobby } from '@/components/lobby';
import { FriendsPanel } from '@/components/friends';
import { ShopModal } from '@/components/shop';

// ============================================
// TURKISH HOME PAGE - Kahvehane Atmosphere
// Authentic Turkish coffeehouse experience
// ============================================

export default function TurkishHome() {
  const { data: session, status } = useSession();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [showShopModal, setShowShopModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-950 via-stone-900 to-stone-950 overflow-hidden">
      {/* Ottoman pattern background */}
      <div className="fixed inset-0 opacity-5 ottoman-pattern" />

      {/* Warm ambient lighting */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 w-[800px] h-96 bg-amber-600/5 rounded-full blur-3xl" />
      </div>

      {/* ============================================
          HEADER - Brass-accented navigation
          ============================================ */}
      <header className="relative z-50">
        <div className="h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
        <div className="flex items-center justify-between px-6 py-4 backdrop-blur-sm bg-stone-900/50">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* Turkish tile logo */}
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 border-2 border-amber-400 shadow-lg flex items-center justify-center">
                <span className="text-2xl font-black text-amber-950">◆</span>
              </div>
              {/* Decorative corner */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border border-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
                Hadi Hep Beraber
              </h1>
              <p className="text-amber-600/80 text-sm font-medium">Türkiye'nin Okey Masası</p>
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            {/* Turkish tea icon */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-amber-900/30 border border-amber-700/30">
              <span className="text-amber-500">🫖</span>
              <span className="text-amber-400/70 text-sm">Hoş geldiniz</span>
            </div>

            {/* Auth buttons */}
            {status === 'loading' ? (
              <div className="w-32 h-10 bg-amber-900/30 rounded-xl animate-pulse" />
            ) : session ? (
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={() => setShowShopModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600/20 to-amber-700/20 border border-amber-500/30 text-amber-400 hover:bg-amber-600/30 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>🛒</span>
                  <span className="hidden sm:inline">Mağaza</span>
                </motion.button>
                <UserMenu />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={() => {
                    setAuthModalTab('login');
                    setShowAuthModal(true);
                  }}
                  className="px-5 py-2.5 rounded-xl border-2 border-amber-600/50 text-amber-400 font-medium hover:bg-amber-600/10 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Giriş
                </motion.button>
                <motion.button
                  onClick={() => {
                    setAuthModalTab('register');
                    setShowAuthModal(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-amber-950 font-bold shadow-lg hover:shadow-xl transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Üye Ol
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab={authModalTab}
      />
      <ShopModal isOpen={showShopModal} onClose={() => setShowShopModal(false)} />

      {/* ============================================
          HERO SECTION - Immersive Okey Experience
          ============================================ */}
      <main className="relative z-10">
        <div className="container mx-auto px-6 py-12">
          {/* Decorative tiles */}
          <motion.div
            className="flex justify-center gap-3 mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {[
              { num: 1, color: 'text-red-500', bg: 'from-red-100 to-white' },
              { num: 5, color: 'text-amber-600', bg: 'from-amber-100 to-white' },
              { num: 9, color: 'text-blue-600', bg: 'from-blue-100 to-white' },
              { num: 13, color: 'text-stone-800', bg: 'from-stone-100 to-white' },
              { special: true },
            ].map((tile, i) => (
              <motion.div
                key={i}
                className={cn(
                  'w-16 h-24 rounded-xl shadow-2xl',
                  'flex flex-col items-center justify-center',
                  'border-2 cursor-pointer transition-transform',
                  tile.special
                    ? 'bg-gradient-to-b from-amber-400 to-amber-600 border-amber-300'
                    : `bg-gradient-to-b ${tile.bg} border-amber-200`
                )}
                whileHover={{ y: -8, rotate: Math.random() * 6 - 3 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {tile.special ? (
                  <>
                    <span className="text-3xl text-red-700">★</span>
                    <span className="text-xs font-black text-amber-900">OKEY</span>
                  </>
                ) : (
                  <>
                    <div className={cn('w-2 h-2 rounded-full mb-1', tile.color?.replace('text', 'bg'))} />
                    <span className={cn('text-3xl font-black', tile.color)}>{tile.num}</span>
                  </>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Main headline */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-5xl md:text-7xl font-black text-white mb-4 drop-shadow-lg">
              Okey Keyfi
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-400">
                Bir Tık Uzağında
              </span>
            </h2>
            <p className="text-xl text-amber-200/80 max-w-2xl mx-auto leading-relaxed">
              Dostlarınla buluş, rakiplerini yen! Türkiye'nin en keyifli okey deneyimini yaşa.
              Anında eşleşme, gerçek oyuncular, sınırsız eğlence.
            </p>
          </motion.div>

          {/* Game mode selection */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* Regular Okey */}
            <motion.a
              href="/play?mode=regular"
              className={cn(
                'group relative px-10 py-6 rounded-2xl overflow-hidden',
                'bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800',
                'border-2 border-emerald-500/50',
                'shadow-2xl hover:shadow-emerald-500/20',
                'transition-all duration-300'
              )}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Felt texture */}
              <div className="absolute inset-0 opacity-20 felt-texture" />
              <div className="relative flex items-center gap-4">
                <span className="text-4xl">🃏</span>
                <div>
                  <h3 className="text-2xl font-black text-white">Normal Okey</h3>
                  <p className="text-emerald-200/80">Klasik okey keyfi</p>
                </div>
              </div>
            </motion.a>

            {/* 101 Okey */}
            <motion.a
              href="/play?mode=okey101"
              className={cn(
                'group relative px-10 py-6 rounded-2xl overflow-hidden',
                'bg-gradient-to-br from-red-800 via-red-700 to-red-900',
                'border-2 border-red-500/50',
                'shadow-2xl hover:shadow-red-500/20',
                'transition-all duration-300'
              )}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 opacity-20 felt-texture" />
              <div className="relative flex items-center gap-4">
                <span className="text-4xl">🏆</span>
                <div>
                  <h3 className="text-2xl font-black text-white">101 Okey</h3>
                  <p className="text-red-200/80">Rekabetçi oyun</p>
                </div>
              </div>
            </motion.a>
          </motion.div>

          {/* Online players indicator */}
          <motion.div
            className="flex justify-center mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-stone-900/80 backdrop-blur-sm border border-amber-600/30">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
              </span>
              <span className="text-lg text-amber-200">
                <span className="text-2xl font-black text-amber-400">1,247</span> oyuncu masada
              </span>
            </div>
          </motion.div>

          {/* Lobby for authenticated users */}
          <AnimatePresence>
            {session && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-5xl mx-auto"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Lobby */}
                  <div className="lg:col-span-2 rounded-2xl bg-stone-900/80 backdrop-blur-sm border border-amber-600/20 p-6 shadow-xl">
                    <Lobby />
                  </div>
                  {/* Friends */}
                  <div className="lg:col-span-1">
                    <FriendsPanel />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============================================
            FEATURES SECTION
            ============================================ */}
        <section className="py-20 bg-gradient-to-b from-transparent to-stone-950/80">
          <div className="container mx-auto px-6">
            <motion.h3
              className="text-3xl font-black text-white text-center mb-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Neden <span className="text-amber-400">Bizi</span> Seçmelisiniz?
            </motion.h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: '⚡', title: 'Anında Eşleşme', desc: 'Saniyeler içinde masana otur', color: 'from-amber-500/20 to-amber-600/10' },
                { icon: '👥', title: 'Gerçek Rakipler', desc: "Türkiye'nin dört yanından oyuncular", color: 'from-red-500/20 to-red-600/10' },
                { icon: '🏆', title: 'Usta Ligi', desc: 'Yüksel, kazan, şampiyon ol', color: 'from-amber-500/20 to-amber-600/10' },
                { icon: '🫖', title: 'Sohbet Keyfi', desc: 'Masada muhabbet et', color: 'from-red-500/20 to-red-600/10' },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  className={cn(
                    'flex flex-col items-center p-6 rounded-2xl text-center',
                    `bg-gradient-to-b ${feature.color}`,
                    'border border-amber-500/10 hover:border-amber-500/30',
                    'transition-all duration-300'
                  )}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                >
                  <span className="text-5xl mb-4">{feature.icon}</span>
                  <h4 className="text-lg font-bold text-amber-400 mb-2">{feature.title}</h4>
                  <p className="text-amber-200/60 text-sm">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================
            HOW TO PLAY SECTION
            ============================================ */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <motion.h3
              className="text-3xl font-black text-white text-center mb-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Nasıl <span className="text-amber-400">Oynanır</span>?
            </motion.h3>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              {[
                { step: '1', icon: '🎯', text: 'Per ve gruplar oluştur' },
                { step: '2', icon: '🃏', text: 'Okey taşını akıllıca kullan' },
                { step: '3', icon: '🏅', text: 'İlk bitiren masayı alır!' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-4xl shadow-xl border-2 border-amber-500/50 mb-3">
                      {item.icon}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-red-700 text-amber-300 font-bold flex items-center justify-center text-sm border-2 border-red-500">
                      {item.step}
                    </div>
                    <p className="mt-3 text-amber-200/80 text-center max-w-[140px]">{item.text}</p>
                  </div>
                  {i < 2 && (
                    <div className="hidden md:block text-4xl text-amber-600/30">→</div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================
            CTA SECTION
            ============================================ */}
        {!session && (
          <section className="py-20">
            <div className="container mx-auto px-6">
              <motion.div
                className="max-w-2xl mx-auto rounded-3xl overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="relative p-10 bg-gradient-to-br from-amber-600/20 to-red-600/20 border border-amber-500/20 backdrop-blur-sm text-center">
                  {/* Decorative elements */}
                  <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-amber-500/30" />
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-amber-500/30" />
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-amber-500/30" />
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-amber-500/30" />

                  <h3 className="text-4xl font-black text-white mb-4">
                    Hazır mısın?
                  </h3>
                  <p className="text-xl text-amber-200/80 mb-8">
                    Hemen üye ol, ilk oyununda <span className="text-amber-400 font-bold">1000 chip</span> hediye!
                  </p>
                  <motion.button
                    onClick={() => {
                      setAuthModalTab('register');
                      setShowAuthModal(true);
                    }}
                    className="px-10 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 text-xl font-black shadow-2xl hover:shadow-amber-500/20 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Hemen Başla
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </section>
        )}
      </main>

      {/* ============================================
          FOOTER
          ============================================ */}
      <footer className="relative z-10 border-t border-amber-600/20 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
                <span className="text-lg font-black text-amber-950">◆</span>
              </div>
              <span className="text-amber-400 font-bold">Hadi Hep Beraber</span>
            </div>
            <p className="text-amber-600/60 text-sm">
              © 2025 Türkiye'nin Okey Masası - Tüm hakları saklıdır
            </p>
            <div className="flex gap-4">
              {['📱', '📧', '💬'].map((icon, i) => (
                <motion.button
                  key={i}
                  className="w-10 h-10 rounded-full bg-amber-900/30 flex items-center justify-center text-xl hover:bg-amber-900/50 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {icon}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Import theme CSS */}
      <style jsx global>{`
        @import '@/styles/turkish-theme.css';
      `}</style>
    </div>
  );
}
