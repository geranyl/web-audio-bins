'use strict';

var FT = window.FT || {};

FT.Player = function () {
    if (!(this instanceof FT.Player))
        return new FT.Player();

    var self = this;
    self.player = null;

    self.init = function (playerDOMObject, onEndCb) {
        self.player = playerDOMObject;
        self.player.addEventListener('ended', function () {
            onEndCb();
        });

    };

    self.play = function (streamURL) {
        self.player.setAttribute('src', streamURL);
        self.player.volume = 0.2;
        self.player.play();
    }
};