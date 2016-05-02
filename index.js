/* Lock to landscape */
if(screen.orientation && screen.orientation.lock) {
  screen.orientation.lock('landscape');
}

/* Setup sence */
var primaryScene = new THREE.Scene();
var secondaryScene = new THREE.Scene();

/* Declare CSS3D Objects */
var primaryMapObject;
var secondaryMapObject;

var mapBase = {
  px: -300,
  py: -300,
  pz: 0,
  rx: CDMath.toRad(-35),
  ry: CDMath.toRad(25),
  rz: 0
}

var mapRestoreBase = $.extend({}, mapBase);
var mapExpandBase = {
  px: 0,
  py: 0,
  pz: -200,
  rx: 0,
  ry: 0,
  rz: 0,
}

var mapEasing = bezier(0.17, 0.67, 0.83, 0.67);
var mapStartTime = -1;
var mapEaseBase;
var mapEaseTarget;

function mapRestorePosition() {
  mapStartTime = performance.now();
  mapEaseBase = mapBase;
  mapEaseTarget = mapRestoreBase;
}

function mapGotoExpandPosition() {
  mapStartTime = performance.now();
  mapEaseBase = mapBase;
  mapEaseTarget = mapExpandBase;
}

function doMapAnimation(now) {
  if(mapStartTime == -1 || now - mapStartTime > 5000) return;
  else {
    var easeValue = mapEasing((now-mapStartTime) / 5000);
    mapBase.px = mapEaseBase.px * (1 - easeValue) + mapEaseTarget.px * easeValue;
    mapBase.py = mapEaseBase.py * (1 - easeValue) + mapEaseTarget.py * easeValue;
    mapBase.pz = mapEaseBase.pz * (1 - easeValue) + mapEaseTarget.pz * easeValue;
    mapBase.rx = mapEaseBase.rx * (1 - easeValue) + mapEaseTarget.rx * easeValue;
    mapBase.ry = mapEaseBase.ry * (1 - easeValue) + mapEaseTarget.ry * easeValue;
    mapBase.rz = mapEaseBase.rz * (1 - easeValue) + mapEaseTarget.rz * easeValue;
  }
}

function applyMap() {
  //TODO: acceleration
  primaryMapObject.position.x = mapBase.px;
  primaryMapObject.position.y = mapBase.py;
  primaryMapObject.position.z = mapBase.pz;
  primaryMapObject.rotation.x = mapBase.rx;
  primaryMapObject.rotation.y = mapBase.ry;
  primaryMapObject.rotation.z = mapBase.rz;

  secondaryMapObject.position.x = mapBase.px;
  secondaryMapObject.position.y = mapBase.py;
  secondaryMapObject.position.z = mapBase.pz;
  secondaryMapObject.rotation.x = mapBase.rx;
  secondaryMapObject.rotation.y = mapBase.ry;
  secondaryMapObject.rotation.z = mapBase.rz;
}

/* Setup cameras */

// Most cellphone cameras has a FOV of around 50. So 50 is the go
var cameraOverview = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
var cameraLeft = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight / 2, 1, 10000);
var cameraRight = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight / 2, 1, 10000);

cameraOverview.position.z = 1000;
cameraLeft.position.z = 1000;
cameraRight.position.z = 1000;

cameraLeft.position.x = -40;
cameraRight.position.x = 40;

/* Setup renderer */
var rendererOverview = new THREE.CSS3DRenderer({ alpha: true });
var rendererLeft = new THREE.CSS3DRenderer({ alpha: true });
var rendererRight = new THREE.CSS3DRenderer({ alpha: true });

rendererOverview.setSize(window.innerWidth, window.innerHeight);
rendererLeft.setSize(window.innerWidth / 2, window.innerHeight);
rendererRight.setSize(window.innerWidth / 2, window.innerHeight);

function setupElements() {
  var primaryMap = document.getElementById("primary-map-mask");
  var secondaryMap = document.getElementById("secondary-map-mask");
  
  primaryMapObject = new THREE.CSS3DObject(primaryMap);
  secondaryMapObject = new THREE.CSS3DObject(secondaryMap);

  primaryScene.add(primaryMapObject);
  secondaryScene.add(secondaryMapObject);

  $(".frame-container .overview").append(rendererOverview.domElement);
  $(".frame-container .left").append(rendererLeft.domElement);
  $(".frame-container .right").append(rendererRight.domElement);
}

/* Setup renderer functions */

var cardboardMode = false;
var animating = false;

function animate(time) {
  if(animating) requestAnimationFrame(animate);

  /* Detect acceleration */
  //TODO: here
  //

  doMapAnimation(time);
  applyMap();

  if(cardboardMode) {
    rendererLeft.render(primaryScene, cameraLeft);
    rendererRight.render(secondaryScene, cameraRight);
  } else {
    rendererOverview.render(primaryScene, cameraOverview);
  }
}

function switchToCardboard() {
  cardboardMode = true;

  //TODO: Update google map

  $("#primary-map-mask").removeClass("overview").addClass("half");
  $("#secondary-map-mask").removeClass("hidden").addClass("half");

  $(".frame-container").addClass("cardboard");
}

function switchToOverview() {
  cardboardMode = false;

  $("#primary-map-mask").addClass("overview").removeClass("half");
  $("#secondary-map-mask").addClass("hidden").removeClass("half");

  $(".frame-container").removeClass("cardboard");
}

function startAnimation() {
  if(!animating) {
    animating = true;
    requestAnimationFrame(animate);
  }
}

function stopAnimation() {
  animating = false;
}

/* Initialize */

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

  $(".help-overlap").click(function() {
    $(".help-overlap").removeClass("shown");
  });

  $(".help-card").click(function(event) {
    event.stopPropagation();
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

  var expanded = false;

  $("#btn-map").click(function() {
    if(expanded) {
      $(".map-mask").removeClass("expanded");
      mapRestorePosition();
      expanded = false;
    } else {
      $(".map-mask").addClass("expanded");
      mapGotoExpandPosition();
      expanded = true;
    }
  });
});
