module.exports = {
  name: "guildMemberAdd",
  async execute(client, member) {
    if (!member.guild) return;

    if (member.user.bot) {
      const audit = await member.guild.fetchAuditLogs({ type: AuditLogEvent.BotAdd });
      const entry = audit.entries.first();

      if (!entry || !entry.executor || entry.executor.bot) return;

      const safe = await Safe.findOne({ guildID: member.guild.id });
      if (safe?.safeUsers.some(u => u.id === entry.executor.id)) return;
      if (config.owners.includes(entry.executor.id)) return;

      try {
        await member.kick("Guard: izinsiz bot eklendi.");
        const owner = await member.guild.members.fetch(entry.executor.id);
        if (owner.bannable) await owner.ban({ reason: "Guard: Sunucuya izinsiz bot ekledi" });
      } catch {}

      const logData = await Log.findOne({ guildID: member.guild.id });
      if (!logData) return;
      const logChannel = client.channels.cache.get(logData.channelID);
      if (!logChannel) return;

      const embed = new EmbedBuilder()
        .setTitle("🚨 Bot Eklendi & Yasaklandı")
        .setDescription(`Sunucuya bot eklendi ve engellendi.
Bot: <@${member.id}>
Ekleyen: <@${entry.executor.id}>`)
        .setColor("Red")
        .setTimestamp();

      logChannel.send({ embeds: [embed] });
    }
  }
};
