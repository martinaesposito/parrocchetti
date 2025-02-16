import * as THREE from "three";
import { Dot } from "./listings-three.js";
import {
  preload as detectPreload,
  setup as detectSetup,
  draw as detectDraw,
  selectedPose,
  videoExists,
} from "./detect-three.js";

// HTMLS
let p5Containter = document.getElementById("p5-container"); //setup del container

let insCenter = document.getElementById("ins-centr");
let handLegend = document.getElementById("hands-legend");

let backtotree = document.getElementById("backtotree");
let backtostart = document.getElementById("backtostart");

let leftGradient = document.getElementById("gradient-left");
let bottomGradient = document.getElementById("gradient-bottom");
let rightGradient = document.getElementById("gradient-right");

let infoEl = document.getElementById("info");
let skipEl = document.getElementById("skip");

// warning
let warning = document.getElementById("warning");
let endCounter = document.getElementById("endCounter");

// TUTORIAL
let tutorial = document.getElementById("tutorial");
let tutorialEnd = tutorial ? false : true;

let progressBar = document.getElementById("progress");

if (tutorial && progressBar) {
  if (tutorial.readyState >= 2) {
    // console.log(
    //   "CASO 1: Video is already loaded, execute the code immediately"
    // );
    tutorialEnd = false;
    const duration = tutorial.duration + "s";
    progressBar.style.animation = "pippo " + duration + " linear forwards";
  } else {
    // console.log("CASO 2: Video isn't loaded yet, add the event listener");
    tutorial.addEventListener("loadeddata", () => {
      tutorialEnd = false;
      const duration = tutorial.duration + "s";
      progressBar.style.animation = "pippo " + duration + " linear forwards";
    });
  }

  tutorial.addEventListener("ended", () => {
    // console.log("tutorial finished");
    backtostart.classList.add("visible"); //istruzioni
    insCenter.classList.add("visible");
    infoEl.classList.add("visible");
    bottomGradient.classList.add("visible");
    p5Containter.classList.add("visible"); //camera
    setTimeout(() => {
      tutorial.classList.remove("visible"); //tutorial
      progressBar.classList.remove("visible");
    }, 200);

    tutorialEnd = true;
    skipEl.style.display = "none";
  });
}

//BRANCHES
let dots = [];
let branchPositions = [];
let branchesss = [];
let platforms = [];
let plat;

const branchPlatform = [
  { value: 149, start: 0.53, end: 0.55, name: "usato.it" },
  { value: 14, start: 0.98, end: 1, name: "TrovaPet" },
  { value: 7, start: 0.35, end: 0.4, name: "animalissimo" },
  { value: 19, start: 0.9, end: 1, name: "AAAnnunci" },
  { value: 3, start: 0.65, end: 0.7, name: "petfocus" },
  { value: 11, start: 0.95, end: 1, name: "trovacuccioli" },
  { value: 14, start: 0.35, end: 0.4, name: "FB marketplace" },
  { value: 18, start: 0.75, end: 0.77, name: "AnimaleAmico" },
  { value: 143, start: 0.83, end: 0.85, name: "subito.it" },
  { value: 3, start: 0.98, end: 1, name: "petpappagalli" },
  { value: 12, start: 0.35, end: 0.4, name: "Trovalosubito" },
  { value: 44, start: 0.94, end: 0.96, name: "Telegram" },
  { value: 149, start: 0.8, end: 0.82, name: "FB pages" },
  { value: 11, start: 0.35, end: 0.4, name: "likesx" },
  { value: 177, start: 0.75, end: 0.85, name: "FB groups" },
  { value: 10, start: 0.7, end: 0.75, name: "Secondamano" },
  { value: 94, start: 0.92, end: 0.95, name: "Clasf.it" },
];

const handPoses = [
  "FingerPerch",
  "Grip",
  "HalfClosed",
  "Open",
  "Relaxed",
  "Shell",
  "TouchingTips",
];

let listingsData;

// STORIES
let storyIntro, stories;

// THREE
let scene, camera, renderer;
let canvasW, canvasH;

let p5Canvas;

let zoom = 1;
let targetZoom;

// ATLAS
const atlas = {
  texture: undefined,
  width: 0,
  height: 0,
};
let instancedMesh;

const radius = 17.5;
const imagesCount = 885;

const squareSize = 125; //dimensione delle immagini nell'atlas
const imagesPerRow = 30;

let uvOffsets;

// esporto tutto
export {
  zoom,
  scene,
  camera,
  tutorialEnd,
  warning,
  endCounter,
  p5Canvas,
  p5Containter,
  backtostart,
  backtotree,
  rightGradient,
  leftGradient,
  bottomGradient,
  infoEl,
  skipEl,
};

////////////////////////////////////////////////////////////////////
async function loadTextureAtlas(imageCount) {
  const loader = new THREE.TextureLoader();

  const atlasWidth = imagesPerRow * squareSize; // Adjust based on your needs
  const atlasHeight = imagesPerRow * squareSize;

  // CREO L'ATLAS
  // const canvas = document.createElement("canvas");
  // canvas.classList.add("hidden");
  // canvas.width = atlasWidth;
  // canvas.height = atlasHeight;
  // const ctx = canvas.getContext("2d");

  // const imagePromises = Array.from(
  //   { length: imageCount },
  //   (_, i) =>
  //     new Promise((resolve) => {
  //       loader.load(
  //         `assets/image_ultra-compress-HOME/${i + 2}.webp`,
  //         (texture) => {
  //           const img = texture.image;
  //           const x = (i % imagesPerRow) * 125 + 1;
  //           const y = Math.floor(i / imagesPerRow) * 125 + 1;
  //           ctx.drawImage(img, x, y, 123, 123);
  //           resolve();
  //         },
  //         undefined,
  //         (error) => {
  //           // Create a temporary canvas for the white image
  //           const tempCanvas = document.createElement("canvas");
  //           tempCanvas.width = 123;
  //           tempCanvas.height = 123;
  //           const tempCtx = tempCanvas.getContext("2d");

  //           // Fill it with white
  //           tempCtx.fillStyle = "white";
  //           tempCtx.fillRect(0, 0, 123, 123);

  //           // Draw the white square in the correct position
  //           const x = (i % imagesPerRow) * 125 + 1;
  //           const y = Math.floor(i / imagesPerRow) * 125 + 1;
  //           ctx.drawImage(tempCanvas, x, y);

  //           console.warn(`Failed to load image ${i + 2}: ${error}`);
  //           resolve();
  //         }
  //       );
  //     })
  // );

  // await Promise.all(imagePromises);

  // let link = document.createElement("a");
  // link.setAttribute("download", "atlas.png");
  // link.setAttribute(
  //   "href",
  //   canvas.toDataURL("image/png").replace("image/png", "image/octet-stream")
  // );
  // link.click();

  const atlasTexture = loader.load("assets/atlas_tree.png");
  atlasTexture.colorSpace = THREE.SRGBColorSpace;
  return { texture: atlasTexture, width: atlasWidth, height: atlasHeight };
}

window.setup = async () => {
  p5Canvas = createCanvas(0.15 * windowWidth, 0.15 * windowWidth * (3 / 4));
  p5Containter.appendChild(p5Canvas.canvas);

  //setup di p5 - che chiama il finto preload e il finto setup
  await preload();
  setup();
};

async function preload() {
  // ATLAS
  const { texture, width, height } = await loadTextureAtlas(imagesCount);
  atlas.texture = texture;
  atlas.width = width;
  atlas.height = height;

  // prendo tutti i listings dal json
  try {
    const response = await fetch("json/listings.json"); //carico tutti i listings
    let jsonData = await response.json();
    jsonData = jsonData.map((item, index) => ({ ...item, index }));

    listingsData = branchPlatform.map((config) => ({
      ...config, //crea un array che a partire dai dati originali di config aggiunge the number of items in jsonData matching the platform
      //se non viene trovato prende il valore di elementi di config
      value: jsonData.filter((item) => item.Platform === config.name).length,
      //  ||config.value,
      items: jsonData.filter((item) => item.Platform === config.name),
    }));
  } catch (error) {
    // If it fails, create a fallback listingsData that uses original branch configuration but with empty items
    console.error("Failed to load listings data", error);
    listingsData = branchPlatform.map((config) => ({
      ...config,
      items: [],
    }));
  }

  // stories
  stories = await fetch("./json/stories.json").then((response) =>
    response.json()
  );

  detectPreload(); // detect hand in detect.js
}

//finto setup che avvia three
function setup() {
  //legenda
  for (let i = 1; i < handPoses.length + 1; i++) {
    let hand = document.createElement("img");
    hand.src = "assets/legend/" + i + ".svg";
    hand.className = "hand";
    handLegend.appendChild(hand);
  }

  canvasW = window.innerWidth;
  canvasH = window.innerHeight;

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

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
    stencil: false,
    depth: false, // If you don't need depth testing
  });

  renderer.shadowMap.autoUpdate = false;

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(canvasW, canvasH);
  document.body.appendChild(renderer.domElement);

  const totalDots = listingsData.reduce((acc, { value }) => acc + value, 0);
  const angles = calculateAngles(listingsData);
  let total = 0;

  angles.forEach((a, index) => {
    const angle = total + a / 2 + (index > 0 ? angles[index - 1] / 2 : 0);

    const center = {
      x: canvasW / 2,
      y: canvasH / 2,
    };

    const bounds = {
      //punti di partenza e arrivo del ramo, calcolato a partire dal seno e coseno dell'angolo corrispondente
      start: {
        x: center.x,
        y: center.y,
      },
      end: {
        x: center.x + (canvasW / 2.2) * Math.cos(angle),
        y: center.y + (canvasH / 2.6) * Math.sin(angle),
      },
    };

    const branch = Object.fromEntries(
      // Convert bounds object to an array of array of (x, y)
      Object.entries(bounds).map(([key, value]) => [
        key,
        Object.fromEntries(
          Object.entries(value).map(([k, v]) => [
            k,
            map(
              listingsData[index][key], //and then map the value from listingsData (expressed in 0,1) for the specific branch/key (start/end)
              0,
              1,
              bounds.start[k],
              bounds.end[k]
            ),
          ])
        ),
      ])
    );
    total = angle;
    branchesss.push({ bounds, ...branch, angleWidth: a });
  });

  dots = generateBranchDots(branchesss);

  detectSetup();

  branchPlatform.forEach((branch, index) => {
    plat = createDiv();
    plat.class("platform fade-transition visible");
    plat.html(`${branch.name} [${listingsData[index].value}] `);
    plat.id(branch.name);
    platforms.push(plat);
  });

  // intro storyContainer
  storyIntro = createDiv();
  storyIntro.style("display", "none");
  storyIntro.addClass("introcontainer flex-column");
}

//DRAW
window.draw = () => {
  draw();
};
function draw() {
  if (!scene || !camera || !renderer) return;

  targetZoom = selectedPose ? 1.8 : 1;
  zoom += (targetZoom - zoom) * 0.1;

  if (abs(targetZoom - zoom) > 0.01) {
    camera.zoom = zoom;
    camera.updateProjectionMatrix();
  }

  // nomi delle platform
  if (branchPositions.length > 0 && platforms.length > 0) {
    branchesss.forEach((e, index) => {
      platforms[index].position(
        canvasW / 2 +
          (branchPositions[index].x - canvasW / 2) * zoom * zoom -
          platforms[index].width / 2,
        canvasH / 2 +
          (branchPositions[index].y - canvasH / 2) * zoom * zoom -
          platforms[index].height / 2
      );

      selectedPose
        ? platforms[index].removeClass("visible")
        : platforms[index].addClass("visible");
    });
  }

  dots.forEach((dot) => {
    dot.move(dots, selectedPose);
    dot.draw(selectedPose);
  });

  instancedMesh.instanceMatrix.needsUpdate = true;
  instancedMesh.geometry.attributes.position.needsUpdate = true;

  if (selectedPose) {
    changeStory(stories.findIndex((s) => s.Pose == selectedPose)); //gli passo l'indice della storia giusta
  } else {
    storyIntro.style("display", "none");
    insCenter.style.display = "flex";
  }

  detectDraw(tutorialEnd);

  renderer.render(scene, camera);
}

// //////////////////////////////////////////////////////////////////////////
//funzione che genera i listings per ciascun ramo che viene chiamata nel setup
function generateBranchDots(branches) {
  const allDots = [];

  // INS
  const instanceGeometry = new THREE.PlaneGeometry(radius, radius);
  const instanceMaterial = new THREE.MeshBasicMaterial({
    map: atlas.texture,
    transparent: true,
  });

  uvOffsets = new Float32Array(885 * 2); // Store UV offsets for each plane

  instancedMesh = new THREE.InstancedMesh(
    instanceGeometry,
    instanceMaterial,
    885
  );

  branches.forEach((branch, bIndex) => {
    const branchDots = [];
    const items = listingsData[bIndex].items;

    const branchAngle = Math.atan2(
      branch.bounds.end.y - branch.bounds.start.y,
      branch.bounds.end.x - branch.bounds.start.x
    );
    const perpAngle = branchAngle + Math.PI / 2;

    // Generate a single t value for this entire branch
    const branchT = random(
      branchPlatform[bIndex].start,
      branchPlatform[bIndex].end
    );

    // Base position along the branch (no offset)
    const baseX = lerp(branch.bounds.start.x, branch.bounds.end.x, branchT);
    const baseY = lerp(branch.bounds.start.y, branch.bounds.end.y, branchT);

    // Final position with perpendicular offset
    const offset = randomGaussian() * 50;
    const finalX = baseX + Math.cos(perpAngle) * offset;
    const finalY = baseY + Math.sin(perpAngle) * offset;

    // Store the final position in branchPositions
    branchPositions.push({ x: baseX, y: baseY });
    // console.log(items.length);

    items.forEach((item, i) => {
      const dotIndex = allDots.length + branchDots.length; //indice dell'immagine che va da 1 a 855
      // console.log(dotIndex, item);
      // Calculate UV offsets based on the atlas grid
      const atlasX = item.index % imagesPerRow; // Position in the 30x30 grid
      const atlasY = imagesPerRow - 1 - Math.floor(item.index / imagesPerRow);
      uvOffsets[item.index * 2] = atlasX / imagesPerRow; // U coordinate
      uvOffsets[item.index * 2 + 1] = atlasY / imagesPerRow; // V coordinate

      const dot = new Dot(
        { ...branch, index: bIndex, branchT },
        item.index,
        15,
        item,
        { x: baseX, y: baseY }, // Base position
        { x: finalX, y: finalY }, // Final position
        instancedMesh
      );
      branchDots.push(dot);
    });

    allDots.push(...branchDots);
  });

  instancedMesh.geometry.setAttribute(
    "uvOffset",
    new THREE.InstancedBufferAttribute(uvOffsets, 2)
  );

  instancedMesh.material.onBeforeCompile = (shader) => {
    shader.vertexShader = `
              attribute vec2 uvOffset;
              varying vec2 vUv;
  
              ${shader.vertexShader}
          `.replace(
      "#include <uv_vertex>",
      `
              float uvPaddingX = 5.0 / ${atlas.width.toFixed(1)};
              float uvPaddingY = 5.0 / ${atlas.height.toFixed(1)};
              
              vUv = uvOffset + uv * vec2(118.0 / ${atlas.width.toFixed(
                1
              )}, 118.0 / ${atlas.height.toFixed(
        1
      )}) + vec2(uvPaddingX, uvPaddingY);
              `
    );

    shader.fragmentShader = `
              varying vec2 vUv;
  
              ${shader.fragmentShader}
          `.replace(
      "#include <map_fragment>",
      `#ifdef USE_MAP
                  vec4 texColor = texture2D(map, vUv);
                  
                  diffuseColor = texColor;
              #endif`
    );
  };

  scene.add(instancedMesh);

  return allDots;
}

// //////////////////////////////////////////////////////////////////
function changeStory(indexStory) {
  let intro = stories[indexStory];
  storyIntro.html(
    "<img id='img-introS' src='assets/cursor/" +
      (indexStory + 1) +
      ".svg'> <div class='overlaybox' id='title'>" +
      intro.TitleIta +
      "</br><span class='eng'>" +
      intro.TitleEng +
      "</span></div><div id='descr' class='overlaybox flex-column gap'>" +
      intro.DescriptionIta +
      "</br><span class='eng'>" +
      intro.DescriptionEng +
      "</span></div>"
  );

  storyIntro.style("display", "flex");
  insCenter.style.display = "none";
}

function calculateAngles(listingsData) {
  const totalDots = listingsData.reduce((acc, { value }) => acc + value, 0);

  const rawAngles = listingsData.map(
    ({ value }) => 2 * Math.PI * (value / totalDots)
  );

  const minAngle = 0.2; // Set minimum angle (0.3 radians)
  // Count how many angles would be below minimum
  const smallAngles = rawAngles.filter((angle) => angle < minAngle).length;

  // Calculate how much space remains for proportional distribution
  const reservedSpace = smallAngles * minAngle;
  const remainingSpace = 2 * Math.PI - reservedSpace;

  // Calculate sum of values for angles that will be proportional
  const proportionalSum = listingsData
    .filter(({ value }) => 2 * Math.PI * (value / totalDots) >= minAngle)
    .reduce((acc, { value }) => acc + value, 0);

  // Final angle calculation
  const adjustedAngles = listingsData.map(({ value }) => {
    const rawAngle = 2 * Math.PI * (value / totalDots);
    if (rawAngle < minAngle) {
      return minAngle;
    } else {
      // Distribute remaining space proportionally
      return remainingSpace * (value / proportionalSum);
    }
  });

  // Verify the sum equals 2π
  const sum = adjustedAngles.reduce((acc, angle) => acc + angle, 0);
  return adjustedAngles;
}
