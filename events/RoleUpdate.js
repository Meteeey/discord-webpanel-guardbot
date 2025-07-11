const { AuditLogEvent, EmbedBuilder } = require("discord.js");
const config = require("../config");
const Safe = require("../schemas/safe");
const Log = require("../schemas/logchannel");

module.exports = {
  name: "roleUpdate",
  async execute(client, oldRole, newRole) {
    const audit = await newRole.guild.fetchAuditLogs({ type: AuditLogEvent.RoleUpdate });
    const entry = audit.entries.first();

    if (!entry?.executor || entry.executor.bot) return;
    if (config.owners.includes(entry.executor.id)) return;

    const safe = await Safe.findOne({ guildID: newRole.guild.id });
    if (safe?.safeUsers.some(u => u.id === entry.executor.id)) return;

    try {
      const member = await newRole.guild.members.fetch(entry.executor.id);
      if (member.bannable) await member.ban({ reason: "Guard: izinsiz rol güncelleme" });
    } catch {}

    const logData = await Log.findOne({ guildID: newRole.guild.id });
    if (!logData) return;
    const logChannel = client.channels.cache.get(logData.channelID);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle("🚨 Rol Güncellendi")
      .setDescription(`
İzinsiz rol güncellemesi yapıldı ve kullanıcı banlandı.

Rol: \`${oldRole.name}\` → \`${newRole.name}\`
Yapan: <@${entry.executor.id}> \`${entry.executor.tag}\`
      `)
      .setColor("Red")
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  }
};
