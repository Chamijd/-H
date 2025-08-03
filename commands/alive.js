const { cmd } = require("../command");
cmd({
  pattern: "alive",
  desc: "Check bot status"
}, async (sock, msg) => {
  await sock.sendMessage(msg.key.remoteJid, { text: "✅ ඔබේ CHAMA MD බොට් එක සජිවයි!" });
});
