/*global SC*/

//ref: https://github.com/michaelbromley/soundcloud-visualizer/blob/master/js/app.js

'use strict';




window.onload = function () {

    /**where you do stuff**/
    var useSoundCloud = true;




    var playerDOMElement = document.getElementById('player');
    var visual;
    var player = FT.Player();
    player.init(playerDOMElement, function () {
        setTimeout(function(){
            window.cancelAnimationFrame(ft.raf);
            window.cancelAnimationFrame(visual.raf);
        }, 1);

    });

    var sc = FT.SoundCloud();
    var ft = FT.FFT();
    var sampleRanges = [
        ft.sampleRanges.initial,
        ft.sampleRanges.bass,
        ft.sampleRanges.bass,
        ft.sampleRanges.low,
        ft.sampleRanges.low,
        ft.sampleRanges.mid,
        ft.sampleRanges.mid,
        ft.sampleRanges.umid,
        ft.sampleRanges.umid,
        ft.sampleRanges.hmid
    ];

    function playIt(streamURL, numBuckets, ranges) {
        player.play(streamURL);
        ft.init(playerDOMElement);
        ft.setBuckets(numBuckets, ranges); //number of bars you'd want to see in the sample visual
        visual = FT.SampleVisual(ft.buckets);
        visual.draw();
        ft.measure();
    }


    if (useSoundCloud) {
        //var track = 'https://soundcloud.com/infacted-recordings/shiv-r-pharmaceutical-grade';
        var track = 'https://soundcloud.com/nemo-iam/bobcaygeon-the-tragically-hip'
        //var track = 'https://soundcloud.com/thegrandarchitect/tools-sine-frequency-sweep';
        //var track = 'https://soundcloud.com/acle/4d-sounds-drum-test-quick-mix';
        //var track = 'https://soundcloud.com/bassnectar/ellie-goulding-lights-bassnectar-remix';
        //var track = 'https://soundcloud.com/sony-classical/sets/henrik-schwarz-instruments-1';
        //var track = 'https://soundcloud.com/xavier-de-maistre/w-a-mozart-concerto-for-flute';

        sc.getTrack(track, function (streamURL) {
            playIt(streamURL, null, sampleRanges);
        }, function (err) {
            console.log(err);
        });
    } else {


        playIt('audiocheck.net_sweep20-20klin.mp3', null, sampleRanges);
        //playIt('audiocheck.net_sweep20-20klin.mp3', 5);

    }

};


/**
 * http://www.decibelcar.com/menutheory/141-treble-hertz.html
 * Bass
 (Approximately 20hz-140hz)
 The 60hz-90hz range is where we notice the greatest perceptible changes in "bass response." Try a test tone and see just how well you hear 20hz or even 32hz, compared with the same volume of 60hz or 90hz.

 Mid-Bass
 (Approximately 140hz-400hz)
 Mid bass has lots of instruments included in its frequency range. Cello, Bassoon, and Male Voice are samples of "mid-bass" sounds. This is also where most 'bass' controls can make a mess of your music. Too much mid-bass gives a muddy and "boomy" quality. Too little and it sounds hollow and thin.

 Midrange
 (Approximately 400hz-2.6khz)
 Since our ears are most sensitive to midrange frequencies, midrange has the greatest effect on the overall sound of your stereo system. The "proper" settings are the ones most pleasing to you the listener. Female vocals and Bass Tuba are examples of mirange sounds.


 Upper Midrange
 (Approximately 2.6khz-5.2khz)
 Pipe organ and piano are examples of this sound range. Speaker designers often boost output in this range to increase "presence" of the music. Too much gives a sound that is overbearingly harsh and fatigues the ears. A balance between this frequency range and the midrange frequencies gives the most pleasing sound.

 High End
 (Approximately 5.2khz-20khz - Two Regions)
 5.2khz up to about 12khz is the realm of dreaded treble control. This is where harmonics can really enhance your musical enjoyment. It's this range that affects the brilliance of music. Too much gives an unpleasant, harsh and "piercing" (painful) quality to your music.

 **/