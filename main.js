import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

// Scene setup
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.5, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add OrbitControls for interaction
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.minDistance = 1;
controls.maxDistance = 10;

// Light setup
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 2, 3);
scene.add(directionalLight);

// Add loading spinner
const loadingSpinner = document.createElement('div');
loadingSpinner.style.position = 'fixed';
loadingSpinner.style.top = '50%';
loadingSpinner.style.left = '50%';
loadingSpinner.style.transform = 'translate(-50%, -50%)';
loadingSpinner.style.width = '50px';
loadingSpinner.style.height = '50px';
loadingSpinner.style.border = '5px solid #ccc';
loadingSpinner.style.borderTop = '5px solid #333';
loadingSpinner.style.borderRadius = '50%';
loadingSpinner.style.animation = 'spin 1s linear infinite';
document.body.appendChild(loadingSpinner);

// Add spinner animation CSS
const style = document.createElement('style');
style.innerHTML = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

// GLTF and Draco loader setup
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
loader.setDRACOLoader(dracoLoader);

// Object variables
let laptopObject, grassObject, floorObject, hairObject;

// Load the model
loader.load(
  './ROOMWORKINGGIRL.glb',
  (gltf) => {
    const model = gltf.scene;
    console.log('Model loaded successfully:', model);

    // Debug: Print all object names
    model.traverse((child) => {
      if (child.isMesh) {
        console.log('Object Name:', child.name);
      }
    });

    // Get correct object names from console logs
    laptopObject = model.getObjectByName('computerBodyTop'); // Update name if different
    grassObject = model.getObjectByName('Cube_9'); // Update name if different
    floorObject = model.getObjectByName('Floor');
    hairObject = model.getObjectByName('hair');

    if (laptopObject) {
      console.log('Laptop found:', laptopObject);
    } else {
      console.error('Laptop not found! Check object name.');
    }

    if (grassObject) {
      console.log('Grass found:', grassObject);
    } else {
      console.error('Grass not found! Check object name.');
    }

    if (floorObject) {
      console.log('Floor found:', floorObject);

      // Aqua Mermaid Gradient for Floor
      const canvasFloor = document.createElement('canvas');
      canvasFloor.width = 512;
      canvasFloor.height = 512;
      const contextFloor = canvasFloor.getContext('2d');
      const gradientFloor = contextFloor.createLinearGradient(0, 0, 0, 512);
      gradientFloor.addColorStop(0, '#00ffff'); // Aqua
      gradientFloor.addColorStop(0.5, '#4b0082'); // Deep Indigo
      gradientFloor.addColorStop(1, '#1e90ff'); // Ocean Blue
      contextFloor.fillStyle = gradientFloor;
      contextFloor.fillRect(0, 0, 512, 512);
      const floorTexture = new THREE.CanvasTexture(canvasFloor);
      floorObject.material.map = floorTexture;
      floorObject.material.needsUpdate = true;
    } else {
      console.error('Floor not found! Check object name.');
    }

    if (hairObject) {
      console.log('Hair found:', hairObject);

      // Gradient for Hair
      const canvasHair = document.createElement('canvas');
      canvasHair.width = 512;
      canvasHair.height = 512;
      const contextHair = canvasHair.getContext('2d');
      const gradientHair = contextHair.createLinearGradient(0, 0, 0, 512);
      gradientHair.addColorStop(0, '#4B0082'); // Midnight Purple
      gradientHair.addColorStop(1, '#1E90FF'); // Electric Blue
      contextHair.fillStyle = gradientHair;
      contextHair.fillRect(0, 0, 512, 512);
      const hairTexture = new THREE.CanvasTexture(canvasHair);
      hairObject.material.map = hairTexture;
      hairObject.material.needsUpdate = true;
    } else {
      console.error('Hair not found! Check object name.');
    }

    model.position.set(0, 0, 0);
    scene.add(model);

    // Hide loading spinner after model loads
    document.body.removeChild(loadingSpinner);
  },
  (xhr) => {
    console.log(`Loading... ${(xhr.loaded / xhr.total) * 100}% loaded`);
  },
  (error) => {
    console.error('Error loading model:', error);
    loadingSpinner.innerHTML = '<p style="color: red;">Error loading model!</p>';
  }
);

// Handle object interactions
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Add event listener for mouse clicks
window.addEventListener('click', (event) => {
  // Normalize mouse coordinates (-1 to +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Raycast to detect interaction
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;
    console.log('Clicked on:', clickedObject.name);

    // Check for laptop interaction
    if (clickedObject === laptopObject) {
      window.location.href = './laptop.html';
    }

    // Check for grass interaction
    if (clickedObject === grassObject) {
      window.location.href = './grass.html';
    }
  }
});

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
// Variable to track the currently hovered object
let hoveredObject = null;

// Add event listener for mouse movement
window.addEventListener('mousemove', (event) => {
  // Normalize mouse coordinates (-1 to +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Raycast to detect hover
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects([laptopObject, grassObject].filter(Boolean), true);

  if (intersects.length > 0) {
    const object = intersects[0].object;

    // Check if the object is not already hovered
    if (hoveredObject !== object) {
      if (hoveredObject) {
        resetHoverEffect(hoveredObject); // Reset previous hover
      }
      applyHoverEffect(object); // Apply new hover
      hoveredObject = object;
    }
  } else {
    if (hoveredObject) {
      resetHoverEffect(hoveredObject);
      hoveredObject = null;
    }
  }
});

// Apply hover effect with a smooth transition
function applyHoverEffect(object) {
  object.scale.set(1.05, 1.05, 1.05); // Slightly enlarge on hover
  if (object.material) {
    // Aqua Mermaid Glow on Hover
    object.material.emissive = new THREE.Color(0x00ffff); // Aqua glow
    object.material.emissiveIntensity = 0.8;
  }
}

// Reset hover effect
function resetHoverEffect(object) {
  object.scale.set(1, 1, 1); // Reset scale
  if (object.material) {
    object.material.emissive = new THREE.Color(0x000000); // Remove glow
    object.material.emissiveIntensity = 0;
  }
}

animate();
