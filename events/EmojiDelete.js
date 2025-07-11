const { AuditLogEvent, EmbedBuilder } = require("discord.js");
const config = require("../config");
const Safe = require("../schemas/safe");
const Log = require("../schemas/logchannel");

module.exports = {
  name: "emojiDelete",
  async execute(client, emoji) {
    if (!emoji.guild) return;

    const audit = await emoji.guild.fetchAuditLogs({ type: AuditLogEvent.EmojiDelete });
    const entry = audit.entries.first();

    if (!entry || !entry.executor || entry.executor.bot) return;

    if (config.owners.includes(entry.executor.id)) return;

    const safe = await Safe.findOne({ guildID: emoji.guild.id });
    if (safe?.safeUsers.some(u => u.id === entry.executor.id)) return;

    try {
      const member = await emoji.guild.members.fetch(entry.executor.id);
      if (member.bannable) await member.ban({ reason: "Guard: izinsiz emoji silme" });
    } catch {}

    const logData = await Log.findOne({ guildID: emoji.guild.id });
    if (!logData) return;
    const logChannel = client.channels.cache.get(logData.channelID);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle("🚨 Emoji Silinme Engellendi")
      .setDescription(`
İzinsiz emoji silindi ve yapan kişi yasaklandı.

Emoji: \`:${emoji.name}:\` (\`${emoji.id}\`)
Yapan: <@${entry.executor.id}> \`${entry.executor.tag}\`
Tarih: <t:${Math.floor(Date.now() / 1000)}:F>
      `)
      .setColor("Red")
      .setFooter({ text: "Guard sistemi devrede." })
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  }
};
