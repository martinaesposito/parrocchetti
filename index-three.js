import {
  preload as detectPreload,
  setup as detectSetup,
  draw as detectDraw,
  cursor as detectCursor,
  handimages,
  canvasW,
  canvasH,
  video,
} from "./detect-three.js";

import { sceneToScreen, screenToScene } from "./utils.js";

import * as THREE from "three";
// THREE
let scene, camera, renderer;

// TITOLONE
let font;
let imgPoints = []; //array dei punti dei titoli
let time = 0;
let targetPositions = []; // Store target positions for easing
let currentPositions = []; // Store current positions for easing
let velocities = []; // Store velocities for each point

let points = [];
let fontSize = 180;

let bounds1, bounds2;
let subTitle;

//immaginine
let images = [];

// loading
let loading = document.getElementById("loading");
let imgLoading = document.getElementById("loading-img");
// imgLoading.src =
//   "assets/loading/" + Math.floor(Math.random() * 8 + 1).toString() + ".gif";

let cursorCtn = document.getElementById("cursor-container");
let cursorImage = document.getElementById("pos8");

////////////////////////////////////////////////////////////////////

window.setup = async () => {
  //setup di p5 - che chiama il finto preload e il finto setup
  await preload();
  setup();
};
async function preload() {
  font = loadFont("assets/fonts/IBM_Plex_Sans/IBMPlexSans-Regular.ttf");

  //immaginine piccole
  const imagePromises = [];
  const loader = new THREE.TextureLoader();

  for (let i = 2; i < 887; i++) {
    const imagePromise = new Promise((resolve) => {
      loader.load(
        `assets/image_ultra-compress/${i}.webp`,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          images.push(texture); // Store with numeric keys
          resolve();
        },
        () => {},
        (e) => {
          resolve(); // Resolve even if the image fails
        }
      );
    });
    imagePromises.push(imagePromise);
  }

  await Promise.all(imagePromises);
  // console.log(images);
  detectPreload();
}

// SETUP
function setup() {
  //finto setup che avvia three

  // three
  scene = new THREE.Scene();
  // scene.background = new THREE.Color().setHex(0xffffff);

  camera = new THREE.OrthographicCamera(
    canvasW / -2,
    canvasW / 2,
    canvasH / 2,
    canvasH / -2,
    1,
    1000
  );
  camera.position.z = 1;

  console.log(scene, camera);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(canvasW, canvasH);
  document.body.appendChild(renderer.domElement);

  // TITOLONE
  // Measure text bounds
  bounds1 = font.textBounds("Handling", 0, 0, fontSize);
  bounds2 = font.textBounds("Parakeets", 0, 0, fontSize);
  const sampleFactor = 0.175;

  // // Get points with translation and add points to array
  points = [
    ...font.textToPoints("Handling", -bounds1.w / 2, -bounds1.h / 2, fontSize, {
      sampleFactor,
    }),
    ...font.textToPoints("Parakeets", -bounds2.w / 2, bounds1.h / 2, fontSize, {
      sampleFactor,
    }),
  ];
  console.log(images);
  // Initialize positions and velocities
  points.forEach((p, i) => {
    let size = random(12.5, 17.5);
    const geometry = new THREE.PlaneGeometry(size, size);

    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      // color: new THREE.Color().setRGB(0, 0, 0),
      map: i < images.length ? images[i] : images[floor(random(images.length))],
    });
    const mesh = new THREE.Mesh(geometry, material);
    let coords = screenToScene(camera, [p.x + canvasW / 2, p.y + canvasH / 2]);
    mesh.position.set(coords.x, coords.y, 0);

    imgPoints.push(mesh);
    scene.add(mesh);

    // Initialize positions
    currentPositions[i] = new THREE.Vector3(coords.x, coords.y, 0);
    targetPositions[i] = new THREE.Vector3(coords.x, coords.y, 0);
    velocities[i] = new THREE.Vector3(0, 0, 0);
  });
  // console.log(imgPoints);

  // // SUBTITLE
  subTitle = document.getElementById("subtitle");
  subTitle.style.top = `${canvasH / 2 + (bounds1.h * 3) / 4}px`; // Adjust as needed

  loading.style.display = "none"; //nascondo il loading
  detectSetup();
  video ? (video.style.display = "none") : null;
}

window.draw = () => {
  draw();
};
let first;
function draw() {
  if (!scene || !camera || !renderer) return;

  if (!detectCursor && !first) {
    cursorCtn.style.display = "block";
    cursorImage.style.display = "block";
    cursorCtn.style.left = "80vw";
    cursorCtn.style.top = "90vh";
    cursorCtn.style.animation = "wave 3s infinite";
  } else {
    first = true;
    cursorCtn.style.top = "0px";
    cursorCtn.style.left = "0px";
    cursorCtn.style.animation = "none";
  }

  time += 0.01;

  points.forEach((p, i) => {
    // Calculate noise-based movement
    let xOffset = map(
      noise(i, time * 0.5) * 0.4 + noise(i + 200, time * 0.01) * 0.4,
      0,
      1,
      -20,
      20
    );
    let yOffset = map(
      noise(i, (time + 100) * 0.7) * 0.4 + noise(i + 400, time * 0.01) * 0.4,
      0,
      1,
      -20,
      20
    );

    // Vector math for cursor distance
    const cursorVec = new THREE.Vector2(
      detectCursor ? detectCursor.x : p.x,
      detectCursor ? detectCursor.y : p.y
    );
    const pointVec = new THREE.Vector2(p.x, -p.y);
    const distance = cursorVec.distanceTo(pointVec);
    console.log;
    // Update target position
    targetPositions[i].set(p.x + xOffset, -(p.y + yOffset), 0);

    // Mouse repulsion
    const repulsionRadius = imgPoints[i].geometry.parameters.width * 4;
    if (detectCursor && distance < repulsionRadius) {
      const repulsionForce =
        (1 - distance / repulsionRadius) ** 2 *
        imgPoints[i].geometry.parameters.width *
        2;
      const angle = Math.atan2(p.y - detectCursor.y, p.x - detectCursor.x);
      targetPositions[i].x += Math.cos(angle) * repulsionForce;
      targetPositions[i].y += Math.sin(angle) * repulsionForce;
    }

    // Smooth movement
    const easing = 0.3;
    velocities[i].lerp(
      new THREE.Vector3(
        (targetPositions[i].x - currentPositions[i].x) * easing,
        (targetPositions[i].y - currentPositions[i].y) * easing,
        0
      ),
      1
    );

    currentPositions[i].add(velocities[i]);
    imgPoints[i].position.set(
      currentPositions[i].x,
      currentPositions[i].y,
      currentPositions[i].z
    );
  });

  renderer.render(scene, camera);

  detectDraw(false);
}
// VERSIONE CON IMMAGINI + RECT
// if (imgPoints[i].type == "image") {
//   // Draw image
//   image(
//     imgPoints[i].img,
//     currentPositions[i].x + xOffset / 100,
//     currentPositions[i].y + yOffset / 100,
//     imgPoints[i].size,
//     imgPoints[i].size
//   );
// } else {
//   // Draw colored rect
//   fill(imgPoints[i].c);
//   rect(
//     currentPositions[i].x + xOffset / 100,
//     currentPositions[i].y + yOffset / 100,
//     imgPoints[i].size,
//     imgPoints[i].size
//   );
// }

// VERSIONE CON SOLO IMMAGINI
// Draw image at current position
// image(
//   imgPoints[i].img,
//   currentPositions[i].x + xOffset / 100,
//   currentPositions[i].y + yOffset / 100,
//   imgPoints[i].size,
//   imgPoints[i].size
// );
// noStroke();
//   if (imgPoints[i].type == "image") {
//     stroke("#C9FF4C");
//     strokeWeight(3);
//   } else noStroke();

//   // VERSIONE CON SOLO RETTANGOLINI
//   fill(imgPoints[i].c);
//   rect(
//     currentPositions[i].x + xOffset / 100,
//     currentPositions[i].y + yOffset / 100,
//     imgPoints[i].size
//   );

// translate(0, 0, 1);

// TOLGO LA PARTE DEL CURSORE
// if (!detectCursor && handimages?.[4]?.width) {
//   const handImage = handimages[4];
//   image(
//     handImage,
//     0,
//     (bounds1.h * 4) / 3.2,
//     (handImage.width / 3) * 2,
//     (handImage.height / 3) * 2
//   );
// }
// }
