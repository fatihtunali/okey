"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { AuthModal, UserMenu } from "@/components/auth";
import { Lobby } from "@/components/lobby";
import { FriendsPanel } from "@/components/friends";
import { ShopModal } from "@/components/shop";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [lang, setLang] = useState<"tr" | "en">("tr");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");
  const [showShopModal, setShowShopModal] = useState(false);

  // Handle play button click - require authentication
  const handlePlay = (mode: "regular" | "okey101") => {
    if (!session) {
      setAuthModalTab("login");
      setShowAuthModal(true);
      return;
    }
    router.push(`/play?mode=${mode}`);
  };

  const t = {
    tr: {
      brand: "Hadi Hep Beraber",
      tagline: "Türkiye'nin Okey Masası",
      description: "Dostlarınla buluş, rakiplerini yen! Gerçek oyuncularla anında eşleş ve Türkiye'nin en keyifli okey deneyimini yaşa.",
      quickMatch: "Hemen Oyna",
      createRoom: "Masa Kur",
      joinRoom: "Masaya Otur",
      login: "Giriş",
      register: "Üye Ol",
      playersOnline: "oyuncu masada",
      features: {
        title: "Neden Biz?",
        fast: "Anında Eşleşme",
        fastDesc: "Saniyeler içinde masana otur",
        players: "Gerçek Rakipler",
        playersDesc: "Türkiye'nin dört bir yanından oyuncular",
        ranking: "Usta Ligi",
        rankingDesc: "Yüksel, kazan, şampiyon ol",
        chat: "Canlı Sohbet",
        chatDesc: "Masada muhabbet et",
      },
      howTo: {
        title: "Nasıl Oynanır?",
        step1: "Per ve gruplar oluştur",
        step2: "Okey taşını akıllıca kullan",
        step3: "İlk bitiren masayı alır!",
      },
      footer: "Hadi Hep Beraber - Türkiye'nin Okey Masası",
    },
    en: {
      brand: "Hadi Hep Beraber",
      tagline: "Turkey's Okey Table",
      description: "Meet friends, beat opponents! Instantly match with real players and enjoy Turkey's most exciting Okey experience.",
      quickMatch: "Play Now",
      createRoom: "Create Table",
      joinRoom: "Join Table",
      login: "Login",
      register: "Sign Up",
      playersOnline: "players at tables",
      features: {
        title: "Why Us?",
        fast: "Instant Matching",
        fastDesc: "Sit at your table in seconds",
        players: "Real Opponents",
        playersDesc: "Players from all across Turkey",
        ranking: "Master League",
        rankingDesc: "Rise, win, become champion",
        chat: "Live Chat",
        chatDesc: "Chat at the table",
      },
      howTo: {
        title: "How to Play?",
        step1: "Form sets and runs",
        step2: "Use the Okey tile wisely",
        step3: "First to finish wins the table!",
      },
      footer: "Hadi Hep Beraber - Turkey's Okey Table",
    },
  };

  const text = t[lang];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-950 via-stone-900 to-stone-950">
      {/* Ottoman pattern background */}
      <div className="fixed inset-0 z-0 opacity-5 ottoman-pattern" />

      {/* Warm ambient lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-36 h-36 sm:w-72 sm:h-72 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 w-[400px] sm:w-[800px] h-48 sm:h-96 bg-amber-600/5 rounded-full blur-3xl" />
      </div>

      {/* Hero Background Image */}
      <div className="fixed inset-0 z-0">
        <img
          src="/hero-okey.png"
          alt="Okey masası"
          className="w-full h-full object-cover opacity-30"
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-950/80 via-stone-900/70 to-stone-950" />
      </div>

      {/* Header */}
      <header className="relative z-10 safe-area-inset">
        <div className="h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
        <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 backdrop-blur-sm bg-stone-900/50 border-b border-amber-600/20">
        <motion.div
          className="flex items-center gap-2 sm:gap-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {/* Turkish tile logo */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 border-2 border-amber-400 shadow-lg flex items-center justify-center">
              <span className="text-lg sm:text-2xl font-black text-amber-950">◆</span>
            </div>
            {/* Decorative corner */}
            <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-red-600 rounded-full border border-red-400" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
              {text.brand}
            </h1>
            <p className="text-amber-600/80 text-xs sm:text-sm font-medium">{text.tagline}</p>
          </div>
        </motion.div>
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Language Toggle */}
          <div className="flex rounded-lg bg-black/20 p-0.5 sm:p-1">
            <button
              onClick={() => setLang("tr")}
              className={`rounded-md px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium transition touch-manipulation ${
                lang === "tr"
                  ? "bg-amber-500 text-red-950"
                  : "text-amber-200 hover:bg-white/10"
              }`}
            >
              🇹🇷 <span className="hidden sm:inline">TR</span>
            </button>
            <button
              onClick={() => setLang("en")}
              className={`rounded-md px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium transition touch-manipulation ${
                lang === "en"
                  ? "bg-amber-500 text-red-950"
                  : "text-amber-200 hover:bg-white/10"
              }`}
            >
              🇬🇧 <span className="hidden sm:inline">EN</span>
            </button>
          </div>
          {/* Auth Buttons */}
          {status === "loading" ? (
            <div className="w-20 sm:w-32 h-8 sm:h-10 bg-white/10 rounded-lg animate-pulse" />
          ) : session ? (
            <>
              <button
                onClick={() => setShowShopModal(true)}
                className="hidden sm:block rounded-lg bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-amber-400 transition hover:bg-amber-500/30 touch-manipulation"
              >
                🛒 {lang === "tr" ? "Mağaza" : "Shop"}
              </button>
              <UserMenu />
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setAuthModalTab("login");
                  setShowAuthModal(true);
                }}
                className="rounded-lg border border-amber-500/30 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-amber-400 transition hover:bg-amber-500/10 touch-manipulation"
              >
                {text.login}
              </button>
              <button
                onClick={() => {
                  setAuthModalTab("register");
                  setShowAuthModal(true);
                }}
                className="rounded-lg bg-amber-500 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-red-950 shadow-lg transition hover:bg-amber-400 touch-manipulation"
              >
                {text.register}
              </button>
            </>
          )}
        </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab={authModalTab}
      />

      {/* Shop Modal */}
      <ShopModal
        isOpen={showShopModal}
        onClose={() => setShowShopModal(false)}
      />

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center px-4 sm:px-6 py-8 sm:py-12 text-center safe-area-inset">
        {/* Decorative Tiles */}
        <div className="mb-6 sm:mb-8 flex gap-2 sm:gap-3">
          {[
            { num: 1, color: "text-red-600" },
            { num: 2, color: "text-amber-600" },
            { num: 3, color: "text-stone-800" },
            { num: 4, color: "text-blue-600" },
            { num: "★", color: "text-red-500", isOkey: true },
          ].map((tile, i) => (
            <div
              key={i}
              className={`flex h-14 w-10 sm:h-20 sm:w-14 flex-col items-center justify-center rounded-lg sm:rounded-xl shadow-xl transform hover:scale-110 hover:-rotate-3 transition-all cursor-pointer ${
                tile.isOkey
                  ? "bg-gradient-to-b from-amber-400 to-amber-600 ring-2 ring-amber-300"
                  : "bg-gradient-to-b from-amber-50 to-amber-100"
              }`}
            >
              <span className={`text-xl sm:text-3xl font-black ${tile.isOkey ? "text-red-950" : tile.color}`}>
                {tile.num}
              </span>
              {tile.isOkey && <span className="text-[8px] sm:text-[10px] font-bold text-red-900">OKEY</span>}
            </div>
          ))}
        </div>

        <h1 className="mb-2 sm:mb-3 text-3xl sm:text-5xl font-black text-white drop-shadow-lg md:text-6xl">
          {text.brand}
        </h1>
        <h2 className="mb-4 sm:mb-6 text-lg sm:text-xl font-medium text-amber-400 md:text-2xl">
          {text.tagline}
        </h2>
        <p className="mb-6 sm:mb-10 max-w-lg text-base sm:text-lg leading-relaxed text-red-100 px-2">
          {text.description}
        </p>

        {/* Game Mode Selection */}
        <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row mb-6 sm:mb-8 w-full sm:w-auto px-2 sm:px-0">
          <button
            onClick={() => handlePlay("regular")}
            className="group flex items-center justify-center gap-2 sm:gap-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 sm:px-10 py-4 sm:py-5 text-lg sm:text-xl font-black text-red-950 shadow-2xl transition hover:from-amber-400 hover:to-amber-500 active:scale-95 sm:hover:scale-105 touch-manipulation"
          >
            <span className="text-xl sm:text-2xl transition group-hover:scale-125">▶</span>
            {lang === "tr" ? "Normal Okey" : "Regular Okey"}
          </button>
          <button
            onClick={() => handlePlay("okey101")}
            className="group flex items-center justify-center gap-2 sm:gap-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-6 sm:px-10 py-4 sm:py-5 text-lg sm:text-xl font-black text-white shadow-2xl transition hover:from-red-500 hover:to-red-600 active:scale-95 sm:hover:scale-105 touch-manipulation"
          >
            <span className="text-xl sm:text-2xl transition group-hover:scale-125">▶</span>
            101 Okey
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row w-full sm:w-auto px-2 sm:px-0">
          <button className="rounded-xl border-2 border-amber-500/40 bg-black/20 px-6 sm:px-8 py-4 sm:py-5 text-base sm:text-lg font-bold text-amber-400 backdrop-blur transition hover:bg-amber-500/20 hover:border-amber-400 active:scale-95 touch-manipulation">
            {text.createRoom}
          </button>
          <button className="rounded-xl border-2 border-amber-500/40 bg-black/20 px-6 sm:px-8 py-4 sm:py-5 text-base sm:text-lg font-bold text-amber-400 backdrop-blur transition hover:bg-amber-500/20 hover:border-amber-400 active:scale-95 touch-manipulation">
            {text.joinRoom}
          </button>
        </div>

        {/* Online Players Count */}
        <div className="mt-8 sm:mt-10 flex items-center gap-2 sm:gap-3 rounded-full bg-black/30 px-4 sm:px-6 py-2 sm:py-3 backdrop-blur">
          <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-green-500"></span>
          </span>
          <span className="text-sm sm:text-lg font-semibold text-amber-200">
            <span className="text-xl sm:text-2xl font-black text-amber-400">1,247</span> {text.playersOnline}
          </span>
        </div>

        {/* Lobby and Friends for authenticated users */}
        {session && (
          <div className="mt-8 sm:mt-12 w-full max-w-4xl px-2 sm:px-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Lobby - takes 2 columns on large screens */}
              <div className="lg:col-span-2 rounded-xl sm:rounded-2xl bg-black/40 border border-white/10 p-4 sm:p-6 backdrop-blur">
                <Lobby />
              </div>
              {/* Friends panel - takes 1 column */}
              <div className="lg:col-span-1">
                <FriendsPanel />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Features Section */}
      <section className="relative z-10 px-4 sm:px-6 py-10 sm:py-16 bg-gradient-to-b from-transparent to-stone-900/90">
        <h3 className="mb-8 sm:mb-12 text-center text-2xl sm:text-3xl font-black text-white">
          {text.features.title}
        </h3>
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 sm:gap-6 md:grid-cols-4">
          {[
            { icon: "⚡", title: text.features.fast, desc: text.features.fastDesc, color: "from-amber-500/20 to-amber-600/10" },
            { icon: "👥", title: text.features.players, desc: text.features.playersDesc, color: "from-red-500/20 to-red-600/10" },
            { icon: "🏆", title: text.features.ranking, desc: text.features.rankingDesc, color: "from-amber-500/20 to-amber-600/10" },
            { icon: "💬", title: text.features.chat, desc: text.features.chatDesc, color: "from-red-500/20 to-red-600/10" },
          ].map((feature, i) => (
            <div
              key={i}
              className={`flex flex-col items-center rounded-xl sm:rounded-2xl bg-gradient-to-b ${feature.color} border border-amber-500/10 p-4 sm:p-6 text-center backdrop-blur transition hover:border-amber-500/30 active:scale-95 sm:hover:scale-105 touch-manipulation`}
            >
              <span className="mb-2 sm:mb-4 text-3xl sm:text-5xl">{feature.icon}</span>
              <h4 className="mb-1 sm:mb-2 text-sm sm:text-lg font-bold text-amber-400">{feature.title}</h4>
              <p className="text-xs sm:text-sm text-red-200">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How to Play Section */}
      <section className="relative z-10 px-4 sm:px-6 py-10 sm:py-16 bg-stone-900/90">
        <h3 className="mb-8 sm:mb-12 text-center text-2xl sm:text-3xl font-black text-white">
          {text.howTo.title}
        </h3>
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col items-center justify-center gap-6 sm:gap-8 md:flex-row">
            {[
              { step: "1", icon: "🎯", text: text.howTo.step1 },
              { step: "2", icon: "🃏", text: text.howTo.step2 },
              { step: "3", icon: "🏅", text: text.howTo.step3 },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="mb-2 sm:mb-3 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-b from-amber-500 to-amber-600 text-3xl sm:text-4xl shadow-xl">
                    {item.icon}
                  </div>
                  <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-red-800 text-xs sm:text-sm font-bold text-amber-400">
                    {item.step}
                  </div>
                  <p className="mt-2 sm:mt-3 max-w-[120px] sm:max-w-[150px] text-center text-xs sm:text-sm font-medium text-red-100">
                    {item.text}
                  </p>
                </div>
                {i < 2 && (
                  <div className="hidden text-4xl text-amber-600/50 md:block">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-4 sm:px-6 py-10 sm:py-16 bg-stone-900">
        <div className="mx-auto max-w-2xl rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-500/20 to-red-500/20 border border-amber-500/20 p-6 sm:p-10 text-center backdrop-blur">
          <h3 className="mb-3 sm:mb-4 text-2xl sm:text-3xl font-black text-white">
            {lang === "tr" ? "Hazır mısın?" : "Ready?"}
          </h3>
          <p className="mb-6 sm:mb-8 text-base sm:text-lg text-red-200">
            {lang === "tr"
              ? "Hemen üye ol, ilk oyununda 1000 chip hediye!"
              : "Sign up now, get 1000 free chips on your first game!"}
          </p>
          <button
            onClick={() => {
              setAuthModalTab("register");
              setShowAuthModal(true);
            }}
            className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl font-black text-red-950 shadow-2xl transition hover:from-amber-400 hover:to-amber-500 active:scale-95 sm:hover:scale-105 touch-manipulation"
          >
            {text.register}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-amber-500/10 px-4 sm:px-6 py-6 sm:py-8 bg-stone-900 safe-area-inset">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-amber-500 text-xs sm:text-sm font-bold text-red-950">
              ◆
            </div>
            <span className="text-amber-400 font-bold text-sm sm:text-base">{text.brand}</span>
          </div>
          <p className="text-xs sm:text-sm text-red-300 text-center">© 2025 {text.footer}</p>
          <div className="flex gap-3 sm:gap-4 text-xl sm:text-2xl">
            <span className="cursor-pointer hover:scale-125 active:scale-95 transition touch-manipulation">📱</span>
            <span className="cursor-pointer hover:scale-125 active:scale-95 transition touch-manipulation">📧</span>
            <span className="cursor-pointer hover:scale-125 active:scale-95 transition touch-manipulation">💬</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
