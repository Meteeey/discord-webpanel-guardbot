const { AuditLogEvent, EmbedBuilder } = require("discord.js");
const config = require("../config");
const Safe = require("../schemas/safe");
const Log = require("../schemas/logchannel");

module.exports = {
  name: "emojiUpdate",
  async execute(client, oldEmoji, newEmoji) {
    if (!newEmoji.guild) return;

    const audit = await newEmoji.guild.fetchAuditLogs({ type: AuditLogEvent.EmojiUpdate });
    const entry = audit.entries.first();

    if (!entry?.executor || entry.executor.bot) return;
    if (config.owners.includes(entry.executor.id)) return;

    const safe = await Safe.findOne({ guildID: newEmoji.guild.id });
    if (safe?.safeUsers.some(u => u.id === entry.executor.id)) return;

    try {
      const member = await newEmoji.guild.members.fetch(entry.executor.id);
      if (member.bannable) await member.ban({ reason: "Guard: izinsiz emoji güncelleme" });
    } catch {}

    const logData = await Log.findOne({ guildID: newEmoji.guild.id });
    if (!logData) return;
    const logChannel = client.channels.cache.get(logData.channelID);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle("🚨 Emoji Güncelleme Engellendi")
      .setDescription(`
Emoji ismi değiştirildi ve yapan kişi banlandı.

Eski: \`${oldEmoji.name}\`
Yeni: \`${newEmoji.name}\`
Yapan: <@${entry.executor.id}> \`${entry.executor.tag}\`
      `)
      .setColor("Red")
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  }
};
