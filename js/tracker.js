//Begin PoseNet code

// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
PoseNet example using p5.js
=== */

let video;
let poseNet;
let poses = [];


function setup() {
  // hoe grooter het canvas hoe accurater de poses, daarom maak ik hier het canvas groter en verklein hem terug in css
  createCanvas(640 * 2, 480 * 2);
  video = createCapture(VIDEO);
  video.size(width, height);


  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  // console.log(poseNet);
  poseNet.on('pose', function (results) {
    poses = results;
    // allerseerte pose herkent hij niet, dan geeft hij een error, daarom deze if
    if (results[0]) {
      // in dit geval kon ik init niet global activeren door posenet
      init();
    }
  });

  // Hide the video element, and just show the canvas
  video.hide();
}

function draw() {
  image(video, 0, 0, width, height);
}


function modelReady() {

  // einde posenet code

  //begin eigen code

  document.querySelector(`.status`).textContent = `It's BIDEN's (player 1) turn!`
  document.querySelector(`.sub-status`).textContent = `Grab your golfclub, stand in 1,5 meters in front of your webcam and hit your opponents head with the golf ball. I know you want to. (Turn op sound for full experience)`;
  document.querySelector(`.loader`).classList.add("no-display")
}

// in de array komen later de x coordinaten van de hand bij het begin van de swing te staan
let xWidthCorBegin = [];
let realisticSwingSpeed = 0;


// initialiseert swing status
let swingState = "not ready";
//document.querySelector(`.swing-state`).textContent = swingState;

// initialiseert player status
let playerState = "not playing";
//document.querySelector(`.player-state`).textContent = playerState;

let timer = 0;
let beginSwing = "not set";

let $golferHead;
let golferHead = `biden`


const init = () => {
  if (poses[0]) {
    analyseResults(poses[0]);
  }
  //document.querySelector(`.try-again`).addEventListener('click', resetPoses);
  $golferHead = document.querySelector(`.golfer-head`);
  //console.log($golferHead.src.split(`-`)[1]);
}
const analyseResults = (results) => {

  let rHandWidth = Math.floor(results.pose.rightWrist.x);
  let lHandWidth = Math.floor(results.pose.leftWrist.x);

  let rShoulderWidth = Math.floor(results.pose.rightShoulder.x)
  let lShoulderWidth = Math.floor(results.pose.leftShoulder.x);
  let distShoulders = Math.abs(lShoulderWidth - rShoulderWidth);


  //als je twee handen ver uit elkaar staan ben je waarschijlijk geen golf aan het spelen, dan heeft het ook geen zin dat de code wordt uitgevoerd, later gepaste feedback toevoegen
  // plus er wordt ook gekeken naar de score, als deze je niet zichtbaar bent is deze score laag
  // plus als je te ver van het scherm staat geeft hij ook feedback (1,5m)
  if ((lHandWidth - rHandWidth) < 300 && results.pose.score > 0.4 && distShoulders > 220) {
    //console.log(`playing`);
    //document.querySelector(`.player-state`).textContent = `playing`;
    if (swingState != `done`) {
      document.querySelector(`.sub-status`).textContent = `Great, now swing with your golfclub`;
    }

    //hoofd veranderen 
    if ($golferHead) {
      $golferHead.src = `assets/img/${golferHead}-start.png`;
    }

    // calc average width coordinate of hands
    let averHandWidth = (rHandWidth + lHandWidth) / 2;
    let averHandHeight = (Math.floor(results.pose.rightWrist.y) + Math.floor(results.pose.leftWrist.y)) / 2;

    //calc mid of shlouders

    let midShoulderWidth = (lShoulderWidth + rShoulderWidth) / 2;

  
    let lShoulderHeight = Math.floor(results.pose.leftShoulder.y);
    let midShoulderHeight = (lShoulderHeight + (Math.floor(results.pose.rightShoulder.y))) / 2;

    // we kijken ook naar de relatieve breedte, want iemand kan dichter bij het scherm staan, of meer naar links,...
    // daarom kijken we hier naar de handen ten opzichte van het midden van de schouder.
    let relativeAverHandWidth = Math.abs(averHandWidth - midShoulderWidth);
    //console.log(relativeAverHandWidth);

    //we kijken ook naar de hoek die de armen maken tegenover de schouders
    //joepie wiskunde

    let armAngle = Math.floor((Math.atan2(averHandHeight - midShoulderHeight, averHandWidth - midShoulderWidth) * 180 / Math.PI) - 90) * -1;
    //document.querySelector(`.swing-angle`).textContent = armAngle;

    animateGolfer(armAngle)

    // de swing begint als de golf club uitwijkt naar links of naar rechts tenopzichte van het lichaam (in dit geval links)
    if (averHandWidth > (lShoulderWidth) && swingState != "done") {
      calculateBeginSwing(relativeAverHandWidth);

    }

    // tussen de linkerschouder en midden van de schouder moet de tijd van de swing ook nog opgeteld worden
    if (averHandWidth < lShoulderWidth && averHandWidth > midShoulderWidth && swingState != "done") {
      timer++;
   
    }

    // bij golfen ligt de bal meestal tussen de 2 schouders, dit punt (midShoulderWidth) is dus het eind x coordinaat voor de swing snelheid te meten
    if (averHandWidth < midShoulderWidth && swingState == "ready") {
      calculateEndSwing();
    }

  } else {

    //hoofd veranderen 
    if ($golferHead) {
      $golferHead.src = `assets/img/${golferHead}-happy.png`;
    }

    if (swingState != `done`) {
      document.querySelector(`.sub-status`).textContent = `Grab your golfclub, stand in 1.5 meters in front of your webcam and hit your opponents head with the golf ball. I know you want to. (Turn op sound for full experience)`;
    }

  }
}

const animateGolfer = (armAngle) => {
  const $golferArms = document.querySelector(`.golfer-arms`);
  if ($golferArms) {
    $golferArms.style.transform = `rotate(${armAngle}deg)`
  }
}

const calculateBeginSwing = (relativeAverHandWidth) => {
  //console.log(`de swing is begonnen`);
  swingState = "ready";
  //console.log(swingState)
  //document.querySelector(`.swing-state`).textContent = swingState;

  if ($golferHead) {
    $golferHead.src = `assets/img/${golferHead}-down.png`;

  }

  xWidthCorBegin.push(relativeAverHandWidth);
  //console.log(xWidthCorBegin);

  // haalt het grootste getaal uit de array (op dit punt is de denkbeeldige golf club het verste)
  const max = xWidthCorBegin.reduce(function (a, b) {
    return Math.max(a, b);
  });

  //document.querySelector(`.start-swing`).textContent = max;
  beginSwing = max;

  // deze if zorgt ervoor dat de tijd zeker start op het verste punt
  if (max == relativeAverHandWidth) {
    timer = 0;
  }
  timer++;

}

const calculateEndSwing = () => {
  //console.log(`de golfbal is vertrokken`);
  swingState = "done";

  //array begin leeg maken
  xWidthCor = [];

  calculateSwingSpeed();
}

const calculateSwingSpeed = () => {
  //calc speed
  // begin swing is de relatieve aftand tussen de handen en het midden van de schouders
  const swingSpeed = beginSwing / timer;

  // deze snelheid zegt weinig over de echte snelheid van een golf bal, even opzoeken
  // 15 minuten research later;
  // avg golfbal van amateur: 130km/uur, pro: 175km/uur, record: 339km/uur
  const realisticSwingSpeed = Math.round((swingSpeed * 1.7) * 100) / 100;
  document.querySelector(`.swing-speed`).textContent = realisticSwingSpeed;
  document.querySelector(`.sub-status`).textContent = `You hit the ball with a speed of ${realisticSwingSpeed} km/u!`;
}



function resetPoses() {
  if (golferHead == `biden`) {
    golferHead = `trump`
  } else {
    golferHead = `biden`
  }

  xWidthCorBegin = [];
  realisticSwingSpeed = 0;

  // initialiseert swing status
  swingState = "not ready";

  // initialiseert player status
  playerState = "not playing";

  timer = 0;
  beginSwing = "not set";

  document.querySelector(`.swing-speed`).textContent = 0;
  init(poses[0]);
}

