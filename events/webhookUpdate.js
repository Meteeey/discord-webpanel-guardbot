module.exports = {
  name: "webhookUpdate",
  async execute(client, channel) {
    const audit = await channel.guild.fetchAuditLogs({ type: AuditLogEvent.WebhookUpdate });
    const entry = audit.entries.first();
    if (!entry || !entry.executor || entry.executor.bot) return;

    if (config.owners.includes(entry.executor.id)) return;
    const safe = await Safe.findOne({ guildID: channel.guild.id });
    if (safe?.safeUsers.some(u => u.id === entry.executor.id)) return;

    const logData = await Log.findOne({ guildID: channel.guild.id });
    if (!logData) return;
    const logChannel = client.channels.cache.get(logData.channelID);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle("🛠️ Webhook Güncellemesi")
      .setDescription(`Bir webhook oluşturuldu veya değiştirildi.
Kanal: <#${channel.id}>
Yapan: <@${entry.executor.id}>`)
      .setColor("Purple")
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  }
};
