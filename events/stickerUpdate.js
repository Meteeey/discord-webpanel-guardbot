module.exports = {
  name: "stickerUpdate",
  async execute(client, oldSticker, newSticker) {
    const audit = await newSticker.guild.fetchAuditLogs({ type: AuditLogEvent.StickerUpdate });
    const entry = audit.entries.first();
    if (!entry || !entry.executor || entry.executor.bot) return;

    if (config.owners.includes(entry.executor.id)) return;
    const safe = await Safe.findOne({ guildID: newSticker.guild.id });
    if (safe?.safeUsers.some(u => u.id === entry.executor.id)) return;

    const logData = await Log.findOne({ guildID: newSticker.guild.id });
    if (!logData) return;
    const logChannel = client.channels.cache.get(logData.channelID);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle("✏️ Sticker Güncellendi")
      .setDescription(`Sticker: \`${oldSticker.name}\` ➜ \`${newSticker.name}\`
Yapan: <@${entry.executor.id}>`)
      .setColor("Orange")
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  }
};
