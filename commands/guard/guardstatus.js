const { EmbedBuilder } = require('discord.js');
const Safe = require('../../schemas/safe');
const Log = require('../../schemas/logchannel');
const config = require("../../config");

module.exports = {
  name: "guardstatus",
  description: "Sunucu güvenlik durumu ve guard özet raporu.",
  aliases: ["güvenlikraporu", "guardraporu"],

  async execute(client, message, args) {
    if (!config.owners.includes(message.author.id))
      return message.reply("🚫 Bu komutu sadece bot sahibi kullanabilir.");

    const data = await Safe.findOne({ guildID: message.guild.id }) || {};
    const logData = await Log.findOne({ guildID: message.guild.id }) || {};

    const guardDurum = data.guardEnabled ? "🟢 Aktif" : "🔴 Pasif";
    const logKanal = logData?.channelID ? `<#${logData.channelID}>` : "❌ Ayarlanmamış";
    const safeCount = data.safeUsers ? data.safeUsers.length : 0;
    const bannedCount = data.bannedCount || 0;

    const embed = new EmbedBuilder()
      .setTitle(`🛡️ ${message.guild.name} - Güvenlik Durumu`)
      .setDescription("Sunucunun güvenlik paneli durumu aşağıda listelenmiştir.")
      .addFields(
        { name: "Guard Durumu", value: guardDurum, inline: true },
        { name: "Log Kanalı", value: logKanal, inline: true },
        { name: "Safe Kullanıcı Sayısı", value: `👤 ${safeCount} kişi`, inline: true },
        { name: "Engellenen İşlemler", value: `🚫 ${bannedCount} işlem`, inline: true }
      )
      .setColor(data.guardEnabled ? "Green" : "Red")
      .setFooter({ text: " Metehan Studio AİLESİ  - Guard Sistemi" })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
};

///  Metehan Studio AİLESİ 
///  Metehan Studio AİLESİ 
///  Metehan Studio AİLESİ 
///  Metehan Studio AİLESİ 