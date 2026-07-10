const canvas = document.getElementById("topographicCanvas");
const ctx = canvas.getContext("2d");


const settings = {
 gridSize: 13,
 noiseScale: 0.00215,
 animationSpeed: 0.0001,


 contourStart: -0.82,
 contourEnd: 0.82,
 contourGap: 0.155,


 lineWidth: 1.2,
 lineOpacity: 0.32,


 mouseRadius: 260,
 mouseStrength: 0.4,
 mouseSmoothness: 0.055
};


let width = 0;
let height = 0;
let pixelRatio = 1;


let columns = 0;
let rows = 0;
let fieldValues = new Float32Array();


const pointer = {
 x: -1000,
 y: -1000,
 targetX: -1000,
 targetY: -1000
};


function resizeCanvas() {
 width = window.innerWidth;
 height = window.innerHeight;


 pixelRatio = Math.min(window.devicePixelRatio || 1, 2);


 canvas.width = Math.floor(width * pixelRatio);
 canvas.height = Math.floor(height * pixelRatio);


 canvas.style.width = `${width}px`;
 canvas.style.height = `${height}px`;


 ctx.setTransform(
   pixelRatio,
   0,
   0,
   pixelRatio,
   0,
   0
 );


 columns = Math.ceil(width / settings.gridSize) + 2;
 rows = Math.ceil(height / settings.gridSize) + 2;


 fieldValues = new Float32Array(columns * rows);
}


function calculateFieldValue(x, y, time) {
 const scale = settings.noiseScale;


 const waveOne =
   Math.sin(x * scale * 0.9 + time * 0.82) *
   Math.cos(y * scale * 1.25 - time * 0.58);


 const waveTwo = Math.sin(
   x * scale * 0.55 +
   y * scale * 0.67 +
   time * 0.48
 );


 const waveThree = Math.cos(
   x * scale * 1.42 -
   y * scale * 0.38 -
   time * 0.35
 );


 const centreOneX = width * 0.24;
 const centreOneY = height * 0.32;


 const centreTwoX = width * 0.73;
 const centreTwoY = height * 0.67;


 const radialOne = Math.sin(
   Math.hypot(
     x - centreOneX,
     y - centreOneY
   ) *
     scale *
     1.25 -
     time * 0.9
 );


 const radialTwo = Math.cos(
   Math.hypot(
     x - centreTwoX,
     y - centreTwoY
   ) *
     scale *
     1.08 +
     time * 0.62
 );


 let value =
   waveOne * 0.31 +
   waveTwo * 0.22 +
   waveThree * 0.18 +
   radialOne * 0.17 +
   radialTwo * 0.12;


 const pointerDistance = Math.hypot(
   x - pointer.x,
   y - pointer.y
 );


 if (pointerDistance < settings.mouseRadius) {
   const falloff =
     1 - pointerDistance / settings.mouseRadius;


   const ripple = Math.sin(
     pointerDistance * 0.025 -
     time * 2.1
   );


   value +=
     ripple *
     falloff *
     falloff *
     settings.mouseStrength;
 }


 return value;
}


function updateField(time) {
 const gridSize = settings.gridSize;


 for (let row = 0; row < rows; row++) {
   for (let column = 0; column < columns; column++) {
     const x = column * gridSize;
     const y = row * gridSize;


     fieldValues[row * columns + column] =
       calculateFieldValue(x, y, time);
   }
 }
}


function getInterpolation(valueA, valueB, threshold) {
 const difference = valueB - valueA;


 if (Math.abs(difference) < 0.00001) {
   return 0.5;
 }


 return Math.max(
   0,
   Math.min(
     1,
     (threshold - valueA) / difference
   )
 );
}


function addSegment(pointA, pointB) {
 ctx.moveTo(pointA.x, pointA.y);
 ctx.lineTo(pointB.x, pointB.y);
}


function drawContourLevel(threshold) {
 const gridSize = settings.gridSize;


 for (let row = 0; row < rows - 1; row++) {
   for (
     let column = 0;
     column < columns - 1;
     column++
   ) {
     const x = column * gridSize;
     const y = row * gridSize;


     const topLeft =
       fieldValues[row * columns + column];


     const topRight =
       fieldValues[row * columns + column + 1];


     const bottomRight =
       fieldValues[
         (row + 1) * columns + column + 1
       ];


     const bottomLeft =
       fieldValues[
         (row + 1) * columns + column
       ];


     let state = 0;


     if (topLeft >= threshold) state |= 1;
     if (topRight >= threshold) state |= 2;
     if (bottomRight >= threshold) state |= 4;
     if (bottomLeft >= threshold) state |= 8;


     if (state === 0 || state === 15) {
       continue;
     }


     const topAmount = getInterpolation(
       topLeft,
       topRight,
       threshold
     );


     const rightAmount = getInterpolation(
       topRight,
       bottomRight,
       threshold
     );


     const bottomAmount = getInterpolation(
       bottomLeft,
       bottomRight,
       threshold
     );


     const leftAmount = getInterpolation(
       topLeft,
       bottomLeft,
       threshold
     );


     const top = {
       x: x + topAmount * gridSize,
       y
     };


     const right = {
       x: x + gridSize,
       y: y + rightAmount * gridSize
     };


     const bottom = {
       x: x + bottomAmount * gridSize,
       y: y + gridSize
     };


     const left = {
       x,
       y: y + leftAmount * gridSize
     };


     switch (state) {
       case 1:
       case 14:
         addSegment(left, top);
         break;


       case 2:
       case 13:
         addSegment(top, right);
         break;


       case 3:
       case 12:
         addSegment(left, right);
         break;


       case 4:
       case 11:
         addSegment(right, bottom);
         break;


       case 5:
         addSegment(left, top);
         addSegment(right, bottom);
         break;


       case 6:
       case 9:
         addSegment(top, bottom);
         break;


       case 7:
       case 8:
         addSegment(left, bottom);
         break;


       case 10:
         addSegment(top, right);
         addSegment(left, bottom);
         break;
     }
   }
 }
}


function render(timestamp) {
 const time = timestamp * settings.animationSpeed;


 pointer.x +=
   (pointer.targetX - pointer.x) *
   settings.mouseSmoothness;


 pointer.y +=
   (pointer.targetY - pointer.y) *
   settings.mouseSmoothness;


 ctx.clearRect(0, 0, width, height);


 updateField(time);


 ctx.beginPath();


 for (
   let threshold = settings.contourStart;
   threshold <= settings.contourEnd;
   threshold += settings.contourGap
 ) {
   drawContourLevel(threshold);
 }


 ctx.strokeStyle =
   `rgba(36, 38, 37, ${settings.lineOpacity})`;


 ctx.lineWidth = settings.lineWidth;
 ctx.lineCap = "round";
 ctx.lineJoin = "round";


 ctx.stroke();


 requestAnimationFrame(render);
}


window.addEventListener("resize", resizeCanvas);


window.addEventListener("pointermove", (event) => {
 pointer.targetX = event.clientX;
 pointer.targetY = event.clientY;
});


window.addEventListener("pointerleave", () => {
 pointer.targetX = -1000;
 pointer.targetY = -1000;
});


window.addEventListener(
 "touchmove",
 (event) => {
   const touch = event.touches[0];


   if (!touch) return;


   pointer.targetX = touch.clientX;
   pointer.targetY = touch.clientY;
 },
 {
   passive: true
 }
);


resizeCanvas();
requestAnimationFrame(render);
