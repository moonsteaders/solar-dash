import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import TWEEN from '@tweenjs/tween.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#solarSystem'),
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Raycaster setup
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 20;
controls.maxDistance = 100;
controls.enablePan = !isMobile();
controls.rotateSpeed = isMobile() ? 0.5 : 1;
controls.zoomSpeed = isMobile() ? 0.5 : 1;
controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.PAN
};
controls.touches = {
    ONE: THREE.TOUCH.ROTATE,
    TWO: THREE.TOUCH.DOLLY_PAN
};

// Camera position
camera.position.set(0, 50, 100);
controls.update();

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
scene.add(ambientLight);

const sunLight = new THREE.PointLight(0xffffff, 2.0, 300);
scene.add(sunLight);

// Add brightness control
let brightnessMultiplier = 1.0;
const BRIGHTNESS_STEP = 0.1;
const MIN_BRIGHTNESS = 0.2;
const MAX_BRIGHTNESS = 2.0;

// Function to update planet brightness
function updatePlanetBrightness() {
    planets.forEach(planet => {
        if (planet.material) {
            planet.material.emissiveIntensity = 0.2 * brightnessMultiplier;
            if (planet.mesh.children.length > 1 && planet.ringMaterial) {  // For Saturn's rings
                planet.ringMaterial.emissiveIntensity = 0.2 * brightnessMultiplier;
            }
        }
    });
}

// Handle keyboard controls
window.addEventListener('keydown', (event) => {
    switch(event.key) {
        case '+':
        case '=':  // Also handle '=' key since it's the same key as '+' without shift
            brightnessMultiplier = Math.min(brightnessMultiplier + BRIGHTNESS_STEP, MAX_BRIGHTNESS);
            updatePlanetBrightness();
            break;
        case '-':
        case '_':  // Also handle '_' key since it's the same key as '-' without shift
            brightnessMultiplier = Math.max(brightnessMultiplier - BRIGHTNESS_STEP, MIN_BRIGHTNESS);
            updatePlanetBrightness();
            break;
    }
});

// Modify the createGradientMaterial function
function createGradientMaterial(hex1, hex2) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY);
    
    const gradient = context.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, radius
    );
    
    gradient.addColorStop(0, `#${hex1.toString(16).padStart(6, '0')}`);
    gradient.addColorStop(0.5, `#${hex1.toString(16).padStart(6, '0')}`);
    gradient.addColorStop(1, `#${hex2.toString(16).padStart(6, '0')}`);
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    const material = new THREE.MeshPhongMaterial({
        map: texture,
        shininess: 150,
        specular: new THREE.Color(0xffffff),
        emissive: new THREE.Color(0x333333),
        emissiveIntensity: 0.2
    });
    
    return material;
}

// Create planets with proper 3D properties and gradient colors
const planets = [];
const planetData = [
    { 
        name: 'Sun', 
        radius: 5, 
        distance: 0, 
        gradient1: 0xFE1881,
        gradient2: 0xFFB700,
        speed: 0,
        tilt: 0,
        orbitalInclination: 0
    },
    { 
        name: 'Mercury', 
        radius: 0.4, 
        distance: 10, 
        gradient1: 0x07BDC9,
        gradient2: 0x00F0DD,
        speed: 0.04,
        tilt: 0.034,
        orbitalInclination: 0.122
    },
    { 
        name: 'Venus', 
        radius: 0.9, 
        distance: 15, 
        gradient1: 0x5C3ADE,
        gradient2: 0xB827AA,
        speed: 0.03,
        tilt: 2.64,
        orbitalInclination: 0.059
    },
    { 
        name: 'Earth', 
        radius: 1, 
        distance: 20, 
        gradient1: 0x5C3ADE,
        gradient2: 0xB827AA,
        speed: 0.02,
        tilt: 0.41,
        orbitalInclination: 0
    },
    { 
        name: 'Mars', 
        radius: 0.5, 
        distance: 25, 
        gradient1: 0xFC3BB2,
        gradient2: 0xF7906E,
        speed: 0.015,
        tilt: 0.44,
        orbitalInclination: 0.032
    },
    { 
        name: 'Jupiter', 
        radius: 2.5, 
        distance: 35, 
        gradient1: 0x00F0DD,
        gradient2: 0x00F0DD,
        speed: 0.01,
        tilt: 0.05,
        orbitalInclination: 0.022
    },
    { 
        name: 'Saturn', 
        radius: 2, 
        distance: 45, 
        gradient1: 0x9400D3,
        gradient2: 0x4B0082,
        speed: 0.008,
        tilt: 0.47,
        orbitalInclination: 0.043
    },
    { 
        name: 'Uranus', 
        radius: 1.5, 
        distance: 55, 
        gradient1: 0x4E17CF,
        gradient2: 0x3064F3,
        speed: 0.006,
        tilt: 1.71,
        orbitalInclination: 0.013
    },
    { 
        name: 'Neptune', 
        radius: 1.5, 
        distance: 65, 
        gradient1: 0x07BDC9,
        gradient2: 0x00F0DD,
        speed: 0.004,
        tilt: 0.72,
        orbitalInclination: 0.030
    },
    { 
        name: 'Pluto', 
        radius: 0.2, 
        distance: 75, 
        gradient1: 0xFE1881,
        gradient2: 0xB827AA,
        speed: 0.002,
        tilt: 0.0,
        orbitalInclination: 0.17
    }
];

// Create orbital lines
const createOrbitLine = (radius, inclination) => {
    const points = [];
    const segments = 128;
    
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const x = radius * Math.cos(theta);
        const z = radius * Math.sin(theta) * Math.cos(inclination);
        const y = radius * Math.sin(theta) * Math.sin(inclination);
        points.push(new THREE.Vector3(x, y, z));
    }
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ 
        color: 0xffffff,
        transparent: true,
        opacity: 0.3
    });
    
    const orbit = new THREE.Line(geometry, material);
    scene.add(orbit);
    return orbit;
};

// Create modal container
const modalContainer = document.createElement('div');
modalContainer.id = 'modal-container';
modalContainer.style.position = 'fixed';
modalContainer.style.top = '0';
modalContainer.style.left = '0';
modalContainer.style.width = '100%';
modalContainer.style.height = '100%';
modalContainer.style.display = 'none';
modalContainer.style.zIndex = '1000';
modalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
modalContainer.style.cursor = 'pointer';
document.body.appendChild(modalContainer);

// Create modal content
const modalContent = document.createElement('div');
modalContent.id = 'modal-content';
modalContent.style.position = 'fixed';
modalContent.style.top = '50%';
modalContent.style.left = '50%';
modalContent.style.transform = 'translate(-50%, -50%)';
modalContent.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
modalContent.style.color = 'white';
modalContent.style.padding = '20px';
modalContent.style.borderRadius = '15px';
modalContent.style.width = '400px';
modalContent.style.border = '2px solid white';
modalContent.style.fontFamily = 'Arial, sans-serif';
modalContent.style.fontSize = '18px';
modalContent.style.lineHeight = '1.5';
modalContent.style.maxHeight = '80vh';
modalContent.style.overflowY = 'auto';
modalContent.style.cursor = 'default';
modalContainer.appendChild(modalContent);

// Get facts panel element
const factsPanel = document.getElementById('facts-panel');

// Create labels container
const labels = [];

// Create label
const createLabel = (text, position) => {
    const div = document.createElement('button');
    div.className = 'planet-label';
    div.textContent = text;
    div.addEventListener('click', (event) => {
        event.stopPropagation();
        const planetData = planets.find(p => p.mesh.name === text);
        if (planetData) {
            selectedPlanet = planetData;
            showPlanetFacts(text);
            centerCameraOnPlanet(planetData);
        }
    });
    document.body.appendChild(div);
    return div;
};

// Function to update labels position
function updateLabels() {
    labels.forEach(({ element, planet }) => {
        const vector = planet.mesh.position.clone();
        vector.project(camera);
        
        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = -(vector.y * 0.5 - 0.5) * window.innerHeight;
        
        element.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;
        
        // Hide labels that are behind the camera
        if (vector.z > 1) {
            element.style.display = 'none';
        } else {
            element.style.display = 'block';
        }
    });
}

// Function to show planet facts
function showPlanetFacts(planetName) {
    const facts = planetFacts[planetName];
    if (facts) {
        const planet = planets.find(p => p.mesh.name === planetName);
        const color = planet ? planet.originalColor : 0xFFFFFF;
        const colorStyle = `color: #${color.toString(16).padStart(6, '0')}`;
        
        factsPanel.innerHTML = `
            <h2 style="${colorStyle}">${planetName}</h2>
            <p><strong style="${colorStyle}">Size:</strong> ${facts.size}</p>
            <p><strong style="${colorStyle}">Distance:</strong> ${facts.distance}</p>
            <p><strong style="${colorStyle}">${facts.planets ? 'Planets:' : 'Moons:'}</strong> ${facts.planets || facts.moons}</p>
            <p><strong style="${colorStyle}">Fun Fact:</strong> ${facts.funFact}</p>
        `;
        factsPanel.style.display = 'block';
    }
}

// Function to center camera on planet
function centerCameraOnPlanet(planetData) {
    const planetPos = planetData.mesh.position.clone();
    const distance = planetData.mesh.children[0].geometry.parameters.radius * (isMobile() ? 15 : 10);
    const offset = new THREE.Vector3(distance, distance / 2, distance);
    const targetPosition = planetPos.clone().add(offset);
    
    new TWEEN.Tween(camera.position)
        .to(targetPosition, 1000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
    
    new TWEEN.Tween(controls.target)
        .to(planetPos, 1000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
}

// Function to detect mobile devices
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.matchMedia("(max-width: 768px)").matches);
}

// Handle window resize
function handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    
    // Adjust camera for mobile
    if (isMobile()) {
        camera.position.set(0, 60, 120); // Move camera back further on mobile
    }
}

window.addEventListener('resize', handleResize);
handleResize(); // Initial call

// Update click handler for both mouse and touch
function handleInteraction(event) {
    event.preventDefault();
    
    const clientX = event.clientX || (event.touches && event.touches[0].clientX);
    const clientY = event.clientY || (event.touches && event.touches[0].clientY);
    
    if (typeof clientX === 'undefined' || typeof clientY === 'undefined') return;
    
    mouse.x = (clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planets.map(p => p.mesh.children[0]));

    if (intersects.length > 0) {
        const clickedPlanet = intersects[0].object.parent;
        const planetData = planets.find(p => p.mesh === clickedPlanet);
        
        if (planetData) {
            selectedPlanet = planetData;
            showPlanetFacts(planetData.mesh.name);
            centerCameraOnPlanet(planetData);
        }
    } else if (event.target === renderer.domElement) {
        selectedPlanet = null;
        factsPanel.style.display = 'none';
    }
}

// Add touch event listeners
renderer.domElement.addEventListener('click', handleInteraction);
renderer.domElement.addEventListener('touchstart', handleInteraction, { passive: false });

// Prevent default touch behaviors
document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

// Add selected planet tracking
let selectedPlanet = null;

// Planet facts data
const planetFacts = {
    'Sun': {
        size: '865,370 miles diameter',
        distance: 'Center of Solar System',
        planets: '8 planets + dwarf planets',
        funFact: 'The Sun contains 99.8% of the mass of our solar system.'
    },
    'Mercury': {
        size: '3,032 miles diameter',
        distance: '36 million miles from Sun',
        moons: '0',
        funFact: 'Mercury is the smallest planet in our solar system.'
    },
    'Venus': {
        size: '7,521 miles diameter',
        distance: '67 million miles from Sun',
        moons: '0',
        funFact: 'Venus rotates in the opposite direction to most planets.'
    },
    'Earth': {
        size: '7,918 miles diameter',
        distance: '93 million miles from Sun',
        moons: '1',
        funFact: 'Earth is the only planet known to support life.'
    },
    'Mars': {
        size: '4,212 miles diameter',
        distance: '142 million miles from Sun',
        moons: '2',
        funFact: 'Mars has the largest dust storms in the solar system.'
    },
    'Jupiter': {
        size: '86,881 miles diameter',
        distance: '484 million miles from Sun',
        moons: '95',
        funFact: 'Jupiter is the largest planet in our solar system.'
    },
    'Saturn': {
        size: '72,367 miles diameter',
        distance: '886 million miles from Sun',
        moons: '146',
        funFact: 'Saturn\'s rings are made mostly of ice particles.'
    },
    'Uranus': {
        size: '31,518 miles diameter',
        distance: '1.8 billion miles from Sun',
        moons: '27',
        funFact: 'Uranus rotates on its side, with its axis nearly parallel to its orbit.'
    },
    'Neptune': {
        size: '30,599 miles diameter',
        distance: '2.8 billion miles from Sun',
        moons: '14',
        funFact: 'Neptune has the strongest winds in the solar system.'
    },
    'Pluto': {
        size: '1,477 miles diameter',
        distance: '3.7 billion miles from Sun',
        moons: '5',
        funFact: 'Pluto was reclassified as a dwarf planet in 2006.'
    }
};

planetData.forEach(data => {
    if (data.distance > 0) {
        createOrbitLine(data.distance, data.orbitalInclination);
    }

    // Create sphere with gradient material
    const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
    const material = createGradientMaterial(data.gradient1, data.gradient2);
    const planet = new THREE.Mesh(geometry, material);
    
    // Create invisible clickable sphere
    const clickableRadius = data.radius * 3;
    const clickableGeometry = new THREE.SphereGeometry(clickableRadius, 32, 32);
    const clickableMaterial = new THREE.MeshBasicMaterial({
        visible: false
    });
    const clickableSphere = new THREE.Mesh(clickableGeometry, clickableMaterial);
    planet.add(clickableSphere);
    
    // Set planet tilt
    planet.rotation.z = data.tilt;
    
    let ringMaterial = null;
    if (data.name === 'Saturn') {
        // Create ring for Saturn
        const ringGeometry = new THREE.RingGeometry(data.radius + 0.5, data.radius + 2, 32);
        ringMaterial = createGradientMaterial(data.gradient1, data.gradient2);
        ringMaterial.side = THREE.DoubleSide;
        ringMaterial.transparent = true;
        ringMaterial.opacity = 0.8;
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        planet.add(ring);
    }
    
    planet.name = data.name;
    scene.add(planet);
    
    // Create label for the planet
    const label = createLabel(data.name, planet.position);
    labels.push({ element: label, planet: { mesh: planet } });
    
    planets.push({
        mesh: planet,
        material: material,
        ringMaterial: ringMaterial,
        originalColor: data.gradient1,
        distance: data.distance,
        speed: data.speed,
        angle: Math.random() * Math.PI * 2,
        orbitalInclination: data.orbitalInclination
    });
});

// Animation
function animate() {
    requestAnimationFrame(animate);
    
    TWEEN.update();
    
    planets.forEach(planet => {
        if (planet.distance > 0) {
            planet.angle += planet.speed;
            const x = planet.distance * Math.cos(planet.angle);
            const z = planet.distance * Math.sin(planet.angle) * Math.cos(planet.orbitalInclination);
            const y = planet.distance * Math.sin(planet.angle) * Math.sin(planet.orbitalInclination);
            planet.mesh.position.set(x, y, z);
        }
    });
    
    updateLabels();
    
    // Update camera position to follow selected planet
    if (selectedPlanet) {
        const planetPosition = selectedPlanet.mesh.position.clone();
        const distance = 30;
        const cameraPosition = planetPosition.clone().add(new THREE.Vector3(0, distance, distance));
        
        camera.position.lerp(cameraPosition, 0.05);
        controls.target.lerp(planetPosition, 0.05);
        
        // Update info panel position
        const vector = selectedPlanet.mesh.position.clone();
        vector.project(camera);
        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = -(vector.y * 0.5 - 0.5) * window.innerHeight;
        
        // Ensure panel stays within viewport
        const panelWidth = modalContent.offsetWidth;
        const panelHeight = modalContent.offsetHeight;
        const margin = 20;
        
        let panelX = x + margin;
        let panelY = y;
        
        // Adjust position if panel would go off screen
        if (panelX + panelWidth > window.innerWidth) {
            panelX = x - panelWidth - margin;
        }
        if (panelY + panelHeight > window.innerHeight) {
            panelY = window.innerHeight - panelHeight - margin;
        }
        if (panelY < margin) {
            panelY = margin;
        }
        
        modalContent.style.left = `${panelX}px`;
        modalContent.style.top = `${panelY}px`;
    }
    
    controls.update();
    renderer.render(scene, camera);
}

// Start animation
animate();

// Add menu toggle functionality
const toggleBtn = document.querySelector('.toggle-btn');
const infoContent = document.querySelector('.info-content');

let isCollapsed = true; // Start collapsed

function toggleMenu() {
    isCollapsed = !isCollapsed;
    toggleBtn.textContent = isCollapsed ? '▸' : '▾';
    infoContent.classList.toggle('collapsed');
}

toggleBtn.addEventListener('click', toggleMenu);

// Prevent clicks on the content from triggering the toggle
infoContent.addEventListener('click', (e) => {
    e.stopPropagation();
}); 