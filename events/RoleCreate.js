const { AuditLogEvent, EmbedBuilder } = require("discord.js");
const config = require("../config");
const Safe = require("../schemas/safe");
const Log = require("../schemas/logchannel");

module.exports = {
  name: "roleCreate",
  async execute(client, role) {
    if (!role.guild) return;

    const audit = await role.guild.fetchAuditLogs({ type: AuditLogEvent.RoleCreate });
    const entry = audit.entries.first();

    if (!entry?.executor || entry.executor.bot) return;

    if (config.owners.includes(entry.executor.id)) return;

    const safe = await Safe.findOne({ guildID: role.guild.id });
    if (safe?.safeUsers.some(u => u.id === entry.executor.id)) return;

    await role.delete().catch(() => {});

    try {
      const member = await role.guild.members.fetch(entry.executor.id);
      if (member.bannable) await member.ban({ reason: "Guard: izinsiz rol oluşturma" });
    } catch {}

    const logData = await Log.findOne({ guildID: role.guild.id });
    if (!logData) return;
    const logChannel = client.channels.cache.get(logData.channelID);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle("🚨 Rol Oluşturma Engellendi")
      .setDescription(`
İzinsiz rol oluşturuldu ve yapan kişi yasaklandı.

Rol: \`${role.name}\` (\`${role.id}\`)
Yapan: <@${entry.executor.id}> \`${entry.executor.tag}\`
Tarih: <t:${Math.floor(Date.now() / 1000)}:F>
      `)
      .setColor("Red")
      .setFooter({ text: "Guard sistemi devrede." })
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  }
};
