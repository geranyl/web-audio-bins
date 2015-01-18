'use strict';

var FT = window.FT || {};

FT.SoundCloud = function () {

    if (!(this instanceof FT.SoundCloud))
        return new FT.SoundCloud();


    var self = this;
    self.sound = {};
    self.streamURL = '';
    self.streamPlaylistIndex = 0;
    self.initialized = false;

    var init = function () {
        SC.initialize({
            client_id: CLIENT_ID
        });
        self.initialized = true;
    };

    self.getTrack = function (trackURL, successCb, failCb) {

        if (!self.initialized) {
            init();
        }

        SC.get('/resolve', {url: trackURL}, function (sound) {
            if (sound.errors) {
                var errorMessage = "";
                for (var i = 0; i < sound.errors.length; i++) {
                    errorMessage += sound.errors[i].error_message + '<br>';
                }
                errorMessage += 'Make sure the URL has the correct format: https://soundcloud.com/user/title-of-the-track';

                console.log(errorMessage);
                failCb(errorMessage);

            } else {

                if (sound.kind == "playlist") {
                    self.sound = sound;
                    self.streamURL = sound.tracks[self.streamPlaylistIndex].stream_url + '?client_id=' + CLIENT_ID;

                    //success
                    successCb(self.streamURL);
                } else {
                    self.sound = sound;
                    self.streamURL = sound.stream_url + '?client_id=' + CLIENT_ID;

                    //success
                    successCb(self.streamURL);
                }

                console.log(self.streamURL)
            }
        });
    }
};

