const express = require('express'),
      ratelimit = require('express-rate-limit'),
      router = express.Router(),
      jwt = require('jsonwebtoken'),
      axios = require('axios'),
      nethergames = axios.create({
        baseURL: 'https://apiv2.nethergames.org/'
      }),
      Discord = require('discord.js');

const checkMethod = (methods) => {
  return (req, res, next) => {
    if (!methods.includes(req.method)) {
      const err = new Error('Not found');
      err.code = 405;
      err.message = 'Method not allowed';
      return next(err);
    }
    return next();
  }
}

const fetchStats = async (username, game) => {
  const { data: { name, extra } } = await nethergames.get(`/players/${username}/stats`);
  let wins, losses;
  if (game === 'bwSolo') {
    wins = extra.bwSoloWins;
    losses = extra.bwSoloDeaths;
  } else {
    wins = extra[`${game}Wins`];
    losses = extra[`${game}Losses`];
  }
  if (!wins || typeof wins !== 'number') wins = 0;
  if (!losses || typeof losses !== 'number') losses = 0;
  return { username, wins, losses };
}

const winstreakChannels = {
  bwSolo: '832295716830314637',
  sw: '832295747269427261',
  tb: '832295804369764403',
  ctf: '832295841347272744'
}

router.all('/games', checkMethod(['GET']), (req, res) => {
  res.json({
    status: 'success',
    games: {
      // bb: 'Build Battle',
      // bh: 'BlockHunt',
      // br: 'Battle Royale',
      bwSolo: 'Bedwars (Solos)',
      // ctf: 'Capture The Flag',
      duels: 'Duels',
      // mm: 'Murder Mystery',
      // ms: 'Momma Says',
      // rc: 'Races',
      // sc: 'Soccer',
      // sg: 'Survival Games',
      sw: 'Skywars',
      tb: 'The Bridge',
      // tr: 'TR?'
    }
  });
});

router.all('/track/:username', checkMethod(['POST']), async (req, res, next) => {
  const { username } = req.params;
  const { game } = req.body;
  if (!username || !game) {
    const error = new Error('Bad request');
    error.code = 400;
    error.message = 'Bad request';
    return next(error);
  }
  const { username: name, wins, losses } = await fetchStats(username, game);
  const jwtPayload = { username: name, wins, losses, game };
  res.json({ status: 'success', token: jwt.sign(jwtPayload, process.env.JWT_SECRET), username: name, game });
});
// Register routes which require client; passed through using a function
module.exports = (client) => {
  client.ready = false;

  client.on('ready', () => {
    client.ready = true;
    const statuses = [
      ['block game', { type: 'PLAYING' }],
      ['Jayvim\'s YouTube videos', { type: 'PLAYING' }],
      ['Chr7st flex', { type: 'LISTENING' }],
      ['Cherexxy crying', { type: 'LISTENING' }],
      ['Mo8rty\'s boring livestreams', { type: 'WATCHING' }],
      ['PiggyPlex walk off', { type: 'WATCHING' }],
      ['CloudySheets die', { type: 'WATCHING' }],
      ['a boring GVG', { type: 'COMPETING' }]
    ];
    let statusCounter = 0;
    client.user.setActivity(...statuses[statusCounter]);
    setInterval(() => {
      statusCounter++;
      // >= as arrays start from index 0
      if (statusCounter >= statuses.length) statusCounter = 0;
      client.user.setActivity(...statuses[statusCounter]);
    }, 20 * 1000);
    console.log(`🔥 Bot started, as ${client.user.tag}`);
  });

  client.login(process.env.DISCORD_TOKEN);

  router.get('/ready', (req, res) => {
    return res.json({
      status: success,
      ready: client.ready
    });
  });

  router.all('/winstreaks/:token', checkMethod(['GET']), ratelimit({
    windowMs: 5 * 60 * 1000,
    max: 1,
    handler: (req, res, next) => {
      const error = new Error('Too many requests');
      error.code = 429;
      error.message = 'Too many requests';
      return next(error);
    }
  }), async (req, res, next) => {
    try {
      const { username, game, wins: initialWins, losses: initialLosses } = jwt.verify(req.params.token, process.env.JWT_SECRET);
      const { wins, losses } = await fetchStats(username, game);
      if (losses - initialLosses > 0) return res.json({
        status: 'success',
        valid: false
      });
      const winstreak = wins - initialWins;
      res.json({
        status: 'success',
        valid: true,
        username,
        winstreak,
        wins,
        losses
      });
      try {
        const channelID = winstreakChannels[game];
        if (!channelID) return;
        const channel = await client.channels.fetch(channelID);
        if (!channel) return;
        const msg = await channel.send(
          new Discord.MessageEmbed()
          .addField('Player', `\`${username}\``, true)
          .addField('Winstreak', `\`${winstreak} wins\``, true)
          .setColor('#2f3136')
          .setFooter('Verified Winstreak')
          .setTimestamp()
        );
        msg.react('🎉');
      } catch (err) { console.error('❌ Discord error while posting WS', err) }
    } catch (err) {
      const error = new Error('Not found');
      error.code = 404;
      error.message = 'Not found';
      console.error(err);
      next(error);
    }
  });

  return router;
};
