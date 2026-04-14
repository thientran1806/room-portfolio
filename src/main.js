import './style.scss'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { DRACOLoader } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import gsap from 'gsap';

const canvas = document.querySelector("#experience-canvas");
const scene = new THREE.Scene();
const sizes = {
  height: window.innerHeight,
  width: window.innerWidth
};

const modals = {
  work: document.querySelector(".modal.work"),
  about: document.querySelector(".modal.about"),
  contact: document.querySelector(".modal.contact"),
};

let touchHappened = false;
document.querySelectorAll(".modal-exit-button").forEach(button=>{
  button.addEventListener("touchend", (e)=>{
    touchHappened = true;
    e.preventDefault();
    const modal = e.target.closest(".modal");
    hideModal(modal);
  }, { passive: false }
);

  button.addEventListener("click", (e)=>{
    if (touchHappened) return;
    e.preventDefault();
    const modal = e.target.closest(".modal");
    hideModal(modal);
  }, { passive: false }
);
})

const showModal = (modal) => {
  modal.style.display = "block";

  gsap.set(modal, {opacity: 0});

  gsap.to(modal, {
    opacity: 1,
    duration: 0.5
  })
};
const hideModal = (modal) => {
  gsap.to(modal, {
    opacity: 0,
    duration: 0.5,
    onComplete: () => {
      modal.style.display = "none";
    }
  });
};

const xAxisFans = [];

const raycasterObjects = [];
let currentIntersects = [];

const socialLinks = {
  Github : "https://github.com",
  Linkedln : "https://www.linkedin.com/in/trong-thien-tran-61931931b/",
};

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

//loaders
const textureLoader = new THREE.TextureLoader();

//model loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

const environmentMap = new THREE.CubeTextureLoader().setPath( 'textures/skybox/' );

const textureMap = {
  First: {
    day:"/textures/Fiesr_Texture_Set.webp"
  },
  Second: {
    day:"/textures/Second_Texture_Set.webp"
  },
  Third: {
    day:"/textures/Third_Texture_Set.webp"
  },
  Fourth: {
    day:"/textures/Fourth_Texture_Set.webp"
  }
}

const videoElement = document.createElement("video");
videoElement.src = "/textures/video/blue-wave.mp4";
videoElement.loop = true;
videoElement.muted = true;
videoElement.playsInline = true;
videoElement.autoplay = true;
videoElement.play()

const videoTexture = new THREE.VideoTexture(videoElement);
videoTexture.colorSpace = THREE.SRGBColorSpace;
videoTexture.flipY = false;

window.addEventListener("mousemove", (e) =>{
  touchHappened = false;
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
})

window.addEventListener("touchstart", (e) =>{
  e.preventDefault()
  pointer.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
}, {passive: false})

window.addEventListener("touchend", (e) =>{
  e.preventDefault();
  handleRaycasterInteraction;
}, {passive: false})

function handleRaycasterInteraction(){
  if(currentIntersects.length > 0){
    const object = currentIntersects[0].object;

    Object.entries(socialLinks).forEach(([key, url]) => {
      if(object.name.includes(key)){
        const newWindow = window.open();
        newWindow.opener = null;
        newWindow.location = url;
        newWindow.target = "_blank";
        newWindow.rel = "noopener noreferrer";
      }
    });

    if(object.name.includes("my_work")){
      showModal(modals.work)
    }
    else if (object.name.includes("about_button")){
      showModal(modals.about)
    }
    else if (object.name.includes("contact_button")){
      showModal(modals.contact)
    }
  }
}

window.addEventListener("click", handleRaycasterInteraction);

const loadedTextures = {
  day: {}
}

Object.entries(textureMap).forEach(([key, paths])=>{
  const dayTexture = textureLoader.load(paths.day);
  dayTexture.flipY = false;
  dayTexture.colorSpace = THREE.SRGBColorSpace;
  loadedTextures.day[key] = dayTexture;
})

loader.load("/models/room-v5.glb", (glb)=>{
  glb.scene.traverse(child=>{
    if(child.isMesh){
      //use to check if the mesh is existed
      console.log(child.name);
      Object.keys(textureMap).forEach((key)=>{
        if(child.name.includes(key)){
          const material = new THREE.MeshBasicMaterial({
            map:loadedTextures.day[key],
          })
          child.material= material;

          if(child.name.includes("fans")){
            xAxisFans.push(child);
          }

          if(child.material.map){
            child.material.map.minFilter = THREE.LinearFilter;
          }
        }
        if(child.name.includes("Raycaster")){
          raycasterObjects.push(child);
        }
        if(child.name.includes("Glass")){
          child.material = new THREE.MeshPhysicalMaterial({
            transmission: 1,
            opacity: 1,
            metalness: 0,
            roughness: 0,
            ior: 1.5,
            thickness: 0.01,
            specularIntensity: 1,
            // envMap: cubeTexture,
            envMapIntensity: 1,
          })
        }
        else if(child.name.includes("Screen")){
          child.material = new THREE.MeshBasicMaterial({
            map: videoTexture
          })
        }
        else if(child.name.includes("Light")){
          child.material = new THREE.MeshBasicMaterial({
            color: 0xffffff
          })
        }
        else if(child.name.includes("Pink_Light")){
          child.material = new THREE.MeshBasicMaterial({
            color: 0xff3399
          })
        }
      })
    }
  })
  // scene.background = cubeTexture
  scene.add(glb.scene);
})

const camera = new THREE.PerspectiveCamera( 45, sizes.width / sizes.height, 0.1, 1000 );
camera.position.set(16.338858629112558, 11.468893913732414, -20.808848254815302);

const renderer = new THREE.WebGLRenderer({ canvas:canvas, antialias:true });
renderer.setSize( sizes.width, sizes.height );
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.update();
controls.target.set(1, 2.5, 0);
// Restrict horizontal rotation
controls.minAzimuthAngle = Math.PI / 2;   
controls.maxAzimuthAngle = -Math.PI ;  

// Restrict vertical rotation 
controls.minPolarAngle = Math.PI / 4;      // 30° from top
controls.maxPolarAngle = Math.PI / 2;   // ~82° (just above horizon)

//event listeners
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  //update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix(); 

  //update renderers
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})

const render = () => {
  controls.update();

  // console.log(camera.position);
  // console.log(controls.target);

  // Animate Fans
  xAxisFans.forEach((fan) => {
    fan.rotation.x += 0.1;
  });

  // Raycaster
  raycaster.setFromCamera(pointer, camera);

  //calculate object intersecting the picking ray
  currentIntersects = raycaster.intersectObjects(raycasterObjects);
  
  for(let i=0; i<currentIntersects.length; i++)
  {
    
  }

  if(currentIntersects.length>0)
  {
    const currentIntersectsObject = currentIntersects[0].object;

    if(currentIntersectsObject.name.includes("Raycaster_Pointer")){
      document.body.style.cursor = "pointer";
    }else{
      document.body.style.cursor = "default";
    }
  }
  else{
    document.body.style.cursor = "default";
  }

  renderer.render(scene, camera );
  window.requestAnimationFrame(render);
}

render();