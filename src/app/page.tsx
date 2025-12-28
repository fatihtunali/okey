"use client";

import { useState } from "react";

export default function Home() {
  const [lang, setLang] = useState<"tr" | "en">("tr");

  const t = {
    tr: {
      title: "OKEY",
      subtitle: "Hadi Hep Beraber",
      description: "Türkiye'nin en sevilen taş oyununu online oyna! Arkadaşlarınla veya yapay zeka ile hemen bir oyuna başla.",
      quickMatch: "Hızlı Oyun",
      createRoom: "Oda Oluştur",
      joinRoom: "Odaya Katıl",
      login: "Giriş Yap",
      register: "Kayıt Ol",
      features: {
        title: "Özellikler",
        realtime: "Gerçek Zamanlı",
        realtimeDesc: "Anlık oyun deneyimi",
        ai: "Yapay Zeka",
        aiDesc: "Rakip bulunamazsa AI ile oyna",
        ranking: "Sıralama",
        rankingDesc: "Liderlik tablosunda yarış",
        chat: "Sohbet",
        chatDesc: "Oyun içi mesajlaşma",
      },
      footer: "2025 Hadi Hep Beraber. Tüm hakları saklıdır.",
    },
    en: {
      title: "OKEY",
      subtitle: "Come On, All Together",
      description: "Play Turkey's most beloved tile game online! Start a game with friends or AI right now.",
      quickMatch: "Quick Match",
      createRoom: "Create Room",
      joinRoom: "Join Room",
      login: "Login",
      register: "Register",
      features: {
        title: "Features",
        realtime: "Real-time",
        realtimeDesc: "Instant game experience",
        ai: "AI Players",
        aiDesc: "Play with AI when no opponents",
        ranking: "Rankings",
        rankingDesc: "Compete on leaderboards",
        chat: "Chat",
        chatDesc: "In-game messaging",
      },
      footer: "2025 Hadi Hep Beraber. All rights reserved.",
    },
  };

  const text = t[lang];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-950">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="text-2xl font-bold text-white">
          🎴 {text.title}
        </div>
        <div className="flex items-center gap-4">
          {/* Language Toggle */}
          <div className="flex rounded-full bg-white/10 p-1">
            <button
              onClick={() => setLang("tr")}
              className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                lang === "tr"
                  ? "bg-white text-emerald-900"
                  : "text-white hover:bg-white/10"
              }`}
            >
              TR
            </button>
            <button
              onClick={() => setLang("en")}
              className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                lang === "en"
                  ? "bg-white text-emerald-900"
                  : "text-white hover:bg-white/10"
              }`}
            >
              EN
            </button>
          </div>
          {/* Auth Buttons */}
          <button className="rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10">
            {text.login}
          </button>
          <button className="rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600">
            {text.register}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center px-6 py-16 text-center">
        {/* Decorative Tiles */}
        <div className="mb-8 flex gap-2">
          {[
            { num: 7, color: "bg-red-500" },
            { num: 8, color: "bg-blue-500" },
            { num: 9, color: "bg-yellow-500" },
            { num: 10, color: "bg-black" },
          ].map((tile, i) => (
            <div
              key={i}
              className="flex h-16 w-12 items-center justify-center rounded-lg bg-amber-100 shadow-lg transform hover:scale-110 transition"
            >
              <span className={`text-2xl font-bold ${tile.color.replace("bg-", "text-")}`}>
                {tile.num}
              </span>
            </div>
          ))}
        </div>

        <h1 className="mb-2 text-6xl font-black text-white drop-shadow-lg">
          {text.title}
        </h1>
        <h2 className="mb-6 text-2xl font-medium text-amber-400">
          {text.subtitle}
        </h2>
        <p className="mb-10 max-w-xl text-lg text-emerald-100">
          {text.description}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <button className="group flex items-center gap-2 rounded-full bg-amber-500 px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-amber-600 hover:scale-105">
            <span className="text-2xl">▶</span>
            {text.quickMatch}
          </button>
          <button className="rounded-full border-2 border-white/30 bg-white/10 px-8 py-4 text-lg font-bold text-white backdrop-blur transition hover:bg-white/20">
            {text.createRoom}
          </button>
          <button className="rounded-full border-2 border-white/30 bg-white/10 px-8 py-4 text-lg font-bold text-white backdrop-blur transition hover:bg-white/20">
            {text.joinRoom}
          </button>
        </div>

        {/* Online Players Count */}
        <div className="mt-8 flex items-center gap-2 text-emerald-200">
          <span className="h-3 w-3 animate-pulse rounded-full bg-green-400"></span>
          <span>247 {lang === "tr" ? "oyuncu çevrimiçi" : "players online"}</span>
        </div>
      </main>

      {/* Features Section */}
      <section className="px-6 py-16">
        <h3 className="mb-10 text-center text-3xl font-bold text-white">
          {text.features.title}
        </h3>
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { icon: "⚡", title: text.features.realtime, desc: text.features.realtimeDesc },
            { icon: "🤖", title: text.features.ai, desc: text.features.aiDesc },
            { icon: "🏆", title: text.features.ranking, desc: text.features.rankingDesc },
            { icon: "💬", title: text.features.chat, desc: text.features.chatDesc },
          ].map((feature, i) => (
            <div
              key={i}
              className="flex flex-col items-center rounded-2xl bg-white/10 p-6 text-center backdrop-blur transition hover:bg-white/20"
            >
              <span className="mb-3 text-4xl">{feature.icon}</span>
              <h4 className="mb-1 font-bold text-white">{feature.title}</h4>
              <p className="text-sm text-emerald-200">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Game Preview */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl rounded-3xl bg-emerald-950/50 p-8 backdrop-blur">
          <div className="flex items-center justify-center gap-4 text-white">
            <div className="text-center">
              <div className="mb-2 text-6xl">🎯</div>
              <p className="text-emerald-200">{lang === "tr" ? "Per ve gruplar oluştur" : "Form sets and runs"}</p>
            </div>
            <div className="text-4xl text-emerald-600">→</div>
            <div className="text-center">
              <div className="mb-2 text-6xl">🃏</div>
              <p className="text-emerald-200">{lang === "tr" ? "Joker (Okey) kullan" : "Use the Joker (Okey)"}</p>
            </div>
            <div className="text-4xl text-emerald-600">→</div>
            <div className="text-center">
              <div className="mb-2 text-6xl">🏅</div>
              <p className="text-emerald-200">{lang === "tr" ? "İlk bitiren kazanır!" : "First to finish wins!"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 text-center text-emerald-300">
        <p>© {text.footer}</p>
      </footer>
    </div>
  );
}
