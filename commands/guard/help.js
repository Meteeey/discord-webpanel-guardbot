const { EmbedBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
  name: "guardhelp",
  description: "Guard bot komutlarını detaylı ve görsel anlatımlı gösterir.",

  execute: async (client, message) => {
    const embed = new EmbedBuilder()
      .setTitle("🛡️ Guard Bot Komutları")
      .setDescription(`
Guard botun sunduğu özellikleri kullanabilirsin. Aşağıda ana komutlar ve açıklamaları yer almaktadır.

**Komutlar:**

• \`guardpanel\`  
  Guard panelini açar. Butonlarla kolay yönetim sağlar.  
  **Örnek:** \`.guardpanel\`

• \`guardstatus\`  
  Sunucu güvenlik durum raporunu gösterir. Aktiflik, log kanalı, güvenli kullanıcı sayısı ve engellenen işlemler.

• \`safe ekle @üye\`  
  Güvenli kullanıcı ekler. Bu kişiler guard’dan etkilenmez.

• \`safe çıkar @üye\`  
  Güvenli kullanıcıyı çıkarır.

• \`logkanal ayarla #kanal\`  
  Guard loglarının gideceği kanalı ayarlar.

---

**Not:**  
Guard sistemi sadece **güvenli kullanıcılar dışındakileri** engeller. Yetkili olmayan değişiklikleri tespit edip engeller.

`);

    embed.setColor("#0099ff")
      .setFooter({ text: " Metehan Studio AİLESİ   Guard Bot" })
      .setTimestamp()
      .setImage('https://cdn.discordapp.com/attachments/1391718765003276292/1393193821453684847/Ekran_Resmi_2025-07-11_14.34.29.png?ex=6872485b&is=6870f6db&hm=61608392c73fb3b057fb91e6b429e445d24779ff0ba48a15fce4ee8fc28ba8bb&')

        


    await message.reply({ embeds: [embed] });
  }
};
/// Metehan Studio AİLESİ ///  Metehan Studio AİLESİ  ///  Metehan Studio AİLESİ  ///  Metehan Studio AİLESİ 