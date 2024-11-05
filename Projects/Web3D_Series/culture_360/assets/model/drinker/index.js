import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js';
import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js';
// import {GUI} from 'https://cdnjs.cloudflare.com/ajax/libs/dat-gui/0.7.9/dat.gui.min.js';
// import {EffectComposer} from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/postprocessing/EffectComposer.js';
// import {RenderPass} from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/postprocessing/RenderPass.js';

let hemiLight, spotLight;

const canvas = document.querySelector('.webgl')
const scene = new THREE.Scene()

const loadingManager = new THREE.LoadingManager()

const progressBar = document.getElementById('progress-bar')

loadingManager.onProgress = function(url, loaded, total) {
    progressBar.value = (loaded / total) * 100;
}

const progressBarContainer = document.querySelector('.progress-bar-container')

loadingManager.onLoad = function() {
    progressBarContainer.style.display = 'none';
    console.log('Just finished loading')
}

// loadingManager.onError = function(url) {
//     console.log('Start loading: ${url}')
// }

const loader = new GLTFLoader(loadingManager)
loader.load('./assets/drinker.glb', function(glb){
    console.log(glb)
    const root = glb.scene;
    root.scale.set(1, 1, 1)
    root.traverse(n => {
        if(n.isMesh) {
            n.castShadow = true;
            n.receiveShadow = true;
            if(n.material.map) n.material.map.anisotropy = 8;
        }
    })

    scene.add(root);
}, function(xhr){
    console.log((xhr.loaded/xhr.total * 100) + "% loaded")
}, function(error){
    console.log('An error occurred')
})

const geometry = new THREE.SphereGeometry( 500, 60, 40 );
geometry.scale( - 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( {
  map: new THREE.TextureLoader(loadingManager).load( './assets/imgs/drinker_panorama.png' ),
  side: THREE.DoubleSide
} );
const panorama = new THREE.Mesh( geometry, material );
panorama.scale.set(2,2,2)
panorama.rotation.set(0,2.5,0)
scene.add(panorama);

const renderer = new THREE.WebGL1Renderer({
    canvas: canvas
})
document.body.appendChild( renderer.domElement );

// const light = new THREE.DirectionalLight(0xffffff, 1.5)
// light.position.set(2,2,10)
// scene.add(light)

// const light2 = new THREE.DirectionalLight(0xffffff, 1.5)
// light2.position.set(-2,2,0)
// scene.add(light2)

// const light3 = new THREE.DirectionalLight(0xffffff, 1.5)
// light3.position.set(2,2,-10)
// scene.add(light3)

// composer = new EffectComposer(renderer)
// composer.add(new RenderPass(scene,camera))

// const effectPass = new effectPass(
//     camera,
//     new BloomEffect()
// );
// effectPass.renderToScreen = true;
// composer.addPass(effectPass);

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

scene.background = new THREE.Color(0xffffff)
const camera = new THREE.PerspectiveCamera(50, sizes.width/sizes.height, 0.1, 2000)
camera.position.set(0,85,170)
camera.rotation.set(0,0,0)

window.addEventListener( 'resize', function(){
    var width = window.innerWidth;
    var height =  window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width/height;
    camera.updateProjectionMatrix();

})

scene.add(camera)

const controls = new OrbitControls( camera, renderer.domElement );
controls.minDistance = 40;
controls.maxDistance = 180;
controls.target.set(0, 60, 0)

//Light
hemiLight = new THREE.HemisphereLight(0xF7BE83, 0x080820, 1);
scene.add(hemiLight)

spotLight = new THREE.SpotLight(0xffffff, 2)
spotLight.castShadow = true
spotLight.shadow.bias = -0.0001
spotLight.shadow.mapSize.width = 1024*4
spotLight.shadow.mapSize.height = 1024*4
scene.add(spotLight)

// scene.add(new THREE.AxesHelper(500))

//
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMappingExposure = 2,3
renderer.shadowMap.enable = true
renderer.gammaOuput = true

//Animate
function animate(){
    // composer.render();
    requestAnimationFrame(animate)
    spotLight.position.set(
        camera.position.x + 40,
        camera.position.y + 40,
        camera.position.z + 40
    )
    controls.update();
    renderer.render(scene,camera)
}

animate()