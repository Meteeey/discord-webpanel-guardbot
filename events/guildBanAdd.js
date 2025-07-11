module.exports = {
  name: "guildBanAdd",
  async execute(client, ban) {
    const audit = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd });
    const entry = audit.entries.first();
    if (!entry || !entry.executor || entry.executor.bot) return;

    if (config.owners.includes(entry.executor.id)) return;
    const safe = await Safe.findOne({ guildID: ban.guild.id });
    if (safe?.safeUsers.some(u => u.id === entry.executor.id)) return;

    const logData = await Log.findOne({ guildID: ban.guild.id });
    if (!logData) return;
    const logChannel = client.channels.cache.get(logData.channelID);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle("🚫 Üye Yasaklandı")
      .setDescription(`Banlanan: <@${ban.user.id}> \`${ban.user.tag}\`
Yapan: <@${entry.executor.id}>`)
      .setColor("Red")
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  }
};
