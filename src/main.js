import './style.scss'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { DRACOLoader } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

const canvas = document.querySelector("#experience-canvas");
const scene = new THREE.Scene();
const sizes = {
  height: window.innerHeight,
  width: window.innerWidth
}

//loaders
const textureLoader = new THREE.TextureLoader();

//model loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

const environmentMap = new THREE.CubeTextureLoader().setPath( 'textures/skybox/' );
const cubeTexture = await environmentMap.loadAsync( [
	'px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'
] );

const textureMap = {
  First: {
    day:"/textures/SetOne.webp"
  },
  Second: {
    day:"/textures/Second_Texture_Set.webp"
  },
  Third: {
    day:"/textures/Third_Texture_Set.webp"
  },
  Fourth: {
    day:"/textures/TextureSetFour.webp"
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

const loadedTextures = {
  day: {}
}

Object.entries(textureMap).forEach(([key, paths])=>{
  const dayTexture = textureLoader.load(paths.day);
  dayTexture.flipY = false;
  dayTexture.colorSpace = THREE.SRGBColorSpace;
  loadedTextures.day[key] = dayTexture;
})

loader.load("/models/room-v4.glb", (glb)=>{
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

          if(child.material.map){
            child.material.map.minFilter = THREE.LinearFilter;
          }
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
            envMap: cubeTexture,
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
  scene.background = cubeTexture
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

  renderer.render(scene,camera );
  window.requestAnimationFrame(render);
}

render();