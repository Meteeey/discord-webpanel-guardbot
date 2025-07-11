const { AuditLogEvent, EmbedBuilder, ChannelType, PermissionFlagsBits } = require("discord.js");
const panelSchema = require("../schemas/Panel"); // senin panel ayarların
const Safe = require("../schemas/safe");
const Log = require("../schemas/logchannel");
const config = require("../config");

module.exports = {
  name: "channelDelete",
  async execute(client, channel) {
    if (!channel.guild) return;

    const panel = await panelSchema.findOne({ guildID: channel.guild.id });
    if (!panel?.kanalKoruma) return;

    const audit = await channel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelDelete });
    const entry = audit.entries.first();

    if (!entry || !entry.executor || entry.executor.bot) return;

    if (config.owners.includes(entry.executor.id)) return;
    const safe = await Safe.findOne({ guildID: channel.guild.id });
    if (safe?.safeUsers.some(u => u.id === entry.executor.id)) return;


    try {
      const member = await channel.guild.members.fetch(entry.executor.id);
      if (member.bannable) await member.ban({ reason: "İzinsiz kanal silme" });
    } catch {}

 
    try {
      let newChannel;
      if (channel.type === ChannelType.GuildText) {
        newChannel = await channel.guild.channels.create({
          name: channel.name,
          type: ChannelType.GuildText,
          topic: channel.topic || null,
          nsfw: channel.nsfw || false,
          rateLimitPerUser: channel.rateLimitPerUser || 0,
          parent: channel.parentId || null,
          permissionOverwrites: channel.permissionOverwrites.cache.map(po => ({
            id: po.id,
            allow: po.allow.bitfield,
            deny: po.deny.bitfield,
            type: po.type,
          })),
          position: channel.position,
          reason: "Silinen kanal geri oluşturuldu (guard sistemi)",
        });
      } else if (channel.type === ChannelType.GuildVoice) {
        newChannel = await channel.guild.channels.create({
          name: channel.name,
          type: ChannelType.GuildVoice,
          bitrate: channel.bitrate || 64000,
          userLimit: channel.userLimit || 0,
          parent: channel.parentId || null,
          permissionOverwrites: channel.permissionOverwrites.cache.map(po => ({
            id: po.id,
            allow: po.allow.bitfield,
            deny: po.deny.bitfield,
            type: po.type,
          })),
          position: channel.position,
          reason: "Silinen kanal geri oluşturuldu (guard sistemi)",
        });
      } else if (channel.type === ChannelType.GuildCategory) {
        newChannel = await channel.guild.channels.create({
          name: channel.name,
          type: ChannelType.GuildCategory,
          permissionOverwrites: channel.permissionOverwrites.cache.map(po => ({
            id: po.id,
            allow: po.allow.bitfield,
            deny: po.deny.bitfield,
            type: po.type,
          })),
          position: channel.position,
          reason: "Silinen kategori geri oluşturuldu (guard sistemi)",
        });
      } else {
    
      }
    } catch (err) {
      console.error("Kanal geri oluşturulamadı:", err);
    }


    const logData = await Log.findOne({ guildID: channel.guild.id });
    if (!logData) return;
    const logChannel = client.channels.cache.get(logData.channelID);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle("📁 Kanal Silindi")
      .setDescription(`
Bir kanal silindi ve yapan kişi yasaklandı.
Kanal: \`${channel.name}\` (\`${channel.id}\`)
Yapan: <@${entry.executor.id}> \`${entry.executor.tag}\`
Tarih: <t:${Math.floor(Date.now() / 1000)}:F>
Kanal otomatik olarak geri oluşturuldu.
      `)
      .setColor("Red")
      .setFooter({ text: "Guard sistemi devrede." })
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  }
};
