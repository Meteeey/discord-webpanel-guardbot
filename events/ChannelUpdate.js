const { AuditLogEvent, EmbedBuilder } = require("discord.js");
const config = require("../config");
const Safe = require("../schemas/safe");
const Log = require("../schemas/logchannel");

module.exports = {
  name: "channelUpdate",
  async execute(client, oldChannel, newChannel) {
    const audit = await newChannel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelUpdate });
    const entry = audit.entries.first();

    if (!entry?.executor || entry.executor.bot) return;
    if (config.owners.includes(entry.executor.id)) return;

    const safe = await Safe.findOne({ guildID: newChannel.guild.id });
    if (safe?.safeUsers.some(u => u.id === entry.executor.id)) return;

    try {
      const member = await newChannel.guild.members.fetch(entry.executor.id);
      if (member.bannable) await member.ban({ reason: "Guard: izinsiz kanal güncelleme" });
    } catch {}

    const logData = await Log.findOne({ guildID: newChannel.guild.id });
    if (!logData) return;
    const logChannel = client.channels.cache.get(logData.channelID);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle("🚨 Kanal Güncellendi")
      .setDescription(`
İzinsiz kanal güncellemesi yapıldı ve kullanıcı banlandı.

Kanal: \`${oldChannel.name}\`
Yapan: <@${entry.executor.id}> \`${entry.executor.tag}\`
      `)
      .setColor("Red")
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  }
};
