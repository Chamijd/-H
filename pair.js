// pair.js
const express = require("express");
const { makeid } = require("./gen-id");  // අනිවාර්ය implement කරන්න
const { default: makeWASocket, useMultiFileAuthState, delay, Browsers, makeCacheableSignalKeyStore } = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");
const router = express.Router();

function removeDir(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { force: true, recursive: true });
}

router.get("/code", async (req, res) => {
  const num = req.query.number;
  if (!num || num.replace(/\D/g, "").length < 11) return res.json({ code: "Invalid number" });
  const id = makeid();
  const sessionDir = path.join(__dirname, "sessions", id);

  await fs.promises.mkdir(sessionDir, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

  try {
    const sock = makeWASocket({
      auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })) },
      printQRInTerminal: false,
      logger: pino({ level: "silent" }),
      browser: Browsers.macOS("Chrome"),
      syncFullHistory: false
    });

    if (!sock.authState.creds.registered) {
      await delay(1500);
      const phone = num.replace(/\D/g, "");
      const code = await sock.requestPairingCode(phone);
      res.json({ code });

      sock.ev.on("creds.update", saveCreds);
      sock.ev.on("connection.update", async ({ connection }) => {
        if (connection === "open") {
          await delay(3000);
          await sock.ws.close();
          removeDir(sessionDir);
        }
      });
    }
  } catch (e) {
    console.error("Pair error", e);
    removeDir(sessionDir);
    res.json({ code: "Service Unavailable" });
  }
});

module.exports = router;
