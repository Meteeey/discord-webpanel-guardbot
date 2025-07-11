module.exports = {
  name: "stickerDelete",
  async execute(client, sticker) {
    const audit = await sticker.guild.fetchAuditLogs({ type: AuditLogEvent.StickerDelete });
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
      .setTitle("❌ Sticker Silindi")
      .setDescription(`Silinen sticker adı: \`${sticker.name}\`
Silen: <@${entry.executor.id}>`)
      .setColor("Red")
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  }
};
