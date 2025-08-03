// index.js
const express = require("express");
const pairRoute = require("./pair");
const fs = require("fs");
const path = require("path");
const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");

const commands = require("./command").commands;
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use("/", pairRoute);

// automatically load sessions (command only, separate from QR pairing)
const sessionBase = path.join(__dirname, "sessions");
const sessionDirs = fs.existsSync(sessionBase) ? fs.readdirSync(sessionBase) : [];

sessionDirs.forEach(dir => {
  useMultiFileAuthState(path.join(sessionBase, dir)).then(({ state, saveCreds }) => {
    const sock = makeWASocket({
      auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, require("pino")({ level: "silent" })) },
      logger: require("pino")({ level: "silent" }),
      syncFullHistory: false,
      browser: ["CHMA‑MD", "Chrome", "1.0.0"]
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("messages.upsert", async ({ messages }) => {
      for (let msg of messages) {
        if (!msg.message || msg.key.isSentByMe) continue;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
        commands.forEach(c => {
          if (text === `.${c.pattern}`) c.run(sock, msg);
        });
      }
    });
  });
});

app.listen(PORT, () => console.log(`🚀 CHMA‑MD running on http://localhost:${PORT}`));
