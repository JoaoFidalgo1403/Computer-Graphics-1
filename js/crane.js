/**
 * Authors:
 *  - João Fidalgo, ist1103471
 *  - Tomás Cruz, ist1103425
 *  - Rodrigo Friães, ist1104139
 * Work time estimate per collaborator: 20h
 */

import * as THREE from 'three';
var scene, renderer;

// Cameras
var activeCameraNumber, camera1, camera2, camera3, camera4, camera5, camera6;

// Global Objects
var kart, topStruct, hook, claws;
var crate, randomisedObjects = [];
var caughtObject;

// Boolen Variables

// Crane movement
var moveForward = false, moveBackward = false;
var rotateLeft = false, rotateRight = false;
var moveUp = false, moveDown = false;
var openClaws = false, closeClaws = false;
var blocked = false;

// Objects visibility
var wireframe = false;
var hitboxesVisible = false;     // Variable to toggle on and off the visibility of the hitboxes

// Handlers for catching an object
var objectCaught = false, readyForRelease = false, release = false;

// Graphic's clock 
const clock = new THREE.Clock();

// Claw orientation
const FORTH = 1;
const BACK = 2;
const RIGHT = 3;
const LEFT = 4;

// Movement constant variables
const ROTATION_SPEED = 0.35;
const MOVEMENT_SPEED = 5;
const CLAW_SPEED = 0.6;
var fallingSpeed = MOVEMENT_SPEED; // exception, falling speed has acceleration

const MAX_CLAW_OPENING =  Math.PI / 3;
const MIN_CLAW_OPENING =  - Math.PI / 12;

const MAX_SLIDE = 20;
const MIN_SLIDE = 4.1;

const MAX_HEIGHT = -1.6;
const MIN_HEIGHT = -22.7;

const MAX_DELTA1 = 20;
const MIN_DELTA1 = 4;

// Define cameras array
var cameras = [];


// Builder functions ----------------------------------------------------------------------------------------------
function buildBox(obj, x, y, z, width, height, length, color) {
    'use strict'
    var geometry = new THREE.BoxGeometry(width, height, length);
    var material = new THREE.MeshBasicMaterial({ color: color, wireframe: wireframe })
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function buildCylinder(obj, x, y, z, height, radiusTop, radiusBottom, color) {
    'use strict';
    var geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 8);
    var material = new THREE.MeshBasicMaterial({ color: color, wireframe: wireframe })
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function buildHitboxSphere(obj, radius, x, y, z) {
    'use strict';
    x = (typeof x !== 'undefined') ? x : 0;
    y = (typeof y !== 'undefined') ? y : 0;
    z = (typeof z !== 'undefined') ? z : 0;

    var geometry = new THREE.SphereGeometry(radius, 10, 10);
    var mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0xFF0000, wireframe: wireframe, visible: hitboxesVisible }));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}


// CRANE creation functions ----------------------------------------------------------------------------------
function createClaw(x, y, z, orientation){
    'use strict';
    var claw = new THREE.Object3D();
    switch(orientation){
        case FORTH:
            buildBox(claw, 0, -0.5, 0.5, 0.5, 1.25, 0.25, 0x000000);  
            buildBox(claw, 0, -1.3, 0.7, 0.5, 0.75, 0.25, 0x00FFFF);
            claw.children[0].rotation.x = - Math.PI / 4;
            claw.children[1].rotation.x = Math.PI / 12;
            break;
        case BACK:
            buildBox(claw, 0, -0.5, -0.5, 0.5, 1.25, 0.25, 0x000000);  
            buildBox(claw, 0, -1.3, -0.7, 0.5, 0.75, 0.25, 0x00FFFF);
            claw.children[0].rotation.x = Math.PI / 4;
            claw.children[1].rotation.x = - Math.PI / 12;
            break;
        case RIGHT:
            buildBox(claw, 0.5, -0.5, 0, 0.25, 1.25, 0.5, 0x000000);  
            buildBox(claw, 0.7, -1.3, 0, 0.25, 0.75, 0.5, 0x00FFFF);
            claw.children[0].rotation.z = Math.PI / 4;
            claw.children[1].rotation.z = - Math.PI / 12;
            break;
        case LEFT:
            buildBox(claw, -0.5, -0.5, 0, 0.25, 1.25, 0.5, 0x000000);  
            buildBox(claw, -0.7, -1.3, 0, 0.25, 0.75, 0.5, 0x00FFFF);
            claw.children[0].rotation.z = - Math.PI / 4;
            claw.children[1].rotation.z =  Math.PI / 12;
            break;
        
    }

    buildHitboxSphere(claw, 0.2, claw.children[1].position.x, 
                            claw.children[1].position.y, 
                            claw.children[1].position.z);   // Rough estimate for hitbox radius (claw's width)
    
    claws.add(claw);
    claw.position.set(x, y, z);

}
function createClaws(y, z) {
    'use strict'
    claws = new THREE.Object3D();
    createClaw(0, 0.6, 0.4, FORTH);
    createClaw(0, 0.6, -0.4, BACK);
    createClaw(0.4, 0.6, 0, RIGHT);
    createClaw(-0.4, 0.6, 0, LEFT);

    hook.add(claws);
    claws.position.set(0, y, z);
}

function createHook(y, z) {
    'use strict';
    hook = new THREE.Object3D();
    // Cable     (The height of the cable is important for the lifting of the hook -> 14)
    buildCylinder(hook, 0, 8, 0, 14, 0.1, 0.1, 0x000000);  
    // Hook  
    buildBox(hook, 0, 0, 0, 1, 2, 1, 0x28910E);             

    buildHitboxSphere(hook, 0.5, 0, -1, 0);

    createClaws(-1.5, 0, 0x000000);

    hook.add(camera6);
    kart.add(hook);
    hook.position.set(0, y, z);
}

function createKart(x, y, z) {
    'use strict';
    kart = new THREE.Object3D();
    buildBox(kart, 0, 0, 0, 2, 1, 2, 0x28910E);  // Kart
    createHook(-15.5, 0);

    scene.add(kart);
    kart.position.set(x, y, z);
}

function createBaseStruct(x, y, z) {
    'use strict';
    var baseStruct = new THREE.Object3D();
    buildBox(baseStruct, 0, 0, 0, 4, 2, 4, 0x000000);    // Crane Base
    buildBox(baseStruct, 0, 11, 0, 2, 20, 2, 0xC35900);  // Crane Pillar  

    scene.add(baseStruct);
    baseStruct.position.set(x, y, z);
}


function createTopStruct(x, y, z) {
    'use strict';
    topStruct = new THREE.Object3D();
    //Elemento rotativo
    buildCylinder(topStruct, 0, 0, 0, 1, 1.5, 1.5, 0x000000);    // Turntable
    buildBox(topStruct, 0, 2, 0, 2, 3, 2, 0xC35900);             // Tower Peak
    buildBox(topStruct, 0, 2.5, 2, 2, 2, 2, 0x28910E);           // Cabin

    //Jib
    buildBox(topStruct, 0, 4.5, 11, 2, 2, 20, 0x0E8391);  
    
    buildCylinder(topStruct, 0.65, 7, 7.5, 14, 0.1, 0.1, 0x000);   // Fore Pendant #1
    buildCylinder(topStruct, -0.65, 7, 7.5, 14, 0.1, 0.1, 0x000);  // Fore Pendant #2
    topStruct.children[4].rotation.x -= Math.PI/2.4;
    topStruct.children[4].rotation.z -= Math.PI/86;

    topStruct.children[5].rotation.x -= Math.PI/2.4;
    topStruct.children[5].rotation.z += Math.PI/86;

    //Counter Jib
    buildBox(topStruct, 0, 4, -4, 2, 1, 10, 0x0E8391);     // CounterJib
    buildBox(topStruct, 0,  2.5, -6.5, 2, 2, 3, 0x000000); // CounterWeight
    buildBox(topStruct, -1, 5, -6, 0, 1, 4, 0x000000);     // Railing #1
    buildBox(topStruct, 1, 5, -6, 0, 1, 4, 0x000000);      // Railing #2

    buildBox(topStruct, 0, 7, 0, 2, 5, 2, 0xC35900);       // Tower

    buildCylinder(topStruct, 0.65, 6.4, -3.8, 8, 0.1, 0.1, 0x000);  
    buildCylinder(topStruct, -0.65, 6.4, -3.8, 8, 0.1, 0.1, 0x000);
    topStruct.children[11].rotation.x += Math.PI/3.5;
    topStruct.children[11].rotation.z -= Math.PI/86;

    topStruct.children[12].rotation.x += Math.PI/3.5;
    topStruct.children[12].rotation.z += Math.PI/86;

    createKart(0, 3, 17);   // Kart
    topStruct.add(kart);

    scene.add(topStruct);
    topStruct.position.set(x, y, z);
}

//CRANE
function createCrane(x, y, z) {
    createBaseStruct(x, y + 1, z);
    createTopStruct(x, y + 22.5, z);
}

//CRATE
function createCrate(x, y, z) { // Box without top
    'use strict';
    crate = new THREE.Object3D();
    
    // Sides
    buildBox(crate, 2.375, 2.5, -0.125, 0.25, 5, 4.75, 0x28910E);
    buildBox(crate, 0.125, 2.5, 2.375, 4.75, 5, 0.25, 0x28910E);
    buildBox(crate, -2.375, 2.5, 0.125, 0.25, 5, 4.75, 0x28910E);
    buildBox(crate, -0.125, 2.5, -2.375, 4.75, 5, 0.25, 0x28910E);


    // Base
   buildBox(crate, 0, 0.125, 0, 4.5, 0.25, 4.5, 0x000000);

    scene.add(crate);
    crate.position.set(x,y,z);
}

//GROUND
function createGround() {
    var ground = new THREE.Mesh(new THREE.BoxGeometry(50, 50, 3).rotateX(-Math.PI * 0.5), new THREE.MeshBasicMaterial({color: new THREE.Color(0x875280).multiplyScalar(1.5), wireframe: wireframe}));
    ground.position.set(0, -1.5, 0);
    scene.add(ground);
}


// RANDOM Objects creation functions -----------------------------------------------------------------------------
function createTorusKnot(x, z) {
    'use strict';

    const radius = getRandomNumber(0.5, 0.8);
    const p = getRandomInteger(2, 5);
    var q = 0;
    do{ q = getRandomInteger(3, 6); } while (p == q);   // To prevent Torus Knots from looking like a Torus

    var torusKnot = new THREE.Object3D();
    var geometry = new THREE.TorusKnotGeometry(radius, 0.25, 37, 7, p, q);
    var material = new THREE.MeshBasicMaterial({ color: 0x0000FF, wireframe: wireframe });  
    var mesh = new THREE.Mesh(geometry, material);

    torusKnot.add(mesh);
    buildHitboxSphere(torusKnot, 2*radius, 0, 0, 0.3);
    torusKnot.height = 0.5;
    torusKnot.position.set(x, torusKnot.height, z);

    torusKnot.rotation.x = Math.PI/2;

    scene.add(torusKnot);
    randomisedObjects.push(torusKnot);
    console.log("randomisedObjects = ", randomisedObjects);
}

function createTorus(x, z) {
    'use strict';

    const radius = getRandomNumber(0.3, 0.7);
    const tube = radius - 0.2;

    var torus = new THREE.Object3D();
    var geometry = new THREE.TorusGeometry(radius, tube, 8, 10);
    var material = new THREE.MeshBasicMaterial({ color: 0x0000FF, wireframe: wireframe }); 
    var mesh = new THREE.Mesh(geometry, material);

    torus.add(mesh);
    buildHitboxSphere(torus, radius+0.5);
    torus.height = 0.5; 
    torus.position.set(x, torus.height, z);

    torus.rotation.x = Math.PI/2;

    scene.add(torus);
    randomisedObjects.push(torus);
}

function createDodecahedron(x, z) {
    'use strict';

    const radius = getRandomNumber(0.7, 1.2);

    var dodeca = new THREE.Object3D();
    var geometry = new THREE.DodecahedronGeometry(radius, 0);
    var material = new THREE.MeshBasicMaterial({ color: 0x0000FF, wireframe: wireframe }); 
    var mesh = new THREE.Mesh(geometry, material); 

    dodeca.add(mesh);
    buildHitboxSphere(dodeca, radius);
    dodeca.height = radius-0.125; 
    dodeca.position.set(x, dodeca.height, z);


    scene.add(dodeca);
    randomisedObjects.push(dodeca);
}

function createIcosahedron(x, z) {
    'use strict';

    const radius = getRandomNumber(0.7, 1.2);

    var icosa = new THREE.Object3D();
    var geometry = new THREE.IcosahedronGeometry(radius, 0); 
    var material = new THREE.MeshBasicMaterial({ color: 0x0000FF, wireframe: wireframe }); 
    var mesh = new THREE.Mesh(geometry, material); 

    icosa.add(mesh);
    buildHitboxSphere(icosa, radius);
    icosa.height = radius-0.125;
    icosa.position.set(x, icosa.height, z);

    scene.add(icosa);
    randomisedObjects.push(icosa);
}

function createBox(x, z) {
    'use strict';

    const height = getRandomNumber(1, 2);
    const side = getRandomNumber(1, 2);

    var box = new THREE.Object3D();
    buildBox(box, 0, 0, 0, side, height, side, 0x0000FF);

    buildHitboxSphere(box, Math.max(height, side)/2);

    box.height = height/2;
    box.position.set(x, box.height, z);

    scene.add(box);
    randomisedObjects.push(box);
}

function createRandomisedObjects() {
    const numObjects = getRandomInteger(5, 10);

    var positions = [];
    var position_tuple;

    for(var i=0; i<numObjects; i++) {
        position_tuple = getPosition(positions);
        positions.push(position_tuple);

        const x_pos = position_tuple[0];
        const z_pos = position_tuple[1];

        switch (getRandomInteger(0, 4)) {
            case 0:
                createTorusKnot(x_pos, z_pos);
                break;
            case 1:
                createTorus(x_pos, z_pos);
                break;
            case 2:
                createDodecahedron(x_pos, z_pos);
                break;
            case 3:
                createIcosahedron(x_pos, z_pos);
                break;
            case 4:
                createBox(x_pos, z_pos);
                break;
        }
    }
}

function getPosition(positions) {
    var r, angle, x_pos, z_pos;
    do {
        r = getRandomNumber(MIN_DELTA1, MAX_DELTA1); // Random radius from crane
        angle = getRandomNumber(0, Math.PI * 2);  // Random angle w/ centre in crane's base
        x_pos = r*Math.sin(angle);
        z_pos = r*Math.cos(angle);
    } while (!possiblePosition(positions, x_pos, z_pos));

    return [x_pos, z_pos];
}

function possiblePosition(positions, x, z) {
    const x_crate = 10;     // arbitrary value
    const z_crate = 7;      // arbitrary value

    const num_of_pos = positions.length;

    if (distanceBetweenObjects(x, z, x_crate, z_crate) < 3.75*Math.sqrt(2)) { return false; }

    for(var i=0; i < num_of_pos; i++) {
        if (distanceBetweenObjects(x, z, positions[i][0], positions[i][1]) < 4) { return false; }
    }
    return true;
}

function distanceBetweenObjects(x1, z1, x2, z2) {
    const point1 = new THREE.Vector3(x1, 0, z1);
    const point2 = new THREE.Vector3(x2, 0, z2); 
    return point1.distanceTo(point2);
}

function getRandomNumber(min, max) {
    return Math.random() * (max-min) + min;
}

function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max-min + 1) + min);
}


// Function to create scene ------------------------------------------------------------------------------------------
function createScene() {
    'use strict';
    scene = new THREE.Scene();
    scene.add(new THREE.AxesHelper(10));
    createCrane(0, 0, 0);
    createCrate(10, 0 ,7); 
    createGround();
    createRandomisedObjects();
}


// Function to create cameras
function createCameras() {
    'use strict';
    var left = window.innerWidth / -28; 
    var right = window.innerWidth / 28; 
    var top = window.innerHeight / 28; 
    var bottom = window.innerHeight / -28; 
    var near = 1; 
    var far = 2000; 

    camera1= new THREE.OrthographicCamera(left, right, top, bottom, near, far);
    camera1.position.set(0, 10, 100); 
    camera1.lookAt(0, 10, 0);

    camera2= new THREE.OrthographicCamera(left, right, top, bottom, near, far);
    camera2.position.set(100, 10, 0); 
    camera2.lookAt(0, 10, 0);

    camera3= new THREE.OrthographicCamera(left, right, top, bottom, near, far);
    camera3.position.set(0, 100, 0); 
    camera3.lookAt(0, 0, 0);

    camera4 = new THREE.OrthographicCamera(left-10, right+10, top+10, bottom-10, near, far);
    camera4.position.set(30, 30, 30);
    camera4.lookAt(0, 0, 0);

    camera5 = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 1000);
    camera5.position.set(30, 30, 30);
    camera5.lookAt(0, 0, 0);

    camera6 = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 1000);
    camera6.position.set(0, -1, 0);  // Set initial position, adjust as needed
    camera6.lookAt(0, -15, 0);
    camera6.rotation.z = Math.PI;

    cameras.push(camera1);
    cameras.push(camera2);
    cameras.push(camera3);
    cameras.push(camera4);
    cameras.push(camera5);
    cameras.push(camera6);

    activeCameraNumber = 5; 
}

function updateHUD(key, highlight, activeCameraN) {
    'use strict';
    var keyElement = document.getElementById(`key-${key}`);
    // Reset all numbers to not active
    for (let i = 1; i <= 6; i++) {
        const numberElement = document.getElementById(`key-${i}`);
        if (numberElement) {
            numberElement.classList.remove('activeCamera');
        }
    }

    if (wireframe)
        document.getElementById(`key-${7}`).classList.add('activeWireframe');
    else document.getElementById(`key-${7}`).classList.remove('activeWireframe');

    // Highlight the active camera number
    const activeNumberElement = document.getElementById(`key-${activeCameraN}`);
    if (activeNumberElement) {
        activeNumberElement.classList.add('activeCamera');
    }

    if (keyElement) {

        highlight ? keyElement.classList.add('active') : keyElement.classList.remove('active');
        
        if (keyElement === activeNumberElement && highlight) 
            activeNumberElement.classList.remove('activeCamera');
        
    }
    
}


function onKeyUp(e) {
    'use strict';
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

        case 82: // R key
            openClaws = false;
            break;
        case 70: // F key
            closeClaws = false;
            break;
    }    
    updateHUD(e.key.toUpperCase(), false, activeCameraNumber); // Update the HUD

}


// Function to handle key presses
function onKeyDown(e) {
    'use strict';
    switch (e.keyCode) {
        //CAMERA Switching 
        case 49:    // '1' key
            activeCameraNumber = 1; 
            break;
        case 50:    // '2' key
            activeCameraNumber = 2;
            break;
        case 51:    // '3' key
            activeCameraNumber = 3;
            break;
        case 52:    // '4' key
            activeCameraNumber = 4;
            break;
        case 53:    // '5' key
            activeCameraNumber = 5;
            break;
        case 54:    // '6' key
            activeCameraNumber = 6;
            
            hitboxesVisible = !hitboxesVisible;
            break;
        
        // WIREFRAME activation
        case 55:    // '7' key
            scene.traverse(function (node) {
                if (node instanceof THREE.Mesh) {
                    node.material.wireframe = !node.material.wireframe;
                }
            });
            wireframe = !wireframe;
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

        // CLAWS opening
        case 82: // R key
            openClaws = true;
            break;
        case 70: // F key
            closeClaws = true;
            break;

    }

    updateHUD(e.key.toUpperCase(), true, activeCameraNumber); // Update the HUD

}


// Function to resize the window
function onResize() {
    // Update renderer size
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Update camera aspect ratio
    const aspect = window.innerWidth / window.innerHeight;
    var camera = cameras[activeCameraNumber - 1];

    // For orthographic cameras
    if (camera instanceof THREE.OrthographicCamera) {
        // Calculate the new dimensions of the orthographic camera
        const frustumHeight = camera.top - camera.bottom;
        const frustumWidth = frustumHeight * aspect;

        // Set new camera dimensions
        camera.left = -frustumWidth / 2;
        camera.right = frustumWidth / 2;
        camera.top = frustumHeight / 2;
        camera.bottom = -frustumHeight / 2;
    } 
    // For perspective cameras
    else if (camera instanceof THREE.PerspectiveCamera) {
        // Update camera aspect ratio
        camera.aspect = aspect;
}

    // Update camera projection matrix
    camera.updateProjectionMatrix();
}


// Function to render the scene
function render() {
    'use strict';
    renderer.render(scene, cameras[activeCameraNumber - 1]);
}


// Function to initialize the scene, camera, and renderer
function init() {
    'use strict';
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    renderer.setClearColor(0x000000, 0); // Set clear color to transparent
    console.log("Renderer initialized:", renderer);

    createCameras(); // Create the camera
    createScene(); // Create the scene
    // Highlight the active camera and wireframe initially
    updateHUD('', true, activeCameraNumber); // Highlight the active camera
    document.addEventListener("keydown", onKeyDown); // Add event listener for key presses
    document.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", onResize);
}


// Functions to animate the scene --------------------------------------------------------------------------------
function JibAnimation(deltaTime) {
    if (rotateLeft) { // Rotate left [NO LIMIT]
        topStruct.rotation.y -= ROTATION_SPEED * deltaTime;
    }
    if (rotateRight) { // Rotate right [NO LIMIT]
        topStruct.rotation.y += ROTATION_SPEED * deltaTime;
    }
}

function hookAnimation(deltaTime) {
    if (moveDown && hook.position.y > MIN_HEIGHT && !blocked) {  // Move down
        hook.position.y -= MOVEMENT_SPEED * deltaTime;
        const scaleChangeFactor = MOVEMENT_SPEED / 14;
        hook.children[0].scale.y += scaleChangeFactor * deltaTime;
        hook.children[0].position.y += ((14 * scaleChangeFactor) / 2) * deltaTime;
    }
    if (moveUp && hook.position.y < MAX_HEIGHT) { // Move up
        hook.position.y += MOVEMENT_SPEED * deltaTime;
        const scaleChangeFactor = MOVEMENT_SPEED / 14;
        hook.children[0].scale.y -= scaleChangeFactor * deltaTime;
        hook.children[0].position.y -= ((14 * scaleChangeFactor) / 2) * deltaTime;
    }
}

function kartAnimation(deltaTime) {
    if (moveBackward && kart.position.z > MIN_SLIDE) { // Move backward
        kart.position.z -= MOVEMENT_SPEED * deltaTime;
    }
    if (moveForward && kart.position.z < MAX_SLIDE) { // Move forward
        kart.position.z += MOVEMENT_SPEED * deltaTime;
    }
}

function clawsAnimation(deltaTime) {
    if (openClaws && -claws.children[0].rotation.x < MAX_CLAW_OPENING) { // Open claws
        claws.children[0].rotation.x -= CLAW_SPEED * deltaTime;
        claws.children[1].rotation.x += CLAW_SPEED * deltaTime; 
        claws.children[2].rotation.z += CLAW_SPEED * deltaTime; 
        claws.children[3].rotation.z -= CLAW_SPEED * deltaTime; 
    }

    if (closeClaws && -claws.children[0].rotation.x > MIN_CLAW_OPENING) {   // Close claws
        claws.children[0].rotation.x += CLAW_SPEED * deltaTime; 
        claws.children[1].rotation.x -= CLAW_SPEED * deltaTime; 
        claws.children[2].rotation.z -= CLAW_SPEED * deltaTime; 
        claws.children[3].rotation.z += CLAW_SPEED * deltaTime;  
    }
}


//Release object animation -----------------------------------------------------------------------------------------
function moveObjectClaws(deltaTime) {
    if (-claws.children[0].rotation.x < MAX_CLAW_OPENING) { // Open claws
        claws.children[0].rotation.x -= CLAW_SPEED * deltaTime;
        claws.children[1].rotation.x += CLAW_SPEED * deltaTime; 
        claws.children[2].rotation.z += CLAW_SPEED * deltaTime; 
        claws.children[3].rotation.z -= CLAW_SPEED * deltaTime; 
        return false;
    }
    return true;
}

function moveObjectHook(deltaTime){
    if(hook.position.y < -10) { // Move up
        hook.position.y += MOVEMENT_SPEED * deltaTime;
        const scaleChangeFactor = MOVEMENT_SPEED / 14;
        hook.children[0].scale.y -= scaleChangeFactor * deltaTime;
        hook.children[0].position.y -= ((14 * scaleChangeFactor) / 2) * deltaTime;
        return false;
    } 
    return true;
}

function moveObjectKart(deltaTime) {
    var kartFinalPos = Math.sqrt(Math.pow(crate.position.x, 2) + 
        Math.pow(crate.position.z, 2));

    const threshold = 0.05; // Adjust this threshold as needed

    const roundedKartPos = Math.round(kart.position.z * 100) / 100;
    const roundedFinalPos = Math.round(kartFinalPos * 100) / 100;

    if (Math.abs(roundedKartPos - roundedFinalPos) > threshold) {
        if (kart.position.z > kartFinalPos) { // Move backward
            kart.position.z -= MOVEMENT_SPEED * deltaTime;
        }
        if (kart.position.z < kartFinalPos) {  // Move forward
            kart.position.z += MOVEMENT_SPEED * deltaTime;
        }
        return false;
    } 
    return true;
}

function moveObjectJib(deltaTime) {
    const angleToCrate = Math.atan2(crate.position.x, crate.position.z);
    const normalizedRotation = (topStruct.rotation.y % (2 * Math.PI) + (2 * Math.PI)) % (2 * Math.PI);

    let shortestAngle = angleToCrate - normalizedRotation;
    if (shortestAngle > Math.PI) {
        shortestAngle -= 2 * Math.PI;
    } else if (shortestAngle < -Math.PI) {
        shortestAngle += 2 * Math.PI;
    }

    let rotationDirection = Math.sign(shortestAngle);

    if (Math.abs(shortestAngle) > ROTATION_SPEED * deltaTime) {
        topStruct.rotation.y += rotationDirection * ROTATION_SPEED * deltaTime; //Rotate if the rotation is bigger than the rotation step
        return false;
    } else {
        topStruct.rotation.y = angleToCrate; // Keeps the position static if the rotation is too little (lower than the rotation step)
        return true;
    }
}

function releaseObject(deltaTime) {
    var minY = caughtObject.height + 0.25; 
    if(caughtObject.position.y > minY) {
        if (caughtObject.position.y - fallingSpeed * deltaTime <= minY) 
            caughtObject.position.y -= caughtObject.position.y - minY;         
        else caughtObject.position.y -= fallingSpeed * deltaTime;
        fallingSpeed *= 1.1;
    } else {
        scene.remove(caughtObject);
        release = false;
        fallingSpeed = MOVEMENT_SPEED;
    }

}

function moveObject(deltaTime) {
    if (moveObjectHook(deltaTime)) {
        var kartCond = moveObjectKart(deltaTime);
        var jibCond = moveObjectJib(deltaTime);

        if(kartCond && jibCond) {
            if(moveObjectClaws(deltaTime)){
                objectCaught = false;
            }    
        }
    }

    if (readyForRelease) {
        var worldRotation = new THREE.Quaternion();
        caughtObject.getWorldQuaternion(worldRotation);
        // Remove the object from the hook
        hook.remove(caughtObject);

        var worldPosition = new THREE.Vector3();
        hook.getWorldPosition(worldPosition);

        caughtObject.position.copy(worldPosition);

        // hook_box_height/2 + object_hb_radius + hook_top_hb_radius  
        caughtObject.position.y -= 1 + caughtObject.children[1].geometry.parameters.radius + 0.5; 

        scene.add(caughtObject);
        caughtObject.setRotationFromQuaternion(worldRotation);
        
        readyForRelease = false;
        release = true;
    }

    if (release) releaseObject(deltaTime);
}

//Collision functions -------------------------------------------------------------------------------------------------
function getHitboxRadius(mesh) {
    return mesh.geometry.parameters.radius;
}

function collided(hitbox1, hitbox2) {

    const global_pos1 = new THREE.Vector3();
    const global_pos2 = new THREE.Vector3();

    hitbox1.getWorldPosition(global_pos1);
    hitbox2.getWorldPosition(global_pos2);

    const r1 = getHitboxRadius(hitbox1);
    const r2 = getHitboxRadius(hitbox2);

    const distance = global_pos1.distanceTo(global_pos2);
    const sum_of_radii = r1+r2;

    if (sum_of_radii >= distance) {
        return true; 
    }
    return false;
}


function collisions(){
    var boolHook, boolClaw;
    const len = randomisedObjects.length;
    var hookClaws = hook.children[3];
    // Claws hitboxes
    var frontClaw = hookClaws.children[0].children[2];
    var backClaw = hookClaws.children[1].children[2];
    var rightClaw = hookClaws.children[3].children[2];
    var leftClaw = hookClaws.children[3].children[2];

    if (objectCaught){
        boolHook = collided(hook.children[2], caughtObject.children[1]);
        boolClaw = collided(frontClaw, caughtObject.children[1]) &&
                   collided(backClaw, caughtObject.children[1]) &&
                   collided(rightClaw, caughtObject.children[1]) &&
                   collided(leftClaw, caughtObject.children[1]);

        // The object is ready to drop, if the claws aren't still touching it          
        if (!boolClaw && boolHook) { 
            readyForRelease = true;
        }     
    } else for (var i=0; i < len; i++) {
        var object = randomisedObjects[i];

        boolHook = collided(hook.children[2], object.children[1]);
        boolClaw = collided(frontClaw, object.children[1]) &&
                   collided(backClaw, object.children[1]) &&
                   collided(rightClaw, object.children[1]) &&
                   collided(leftClaw, object.children[1]);

        // Block downwards movement 
        if ((boolClaw && !boolHook) || (!boolClaw && boolHook)) {
            blocked = true;
            break;
        }
        else if (!boolClaw && !boolHook) {
            blocked = false;
        }
        // Object has been caught
        else {
            caughtObject = object;

            var vec = new THREE.Vector3();
            hook.getWorldPosition(vec);
            object.position.set(0, object.position.y - vec.y, 0);
        
            hook.add(object);
            objectCaught = true;
            break;
        } 
    }
}


function animate() {
    'use strict';
    const deltaTime = clock.getDelta();

    requestAnimationFrame(animate);
    
    if (objectCaught) {
        moveObject(deltaTime);
        blocked = false;
    } else {
        clawsAnimation(deltaTime);
        hookAnimation(deltaTime);
        kartAnimation(deltaTime);
        JibAnimation(deltaTime);
    }
    collisions();

    render();
}

// Initialize the scene
init();
animate();