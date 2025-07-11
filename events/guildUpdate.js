const { AuditLogEvent, EmbedBuilder } = require("discord.js");
const config = require("../config");
const Safe = require("../schemas/safe");
const Log = require("../schemas/logchannel");

module.exports = {
  name: "guildUpdate",
  async execute(client, oldGuild, newGuild) {
    const audit = await newGuild.fetchAuditLogs({ type: AuditLogEvent.GuildUpdate });
    const entry = audit.entries.first();
    if (!entry || !entry.executor || entry.executor.bot) return;

    if (config.owners.includes(entry.executor.id)) return;
    const safe = await Safe.findOne({ guildID: newGuild.id });
    if (safe?.safeUsers.some(u => u.id === entry.executor.id)) return;

    const logData = await Log.findOne({ guildID: newGuild.id });
    if (!logData) return;
    const logChannel = client.channels.cache.get(logData.channelID);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle("⚙️ Sunucu Güncellendi")
      .setDescription(`Sunucu ayarları değiştirildi.
Değiştiren: <@${entry.executor.id}> \`${entry.executor.tag}\`
Zaman: <t:${Math.floor(Date.now() / 1000)}:F>`)
      .setColor("Orange")
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  }
};
