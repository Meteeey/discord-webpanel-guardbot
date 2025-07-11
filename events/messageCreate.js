const config = require("../config");
const { EmbedBuilder } = require("discord.js");
const CustomCommand = require("../schemas/customCommand");

module.exports = {
  name: "messageCreate",
  async execute(client, message) {
    if (!message.guild || message.author.bot) return;

    const content = message.content.trim().toLowerCase();


    const özel = await CustomCommand.findOne({
      guildID: message.guild.id,
      command: content
    });

    if (özel) {
      try {
        if (özel.type === 'text') {
          await message.channel.send(özel.response);
        } else if (özel.type === 'image') {
          await message.channel.send({
            content: özel.response || '',
            files: özel.imageUrl ? [özel.imageUrl] : []
          });
        } else if (özel.type === 'embed') {
          const embed = new EmbedBuilder()
            .setDescription(özel.response || 'Mesaj bulunamadı.')
            .setColor(özel.embedColor || '#5865f2')
            .setTimestamp();

          if (özel.embedTitle) embed.setTitle(özel.embedTitle);
          if (özel.embedFooter) embed.setFooter({ text: özel.embedFooter });

          await message.channel.send({ embeds: [embed] });
        }
      } catch (err) {
        console.error("Özel komut gönderilirken hata:", err);
      }

      return; 
    }

    if (!message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).split(/ +/);
    const cmdName = args.shift().toLowerCase();
    const cmd = client.commands.get(cmdName);
    if (!cmd) return;

    try {
      await cmd.execute(client, message, args);
    } catch (e) {
      console.error(e);
      message.reply("Komut çalıştırılamadı!");
    }
  }
};
