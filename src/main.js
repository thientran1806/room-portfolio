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

const textureMap = {
  First: {
    day:"/textures/First_Texture_Set.webp"
  },
  Second: {
    day:"/textures/TextureSetTwo.webp"
  },
  Third: {
    day:"/textures/Third_Texture_Set.webp"
  },
  Fourth: {
    day:"/textures/TextureSetFour.webp"
  }
}

const loadedTextures = {
  day: {}
}

Object.entries(textureMap).forEach(([key, paths])=>{
  const dayTexture = textureLoader.load(paths.day);
  dayTexture.flipY = false;
  dayTexture.colorSpace = THREE.SRGBColorSpace;
  loadedTextures.day[key] = dayTexture;
})

loader.load("/models/room-v3.glb", (glb)=>{
  glb.scene.traverse(child=>{
    if(child.isMesh){
      console.log(child.name);
      Object.keys(textureMap).forEach((key)=>{
        if(child.name.includes(key)){
          const material = new THREE.MeshBasicMaterial({
            map:loadedTextures.day[key],
          })

          child.material= material;
        }
      })
    }
  })
  scene.add(glb.scene);
})

const camera = new THREE.PerspectiveCamera( 75, sizes.width / sizes.height, 0.1, 1000 );
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ canvas:canvas, antialias:true });
renderer.setSize( sizes.width, sizes.height );
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.update();

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

  renderer.render(scene,camera );
  window.requestAnimationFrame(render);
}

render();