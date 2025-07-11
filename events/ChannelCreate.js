const { AuditLogEvent, EmbedBuilder } = require("discord.js");
const config = require("../config");
const Safe = require("../schemas/safe");
const Log = require("../schemas/logchannel");

module.exports = {
  name: "channelCreate",
  async execute(client, channel) {
    if (!channel.guild) return;

    const audit = await channel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelCreate });
    const entry = audit.entries.first();

    if (!entry?.executor || entry.executor.bot) return;

    if (config.owners.includes(entry.executor.id)) return;

    const safe = await Safe.findOne({ guildID: channel.guild.id });
    if (safe?.safeUsers.some(u => u.id === entry.executor.id)) return;

   
    await channel.delete().catch(() => {});


    try {
      const member = await channel.guild.members.fetch(entry.executor.id);
      if (member.bannable) await member.ban({ reason: "Guard: izinsiz kanal açma" });
    } catch {}


    const logData = await Log.findOne({ guildID: channel.guild.id });
    if (!logData) return;
    const logChannel = client.channels.cache.get(logData.channelID);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle("🚨 Kanal Oluşturma Engellendi")
      .setDescription(`
İzinsiz kanal oluşturuldu ve yapan kişi yasaklandı.

Kanal: \`${channel.name}\` (\`${channel.id}\`)
Yapan: <@${entry.executor.id}> \`${entry.executor.tag}\`
Tarih: <t:${Math.floor(Date.now() / 1000)}:F>
      `)
      .setColor("Red")
      .setFooter({ text: "Guard sistemi devrede." })
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  }
};
