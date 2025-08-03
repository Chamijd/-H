const { cmd } = require("../command");
cmd({
  pattern: "menu",
  desc: "Show menu"
}, async (sock, msg) => {
  await sock.sendMessage(msg.key.remoteJid, {
    text: "📜 මෙන්න Menu:\n.alive ‑ check status\n.menu ‑ show menu\n.owner ‑ owner info"
  });
});
