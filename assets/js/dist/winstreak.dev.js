"use strict";

(function () {
  try {
    var parts = token.split('.');
    if (!parts[1]) return window.location.href = '/clear';
    var payload = JSON.parse(atob(parts[1]));
    $('.username').text(payload.username);
    $.get('/api/games', function (_ref) {
      var games = _ref.games;
      $('.game').text(games[payload.game]);
    });
    $.get("https://apiv2.nethergames.org/players/".concat(payload.username, "/stats")).done(function (_ref2) {
      var wins = _ref2.wins,
          bio = _ref2.bio,
          kills = _ref2.kills,
          deaths = _ref2.deaths,
          lastJoin = _ref2.lastJoin,
          firstJoin = _ref2.firstJoin,
          level = _ref2.level,
          lastServer = _ref2.lastServer,
          rankColors = _ref2.rankColors,
          ranks = _ref2.ranks,
          xp = _ref2.xp,
          statusCredits = _ref2.statusCredits,
          tier = _ref2.tier,
          voted = _ref2.voted,
          extra = _ref2.extra;
      var gameWins, gameLosses;

      if (payload.game === 'bwSolo') {
        gameWins = extra.bwSoloWins;
        gameLosses = extra.bwSoloDeaths;
      } else {
        gameWins = extra["".concat(payload.game, "Wins")];
        gameLosses = extra["".concat(payload.game, "Losses")];
      }

      gameWins = gameWins && typeof gameWins === 'number' ? gameWins : 0;
      gameLosses = gameLosses && typeof gameLosses === 'number' ? gameLosses : 0;
      console.log(gameLosses, payload.losses);

      if (gameLosses - payload.losses > 0) {
        // User has lost their winstreak!
        confirm('This player has lost their winstreak!');
        window.location.href = '/winstreaks';
        return;
      }

      ;
      $('.winstreak').text("".concat(gameWins - payload.wins, " wins"));
      $('.game-wins').text("".concat(gameWins, " wins"));
      $('.game-losses').text("".concat(gameLosses, " losses"));
      $('.wins').text("".concat(wins, " wins"));
      $('.kdr').text("".concat(Math.round(kills / deaths * 10) / 10, " KDR (").concat(kills, ":").concat(deaths, ")"));
    }).fail(function (err) {
      alert('Something went wrong whilst querying the NetherGames API.');
      console.trace(err);
    });
  } catch (err) {
    console.trace(err);
  }
})();

var copyWinstreakLink = function copyWinstreakLink() {
  $('.winstreak-link').select();
  document.execCommand('copy');
};

$(document).on('click', '.verify-btn', function (e) {
  var $el = $(e.currentTarget);
  $.get("/api/winstreaks/".concat(token)).done(function (res) {
    alert('Your winstreak has been verified.\nNote there is a 5 minute cooldown between verifying winstreaks.\n\nMake sure you\'re in our Discord server to see your winstreak.');
  }).fail(function (err) {
    console.error(err);
    alert('Your winstreak could not be verified.\nThis could be because you must wait 5 minutes between verify attempts.\n\nPlease let us know in our Discord server.');
  });
  $el.attr('disabled', true);
});