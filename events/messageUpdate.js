const { EmbedBuilder } = require("discord.js");
const Log = require("../schemas/logchannel");

module.exports = {
  name: "messageUpdate",
  async execute(client, oldMessage, newMessage) {
    if (!oldMessage.guild || oldMessage.author?.bot || oldMessage.content === newMessage.content) return;

    const logData = await Log.findOne({ guildID: oldMessage.guild.id });
    if (!logData) return;

    const logChannel = client.channels.cache.get(logData.channelID);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle("✏️ Mesaj Düzenlendi")
      .setDescription(`
Kanal: <#${oldMessage.channel.id}>
Yazan: <@${oldMessage.author.id}> \`${oldMessage.author.tag}\`

**Eski:** \`${oldMessage.content || "Yok"}\`
**Yeni:** \`${newMessage.content || "Yok"}\`
      `)
      .setColor("Yellow")
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  }
};
