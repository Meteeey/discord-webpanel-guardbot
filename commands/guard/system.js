const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const conf = require("../../config");
const panelSchema = require("../../schemas/Panel");

module.exports = {
  name: "sistem",
  aliases: ["sistem"],
  execute: async (client, message) => {
    if (!conf.owners.includes(message.author.id)) return;

    let data = await panelSchema.findOne({ guildID: message.guild.id });
    if (!data) data = await panelSchema.create({ guildID: message.guild.id });

    const embed = new EmbedBuilder()
      .setAuthor({ name: `${message.guild.name} - Guard Sistem Paneli`, iconURL: message.guild.iconURL({ dynamic: true }) })
      .setColor("Blurple")
      .setDescription(`
🛡️ **Guard Sistem Durumları**

📁 Kanal Koruma: ${data.kanalKoruma ? "🟢 Aktif" : "🔴 Kapalı"}
🧩 Rol Koruma: ${data.rolKoruma ? "🟢 Aktif" : "🔴 Kapalı"}
😃 Emoji Koruma: ${data.emojiKoruma ? "🟢 Aktif" : "🔴 Kapalı"}
🔨 Ban/Kick Koruma: ${data.banKickKoruma ? "🟢 Aktif" : "🔴 Kapalı"}
    `)
      .setFooter({ text: "Guard sistemini buradan yönetebilirsin." });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("kanal").setLabel("Kanal").setEmoji("📁").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("rol").setLabel("Rol").setEmoji("🧩").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("emoji").setLabel("Emoji").setEmoji("😃").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("banKick").setLabel("Ban/Kick").setEmoji("🔨").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("yenile").setLabel("Yenile").setEmoji("♻️").setStyle(ButtonStyle.Secondary),
    );

    const msg = await message.reply({ embeds: [embed], components: [row] });

    const filter = (i) => i.user.id === message.author.id;
    const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

    collector.on("collect", async (i) => {
      await i.deferUpdate();
      let updated = false;

      if (i.customId === "kanal") { data.kanalKoruma = !data.kanalKoruma; updated = true; }
      if (i.customId === "rol") { data.rolKoruma = !data.rolKoruma; updated = true; }
      if (i.customId === "emoji") { data.emojiKoruma = !data.emojiKoruma; updated = true; }
      if (i.customId === "banKick") { data.banKickKoruma = !data.banKickKoruma; updated = true; }

      if (updated) {
        await data.save();
        client.channels.cache.get(conf.guardLogChannel)?.send({
          embeds: [
            new EmbedBuilder()
              .setTitle("🛡️ Guard Sistemi Güncellendi")
              .setDescription(`**${i.customId} koruması** artık: ${data[i.customId + "Koruma"] ? "🟢 Aktif" : "🔴 Kapalı"}`)
              .setColor(data[i.customId + "Koruma"] ? "Green" : "Red")
              .setTimestamp()
          ]
        });
      }

      if (i.customId === "yenile" || updated) {
        embed.setDescription(`
📁 Kanal Koruma: ${data.kanalKoruma ? "🟢 Aktif" : "🔴 Kapalı"}
🧩 Rol Koruma: ${data.rolKoruma ? "🟢 Aktif" : "🔴 Kapalı"}
😃 Emoji Koruma: ${data.emojiKoruma ? "🟢 Aktif" : "🔴 Kapalı"}
🔨 Ban/Kick Koruma: ${data.banKickKoruma ? "🟢 Aktif" : "🔴 Kapalı"}
        `);
        await msg.edit({ embeds: [embed], components: [row] });
      }
    });
  }
};
/// DEVCODE AİLESİ /// DEVCODE AİLESİ /// DEVCODE AİLESİ /// DEVCODE AİLESİ /// DEVCODE AİLESİ /// DEVCODE AİLESİ 