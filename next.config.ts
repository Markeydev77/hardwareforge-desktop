import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Samostatny server (server.js + minimum node_modules), ktory Electron
  // spusti v sebe - bez `next start` a bez celych node_modules v inštalátore.
  output: "standalone",
  // Bez tohto by Turbopack hladal korenovy adresar vyssie (C:\Users\marko)
  // a stazoval sa na package-lock.json v domovskom priecinku.
  turbopack: { root: import.meta.dirname },
  poweredByHeader: false,
  // Natívny SQLite modul sa nesmie zbalit webpackom - musi zostat ako balik
  // v standalone/node_modules (odtial ho pouziva aj Electron pre zalohy).
  serverExternalPackages: ["libsql", "@libsql/client", "@prisma/adapter-libsql"],
  outputFileTracingIncludes: {
    // libsql nacitava binarku dynamicky (require(`@libsql/${target}`)) -
    // statická analyza ju nevidi, bez tohto by zabalena appka pri starte spadla.
    "/*": [
      "node_modules/libsql/**/*",
      "node_modules/@libsql/win32-x64-msvc/**/*",
      "node_modules/@neon-rs/load/**/*",
      "node_modules/detect-libc/**/*",
    ],
  },
  outputFileTracingExcludes: {
    "/*": [
      // KRITICKE: vyvojarska databaza a subory sa nesmu dostat do instalatora
      ".data/**/*",
      // optimalizator obrazkov je vypnuty (images.unoptimized) - sharp netreba
      "node_modules/sharp/**/*",
      "node_modules/@img/**/*",
    ],
  },
  images: {
    // Vsetky obrazky su lokalne subory servovane cez /api/files. Optimalizator
    // obrazkov netreba a vzdialene zdroje (remotePatterns) zamerne nie su povolene.
    unoptimized: true,
  },
  experimental: {
    // Obrazok suciastky ide cez Server Action (limit 5 MB + rezerva na formular).
    serverActions: { bodySizeLimit: "6mb" },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
