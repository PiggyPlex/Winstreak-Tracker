"use strict";

var gamesCallback = function gamesCallback() {
  $.get('/api/games', function (_ref) {
    var games = _ref.games;
    $('.game').each(function () {
      $(this).text(games[$(this).text()]);
    });
  });
};

(function () {
  try {
    var tokens = JSON.parse(localStorage.getItem('@winstreak:tokens'));
    var data = tokens.map(function (token) {
      if (typeof token !== 'string') return;
      var parts = token.split('.');
      if (!parts[1]) return;

      try {
        return {
          token: token,
          payload: JSON.parse(atob(parts[1]))
        };
      } catch (err) {
        console.trace(err);
        return;
      }
    }).filter(function (a) {
      return a;
    });
    if (data.length < 1) return window.location.href = '/start';
    data.forEach(function (_ref2) {
      var payload = _ref2.payload,
          token = _ref2.token;
      var card = $('<a class="card"></a>');
      card.attr('href', "/winstreaks/".concat(token));
      console.log('Fetched', payload);
      card.append($('<p></p>').text(payload.username));
      card.append($('<i class="game"></i>').text(payload.game));
      $('.players-grid').append(card);
    });
    gamesCallback();
  } catch (err) {
    console.trace(err);
    window.location.href = '/clear';
  }
})();