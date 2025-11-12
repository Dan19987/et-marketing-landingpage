import * as THREE from 'three';

let lastFrameTime = 0;
let deltaTime = 0;
const targetFrameRate = 60;
const frameInterval = 1000 / targetFrameRate;

// Globale Variablen für den Fallback-Würfel
let renderer, scene, camera;
let cubeGroup;
let outerCube = null;
let innerDoor = null;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let rotationSpeed = { x: 0.005, y: 0.01 };
const minRotationSpeed = 0.001;
const damping = 0.95;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { default: CubeManager } = await import('./CubeManager.js');
        
        const cubeManager = new CubeManager({
            init: init,
            onWindowResize: onWindowResize,
            animate: animate
        });
        
        await cubeManager.init();

    } catch (error) {
        console.error('Fehler beim Laden des CubeManager:', error);
    }
});

function init() {
    camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.1,
        10
    );
    camera.position.z = 2.5;

    scene = new THREE.Scene();
    cubeGroup = new THREE.Group();

    const manager = new THREE.LoadingManager();
    manager.onLoad = function () {
        console.log('Alle Ressourcen wurden geladen');
        scene.add(cubeGroup);

        if (innerDoor) {
            scene.add(innerDoor);
        }

        adjustCubeScale();
        animate();
    };

    const loader = new THREE.TextureLoader(manager);

    // Laden des Außenwürfels
    const outerGeometry = new THREE.BoxGeometry(1, 1, 1);
    loader.load(
        '/static/images/hero-image.png',
        (texture) => {
            console.log('Hero-Image-Textur erfolgreich geladen');
            const outerMaterial = new THREE.MeshStandardMaterial({
                map: texture,
                transparent: true,
                opacity: 1,
                side: THREE.DoubleSide,
                depthWrite: true,
                depthTest: true,
                alphaToCoverage: true
            });
            outerCube = new THREE.Mesh(outerGeometry, outerMaterial);
            cubeGroup.add(outerCube);
        },
        undefined,
        (error) => {
            console.error('Fehler beim Laden der Hero-Image-Textur:', error);
        }
    );

    // Laden der Tür
    const innerGeometry = new THREE.BoxGeometry(0.3, 0.7, 0.05);
    loader.load(
        '/static/images/tuerbild.png',
        (doorTexture) => {
            console.log('Türtextur erfolgreich geladen');
            const innerMaterial = new THREE.MeshStandardMaterial({
                map: doorTexture,
                transparent: true,
                opacity: 1,
                side: THREE.DoubleSide,
                depthWrite: true,
                depthTest: true,
                polygonOffset: true,
                polygonOffsetFactor: -1,
                polygonOffsetUnits: -1
            });
            innerDoor = new THREE.Mesh(innerGeometry, innerMaterial);
            innerDoor.position.set(0, 0, -0.1);
        },
        undefined,
        (error) => {
            console.error('Fehler beim Laden der Türtextur:', error);
        }
    );

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    document.getElementById('3d-logo-container').appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Event-Listener
    renderer.domElement.addEventListener('mousedown', onMouseDown, false);
    renderer.domElement.addEventListener('mousemove', onMouseMove, false);
    renderer.domElement.addEventListener('mouseup', onMouseUp, false);
    renderer.domElement.addEventListener('mouseleave', onMouseUp, false);
    renderer.domElement.addEventListener('touchstart', onTouchStart, false);
    renderer.domElement.addEventListener('touchmove', onTouchMove, false);
    renderer.domElement.addEventListener('touchend', onTouchEnd, false);
}

function adjustCubeScale() {
    if (window.innerWidth < 600) {
        cubeGroup.scale.set(0.85, 0.85, 0.85);
        if (innerDoor) {
            innerDoor.scale.set(0.85, 0.85, 0.85);
        }
    } else {
        cubeGroup.scale.set(1, 1, 1);
        if (innerDoor) {
            innerDoor.scale.set(1, 1, 1);
        }
    }
}

function onWindowResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    adjustCubeScale();
}

function onMouseDown(event) {
    if (event.target !== renderer.domElement) return;
    if (event.target.closest('.exclude-interaction')) return;
    
    if (isIntersecting(event.clientX, event.clientY)) {
        isDragging = true;
        previousMousePosition = { x: event.clientX, y: event.clientY };
        event.preventDefault();
    } else {
        isDragging = false;
    }
}

function onMouseMove(event) {
    if (isDragging && cubeGroup) {
        event.preventDefault();
        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;

        const quaternionX = new THREE.Quaternion();
        const quaternionY = new THREE.Quaternion();

        quaternionX.setFromAxisAngle(new THREE.Vector3(1, 0, 0), deltaY * 0.01);
        quaternionY.setFromAxisAngle(new THREE.Vector3(0, 1, 0), deltaX * 0.01);

        cubeGroup.quaternion.multiplyQuaternions(quaternionY, cubeGroup.quaternion);
        cubeGroup.quaternion.multiplyQuaternions(quaternionX, cubeGroup.quaternion);

        rotationSpeed.y = deltaX * 0.01;
        rotationSpeed.x = deltaY * 0.01;

        previousMousePosition = { x: event.clientX, y: event.clientY };
    }
}

function onMouseUp(event) {
    isDragging = false;
}

function onTouchStart(event) {
    if (event.touches.length === 1) {
        const touch = event.touches[0];
        if (isIntersecting(touch.clientX, touch.clientY)) {
            isDragging = true;
            previousMousePosition = { x: touch.clientX, y: touch.clientY };
            event.preventDefault();
        } else {
            isDragging = false;
        }
    }
}

function onTouchMove(event) {
    if (isDragging && event.touches.length === 1 && cubeGroup) {
        event.preventDefault();
        const touch = event.touches[0];
        const deltaX = touch.clientX - previousMousePosition.x;
        const deltaY = touch.clientY - previousMousePosition.y;

        const quaternionX = new THREE.Quaternion();
        const quaternionY = new THREE.Quaternion();

        quaternionX.setFromAxisAngle(new THREE.Vector3(1, 0, 0), deltaY * 0.01);
        quaternionY.setFromAxisAngle(new THREE.Vector3(0, 1, 0), deltaX * 0.01);

        cubeGroup.quaternion.multiplyQuaternions(quaternionY, cubeGroup.quaternion);
        cubeGroup.quaternion.multiplyQuaternions(quaternionX, cubeGroup.quaternion);

        rotationSpeed.y = deltaX * 0.01;
        rotationSpeed.x = deltaY * 0.01;

        previousMousePosition = { x: touch.clientX, y: touch.clientY };
    }
}

function onTouchEnd(event) {
    isDragging = false;
}

function isIntersecting(clientX, clientY) {
    if (!outerCube) return false;

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(outerCube, true);
    return intersects.length > 0;
}

function animate(currentTime) {
    requestAnimationFrame(animate);

    deltaTime = currentTime - lastFrameTime;

    if (deltaTime >= frameInterval) {
        if (cubeGroup && !isDragging) {
            const quaternionX = new THREE.Quaternion();
            const quaternionY = new THREE.Quaternion();

            rotationSpeed.y *= damping;
            rotationSpeed.x *= damping;

            if (Math.abs(rotationSpeed.y) < minRotationSpeed) {
                rotationSpeed.y = rotationSpeed.y >= 0 ? minRotationSpeed : -minRotationSpeed;
            }
            if (Math.abs(rotationSpeed.x) < minRotationSpeed) {
                rotationSpeed.x = rotationSpeed.x >= 0 ? minRotationSpeed : -minRotationSpeed;
            }

            quaternionX.setFromAxisAngle(new THREE.Vector3(1, 0, 0), rotationSpeed.x);
            quaternionY.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotationSpeed.y);

            cubeGroup.quaternion.multiplyQuaternions(quaternionX, cubeGroup.quaternion);
        }

        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }

        lastFrameTime = currentTime;
    }
}

export { init, onWindowResize, animate };