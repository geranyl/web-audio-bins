/* jshint camelcase:false */
'use strict';

var FT = window.FT || {};

//https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
FT.FFT = function () {
    if (!(this instanceof FT.FFT))
        return new FT.FFT();


    var FFT_SIZE = 2048; //256, 1024, 2048 (power of 2);
    //to use weights, this needs to be at 2048


    var useWeights = false;
    if(FFT_SIZE === 2048){
        useWeights = true;
    }


    var freqToFFTScale = FFT_SIZE/2 / 20000;//20kHz

    var self = this;

    //presetRanges
    self.sampleRanges = {
        //initial: Math.ceil(20*freqToFFTScale),
        initial: Math.ceil(0*freqToFFTScale), //With A-weighting including the entire bass range seems to dampen the bass better
        bass:Math.ceil(140*freqToFFTScale),
        low:Math.ceil(400*freqToFFTScale),
        mid:Math.ceil(2600*freqToFFTScale),
        umid:Math.ceil(5200*freqToFFTScale),
        hmid:Math.ceil(20000*freqToFFTScale)

    };



    self.buckets = null;//low, mid, high

    self.audioCtx = null;
    self.analyser = null;


    var curBucketIndex = 0;
    var ranges = [];


    self.init = function (playerDOM) {
        self.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        // Webkit/blink browsers need prefix, Safari won't work without window.
        self.analyser = self.audioCtx.createAnalyser(); //create an analyser

        self.analyser.minDecibels = -100; //cut off for min decibles to register - default
        self.analyser.maxDecibels = -30; //cut off for max decibles to register - default
        self.analyser.smoothingTimeConstant = 0.85;//lower values = more jarring changes
        var source = self.audioCtx.createMediaElementSource(playerDOM);//get the source of audio
        source.connect(self.analyser); //connect the source to the analyser
        self.analyser.connect(self.audioCtx.destination); //connect the analyser to the destination

        self.analyser.fftSize = FFT_SIZE;
        self.bufferLength = self.analyser.frequencyBinCount; // half the FFT value
        self.dataArray = new Uint8Array(self.bufferLength);
    };




    self.setBuckets = function (numBuckets, presetRanges) {

        if(numBuckets && presetRanges){
            throw new Error('You can choose the number of buckets, or set your own ranges. Setting numBuckets will split the frequency ranges into equivalent bucket sizes. Ranges will allow you to set buckets according to frequency.')
        }

        if (numBuckets > self.analyser.fftSize / 2) {
            throw new Error('buckets cannot exceed half the fftSize');
        }


        if(numBuckets) {
            self.buckets = Array.apply(null, new Array(numBuckets)).map(Number.prototype.valueOf, 0);
            ranges[0] = 0;
            for (var i = 1; i < numBuckets*2; i++) {
                ranges[i] = Math.ceil(self.bufferLength / numBuckets) * i - ranges[i-1];
            }
            ranges[numBuckets*2 - 1] = self.bufferLength;
        }

        if(presetRanges){
            self.buckets = Array.apply(null, new Array(presetRanges.length/2)).map(Number.prototype.valueOf, 0);
            ranges = presetRanges;
        }


        console.log(self.bufferLength, aWeightedTable.length)

    };


    self.measure = function () {

        self.raf = window.requestAnimationFrame(self.measure);

        self.analyser.getByteFrequencyData(self.dataArray); //// get waveform data and put it into the dataArray; getByteTimeDomainData will give you the usual sine wave visual

        var accumValue = 0;
        var lastRangeValue = ranges[curBucketIndex*2];

        for (var i = ranges[curBucketIndex*2]; i < self.bufferLength; i++) {

            //each sample point will be between 0 and 1;

            var val = 0;
            if(useWeights){
                val = self.dataArray[i]+aWeightedTable[i*2 +1]+aWeightedTable[i*2]+aWeightedTable[i];
            }else{
                val = self.dataArray[i];
            }

            accumValue += val;

            if (i + 1 >= ranges[curBucketIndex*2+1]) {
                accumValue = accumValue<0?0:accumValue;
                self.buckets[curBucketIndex] = accumValue / 256.0 /(ranges[2*curBucketIndex +1] - lastRangeValue);
                lastRangeValue = ranges[curBucketIndex*2];
                curBucketIndex+=1;
                accumValue = 0;
                if (curBucketIndex > self.buckets.length-1) {
                    curBucketIndex = 0;
                }
            }

        }

    };
};
