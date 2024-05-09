/**
 * Authors:
 *  - João Fidalgo, ist1103471
 *  - Tomás Cruz, ist1103425
 *  - Rodrigo Friães, ist1104139
 * 
 * NOTES (to delete later):
 * 
 * *Write here anything*
 * 
 */

import * as THREE from 'three';
// Define variables
var activeCameraNumber, camera1, camera2, camera3, camera4, camera5, camera6, teste, scene, renderer;
var geometry, material, mesh;
var moveForward = false, moveBackward = false, rotateLeft = false, rotateRight = false, moveUp = false, moveDown = false;
var crate;
var wireframe = true;
var openClaws = false;
var closeClaws = false;

var kart, topStruct, hook, claws, randomisedObjects = [];
var hitboxesVisible = true;     // Variable to toggle on and off the visibility of the hitboxes
var activeCameraNumber;
var objectCaught = false, caughtObject;
var blocked = false;
var readyForRelease = false, whynot = false;

const clock = new THREE.Clock();

const FORTH = 1;
const BACK = 2;
const RIGHT = 3;
const LEFT = 4;

const BLOCKED_FRONT = 1;
const BLOCKED_BACK = 2;
const BLOCKED_LEFT = 4;
const BLOCKED_RIGHT = 3;
const BLOCKED_DOWN = 5;


const ROTATION_SPEED = 0.35;
const MOVEMENT_SPEED = 5;
const CLAW_SPEED = 0.6;

//const MAX_ROTATION = Math.PI / 2;
//const MIN_ROTATION = -Math.PI / 2;

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


// Builder functions
function buildBox(obj, x, y, z, width, height, length, color) {
    'use strict'
    geometry = new THREE.BoxGeometry(width, height, length);
    var material = new THREE.MeshBasicMaterial({ color: color, wireframe: wireframe })
    mesh = new THREE.Mesh(geometry, material);
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

    geometry = new THREE.SphereGeometry(radius, 10, 10);
    mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x05f51d, wireframe: wireframe, visible: hitboxesVisible }));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

// Group creation

function createClaw(x, y, z, orientation){
    'use strict';
    var claw = new THREE.Object3D();
    switch(orientation){
        case FORTH:
            buildBox(claw, 0, -0.5, 0.5, 0.5, 1.25, 0.25, 0x000000);  
            buildBox(claw, 0, -1.3, 0.7, 0.5, 0.75, 0.25, 0xFF00FF);
            claw.children[0].rotation.x = - Math.PI / 4;
            claw.children[1].rotation.x = Math.PI / 12;
            break;
        case BACK:
            buildBox(claw, 0, -0.5, -0.5, 0.5, 1.25, 0.25, 0x000000);  
            buildBox(claw, 0, -1.3, -0.7, 0.5, 0.75, 0.25, 0xFF00FF);
            claw.children[0].rotation.x = Math.PI / 4;
            claw.children[1].rotation.x = - Math.PI / 12;
            break;
        case RIGHT:
            buildBox(claw, 0.5, -0.5, 0, 0.25, 1.25, 0.5, 0x000000);  
            buildBox(claw, 0.7, -1.3, 0, 0.25, 0.75, 0.5, 0xFF00FF);
            claw.children[0].rotation.z = Math.PI / 4;
            claw.children[1].rotation.z = - Math.PI / 12;
            break;
        case LEFT:
            buildBox(claw, -0.5, -0.5, 0, 0.25, 1.25, 0.5, 0x000000);  
            buildBox(claw, -0.7, -1.3, 0, 0.25, 0.75, 0.5, 0xFF00FF);
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

    buildCylinder(hook, 0, 8, 0, 14, 0.1, 0.1, 0x000000);    // Cable     (The height of the cable is important for the lifting of the hook -> 14)
    buildBox(hook, 0, 0, 0, 1, 2, 1, 0x28910E);             // Hook

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

function createCrane(x, y, z) {
    createBaseStruct(x, y + 1, z);
    createTopStruct(x, y + 22.5, z);
}

// RANDOM Objects
function createTorusKnot(x, z) { // minimum = 9
    'use strict';

    const radius = getRandomNumber(0.3, 0.7);
    const p = getRandomInteger(2, 5);
    var q = 0;
    do{ q = getRandomInteger(3, 6); } while (p == q);   // To prevent Torus Knots from looking like a Torus

    var torusKnot = new THREE.Object3D();
    geometry = new THREE.TorusKnotGeometry(radius, 0.25, 90, 13, p, q);
    material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: wireframe });  
    mesh = new THREE.Mesh(geometry, material);

    torusKnot.add(mesh);
    buildHitboxSphere(torusKnot, 2.5*radius, 0, 0, 0.5);
    torusKnot.position.x = x;
    torusKnot.position.y = 0.5;
    torusKnot.position.z = z;

    torusKnot.rotation.x = Math.PI/2;

    scene.add(torusKnot);
    randomisedObjects.push(torusKnot);
    console.log("randomisedObjects = ", randomisedObjects);
}

function createTorus(x, z) {
    'use strict';

    const radius = getRandomNumber(0.3, 0.7);

    var torus = new THREE.Object3D();
    geometry = new THREE.TorusGeometry(radius, 0.5, 16, 90); 
    material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: wireframe }); 
    mesh = new THREE.Mesh(geometry, material);

    torus.add(mesh);
    buildHitboxSphere(torus, radius+0.5);
    torus.position.x = x;
    torus.position.y = 0.5;
    torus.position.z = z;

    torus.rotation.x = Math.PI/2;

    scene.add(torus);
    randomisedObjects.push(torus);
}

function createDodecahedron(x, z) {
    'use strict';

    const radius = getRandomNumber(0.7, 1.2);

    var dodeca = new THREE.Object3D();
    geometry = new THREE.DodecahedronGeometry(radius, 0);
    material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: wireframe }); 
    mesh = new THREE.Mesh(geometry, material); 

    dodeca.add(mesh);
    buildHitboxSphere(dodeca, radius);
    dodeca.position.x = x;
    dodeca.position.y = radius-0.125;                               // Just a safety measure to keep objects from floating
    dodeca.position.z = z;

    scene.add(dodeca);
    randomisedObjects.push(dodeca);
}

function createIcosahedron(x, z) {
    'use strict';

    const radius = getRandomNumber(0.7, 1.2);

    var icosa = new THREE.Object3D();
    geometry = new THREE.IcosahedronGeometry(radius, 0); 
    material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: wireframe }); 
    mesh = new THREE.Mesh(geometry, material); 

    icosa.add(mesh);
    buildHitboxSphere(icosa, radius);
    icosa.position.x = x;
    icosa.position.y = radius-0.125;                                // Just a safety measure to keep objects from floating
    icosa.position.z = z;

    scene.add(icosa);
    randomisedObjects.push(icosa);
}

function createRandomisedBox(x, z) {
    'use strict';

    const height = getRandomNumber(1, 2);
    const side = getRandomNumber(1, 2);

    var box = new THREE.Object3D();
    buildBox(box, 0, 0, 0, side, height, side, 0xff0000);

    const radius = Math.sqrt( ( Math.pow(side, 2)/2 ) + ( Math.pow(height, 2)/2 ) );
    buildHitboxSphere(box, Math.max(height, side)/2);

    box.position.set(x, height/2, z);

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

        switch (getRandomInteger(0,4)) {
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
                createRandomisedBox(x_pos, z_pos);
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
    return Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(z1-z2, 2));
}


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

function getRandomNumber(min, max) {
    return Math.random() * (max-min) + min;
}

function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max-min + 1) + min);
}

// Function to create scene
function createScene() {
    'use strict';
    scene = new THREE.Scene();
    scene.add(new THREE.AxesHelper(10));
    createCrane(0, 0, 0);
    createCrate(10, 0 ,7);  // To change (or even random)
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
    if (keyElement) {
        
        if (highlight) {
            if (key < 7 && key > 0) keyElement.classList.add('activeCamera'); // Add highlight class
            else if (key == 7) keyElement.classList.add('activeWireframe');
            else keyElement.classList.add('active');
        
        } else {
            if (key < 7 && key > 0) keyElement.classList.remove('activeCamera'); // Add highlight class
            else if (key == 7) keyElement.classList.remove('activeWireframe');
            else keyElement.classList.remove('active');
            
        }
    }

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
    
}


function getHitboxRadius(mesh) {
    return mesh.geometry.parameters.radius;
}

function collided(hitbox1, hitbox2) {

    const global_pos1 = new THREE.Vector3();
    const global_pos2 = new THREE.Vector3();

    hitbox1.getWorldPosition(global_pos1);
    hitbox2.getWorldPosition(global_pos2);
    const x1 = global_pos1.x;
    const y1 = global_pos1.y;
    const z1 = global_pos1.z;
    const r1 = getHitboxRadius(hitbox1);

    const x2 = global_pos2.x;
    const y2 = global_pos2.y;
    const z2 = global_pos2.z;
    const r2 = getHitboxRadius(hitbox2);

    const distance_squared = Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2) + Math.pow(z1-z2, 2);
    const radii_squared = Math.pow(r1+r2, 2);

    if (radii_squared >= distance_squared) { 
        return true; 
    }
    return false;
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
            objectCaught = !objectCaught;
            break;
        case 54:    // '6' key
            activeCameraNumber = 6;
            
            hitboxesVisible = !hitboxesVisible;
            break;
        case 56:    // '8' key - TO REMOVE
            activeCameraNumber = cameras[6];
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


// Function to initialize the scene, camera, and renderer
function init() {
    'use strict';
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    createCameras(); // Create the camera
    createScene(); // Create the scene
    // Highlight the active camera and wireframe initially
    updateHUD('', true, activeCameraNumber); // Highlight the active camera
    document.addEventListener("keydown", onKeyDown); // Add event listener for key presses
    document.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", onResize);
}


// Function to render the scene
function render() {
    'use strict';
    renderer.setClearColor(0xFFFFFF);   // Background color set to Light yellow
    renderer.render(scene, cameras[activeCameraNumber - 1]);
}


// Function to resize the window
function onResize() {
    'use strict';
    renderer.setSize(window.innerWidth, window.innerHeight);

    if (window.innerHeight > 0 && window.innerWidth) {
        cameras[activeCameraNumber - 1].aspect = renderer.getSize().width/renderer.getSize().height;
        cameras[activeCameraNumber - 1].updateProjectionMatrix();
    }
}

// Functions to animate the scene
function JibAnimation(deltaTime) {
    if (rotateLeft) { //blocked != BLOCKED_LEFT) {    // Rotate left [NO LIMIT]
        topStruct.rotation.y -= ROTATION_SPEED * deltaTime;
    }
    if (rotateRight) { //blocked != BLOCKED_RIGHT) {   // Rotate right [NO LIMIT]
        topStruct.rotation.y += ROTATION_SPEED * deltaTime;
    }
}

function hookAnimation(deltaTime) {
    if (moveDown && hook.position.y > MIN_HEIGHT && !blocked) { //blocked != BLOCKED_DOWN) { // Move down
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
    if (moveBackward && kart.position.z > MIN_SLIDE) { //blocked != BLOCKED_BACK) { // Move backward
        kart.position.z -= MOVEMENT_SPEED * deltaTime;
    }
    if (moveForward && kart.position.z < MAX_SLIDE) { //blocked != BLOCKED_FRONT) {  // Move forward
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


//Release object animation
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
    if(hook.position.y < -10) {
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

}

function moveObject(deltaTime) {
    var hookCond = moveObjectHook(deltaTime);
    var kartCond = moveObjectKart(deltaTime);
    var jibCond = moveObjectJib(deltaTime);

    if (hookCond && kartCond && jibCond) {
        whynot = true;
        if(moveObjectClaws(deltaTime)){
            objectCaught = false;
        }    
    }

    if (readyForRelease) {
        hook.remove(caughtObject);
        console.log("ready for realease:", readyForRelease);
        readyForRelease = false;
    }
}

//Colisions
function colisions(){
    var boolHook, boolClaw;
    const len = randomisedObjects.length;

    for (var i=0; i < len; i++) {
        var object = randomisedObjects[i];
        var hookClaw = hook.children[3].children[0].children[2];

        boolHook = collided(hook.children[2], object.children[1]);
        boolClaw = collided(hookClaw, object.children[1]);

        if ((boolClaw && !boolHook) || (!boolClaw && boolHook)) {
            blocked = true;
            break;
        }
        else if (!boolClaw && !boolHook) {
            blocked = false;
        }
        else if (!readyForRelease){
            var vec = new THREE.Vector3();
            hook.getWorldPosition(vec);
            object.position.set(0, object.position.y - vec.y , 0);
            hook.add(object);
            caughtObject = object;

            objectCaught = true;
            break;
        } 
    }

    if (whynot){
        boolHook = collided(hook.children[2], caughtObject.children[1]);
        boolClaw = collided(hookClaw, caughtObject.children[1]);
        if (!boolClaw && boolHook) 
            readyForRelease = true;
    }
}

function animate() {
    'use strict';
    const deltaTime = clock.getDelta();

    requestAnimationFrame(animate);
    
    if (objectCaught) {
        moveObject(deltaTime);
        blocked = false;
        if (whynot) colisions(deltaTime);
    } else {
    clawsAnimation(deltaTime);
    hookAnimation(deltaTime);
    kartAnimation(deltaTime);
    JibAnimation(deltaTime);
    colisions(deltaTime);
    }


    render();
}


// Initialize the scene
init();
animate();