/**
 * Authors:
 *  - João Fidalgo, ist1103471
 *  - Tomás Cruz, ist1103425
 *  - Rodrigo Friães, ist1104139
 * 
 * NOTES (to delete later):
 *  - karOffset is unused, thus may be removed
 */

import * as THREE from 'three';
// Define variables
var activeCamera, camera1, camera2, camera3, camera4, camera5, camera6, scene, renderer;
var geometry, material, mesh;
var moveForward = false, moveBackward = false, rotateLeft = false, rotateRight = false, moveUp = false, moveDown = false;
var ball;

var kart, topStruct, hook;
//var kartOffset = new THREE.Vector3();

const ROTATION_SPEED = 0.005;
const MOVEMENT_SPEED = 0.1;

const MAX_ROTATION = Math.PI / 2;
const MIN_ROTATION = -Math.PI / 2;

const MAX_HEIGHT = 13.9;
const MIN_HEIGHT = -8;

// Define cameras array
var cameras = [];


// Builder functions
function buildBox(obj, x, y, z, width, height, length) {
    'use strict'
    geometry = new THREE.BoxGeometry(width, height, length);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function buildCylinder(obj, x, y, z, height, radiusTop, radiusBottom) {
    'use strict';
    var geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 8);
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

// Group creation
function createHook(y, z) {
    'use strict';
    hook = new THREE.Object3D();
    material = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true });

    buildCylinder(hook, 0, -7.5, 0, 14, 0.1, 0.1);    // Cable     (The height of the cable is important for the lifting of the hook -> 14)
    buildBox(hook, 0, -15.5, 0, 1, 2, 1);             // Hook

    hook.add(camera6);
    kart.add(hook);
    hook.position.set(0, y, z);
}

function createKart(x, y, z) {
    'use strict';
    kart = new THREE.Object3D();
    material = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true });
    buildBox(kart, 0, 0, 0, 2, 1, 2);  // Kart
    createHook(0, 0);

    scene.add(kart);
    kart.position.set(x, y, z);
    //kartOffset.copy(kart.position).sub(topStruct.position);
}

function createBaseStruct(x, y, z) {
    'use strict';
    var baseStruct = new THREE.Object3D();
    material = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true });

    buildBox(baseStruct, 0, 0, 0, 4, 2, 4);    // Crane Base
    buildBox(baseStruct, 0, 11, 0, 2, 20, 2);  // Crane Pillar  

    scene.add(baseStruct);
    baseStruct.position.set(x, y, z);
}


function createTopStruct(x, y, z) {
    'use strict';
    topStruct = new THREE.Object3D();
    material = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true });
    //Elemento rotativo
    buildCylinder(topStruct, 0, 0, 0, 1, 1.5, 1.5);    // Turntable
    buildBox(topStruct, 0, 2, 0, 2, 3, 2);             // Tower Peak
    buildBox(topStruct, 0, 2.5, 2, 2, 2, 2);           // Cabin

    //Jib
    buildBox(topStruct, 0, 4.5, 11, 2, 2, 20);       

    //Counter Jib
    buildBox(topStruct, 0, 4, -4, 2, 1, 10);     // CounterJib
    buildBox(topStruct, 0,  2.5, -6.5, 2, 2, 3); // CounterWeight
    buildBox(topStruct, -1, 5, -6, 0, 1, 4);     // Railing #1
    buildBox(topStruct, 1, 5, -6, 0, 1, 4);      // Railing #2
    
    buildBox(topStruct, 0, 7, 0, 2, 5, 2);       // Tower

    createKart(0, 3, 17);   // Kart
    topStruct.add(kart);

    scene.add(topStruct);
    topStruct.position.set(x, y, z);
}

function createCrane(x, y, z) {
    createBaseStruct(x, y + 1, z);
    createTopStruct(x, y + 22.5, z);
}

function createBall(x, y, z) {
    'use strict';

    ball = new THREE.Object3D();
    material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: false });
    geometry = new THREE.SphereGeometry(1, 15, 15);
    mesh = new THREE.Mesh(geometry, material);

    ball.add(mesh);
    ball.position.set(x, y, z);

    scene.add(ball);
}


// Function to create scene
function createScene() {
    'use strict';
    scene = new THREE.Scene();
    scene.add(new THREE.AxesHelper(10));
    createCrane(0, 0, 0);
    createBall(4, 1, 16);
}


// Function to create cameras
function createCameras() {
    'use strict';
    var left = window.innerWidth / -28; 
    var right = window.innerWidth / 28; 
    var top = window.innerHeight / 28; 
    var bottom = window.innerHeight / -28; 
    var near = 1; 
    var far = 1000; 

    camera1= new THREE.OrthographicCamera(left, right, top, bottom, near, far);
    camera1.position.set(0, 10, 100); 
    camera1.lookAt(0, 10, 0);

    camera2= new THREE.OrthographicCamera(left, right, top, bottom, near, far);
    camera2.position.set(100, 10, 0); 
    camera2.lookAt(0, 10, 0);

    camera3= new THREE.OrthographicCamera(left, right, top, bottom, near, far);
    camera3.position.set(0, 100, 0); 
    camera3.lookAt(0, 0, 0);

    camera4 = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
    camera4.position.set(30, 30, 30);
    camera4.lookAt(0, 0, 0);

    camera5 = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 1000);
    camera5.position.set(30, 30, 30);
    camera5.lookAt(0, 0, 0);

    camera6 = new THREE.PerspectiveCamera(120, window.innerWidth / window.innerHeight, 1, 1000);
    camera6.position.set(0, -16, 0);  // Set initial position, adjust as needed
    camera6.lookAt(0, -25.5, 0);


    cameras.push(camera1);
    cameras.push(camera2);
    cameras.push(camera3);
    cameras.push(camera4);
    cameras.push(camera5);
    cameras.push(camera6);

    activeCamera = camera5; 
}


function onKeyUp(e) {
    switch (e.keyCode) {
        //KART movement
        case 87:    // W(w) key
            moveForward = false;
            break;
        case 83:    // S(s) key
            moveBackward = false;
            break;
        
        //HOOK movement
        case 69:    // E(e) key
            moveUp = false;
            break;
        case 68:    // D(d) key
            moveDown = false;
            break;

        //CRANE rotation
        case 65:    // A(a) key
            rotateRight = false;
            break;
        case 81:    // Q(q) key
            rotateLeft = false;
            break;
    }
}


// Function to handle key presses
function onKeyDown(e) {
    'use strict';
    switch (e.keyCode) {
        //CAMERA Switching
        case 49:    // '1' key
            activeCamera = cameras[0];
            break;
        case 50:    // '2' key
            activeCamera = cameras[1];
            break;
        case 51:    // '3' key
            activeCamera = cameras[2];
            break;
        case 52:    // '4' key
            activeCamera = cameras[3];
            break;
        case 53:    // '5' key
            activeCamera = cameras[4];
            break;
        case 54:    // '6' key
            activeCamera = cameras[5];
            break;

        //KART movement
        case 87:    // W(w) key
            moveForward = true;
            break;
        case 83:    // S(s) key
            moveBackward = true;
            break; 
            
        //HOOK movement
        case 69:    // E(e) key
            moveUp = true;
            break;
        case 68:    // D(d) key
            moveDown = true;
            break;

        //CRANE rotation
        case 65:    // A(a) key
            rotateRight = true;
            break;
        case 81:    // Q(q) key
            rotateLeft = true;
            break;
    }
}


// Function to initialize the scene, camera, and renderer
function init() {
    'use strict';
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    createCameras(); // Create the camera
    createScene(); // Create the scene
    document.addEventListener("keydown", onKeyDown); // Add event listener for key presses
    document.addEventListener("keyup", onKeyUp);
}


// Function to render the scene
function render() {
    'use strict';
    renderer.setClearColor(0xEBBEF8);   // Background color set to Light yellow
    renderer.render(scene, activeCamera);
}


// Function to animate the scene
function animate() {
    'use strict';
    requestAnimationFrame(animate);
    
    if (moveBackward && kart.position.z > 4) { // Move backward
        kart.position.z -= MOVEMENT_SPEED;
    }
    if (moveForward && kart.position.z < 20) {  // Move forward
        kart.position.z += MOVEMENT_SPEED;
    }

    if (moveDown && hook.position.y > MIN_HEIGHT) { // Move down
        hook.position.y -= MOVEMENT_SPEED;
        const scaleChangeFactor = MOVEMENT_SPEED / 14;
        hook.children[0].scale.y += scaleChangeFactor;
        hook.children[0].position.y += (14 * scaleChangeFactor) / 2;
    }
    if (moveUp && hook.position.y < MAX_HEIGHT) { // Move up
        hook.position.y += MOVEMENT_SPEED;
        const scaleChangeFactor = MOVEMENT_SPEED / 14;
        hook.children[0].scale.y -= scaleChangeFactor;
        hook.children[0].position.y -= (14 * scaleChangeFactor) / 2;
    }


    if (rotateLeft && topStruct.rotation.y > MIN_ROTATION) {
        topStruct.rotation.y -= ROTATION_SPEED;
        if (topStruct.rotation.y < MIN_ROTATION) {
            topStruct.rotation.y = MIN_ROTATION;
        }
    }
    if (rotateRight && topStruct.rotation.y < MAX_ROTATION) {
        topStruct.rotation.y += ROTATION_SPEED;
        if (topStruct.rotation.y > MAX_ROTATION) {
            topStruct.rotation.y = MAX_ROTATION;
        }
    }

    render();
}


// Initialize the scene
init();
animate();
