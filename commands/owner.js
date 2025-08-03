const { cmd } = require("../command");
cmd({
  pattern: "owner",
  desc: "Owner contact"
}, async (sock, msg) => {
  await sock.sendMessage(msg.key.remoteJid, { text: "👤 Owner: wa.me/783314361" });
});
