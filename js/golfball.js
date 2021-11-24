import { loadImage } from './functions/lib.js';
import { random } from './functions/lib.js';
{


  // globale variablen declareren
  const $canvas = document.querySelector(`.canvas`);
  const ctx = $canvas.getContext(`2d`);

  let $status = document.querySelector(`.status`);
  let $subStatus = document.querySelector(`.sub-status`);

  let ball;
  let target;
  let targetHead;
  let targetHeadHit;
  let trumpsHairHit;
  let targetNotHit;
  let trumpsWall;
  let wallY = 400;
  let wallVelocity = 3;

  let isTargetHit = `not initiated`

  let horVelocity = 0;
  let verVelocity = 0;

  let horVelocityHair = 0;
  let hairX = 263;

  let pointsTrump = 0;
  let pointsBiden = 0;

  let subStatus;

  let playerName = `biden`
  let targetName = `trump`

  let hasHappend1 = false;
  let hasHappend2 = false;
  let hasHappend3 = false;
  let hasPlayed = false;

  let level = 1;

  const audioIfMisTrump = new Audio(`../assets/sound/mistrump${Math.floor(random(1, 5))}.mp3`);
  const audioIfHitTrump = new Audio(`../assets/sound/hittrump.mp3`);

  const audioIfHitBiden = new Audio(`../assets/sound/hitbiden.mp3`);
  const audioIfMisBiden = new Audio(`../assets/sound/misbiden.mp3`);

  const audioWall = new Audio(`../assets/sound/trumpswallsound.mp3`);


  const init = async () => {

    //in dit geval werk ik een object omdat ik toch maar 1 bol aan maak, deze bol is ook altijd het zelfde (een class zou overkill zijn in dit geval)
    ball = { x: 10, y: 590, radius: 10, status: 0, color: "white" };

    // laadt alle images in 
    target = await loadImage('../assets/img/trumptarget.png');
    targetHead = await loadImage('../assets/img/trump-happy.png');
    targetHeadHit = await loadImage('../assets/img/trumppijnbald.png');
    trumpsHairHit = await loadImage('../assets/img/trumppijnhaar.png');
    targetNotHit = await loadImage('../assets/img/trumpblij.png');
    trumpsWall = await loadImage('../assets/img/trumpswall.jpg');
    //document.querySelector(`.try-again`).addEventListener('click', resetBall);

    draw();

    //controleert of de swing uitgevoerd is door de gebruiker en haalt de snelheid van de swing/golfbal op
    checkSpeed();
  };

  const draw = () => {

    ctx.clearRect(0, 0, $canvas.width, $canvas.height);

    //draw golball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();

    // als de golf swing wordt uitgevoerd door de gebruiker aka speed != 0 gebreurt de volgende functie
    const speed = document.querySelector(`.swing-speed`).textContent;
    if (speed != 0 && horVelocity != 0) {
      golfballShot();

    }

    //draw target;
    ctx.drawImage(target, 1300, 359, 300 / 3, 732 / 3);
    if (isTargetHit == `yes`) {
      ctx.clearRect(1300, 250, 100, 100);
      ctx.drawImage(targetHeadHit, 1300, 263, 300 / 3, 300 / 3);
      if (targetName == `trump`) {
        ctx.drawImage(trumpsHairHit, hairX, 263, 300 / 3, 100 / 3);
        hairX += horVelocityHair;
      }
    } else if (isTargetHit == `no`) {
      ctx.clearRect(1300, 250, 100, 100);
      ctx.drawImage(targetNotHit, 1300, 263, 300 / 3, 300 / 3);
    } else {
      ctx.drawImage(targetHead, 1300, 270, 300 / 3, 300 / 3);
    }

    //checkt level
    if (level == 2) {
      startNextLevel();
    } else if (level == 3) {
      startNextLevel();
    } else if (level == 4) {
      startLevel4();
    } else if (level == 5) {
      startNextLevel();
    } 
    

    window.requestAnimationFrame(draw);
  }


  const golfballShot = () => {
    let gravity = 0.5;
    const bounce = 0.7;

    // vanaf level 4 zit je op de maan, dan is er minder zwaartekracht
    if (level > 3) {
      gravity = 0.09;
    }

    ball.x += horVelocity;
    ball.y += verVelocity;
    verVelocity += gravity;



    //als de target niet geraakt wordt
    if (ball.x + ball.radius > 1312 && ball.x + ball.radius < 1500 && ball.y < 255 && hasHappend1 == false) {
      if (playerName == `biden`) {
        audioIfMisTrump.play();
      } else {
        audioIfMisBiden.play();
      }

      isTargetHit = `no`;
      switchPlayer();
      subStatus = `You missed! Try again next time`;
      $subStatus.textContent = subStatus;
      hasHappend1 = true;
    }

    //als de target geraakt wordt
    if (ball.x + ball.radius > 1312 && ball.y > 255 && ball.x < 1500 && hasHappend3 == false) {

      horVelocity *= -1;
      addFriction(1.7);
      isTargetHit = `yes`;
      //console.log(`hit body`);
      hairX = 1300;
      horVelocityHair = 0;
      if (playerName == `biden`) {
        audioIfHitTrump.play();
        pointsBiden = pointsBiden + 5;
      } else {
        audioIfHitBiden.play();
        pointsTrump = pointsTrump + 5;
      }
      subStatus = `Nice, you hit his body, but try to hit the head the next time. + 5 points`;
      $subStatus.textContent = subStatus;
      switchPlayer();
      hasHappend3 = true;
    }

    //hoofd wordt geraakt
    if (ball.x + ball.radius > 1312 && ball.y > 255 && ball.y < 360 && ball.x < 1400 && hasHappend2 == false) {
      //console.log(`hit head`);
      hairX = 1300;
      horVelocityHair = 15;
      if (playerName == `biden`) {
        pointsBiden = pointsBiden + 15;
      } else {
        pointsTrump = pointsTrump + 15;
      }
      subStatus = `Great + 20 points`;

      $subStatus.textContent = subStatus;
      hasHappend2 = true;
    }

    // als de bal niets raakt (golf swing te traag)
    if (horVelocity < 1.2 && ball.x < 1300 && hasHappend2 == false && isTargetHit != `yes`) {
      //console.log(`to slow`);
      if (playerName == `biden`) {
        audioIfMisTrump.play();
      } else {
        audioIfMisBiden.play();
      }
      subStatus = `Your swing was too slow`;
      $subStatus.textContent = subStatus;
      switchPlayer();
      hasHappend2 = true;
    }

    document.querySelector(`.points-biden`).textContent = pointsBiden;
    document.querySelector(`.points-trump`).textContent = pointsTrump;


    // Bal raakt de vloer 
    if (ball.y + ball.radius > $canvas.height) {

      // als de bal op de grond botst
      ball.y = $canvas.height - ball.radius;
      //bounce the ball
      verVelocity *= -bounce;
      //anders stop de bal nooit met botsen
      if (verVelocity < 0 && verVelocity > -2.1)
        if (Math.abs(horVelocity) < 1.1)
          horVelocity = 0.0;

      // weerstand toevoegen om het realistischer te maken
      addFriction(0.7);
    }
  }

  const addFriction = (xFriction) => {
    if (horVelocity > 0)
      horVelocity = horVelocity - xFriction;
    if (horVelocity < 0)
      horVelocity = horVelocity + xFriction;
  }

  const switchPlayer = () => {

    // na level 5 is de game gedaan, zoals altijd heeft trump het laatste woord
    if (playerName == `trump` && isTargetHit == `yes` && level == 5){
      endGame();
    } else {
      // gebruik van een timer zodat de spelers tijd hebben om te wisselen en voor de camera te komen
      function handleTimer() {
        if (count == 0) {
          clearInterval(timer);
          resetPoses()
          resetBall();
          changeCharacters();
          hasHappend1 = false;
          hasHappend2 = false;
          hasHappend3 = false;
          $status.textContent = `It's ${targetName.toUpperCase()}'s turn!`;
          $subStatus.textContent = `Grab your golfclub, stand in 1,5 meters in front of your webcam and hit your oponents head with the golf ball. I know you want to.`;
        } else {
          $status.textContent = `${targetName.toUpperCase()}'s turn (player 2) in ${count}`
          count--;
        }
      }
      let count = 5;
      const timer = setInterval(function () { handleTimer(count); }, 1000);
    }
  }

  const resetBall = () => {
    horVelocity = 0;
    verVelocity = 0;
    horVelocityHair = 0;
    ball = { x: 10, y: 590, radius: 10, status: 0, color: "white" };
    checkSpeed();
  }

  const changeCharacters = async () => {

    const $playerHead = document.querySelector(`.golfer-head`);

    if (playerName == `biden`) {
      targetHead = await loadImage('../assets/img/biden-happy.png');
      targetHeadHit = await loadImage(`../assets/img/bidenpijnbald.png`);
      targetNotHit = await loadImage(`../assets/img/bidenblij.png`);
      playerName = `trump`
      targetName = `biden`
      $playerHead.src = `assets/img/trump-happy.png`;
    } else if (playerName == `trump`) {
      targetHead = await loadImage('../assets/img/trump-happy.png');
      targetHeadHit = await loadImage(`../assets/img/trumppijnbald.png`);
      targetNotHit = await loadImage(`../assets/img/trumpblij.png`);
      playerName = `biden`
      targetName = `trump`
      $playerHead.src = `assets/img/biden-happy.png`;

      //moet maar om de twee keer gebeuren en trump wilt altijd het laatste woord hebben, dan pas volgend level
      //console.log(isTargetHit);
      if (isTargetHit == `yes`) {
        level++;
        if (level > 2) {
          wallVelocity = 6;
        }
      }
      document.querySelector(`.level`).textContent = `level ${level}`;
    }

    isTargetHit = `not initiated`;
  }

  const startNextLevel = () => {
    if (isTargetHit != `yes`) {
      builtWall();
    }
    hitWall();
    //play sound
    if (hasPlayed == false) {
      audioWall.play();
      hasPlayed = true
    }
  }

  const builtWall = () => {
    ctx.drawImage(trumpsWall, 1000, wallY, 70 / 2.2, 439 / 2.2);
    //console.log(wallY);
    wallY -= wallVelocity;

    if (wallY < 100) {
      wallVelocity *= -1;
    } else if (wallY > 400) {
      wallVelocity *= -1;
    }
  }

  const hitWall = () => {

    let endWall = wallY + 200

    if (ball.x + ball.radius > 1000 && ball.y > wallY && ball.y < endWall && ball.x < 1200 && hasHappend2 == false) {
      horVelocity *= -1;
      addFriction(1.7);
      //console.log(`wall`);
      if (playerName == `biden`) {
        audioIfMisTrump.play();
      } else {
        audioIfMisBiden.play();
      }
      isTargetHit = `no`;
      subStatus = `You hit the great wall`;
      $subStatus.textContent = subStatus;
      switchPlayer();
      hasHappend2 = true;
    }
  }

  const startLevel4 = () => {
    if (horVelocity == 0) {
      $subStatus.textContent = `you're on the moon now, moongravity will be applied`;
    }
    document.querySelector(`.container`).classList.add("container-moon");
  }

  const endGame = () => {
    document.querySelector(`.level`).textContent = `end game`;

    let winnerMessage;
    if (pointsBiden < pointsTrump) {
      winnerMessage = `<p>Donals Trump wins!</p><img class="winner-head" src="../assets/img/trumpblij.png" alt="winner head" width="40">`
    } else if (pointsTrump < pointsBiden) {
      winnerMessage = `<p>Joe Biden wins!</p><img class="winner-head" src="../assets/img/bidenblij.png" alt="winner head" width="40">`
    } else {
      winnerMessage = `Its a tie!`
    }
    $status.innerHTML = winnerMessage;
    $subStatus.innerHTML = `<a class="play-again-button" href="index.html">Play again</a>`
  }


  const playSoundEffect = () => {
    const audio = new Audio('../assets/sound/golfbalhit.mp3');
    audio.play();
  }

  const checkSpeed = () => {
    const speed = document.querySelector(`.swing-speed`).textContent;
    if (speed == 0) {
      window.requestAnimationFrame(checkSpeed);
    } else {
      playSoundEffect()
    }
    horVelocity = speed / 3;
    verVelocity = speed / 4;
  }

  init();
}
