const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

const tempPasswords = new Map();

function generateTempPassword(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let pass = '';
  for(let i = 0; i < length; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

module.exports = {
  name: "webpanel",
  description: "Web panel giriş butonu ve geçici şifre gönderir.",
  tempPasswords, 

  execute: async (client, message) => {
    if(message.author.bot) return;

    try {
      const password = generateTempPassword();
      const expires = Date.now() + (60 * 1000);
      tempPasswords.set(message.author.id, { password, expires });

      await message.author.send(`Geçici şifreniz: **${password}** (60 saniye geçerlidir)`);

      const button = new ButtonBuilder()
        .setLabel('Guard Paneline Git')
        .setStyle(ButtonStyle.Link)
        .setURL('http://localhost:3000/panel-login');

      const row = new ActionRowBuilder().addComponents(button);

      const embed = new EmbedBuilder()
        .setTitle('Web Panel Girişi')
        .setDescription('Aşağıdaki butona tıklayarak giriş yapın. Şifreniz DM\'nize gönderildi.')
        .setColor('#0099ff');

      await message.channel.send({ embeds: [embed], components: [row] });

    } catch (err) {
      console.error(err);
      message.channel.send('DM gönderilemedi. Lütfen DM kutunuzu kontrol edin.');
    }
  }
};
//  Metehan Studio AİLESİ  Metehan Studio AİLESİ 