'use strict';

var FT = window.FT || {};

FT.SampleVisual = function (buckets) {

    if (!(this instanceof FT.SampleVisual))
        return new FT.SampleVisual(buckets);


    //temp
    var canvasCtx = document.getElementById('canvas').getContext('2d');
    var WIDTH = 400;
    var HEIGHT = 400;

    var self = this;


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

};