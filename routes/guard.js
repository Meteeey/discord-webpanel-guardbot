const express = require('express');
const router = express.Router();
const Safe = require('../schemas/safe');


router.get('/:guildID', async (req, res) => {
  const guildID = req.params.guildID;
  const data = await Safe.findOne({ guildID }) || {};

  res.render('index', {
    guildID,
    guardEnabled: data.guardEnabled || false,
    safeUsers: data.safeUsers || [],
    logChannelID: data.logChannelID || '',
  });
});


router.post('/:guildID/toggle', async (req, res) => {
  const guildID = req.params.guildID;
  const { enable } = req.body;
  await Safe.updateOne(
    { guildID },
    { $set: { guardEnabled: enable === 'true' } },
    { upsert: true }
  );
  res.redirect(`/guard/${guildID}`);
});


router.post('/:guildID/safeuser/add', async (req, res) => {
  const guildID = req.params.guildID;
  const { userID } = req.body;
  const data = await Safe.findOne({ guildID }) || { safeUsers: [] };

  if (!data.safeUsers.find(u => u.id === userID)) {
    data.safeUsers.push({ id: userID, addedAt: new Date() });
    await Safe.updateOne({ guildID }, data, { upsert: true });
  }

  res.redirect(`/guard/${guildID}`);
});


router.post('/:guildID/safeuser/remove', async (req, res) => {
  const guildID = req.params.guildID;
  const { userID } = req.body;
  const data = await Safe.findOne({ guildID }) || { safeUsers: [] };

  data.safeUsers = data.safeUsers.filter(u => u.id !== userID);
  await Safe.updateOne({ guildID }, data, { upsert: true });

  res.redirect(`/guard/${guildID}`);
});


router.post('/:guildID/logchannel', async (req, res) => {
  const guildID = req.params.guildID;
  const { channelID } = req.body;

  await Safe.updateOne(
    { guildID },
    { $set: { logChannelID: channelID } },
    { upsert: true }
  );
  res.redirect(`/guard/${guildID}`);
});

module.exports = router;
