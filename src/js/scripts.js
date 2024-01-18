import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js';
import dat from 'https://cdn.jsdelivr.net/npm/dat.gui@0.7.7/build/dat.gui.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const gui = new dat.GUI();
const sphereParams = {
    segments: 32,
    rings: 32,
    wireframe: true
};

const geometry = new THREE.SphereGeometry(1, sphereParams.segments, sphereParams.rings);

const material = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: sphereParams.wireframe });
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// Set up OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);

// Auto rotation variables
let autoRotate = true;
let autoRotateTimer = 5; // 5 seconds
let autoRotateTime = autoRotateTimer;
let mouseMoved = false;

camera.position.z = 5;

// GUI controls
gui.add(sphereParams, 'segments', 3, 100).step(1).onChange(updateSphereGeometry);
gui.add(sphereParams, 'rings', 2, 100).step(1).onChange(updateSphereGeometry);
gui.add(sphereParams, 'wireframe').onChange(updateWireframe);
gui.add({ toggleAutoRotate: toggleAutoRotate }, 'toggleAutoRotate');

function updateSphereGeometry() {
    geometry.dispose(); // Dispose of the current geometry
    const newGeometry = new THREE.SphereGeometry(1, sphereParams.segments, sphereParams.rings);
    sphere.geometry = newGeometry; // Update the sphere's geometry
}

function updateWireframe() {
    material.wireframe = sphereParams.wireframe; // Update the wireframe property
}

function toggleAutoRotate() {
    autoRotate = !autoRotate;
    autoRotateTime = autoRotateTimer;
}

function onDocumentMouseMove(event) {
    mouseMoved = true;
}

document.addEventListener('mousemove', onDocumentMouseMove);

function animate() {
    if (autoRotate && mouseMoved) {
        // Auto rotation
        const angle = (Date.now() * 0.001) % (2 * Math.PI);
        camera.position.x = Math.cos(angle) * 5;
        camera.position.z = Math.sin(angle) * 5;
        camera.lookAt(0, 0, 0);

        mouseMoved = false;
    } else {
        // Manual control
        controls.update();
    }

    requestAnimationFrame(animate);
    renderer.render(scene, camera);

    // Update auto rotation timer
    if (autoRotateTime > 0) {
        autoRotateTime -= 0.016; // Assuming 60 FPS
    } else {
        autoRotateTime = autoRotateTimer;
        autoRotate = true; // Reset auto rotation after the specified time
    }
}

animate();
