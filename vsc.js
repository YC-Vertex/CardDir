var promisifiedOldGUM = function(constraints, successCallback, errorCallback) {

  // First get ahold of getUserMedia, if present
  var getUserMedia = (navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia);

  // Some browsers just don't implement it - return a rejected promise with an error
  // to keep a consistent interface
  if(!getUserMedia) {
    return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
  }

  // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
  return new Promise(function(successCallback, errorCallback) {
    getUserMedia.call(navigator, constraints, successCallback, errorCallback);
  });
		
}

// Older browsers might not implement mediaDevices at all, so we set an empty object first
if(navigator.mediaDevices === undefined) {
  navigator.mediaDevices = {};
}

// Some browsers partially implement mediaDevices. We can't just assign an object
// with getUserMedia as it would overwrite existing properties.
// Here, we will just add the getUserMedia property if it's missing.
if(navigator.mediaDevices.getUserMedia === undefined) {
  navigator.mediaDevices.getUserMedia = promisifiedOldGUM;
}

var mediaStream;
var videoL, videoR;

function setupCamera() {
	navigator.getUserMedia = (
		navigator.getUserMedia || 
		navigator.webkitGetUserMedia ||
		navigator.mozGetUserMedia ||
		navigator.msGetUserMedia
	);

	videoL = $(".frame-container .left #videoL").get(0);
	videoR = $(".frame-container .right #videoR").get(0);

	if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
		alert("Sorry - your browser does not support getUserMedia - try Chrome or Firefox");
	}
}

var cameraShown = false;

function showCamera() {
	if (cameraShown) return false;
	cameraShown = true;	
 
	var streamCb = function(stream) {
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
	}

	var streamErrCb = function(err) {
		console.log("ERROR: " + err);
	}
	navigator.mediaDevices.getUserMedia({ video: true, audio: false })
		.then(streamCb)
		.catch(streamErrCb);
};

function stopCamera() {
	if (!cameraShown) return false;
	cameraShown = false;

	videoL.pause();
	videoR.pause();
	mediaStream.getTracks().forEach(e => {
		e.stop();
	});

  $(".frame-container .left #videoL").addClass("hidden-video");
  $(".frame-container .right #videoR").addClass("hidden-video");
}
