const commands = [];
function cmd(conf, run) {
  commands.push({ pattern: conf.pattern, desc: conf.desc, run });
}
module.exports = { cmd, commands };
