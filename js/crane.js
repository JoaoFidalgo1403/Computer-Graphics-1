import * as THREE from 'three';
// Define variables
var activeCamera, camera1, camera2, camera3, camera4, camera5, scene, renderer;
var geometry, material, mesh;
var activeCameraIndex = 0; // Initialize activeCameraIndex
var moveLeft = false, moveRight = false, rotateLeft = false, rotateRight = false;

var kart, topStruct;
var kartOffset = new THREE.Vector3();

// Define cameras array
var cameras = [];

/*
// Function to add triangular prism
function addTriangularPrism(obj, x, y, z, height, radiusTop, radiusBottom) {
    'use strict';
    var sides = 3; // Number of sides for the cylinder (triangle has 3 sides)
    var geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, sides);
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.rotation.set(Math.PI / 2, Math.PI, Math.PI / 2); // Rotate prism
    obj.add(mesh);
    return mesh;
}
*/
function createBox(obj, x, y, z, width, height, length) {
    'use strict'
    geometry = new THREE.BoxGeometry(width, height, length);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addCylinder(obj, x, y, z, height, radiusTop, radiusBottom) {
    'use strict';
    var geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 8);
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addCraneBase(obj, x, y, z) {
    createBox(obj, x, y ,z, 4, 2, 4);    
}

function addCranePillar(obj, x, y, z) {
    createBox(obj, x, y ,z, 2, 20, 2);    
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

function addKart(obj, x, y, z) {
    createBox(obj, x, y, z, 2, 1, 2);
}

function createKart(x, y, z) {
    'use strict';
    kart = new THREE.Object3D();
    material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    addKart(kart, 0, 0, 0);
    addCylinder(kart, 0, -7.5, 0, 14, 0.1, 0.1); //0, 25.75, 17
    addHook(kart, 0, -15.5, 0);

    scene.add(kart);

    kart.position.set(x, y, z);

    kartOffset.copy(kart.position).sub(topStruct.position);
}

function createBaseStruct(x, y, z) {
    'use strict';
    var baseStruct = new THREE.Object3D();
    material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

    addCraneBase(baseStruct, 0, 0, 0);
    addCranePillar(baseStruct, 0, 11, 0);

    scene.add(baseStruct);
    
    baseStruct.position.set(x, y, z);

}

function createTopStruct(x, y, z) {
    'use strict';
    topStruct = new THREE.Object3D();
    material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    //Elemento rotativo
    addCylinder(topStruct, 0, 0, 0, 1, 1.5, 1.5);
    createBox(topStruct, 0, 2, 0, 2, 3, 2);
    addCabin(topStruct, 0, 2.5, 2);
    
    //Jib
    addJib(topStruct, 0, 4.5,  11);

    //Counter Jib
    addCounterJib(topStruct, 0, 4, -4);
    addCounterWeigth(topStruct, 0,  2.5, -6.5);
    addGuard(topStruct, -1, 5, -6);
    addGuard(topStruct, 1, 5, -6);
    addTower(topStruct, 0, 7, 0);

    createKart(0, 3, 17);
    topStruct.add(kart);

    scene.add(topStruct);
    topStruct.position.set(x, y, z);

}

// Function to create scene
function createScene() {
    'use strict';
    scene = new THREE.Scene();
    scene.add(new THREE.AxesHelper(10));
    createBaseStruct(0, 1, 0); // Create crane's base structure in the scene
    createTopStruct(0, 22.5, 0);
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

    camera4 = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
    camera4.position.set(30, 30, 30);
    camera4.lookAt(0, 0, 0);

    camera5 = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 1000);
    camera5.position.set(30, 30, 30);
    camera5.lookAt(0, 0, 0);


    activeCamera = camera5; 

    cameras.push(camera1);
    cameras.push(camera2);
    cameras.push(camera3);
    cameras.push(camera4);
    cameras.push(camera5);

}

function onKeyUp(event) {
    switch (event.keyCode) {
        //KART movement
        case 101: // e key
        case 69: // E key
            moveRight = false;
            break;
        case 100: // d key
        case 68: // D key
            moveLeft = false;
            break;

        //CRANE rotation
        case 97: // a key
        case 65: // A key
            rotateRight = false;
            break;
        case 113: // q key
        case 81: // Q key
            rotateLeft = false;
            break;
    }
}

// Function to handle key presses
function onKeyDown(e) {
    'use strict';
    switch (e.keyCode) {
        //CAMERA switching
        case 99: // c key
        case 67: // C key
            activeCameraIndex = (activeCameraIndex + 1) % cameras.length;
            activeCamera = cameras[activeCameraIndex];
            break;

        //KART movement
        case 101: // e key
        case 69: // E key
            moveRight = true;
            break;
        case 100: // d key
        case 68: // D key
            moveLeft = true;
            break;  

        //CRANE rotation
        case 97: // a key
        case 65: // A key
            rotateRight = true;
            break;
        case 113: // q key
        case 81: // Q key
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
    createScene(); // Create the scene
    createCamera(); // Create the camera
    document.addEventListener("keydown", onKeyDown); // Add event listener for key presses
    document.addEventListener("keyup", onKeyUp);
}

// Function to render the scene
function render() {
    'use strict';
    //renderer.setClearColor(0x80d1d1);   // Background color set to Cyan
    renderer.render(scene, activeCamera);
}

// Function to animate the scene
function animate() {
    'use strict';
    requestAnimationFrame(animate);

    if (moveLeft && kart.position.z > 4) {
        kart.position.z -= 0.1; // Move left
    }
    if (moveRight && kart.position.z < 20) {
        kart.position.z += 0.1; // Move right
    }

    //kart.position.copy(topStruct.localToWorld(kartOffset.clone()));

    var rotationSpeed = 0.005; 

    var maxRotation = Math.PI / 2;
    var minRotation = -Math.PI / 2; 
    if (rotateLeft && topStruct.rotation.y > minRotation) {
        topStruct.rotation.y -= rotationSpeed;
        if (topStruct.rotation.y < minRotation) {
            topStruct.rotation.y = minRotation;
        }
    }
    if (rotateRight && topStruct.rotation.y < maxRotation) {
        topStruct.rotation.y += rotationSpeed;
        if (topStruct.rotation.y > maxRotation) {
            topStruct.rotation.y = maxRotation;
        }
    }

    render();
}

// Initialize the scene
init();
animate();
