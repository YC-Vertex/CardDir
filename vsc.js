/* Capture video stream */
navigator.getUserMedia = (
	navigator.getUserMedia || 
	navigator.webkitGetUserMedia ||
	navigator.mozGetUserMedia ||
	navigator.msGetUserMedia
);

var videoL = $(".frame-container .left #videoL").get(0);
var videoR = $(".frame-container .right #videoR").get(0);
var mediaStream;
var streaming;

var imgCount = 0;

$(document).ready(function() {
	if (!navigator.getUserMedia) {
		alert("Sorry - your browser does not support getUserMedia - try Chrome or Firefox");
	}
			
	$("body").on('click', "#btn-toggle-mode", function(e) {
		e.preventDefault();
		navigator.getUserMedia({
			video: true,
			audio: false
		},
		function(stream) {
			if (navigator.mozGetUserMedia) {
				videoL.mozSrcObject = stream;
				videoR.mozSrcObject = stream;
			} else {
				var url = window.URL || window.webkitURL;
				var src = url ? url.createObjectURL(stream) : stream;
				console.log(src);
				videoL.src = src;
				videoR.src = src;
			}
			mediaStream = stream;
			videoL.play();
			videoR.play();
		},
		function(error) {
			console.log("ERROR: " + error);
		});
	});

	$("video").on('canplay', function(e) {
		if (!streaming) {
			videoL.setAttribute('width', window.innerWidth);
			videoL.setAttribute('height', window.innerHeight);
			videoR.setAttribute('width', window.innerWidth);
			videoR.setAttribute('height', window.innerHeight);
			streaming = true;
		}
	});
});
