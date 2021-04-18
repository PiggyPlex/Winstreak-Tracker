"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var express = require('express'),
    ratelimit = require('express-rate-limit'),
    router = express.Router(),
    jwt = require('jsonwebtoken'),
    axios = require('axios'),
    nethergames = axios.create({
  baseURL: 'https://apiv2.nethergames.org/'
}),
    Discord = require('discord.js');

var checkMethod = function checkMethod(methods) {
  return function (req, res, next) {
    if (!methods.includes(req.method)) {
      var err = new Error('Not found');
      err.code = 405;
      err.message = 'Method not allowed';
      return next(err);
    }

    return next();
  };
};

var fetchStats = function fetchStats(username, game) {
  var _ref, _ref$data, name, extra, wins, losses;

  return regeneratorRuntime.async(function fetchStats$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(nethergames.get("/players/".concat(username, "/stats")));

        case 2:
          _ref = _context.sent;
          _ref$data = _ref.data;
          name = _ref$data.name;
          extra = _ref$data.extra;

          if (game === 'bwSolo') {
            wins = extra.bwSoloWins;
            losses = extra.bwSoloDeaths;
          } else {
            wins = extra["".concat(game, "Wins")];
            losses = extra["".concat(game, "Losses")];
          }

          if (!wins || typeof wins !== 'number') wins = 0;
          if (!losses || typeof losses !== 'number') losses = 0;
          return _context.abrupt("return", {
            username: username,
            wins: wins,
            losses: losses
          });

        case 10:
        case "end":
          return _context.stop();
      }
    }
  });
};

var winstreakChannels = {
  bwSolo: '832295716830314637',
  sw: '832295747269427261',
  tb: '832295804369764403',
  ctf: '832295841347272744'
};
router.all('/games', checkMethod('GET'), function (req, res) {
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
      tb: 'The Bridge' // tr: 'TR?'

    }
  });
});
router.all('/track/:username', checkMethod(['POST']), function _callee(req, res, next) {
  var username, game, error, _ref2, name, wins, losses, jwtPayload;

  return regeneratorRuntime.async(function _callee$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          username = req.params.username;
          game = req.body.game;

          if (!(!username || !game)) {
            _context2.next = 7;
            break;
          }

          error = new Error('Bad request');
          error.code = 400;
          error.message = 'Bad request';
          return _context2.abrupt("return", next(error));

        case 7:
          _context2.next = 9;
          return regeneratorRuntime.awrap(fetchStats(username, game));

        case 9:
          _ref2 = _context2.sent;
          name = _ref2.username;
          wins = _ref2.wins;
          losses = _ref2.losses;
          jwtPayload = {
            username: name,
            wins: wins,
            losses: losses,
            game: game
          };
          res.json({
            status: 'success',
            token: jwt.sign(jwtPayload, process.env.JWT_SECRET),
            username: name,
            game: game
          });

        case 15:
        case "end":
          return _context2.stop();
      }
    }
  });
});

module.exports = function (client) {
  client.ready = false;
  client.on('ready', function () {
    var _client$user;

    client.ready = true;
    var statuses = [['block game', {
      type: 'PLAYING'
    }], ['Jayvim\'s YouTube videos', {
      type: 'PLAYING'
    }], ['Chr7st flex', {
      type: 'LISTENING'
    }], ['Cherexxy crying', {
      type: 'LISTENING'
    }], ['Mo8rty\'s boring livestreams', {
      type: 'WATCHING'
    }], ['PiggyPlex walk off', {
      type: 'WATCHING'
    }], ['CloudySheets die', {
      type: 'WATCHING'
    }], ['a boring GVG', {
      type: 'COMPETING'
    }]];
    var statusCounter = 0;

    (_client$user = client.user).setActivity.apply(_client$user, _toConsumableArray(statuses[statusCounter]));

    setInterval(function () {
      var _client$user2;

      statusCounter++; // >= as arrays start from index 0

      if (statusCounter >= statuses.length) statusCounter = 0;

      (_client$user2 = client.user).setActivity.apply(_client$user2, _toConsumableArray(statuses[statusCounter]));
    }, 20 * 1000);
    console.log("\uD83D\uDD25 Bot started, as ".concat(client.user.tag));
  });
  client.login(process.env.DISCORD_TOKEN);
  router.get('/ready', function (req, res) {
    return res.json({
      status: success,
      ready: client.ready
    });
  });
  router.all('/winstreaks/:token', checkMethod('GET'), ratelimit({
    windowMs: 5 * 60 * 1000,
    max: 1,
    handler: function handler(req, res, next) {
      var error = new Error('Too many requests');
      error.code = 429;
      error.message = 'Too many requests';
      return next(error);
    }
  }), function _callee2(req, res, next) {
    var _jwt$verify, username, game, initialWins, initialLosses, _ref3, wins, losses, winstreak, channelID, channel, msg, error;

    return regeneratorRuntime.async(function _callee2$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            _jwt$verify = jwt.verify(req.params.token, process.env.JWT_SECRET), username = _jwt$verify.username, game = _jwt$verify.game, initialWins = _jwt$verify.wins, initialLosses = _jwt$verify.losses;
            _context3.next = 4;
            return regeneratorRuntime.awrap(fetchStats(username, game));

          case 4:
            _ref3 = _context3.sent;
            wins = _ref3.wins;
            losses = _ref3.losses;

            if (!(losses - initialLosses > 0)) {
              _context3.next = 9;
              break;
            }

            return _context3.abrupt("return", res.json({
              status: 'success',
              valid: false
            }));

          case 9:
            winstreak = wins - initialWins;
            res.json({
              status: 'success',
              valid: true,
              username: username,
              winstreak: winstreak,
              wins: wins,
              losses: losses
            });
            _context3.prev = 11;
            channelID = winstreakChannels[game];

            if (channelID) {
              _context3.next = 15;
              break;
            }

            return _context3.abrupt("return");

          case 15:
            _context3.next = 17;
            return regeneratorRuntime.awrap(client.channels.fetch(channelID));

          case 17:
            channel = _context3.sent;

            if (channel) {
              _context3.next = 20;
              break;
            }

            return _context3.abrupt("return");

          case 20:
            _context3.next = 22;
            return regeneratorRuntime.awrap(channel.send(new Discord.MessageEmbed().addField('Player', "`".concat(username, "`"), true).addField('Winstreak', "`".concat(winstreak, " wins`"), true).setColor('#2f3136').setFooter('Verified Winstreak').setTimestamp()));

          case 22:
            msg = _context3.sent;
            msg.react('🎉');
            _context3.next = 29;
            break;

          case 26:
            _context3.prev = 26;
            _context3.t0 = _context3["catch"](11);
            console.error('❌ Discord error while posting WS', _context3.t0);

          case 29:
            _context3.next = 38;
            break;

          case 31:
            _context3.prev = 31;
            _context3.t1 = _context3["catch"](0);
            error = new Error('Not found');
            error.code = 404;
            error.message = 'Not found';
            console.error(_context3.t1);
            next(error);

          case 38:
          case "end":
            return _context3.stop();
        }
      }
    }, null, null, [[0, 31], [11, 26]]);
  });
  return router;
};