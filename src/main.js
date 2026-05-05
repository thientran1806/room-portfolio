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

let  isModalOpen = false;

const showModal = (modal) => {
  modal.style.display = "flex";
  isModalOpen = true;
  controls.enabled = false;

  if(currentHoveredObject){
    playHoverAnimation(currentHoveredObject, false)
    currentHoveredObject = null
  }
  document.body.style.cursor = "default";
  currentIntersects = [];

  gsap.set(modal, {opacity: 0});

  gsap.to(modal, {
    opacity: 1,
    duration: 0.5
  })
};
const hideModal = (modal) => {
  isModalOpen = false;
  controls.enabled = true;
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
let currentHoveredObject = null;

const socialLinks = {
  Github : "https://github.com/thientran1806",
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
    day:"/textures/First_Texture_Set.webp"
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

const vinylAudio = new Audio("/textures/sound/opalite.mp3");
vinylAudio.loop = true;
vinylAudio.volume = 0.7;

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
  if(isModalOpen) return;
  e.preventDefault()
  pointer.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
}, {passive: false})

window.addEventListener("touchend", (e) =>{
  if(isModalOpen) return;
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
    else if (object.name.includes("vinyl_disc")){
      toggleVinylAnimation();
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

let hanging1;
let hanging2;
let contactbtn;
let myworkbtn;
let aboutbtn;
let linkedlnbtn;
let githubbtn;
let vinylDisc;
let armVinyl;
let isVinylPlaying = false;
let vinylSpinTween = null;

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
        if(child.name.includes("Hover")){
          child.userData.initialScale = new THREE.Vector3().copy(child.scale);
          child.userData.initialPosition = new THREE.Vector3().copy(child.position);
          child.userData.initialRotation = new THREE.Euler().copy(child.rotation); 
        }
        if(child.name.includes("hanging_1")){
          hanging1 = child;
          child.scale.set(0, 0, 0);
        }
        else if(child.name.includes("hanging_2")){
          hanging2 = child;
          child.scale.set(0, 0, 0);
        }
        else if(child.name.includes("my_work")){
          myworkbtn = child;
          child.scale.set(0, 0, 0);
          child.userData.initialScale = new THREE.Vector3(1, 2, 1);
        }
        else if(child.name.includes("contact")){
          contactbtn = child;
          child.scale.set(0, 0, 0);
          child.userData.initialScale = new THREE.Vector3(1, 2, 1);
        }
        else if(child.name.includes("about")){
          aboutbtn = child;
          child.scale.set(0, 0, 0);
          child.userData.initialScale = new THREE.Vector3(1, 2, 1);
        }
        else if(child.name.includes("Linkedln")){
          linkedlnbtn = child;
          child.scale.set(0, 0, 0);
          child.userData.initialScale = new THREE.Vector3(1, 1, 1);
        }
        else if(child.name.includes("Github")){
          githubbtn = child;
          child.scale.set(0, 0, 0);
          child.userData.initialScale = new THREE.Vector3(1, 2, 1);
        }
        else if(child.name.includes("vinyl_disc")){
          vinylDisc = child;
          child.userData.initialRotation = new THREE.Euler().copy(child.rotation);
          raycasterObjects.push(child); 
        }        
        else if(child.name.includes("arm_vinyl")){
          armVinyl = child;
          child.userData.initialRotation = new THREE.Euler().copy(child.rotation);
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
  playIntroAnimation();
  window.finishLoading();
});

function playIntroAnimation() {
  const t1 = gsap.timeline({
    defaults:{
      duration: 0.8,
      ease: "back.out(1.8)",
    }
  })

  t1.to(hanging1.scale, {
    z:1,
    x:1,
    y:1,
  }, "-=0.5").to(hanging2.scale, {
    z:1,
    y:1,
    x:1,
  }, "-=0.5" ) 
    .to(myworkbtn.scale, {
    z:1,
    y:2,
    x:1,
  }, "-=0.6") 
    .to(contactbtn.scale, {
    z:1,
    y:2,
    x:1,
  }, "-=0.6") 
    .to(aboutbtn.scale, {
    z:1,
    y:2,
    x:1,
  }, "-=0.6")
  const t2 = gsap.timeline({
    defaults:{
      duration: 0.8,
      ease: "back.out(1.8)",
    }
  })

  t1.to(linkedlnbtn.scale, {
    z:1,
    x:1,
    y:1,
  }).to(githubbtn.scale, {
    z:1,
    y:1,
    x:1,
  } ) 
}

function toggleVinylAnimation() {
  if (!vinylDisc || !armVinyl) return;
 
  isVinylPlaying = !isVinylPlaying;
 
  if (isVinylPlaying) {
    // Move arm onto the disc (rotate +45 degrees on Y axis)
    gsap.to(armVinyl.rotation, {
      y: armVinyl.userData.initialRotation.y - Math.PI / 7,
      duration: 0.8,
      ease: "power2.inOut",
    });
 
    // Spin the disc continuously
    vinylSpinTween = gsap.to(vinylDisc.rotation, {
      y: vinylDisc.rotation.y + Math.PI * 2,
      duration: 2,
      ease: "none",
      repeat: -1,
    });
    // play music
    vinylAudio.play();
  } else {
    // Move arm back to resting position
    gsap.to(armVinyl.rotation, {
      y: armVinyl.userData.initialRotation.y,
      duration: 0.8,
      ease: "power2.inOut",
    });
 
    // Gradually slow down and stop the disc
    if (vinylSpinTween) {
      vinylSpinTween.kill();
      vinylSpinTween = null;
    }
    gsap.to(vinylDisc.rotation, {
      y: vinylDisc.userData.initialRotation
        ? vinylDisc.userData.initialRotation.y
        : 0,
      duration: 1.2,
      ease: "power2.out",
    });
    // Fade out and stop music
    gsap.to(vinylAudio, {
      volume: 0,
      duration: 1.2,
      ease: "power2.out",
      onComplete: () => {
        vinylAudio.pause();
        vinylAudio.currentTime = 0;
        vinylAudio.volume = 0.7;
      }
    });
  }
}

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

// restrict distance
controls.minDistance = 3;
controls.maxDistance = 30;

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

const scaleFactor = 1.2;
const scaleFactorEnabled = true;

function playHoverAnimation (object, isHovering){
  gsap.killTweensOf(object.scale);
  gsap.killTweensOf(object.position);
  gsap.killTweensOf(object.rotation);

  const activeScale = (scaleFactorEnabled && !object.name.includes("Hover2")) ? scaleFactor: 0.8;

  const isHover2 = object.name.includes("Hover2");
  const isHover3 = object.name.includes("Hover3");
  const isMyWork = object.name.includes("my_work");
  const isContact = object.name.includes("contact");
  const isAbout = object.name.includes("about");
  const isButton = isMyWork || isContact || isAbout;

  if(isHovering)
  {
    gsap.to(object.scale, {
      x: object.userData.initialScale.x * (isHover2 ? 1.2 : isHover3 ? 1.0: activeScale ),
      y: object.userData.initialScale.y * (isHover2 ? 1.0 : isHover3 ? 1.0: activeScale),
      z: object.userData.initialScale.z * (isHover2 ? 1.0 : isHover3 ? 1.1: activeScale),
      duration: 0.5,
      ease: "bounce.out(1.8)"
    })
    if(!isHover2 && !isHover3){
      gsap.to(object.rotation, {
        z: object.userData.initialRotation.y + (isButton ? Math.PI / 12 : 0),
        duration: 0.5,
        ease: "bounce.out(1.8)",
      })
    }
  }else{
    gsap.to(object.scale, {
      x: object.userData.initialScale.x,
      y: object.userData.initialScale.y,
      z: object.userData.initialScale.z,
      duration: 0.3,
      ease: "bounce.out(1.8)"
    })
    if(!isHover2 && !isHover3){
      gsap.to(object.rotation, {
        y: object.userData.initialRotation.y,
        x: object.userData.initialRotation.x,
        z: object.userData.initialRotation.z,
        duration: 0.3,
        ease: "bounce.out(1.8)",
      })
    }
  }
}

const render = () => {
  controls.update();

  // console.log(camera.position);
  // console.log(controls.target);

  // Animate Fans
  xAxisFans.forEach((fan) => {
    fan.rotation.x += 0.1;
  });

  // Raycaster
  if(!isModalOpen){
    raycaster.setFromCamera(pointer, camera);

  //calculate object intersecting the picking ray
  currentIntersects = raycaster.intersectObjects(raycasterObjects);
  
  for(let i=0; i<currentIntersects.length; i++)
  {
  }

  if(currentIntersects.length>0)
  {
    const currentIntersectsObject = currentIntersects[0].object;

    if(currentIntersectsObject.name.includes("Hover")){
      if(currentIntersectsObject !== currentHoveredObject){

        if(currentHoveredObject){
          playHoverAnimation(currentHoveredObject, false)
        }

        playHoverAnimation(currentIntersectsObject, true);
        currentHoveredObject = currentIntersectsObject;
      }
    }

    if(currentIntersectsObject.name.includes("Raycaster_Pointer")){
      document.body.style.cursor = "pointer";
    }else{
      document.body.style.cursor = "default";
    }
  }
  else{
    if(currentHoveredObject){
      playHoverAnimation(currentHoveredObject,false);
      currentHoveredObject = null;
    }
    document.body.style.cursor = "default";
  }
  }
  renderer.render(scene, camera );
  window.requestAnimationFrame(render);
}

render();