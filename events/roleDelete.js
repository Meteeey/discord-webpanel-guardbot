const { AuditLogEvent, EmbedBuilder, PermissionsBitField } = require("discord.js");
const Safe = require("../schemas/safe");
const Log = require("../schemas/logchannel");
const config = require("../config");

module.exports = {
  name: "roleDelete",
  async execute(client, role) {
    if (!role.guild) return;

    const audit = await role.guild.fetchAuditLogs({ type: AuditLogEvent.RoleDelete });
    const entry = audit.entries.first();

    if (!entry || !entry.executor || entry.executor.bot) return;
    if (config.owners.includes(entry.executor.id)) return;

    const safe = await Safe.findOne({ guildID: role.guild.id });
    if (safe?.safeUsers.some(u => u.id === entry.executor.id)) return;


    try {
      const member = await role.guild.members.fetch(entry.executor.id);
      if (member.bannable) await member.ban({ reason: "Guard: izinsiz rol silme" });
    } catch (err) {
      console.error("Banlama başarısız:", err);
    }


    try {
      await role.guild.roles.create({
        name: role.name,
        color: role.color,
        hoist: role.hoist,
        permissions: role.permissions.bitfield ?? PermissionsBitField.Flags.None,
        mentionable: role.mentionable,
        reason: "Silinen rol guard sistemi tarafından tekrar oluşturuldu",
       
      });
    } catch (err) {
      console.error("Rol yeniden oluşturulamadı:", err);
    }


    const logData = await Log.findOne({ guildID: role.guild.id });
    if (!logData) return;
    const logChannel = client.channels.cache.get(logData.channelID);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle("🚨 Rol Silme Engellendi")
      .setDescription(`
İzinsiz rol silindi ve yapan kişi banlandı.

Rol: \`${role.name}\` (\`${role.id}\`)
Yapan: <@${entry.executor.id}> \`${entry.executor.tag}\`
Tarih: <t:${Math.floor(Date.now() / 1000)}:F>
Rol otomatik olarak yeniden oluşturuldu.
      `)
      .setColor("Red")
      .setFooter({ text: "Guard sistemi devrede." })
      .setTimestamp();

    await logChannel.send({ embeds: [embed] });
  }
};
