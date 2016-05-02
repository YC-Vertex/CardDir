/* Lock to landscape */
if(screen.orientation && screen.orientation.lock) {
  screen.orientation.lock('landscape');
}

/* Setup sence */
var scene = new THREE.Scene();

var geometry = new THREE.BoxGeometry(200, 200, 200);
var material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
var mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

/* Setup cameras */
var cameraOverview = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
var cameraLeft = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight / 2, 1, 10000);
var cameraRight = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight / 2, 1, 10000);

cameraOverview.position.z = 1000;
cameraLeft.position.z = 1000;
cameraRight.position.z = 1000;

cameraLeft.position.x = -100;
cameraRight.position.x = 100;

/* Setup renderer */
var rendererOverview = new THREE.WebGLRenderer({ alpha: true });
var rendererLeft = new THREE.WebGLRenderer({ alpha: true });
var rendererRight = new THREE.WebGLRenderer({ alpha: true });

rendererOverview.setSize(window.innerWidth, window.innerHeight);
rendererLeft.setSize(window.innerWidth / 2, window.innerHeight);
rendererRight.setSize(window.innerWidth / 2, window.innerHeight);

function setupElements() {
  $(".frame-container .overview").append(rendererOverview.domElement);
  $(".frame-container .left").append(rendererLeft.domElement);
  $(".frame-container .right").append(rendererRight.domElement);
}

/* Setup renderer functions */

var cardboardMode = false;
var animating = false;

function animate() {
  if(animating) requestAnimationFrame(animate);

  /* Detect acceleration */
  //TODO: here
  //
  mesh.rotation.x += 0.01;
  mesh.rotation.z += 0.02;
  mesh.rotation.y += 0.03;

  if(cardboardMode) {
    rendererRight.render(scene, cameraRight);
    rendererLeft.render(scene, cameraLeft);
  } else {
    rendererOverview.render(scene, cameraOverview);
  }
}

function switchToCardboard() {
  cardboardMode = true;
  $(".frame-container").addClass("cardboard");
}

function switchToOverview() {
  cardboardMode = false;
  $(".frame-container").removeClass("cardboard");
}

function startAnimation() {
  if(!animating) {
    animating = true;
    animate();
  }
}

function stopAnimation() {
  animating = false;
}

$(document).ready(function() {
  setupElements();
  switchToOverview();
  startAnimation();

  $("#btn-toggle-mode").click(function() {
    if(cardboardMode) {
      $(this).removeClass("mode-cardboard");
      switchToOverview();
    } else {
      $(this).addClass("mode-cardboard");
      switchToCardboard();
    }
  });

  $("#btn-help").click(function() {
    $(".help-overlap").toggleClass("shown");
  });

  var zoomInDisabled = false;
  var zoomOutDisabled = false;

  function updateZoomBtnState() {
    if(cameraRight.position.x == cameraLeft.position.x) {
      if(!zoomOutDisabled) {
        $("#btn-zoom-out .material-icons").addClass("md-inactive");
        $("#btn-zoom-out").prop("disabled", true);
        zoomOutDisabled = true;
      }
    } else {
      if(zoomOutDisabled) {
        $("#btn-zoom-out .material-icons").removeClass("md-inactive");
        $("#btn-zoom-out").prop("disabled", false);
        zoomOutDisabled = false;
      }
    }
    
    //TODO: We need a upper limit here
  }

  $("#btn-zoom-in").click(function() {
    cameraLeft.position.x -= 20;
    cameraRight.position.x += 20;

    updateZoomBtnState();
  })

  $("#btn-zoom-out").click(function() {
    if(zoomOutDisabled) return;

    cameraLeft.position.x += 20;
    cameraRight.position.x -= 20;

    updateZoomBtnState();
  })
});
