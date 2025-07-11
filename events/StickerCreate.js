module.exports = {
  name: "stickerCreate",
  async execute(client, sticker) {
    const audit = await sticker.guild.fetchAuditLogs({ type: AuditLogEvent.StickerCreate });
    const entry = audit.entries.first();
    if (!entry || !entry.executor || entry.executor.bot) return;

    if (config.owners.includes(entry.executor.id)) return;
    const safe = await Safe.findOne({ guildID: sticker.guild.id });
    if (safe?.safeUsers.some(u => u.id === entry.executor.id)) return;

    const logData = await Log.findOne({ guildID: sticker.guild.id });
    if (!logData) return;
    const logChannel = client.channels.cache.get(logData.channelID);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle("🆕 Yeni Sticker Eklendi")
      .setDescription(`Sticker adı: \`${sticker.name}\`
Ekleyen: <@${entry.executor.id}>`)
      .setColor("Green")
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  }
};
