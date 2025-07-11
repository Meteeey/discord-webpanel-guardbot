const { Client, Collection, GatewayIntentBits } = require("discord.js");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const express = require("express");
const Safe = require('./schemas/safe');
const Log = require('./schemas/logchannel');
const config = require("./config");
const session = require('express-session');
const LogEntry = require('./schemas/logEntry');



const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.commands = new Collection();

fs.readdirSync("./commands").forEach(dir => {
  fs.readdirSync(`./commands/${dir}`)
    .filter(f => f.endsWith(".js"))
    .forEach(f => {
      const cmd = require(`./commands/${dir}/${f}`);
      client.commands.set(cmd.name, cmd);
      (cmd.aliases || []).forEach(a => client.commands.set(a, cmd));
    });
});

fs.readdirSync("./events").filter(file => file.endsWith(".js")).forEach(file => {
  const evt = require(`./events/${file}`);
  if (!evt.name || typeof evt.execute !== "function") return;
  client.on(evt.name, evt.execute.bind(null, client));
});
const activities = [
  { name: 'Muti ❤️ New Guard', type: 0 },
  { name: 'METEHAN Studio ❤️', type: 3 },
  { name: 'Yeni komutlar ekleniyor...', type: 0 },
  { name: 'Sunucunu koruyor 🛡️', type: 5 },
  { name: '.help komutlarıma bak!', type: 2 },
];

let index = 0;

setInterval(() => {
  const activity = activities[index % activities.length];
  client.user.setActivity(activity.name, { type: activity.type });
  index++;
}, 10000);



mongoose.connect(config.mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch(console.error);

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/backups', express.static(path.join(__dirname, 'backups')));
app.use(session({
  secret: 'güçlü-bir-gizli-kelime',
  resave: false,
  saveUninitialized: true
}));
app.get('/panel-login', (req, res) => {
  res.render('login', { error: null });
});


const { tempPasswords } = require('./commands/guard/webpanel');

app.post('/panel-login', (req, res) => {
  const { userId, password } = req.body;
  const temp = tempPasswords.get(userId);

  if (!temp) return res.render('login', { error: 'Geçici şifre bulunamadı veya süresi doldu.' });

  if (temp.password === password && temp.expires > Date.now()) {
    req.session.userId = userId;
    tempPasswords.delete(userId);


    return res.redirect('/');
  } else {
    return res.render('login', { error: 'Şifre yanlış veya süresi dolmuş.' });
  }
});
const Announcement = require('./schemas/Announcement');
app.get('/', async (req, res) => {
  if (!req.session.userId) return res.redirect('/panel-login');
  const showSavedMessage = req.query.saved === '1';

  try {
    const guildID = config.guildID;
    const guild = await client.guilds.fetch(guildID);

    const announcement = await Announcement.findOne({ guildID }) || { channelID: '', message: '' };
    const channels = guild.channels.cache
      .filter(ch => ch.type === 0)
      .map(ch => ({ id: ch.id, name: ch.name }));

    const safeData = await Safe.findOne({ guildID }) || { safeUsers: [], guardEnabled: false };
    const logData = await Log.findOne({ guildID }) || { channelID: null };
    const panel = await Panel.findOne({ guildID }) || await Panel.create({ guildID });

    const botUser = client.user;
    const member = await guild.members.fetch(req.session.userId);

    const currentUser = {
      tag: member.user.tag,
      roles: member.roles.cache.map(r => r.name),
      safe: safeData.safeUsers.some(u => u.id === member.id),
      permissions: member.permissions.toArray()
    };

    const safeUsers = await Promise.all(safeData.safeUsers.map(async u => {
      try {
        const user = await client.users.fetch(u.id);
        return {
          id: u.id,
          tag: user.tag,
          avatar: user.displayAvatarURL({ extension: 'png', size: 64 }),
          addedAt: u.addedAt || new Date()
        };
      } catch {
        return {
          id: u.id,
          tag: 'Bilinmeyen Kullanıcı',
          avatar: 'https://via.placeholder.com/64?text=?',
          addedAt: u.addedAt || new Date()
        };
      }
    }));

    const recentLogs = await LogEntry.find({ guildID })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    const commandCount = await CustomCommand.countDocuments({ guildID });
    const fetchedGuild = await client.guilds.fetch(guildID);

    const guildData = {
      name: fetchedGuild.name,
      iconURL: fetchedGuild.iconURL({ extension: 'png', size: 64 }) || "https://via.placeholder.com/64"
    };

    res.render('index', {
      guardEnabled: safeData.guardEnabled,
      safeUsers,
      logChannelID: logData.channelID,
      backups: fs.existsSync(path.join(__dirname, 'backups')) ? fs.readdirSync(path.join(__dirname, 'backups')).filter(f => f.endsWith('.json')) : [],
      botAvatar: botUser.displayAvatarURL({ extension: 'png', size: 64 }),
      botUsername: botUser.username,
      botId: botUser.id,
      panel,
      currentUser,
      channels,
      recentLogs,
      customCommandCount: commandCount,
      guild: guildData,
      channels,
      announcement,
      saved: req.query.saved === '1',


      user: {
        avatar: member.user.displayAvatarURL({ extension: 'png', size: 64 }),
        username: member.user.username,
        discriminator: member.user.discriminator
      }
    });





  } catch (err) {
    console.error("Anasayfa yüklenemedi:", err);
    if (!res.headersSent) {
      res.status(500).send('Sunucu hatası');
    }
  }
}); const { ChannelType, PermissionsBitField } = require('discord.js');







const CustomCommand = require('./schemas/customCommand');


app.post('/custom-commands', async (req, res) => {
  const {
    command,
    response,
    type,
    imageUrl,
    embedTitle,
    embedColor,
    embedFooter
  } = req.body;

  try {
    await CustomCommand.findOneAndUpdate(
      { guildID: config.guildID, command: command.trim().toLowerCase() },
      {
        response,
        type,
        imageUrl,
        embedTitle,
        embedColor,
        embedFooter
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, message: "Komut başarıyla eklendi!" });
  } catch (err) {
    console.error("Komut eklenirken hata:", err);
    res.status(500).json({ success: false, message: "Komut eklenirken hata oluştu." });
  }
});



app.get('/api/live-stats', async (req, res) => {
  try {
    const guildID = config.guildID;
    const guild = await client.guilds.fetch(guildID);

    const totalMembers = guild.memberCount;


    let bots = 0;
    try {
      const members = await guild.members.fetch({ time: 7000 });
      bots = members.filter(m => m.user.bot).size;
    } catch (err) {

    }

    const humans = totalMembers - bots;


    const voiceChannelMembers = guild.channels.cache
      .filter(ch => ch.type === 2 || ch.type === 13)
      .reduce((acc, ch) => acc + ch.members.size, 0);

    res.json({
      totalMembers,
      bots,
      humans,
      voiceChannelMembers
    });

  } catch (error) {
    console.error('[API] Canlı istatistik hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

app.post('/announcement-settings', async (req, res) => {
  const { channelID, message } = req.body;
  const guildID = config.guildID;

  try {
    const guild = await client.guilds.fetch(guildID);
    const channel = await guild.channels.fetch(channelID);

    if (!channel) return res.status(400).json({ success: false, message: 'Kanal bulunamadı' });

    await Announcement.findOneAndUpdate(
      { guildID },
      { channelID, message, updatedAt: new Date() },
      { upsert: true }
    );

    await channel.send(message);

    return res.json({ success: true, message: 'Duyuru gönderildi' });
  } catch (err) {
    console.error('[Duyuru Hatası]', err);
    return res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});


app.get('/api/safe/list', async (req, res) => {
  try {
    const guildID = config.guildID;
    const safeData = await Safe.findOne({ guildID }) || { safeUsers: [] };

    const safeUsers = await Promise.all(
      safeData.safeUsers.map(async u => {
        try {
          const user = await client.users.fetch(u.id);
          return {
            id: u.id,
            tag: user.tag,
            avatar: user.displayAvatarURL({ extension: 'png', size: 64 }),
            addedAt: u.addedAt || new Date()
          };
        } catch {
          return {
            id: u.id,
            tag: 'Bilinmeyen Kullanıcı',
            avatar: 'https://via.placeholder.com/64?text=?',
            addedAt: u.addedAt || new Date()
          };
        }
      })
    );

    res.json({ success: true, safeUsers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Safe kullanıcılar alınamadı.' });
  }
});



app.post('/api/create-role', async (req, res) => {
  const { name, color, permissions } = req.body;
  if (!name || !color || !permissions) return res.status(400).json({ message: 'Eksik parametre' });

  try {
    const guildID = config.guildID;
    if (!guildID) return res.status(404).json({ message: 'Sunucu bulunamadı' });

    const guild = await client.guilds.fetch(guildID);
    if (!guild) return res.status(404).json({ message: 'Sunucu bulunamadı' });


    const discordPerms = permissions
      .map(p => PermissionsBitField.Flags[p])
      .filter(Boolean);

    if (discordPerms.length === 0) {
      return res.status(400).json({ message: 'Geçerli izin bulunamadı' });
    }

    const newRole = await guild.roles.create({
      name,
      color,
      permissions: discordPerms,
      reason: 'Guard Bot Web Panelinden oluşturuldu'
    });

    res.json({ message: 'Rol oluşturuldu', roleName: newRole.name, roleId: newRole.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Rol oluşturulamadı', error: error.message });
  }
});


app.delete('/api/delete-role/:id', async (req, res) => {
  const roleId = req.params.id;
  const guildID = config.guildID;

  try {
    const guild = await client.guilds.fetch(guildID);
    const role = await guild.roles.fetch(roleId);
    if (!role) return res.status(404).json({ message: 'Rol bulunamadı.' });

    await role.delete('Web panelden silindi.');
    res.json({ message: 'Rol başarıyla silindi.' });
  } catch (error) {
    console.error('Rol silme hatası:', error);
    res.status(500).json({ message: 'Rol silinirken hata oluştu.', error: error.message });
  }
});

app.post('/log-channel-settings', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: "Giriş yapmanız gerekiyor." });
  }

  const { channelID } = req.body;
  const guildID = config.guildID;

  try {
    let logData = await Log.findOne({ guildID });
    if (!logData) {
      logData = new Log({ guildID });
    }

    logData.channelID = channelID || null;
    await logData.save();

    res.json({ success: true, message: "Log kanalı başarıyla ayarlandı!" });
  } catch (err) {
    console.error("Log kanalı ayarlanırken hata:", err);
    res.status(500).json({ success: false, message: "Sunucu hatası." });
  }
});




app.get('/api/roles', async (req, res) => {
  try {
    const guild = await client.guilds.fetch(config.guildID);
    const roles = await guild.roles.fetch();

    const roleList = roles.map(role => ({
      id: role.id,
      name: role.name,
      color: role.hexColor,
      permissions: role.permissions.toArray(),
      position: role.position
    }));

    res.json({ roles: roleList });
  } catch (err) {
    console.error('Roller alınamadı:', err);
    res.status(500).json({ message: 'Roller alınamadı.', error: err.message });
  }
});






app.post('/toggle-guard', async (req, res) => {
  const { state } = req.body;
  const guildID = config.guildID;
  await Safe.updateOne({ guildID }, { $set: { guardEnabled: state === 'enable' } }, { upsert: true });
  res.redirect('/');
});


app.post('/backup', async (req, res) => {
  const guildID = config.guildID;
  const safeData = await Safe.findOne({ guildID }) || {};
  const logData = await Log.findOne({ guildID }) || {};

  const backup = {
    guildID,
    guardEnabled: safeData.guardEnabled || false,
    safeUsers: safeData.safeUsers || [],
    logChannel: logData.channelID || null,
    backupTime: new Date().toISOString()
  };

  const backupsDir = path.join(__dirname, 'backups');
  if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir);

  const fileName = `guard-${guildID}-${Date.now()}.json`;
  const filePath = path.join(backupsDir, fileName);
  fs.writeFileSync(filePath, JSON.stringify(backup, null, 2));

  res.redirect('/');
});


app.post('/api/safe/add', async (req, res) => {
  try {
    const guildID = config.guildID;
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Kullanıcı ID gereklidir' });

    const safeData = await Safe.findOne({ guildID }) || new Safe({ guildID, safeUsers: [], guardEnabled: false });
    if (safeData.safeUsers.some(u => u.id === id)) return res.status(400).json({ error: 'Zaten listede' });

    safeData.safeUsers.push({ id, addedAt: new Date() });
    await safeData.save();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});


app.post('/api/safe/remove', async (req, res) => {
  try {
    const guildID = config.guildID;
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Kullanıcı ID gerekli' });

    const safeData = await Safe.findOne({ guildID });
    if (!safeData) return res.status(404).json({ error: 'Liste bulunamadı' });

    safeData.safeUsers = safeData.safeUsers.filter(u => u.id !== id);
    await safeData.save();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});


app.post('/api/logchannel/set', async (req, res) => {
  try {
    const guildID = config.guildID;
    const { channelID } = req.body;
    if (!channelID) return res.status(400).json({ error: 'Kanal ID gereklidir' });

    await Log.updateOne({ guildID }, { $set: { channelID } }, { upsert: true });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

const Panel = require('./schemas/Panel');

app.get('/api/guard-settings', async (req, res) => {
  const guildID = config.guildID;
  let panel = await Panel.findOne({ guildID });
  if (!panel) panel = await Panel.create({ guildID });
  res.json(panel);
});

app.post('/api/guard-settings', async (req, res) => {
  const { kanalKoruma, rolKoruma, emojiKoruma, banKickKoruma } = req.body;
  const guildID = config.guildID;
  try {
    const updated = await Panel.findOneAndUpdate(
      { guildID },
      { kanalKoruma, rolKoruma, emojiKoruma, banKickKoruma },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: "Güncelleme hatası" });
  }
});





client.login(config.token).then(() => {
  app.listen(PORT, () => {
    console.log(`🌐 Web paneli http://localhost:${PORT} adresinde çalışıyor.`);
  });
});
