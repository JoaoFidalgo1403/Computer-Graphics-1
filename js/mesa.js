import * as THREE from 'three';
// Define variables
var activeCamera, camera1, camera2, camera3, camera4, camera5, scene, renderer;
var geometry, material, mesh;
var height = 25;
var activeCameraIndex = 0; // Initialize activeCameraIndex

// Define cameras array
var cameras = [];

function createBox(obj, x, y, z, width, height, length) {
    'use strict'
    geometry = new THREE.BoxGeometry(width, height, length);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addCraneBase(obj, x, y, z) {
    createBox(obj, x, y ,z, 4, 2, 4);    
}

function addCranePillar(obj, x, y, z) {
    createBox(obj, x, y ,z, 2, 20, 2);    
}

// Function to add triangular prism
function addTriangularPrism(obj, x, y, z, height, radiusTop, radiusBottom) {
    'use strict';
    var sides = 3; // Number of sides for the cylinder (triangle has 3 sides)
    var geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, sides);
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.rotation.set(Math.PI / 2, Math.PI, Math.PI / 2); // Rotate prism
    obj.add(mesh);
}

function addCylinder(obj, x, y, z, height, radiusTop, radiusBottom) {
    'use strict';
    var geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 8);
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addJib(obj, x, y, z) {
    createBox(obj, x, y ,z, 2, 2, 20);       
}

function addCounterJib(obj, x, y, z) {
    createBox(obj, x, y ,z , 2, 1, 10);    
}

function addTower(obj, x, y, z) {
    createBox(obj, x, y, z, 2, 5, 2);
}

function addCabin(obj, x, y, z) {
    createBox(obj, x, y, z, 2, 2, 2);
}

function addCounterWeigth(obj, x, y, z) {
    createBox(obj, x, y, z, 2, 2, 3);
}

function addGuard(obj, x, y, z) {
    createBox(obj, x, y, z, 0, 1, 4);
}

function addHook(obj, x, y, z) {
    createBox(obj, x, y, z, 1, 2, 1);
}


// Function to create crane
function createCrane(x, y, z) {
    'use strict';
    var crane = new THREE.Object3D();
    material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    //addTriangularPrism(crane, -11, 24.5 , 0, 20, 1, 1); //Da problemas
    addCraneBase(crane, 0, 1, 0);
    addCranePillar(crane, 0, 12, 0);
    addCabin(crane, 0, 25, 2);

    addCylinder(crane, 0, 22.5, 0, 1, 1.5, 1.5);
    createBox(crane, 0, 24.5, 0, 2, 3, 2);
    //addCylinder(crane, 0, 23.5, 0, 1, 1, 1);

    addJib(crane, 0, 27,  11);
    addCounterJib(crane, 0, 26.5, -4);
    addCounterWeigth(crane, 0,  25, -6.5);
    addGuard(crane, -1, 27.5, -6);
    addGuard(crane, 1, 27.5, -6);

    addCylinder(crane, 0, 18.5, 17, 14, 0.1, 0.1);
    addHook(crane, 0, 10.5, 17);

    //addCylinder(crane, 0, 27.5, 0, 5, 0.5, 1); //Brincadeira
    addTower(crane, 0, 29.5, 0);

    scene.add(crane);
    crane.position.set(x, y, z);
}

// Function to create scene
function createScene() {
    'use strict';
    scene = new THREE.Scene();
    scene.add(new THREE.AxesHelper(10));
    createCrane(0, 0, 0); // Create crane in the scene
}

// Function to create camera
function createCamera() {
    'use strict';
    var left = window.innerWidth / -28; 
    var right = window.innerWidth / 28; 
    var top = window.innerHeight / 28; 
    var bottom = window.innerHeight / -28; 
    var near = 1; 
    var far = 1000; 

    camera1= new THREE.OrthographicCamera(left, right, top, bottom, near, far);
    camera1.position.set(100, 10, 0); 
    camera1.lookAt(0, 10, 0);

    camera2= new THREE.OrthographicCamera(left, right, top, bottom, near, far);
    camera2.position.set(0, 10, 100); 
    camera2.lookAt(0, 10, 0);

    camera3= new THREE.OrthographicCamera(left, right, top, bottom, near, far);
    camera3.position.set(0, 100, 0); 
    camera3.lookAt(0, 0, 0);

    camera5 = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    camera5.position.set(30, 30, 30);
    camera5.lookAt(0, 10, 0);


    activeCamera = camera1; 

    cameras.push(camera1);
    cameras.push(camera2);
    cameras.push(camera3);
    //cameras.push(camera4);
    cameras.push(camera5)

}

// Function to handle key presses
function onKeyDown(e) {
    'use strict';
    switch (e.keyCode) {
        case 67: // Toggle between cameras using 'C' key
        case 99:
            activeCameraIndex = (activeCameraIndex + 1) % cameras.length;
            activeCamera = cameras[activeCameraIndex];
            break;
    }
}

// Function to initialize the scene, camera, and renderer
function init() {
    'use strict';
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    createScene(); // Create the scene
    createCamera(); // Create the camera
    window.addEventListener("keydown", onKeyDown); // Add event listener for key presses
}

// Function to render the scene
function render() {
    'use strict';
    renderer.render(scene, activeCamera);
}

// Function to animate the scene
function animate() {
    'use strict';
    requestAnimationFrame(animate);
    render();
}

// Initialize the scene
init();
animate();
