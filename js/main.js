/*global SC*/

//ref: https://github.com/michaelbromley/soundcloud-visualizer/blob/master/js/app.js

'use strict';


var FFT_SIZE = 256; //256, 1024, 2048 (power of 2)

var FT = {};


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
        self.player.play();
    }
};


//https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
FT.FFT = function () {
    if (!(this instanceof FT.FFT))
        return new FT.FFT();


    var self = this;

    self.buckets = null;//low, mid, high

    self.audioCtx = null;
    self.analyzer = null;

    self.init = function (playerDOM) {
        self.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        // Webkit/blink browsers need prefix, Safari won't work without window.
        self.analyzer = self.audioCtx.createAnalyser(); //create an analyzer
        var source = self.audioCtx.createMediaElementSource(playerDOM);//get the source of audio
        source.connect(self.analyzer); //connect the source to the analyzer
        self.analyzer.connect(self.audioCtx.destination); //need to connect all nodes - e.g analyzer - to the context destination to hear audio

        self.analyzer.fftSize = FFT_SIZE;
        self.bufferLength = self.analyzer.frequencyBinCount; // half the FFT value
        self.dataArray = new Uint8Array(self.bufferLength);
    };


    var curBucketIndex = 0;

    var ranges = [];

    self.setBuckets = function (numBuckets) {
        if (numBuckets > self.analyzer.fftSize / 2) {
            throw new Error('buckets cannot exceed half the fftSize');
        }
        //if(ranges.length < numBuckets*2){
        //    throw new Error('you must specify a start and end value for each bucket');
        //}

        self.buckets = Array.apply(null, new Array(numBuckets)).map(Number.prototype.valueOf, 0);
        //console.log(self.buckets)

        for (var i = 0; i < numBuckets - 1; i++) {
            ranges[i] = Math.ceil(self.bufferLength / numBuckets) * (i + 1);
        }
        ranges[numBuckets - 1] = self.bufferLength;

        console.log(ranges, self.bufferLength)

    };


    self.measure = function () {

        self.raf = window.requestAnimationFrame(self.measure);

        self.analyzer.getByteFrequencyData(self.dataArray); //// get waveform data and put it into the dataArray; getByteTimeDomainData will give you the usual sine wave visual

        var accumValue = 0;
        var lastRangeValue = 0;
        for (var i = 0; i < self.bufferLength; i++) {

            //each sample point will be between 0 and 1;
            accumValue += self.dataArray[i];

            if (i + 1 >= ranges[curBucketIndex]) {
                self.buckets[curBucketIndex] = accumValue / 256.0 / (ranges[curBucketIndex] - lastRangeValue);
                lastRangeValue = ranges[curBucketIndex];
                curBucketIndex++;
                accumValue = 0;
                if (curBucketIndex >= self.buckets.length) {
                    curBucketIndex = 0;
                }
            }

        }

    };
};


FT.SampleVisual = function (analyzer, bufferLength, dataArray, buckets) {

    if (!(this instanceof FT.SampleVisual))
        return new FT.SampleVisual(analyzer, bufferLength, dataArray, buckets);


    //temp
    var canvasCtx = document.getElementById('canvas').getContext('2d');
    var WIDTH = 400;
    var HEIGHT = 400;

    var self = this;

    self.analyzer = analyzer;
    self.dataArray = dataArray;
    self.bufferLength = bufferLength;

    this.draw = function () {
        self.raf = requestAnimationFrame(self.draw);


        canvasCtx.fillStyle = 'rgb(200, 200, 200)';
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        canvasCtx.lineWidth = 1;
        canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

        var sliceWidth = WIDTH * 1.0 / buckets.length;
        var x = 0;


        for (var i = 0; i < buckets.length; i++) {
            canvasCtx.fillStyle = 'hsl(' + 360 * (i / buckets.length) + ', 50%, 50%)';
            canvasCtx.fillRect(x, HEIGHT - 10, sliceWidth, -buckets[i] * HEIGHT / 2 - 1);
            x += sliceWidth;
        }

    };

    //this.draw = function () {
    //
    //
    //    requestAnimationFrame(self.draw);
    //
    //    self.analyzer.getByteTimeDomainData(self.dataArray);
    //
    //
    //    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    //    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
    //
    //    canvasCtx.lineWidth = 2;
    //    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
    //
    //    canvasCtx.beginPath();
    //
    //    var sliceWidth = WIDTH * 1.0 / self.bufferLength;
    //    var x = 0;
    //
    //    for (var i = 0; i < self.bufferLength; i++) {
    //        var v = self.dataArray[i] / 128.0;
    //        var y = v * HEIGHT / 2;
    //
    //        if (i === 0) {
    //            canvasCtx.moveTo(x, y);
    //        } else {
    //            canvasCtx.lineTo(x, y);
    //        }
    //
    //        x += sliceWidth;
    //    }
    //
    //    canvasCtx.lineTo(WIDTH, HEIGHT / 2);
    //    canvasCtx.stroke();
    //};
};


window.onload = function () {

    /**where you do stuff**/
    var useSoundCloud = false;


    var playerDOMElement = document.getElementById('player');
    var visual;
    var player = FT.Player();
    player.init(playerDOMElement, function () {
        setTimeout(function(){
            window.cancelAnimationFrame(ft.raf);
            window.cancelAnimationFrame(visual.raf);
        }, 1000);

    });

    var sc = FT.SoundCloud();
    var ft = FT.FFT();


    function playIt(streamURL) {
        player.play(streamURL);
        ft.init(playerDOMElement);
        ft.setBuckets(128);


        visual = FT.SampleVisual(ft.analyzer, ft.bufferLength, ft.dataArray, ft.buckets);
        visual.draw();

        ft.measure();

    }


    if (useSoundCloud) {
        //var track = 'https://soundcloud.com/infacted-recordings/shiv-r-pharmaceutical-grade';
        //var track = 'https://soundcloud.com/nemo-iam/bobcaygeon-the-tragically-hip'
        //var track = 'https://soundcloud.com/thegrandarchitect/tools-sine-frequency-sweep';
        var track = 'https://soundcloud.com/acle/4d-sounds-drum-test-quick-mix';

        sc.getTrack(track, function (streamURL) {
            playIt(streamURL);
        }, function (err) {
            console.log(err);
        });
    } else {
        player.play('audiocheck.net_sweep20-20klin.mp3');
        ft.init(playerDOMElement);
        ft.setBuckets(8);


        visual = FT.SampleVisual(ft.analyzer, ft.bufferLength, ft.dataArray, ft.buckets);
        visual.draw();

        ft.measure();
    }


};