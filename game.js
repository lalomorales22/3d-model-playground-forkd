import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { AudioManager } from './audioManager.js';
import { SpeechManager } from './SpeechManager.js';

export class Game {
    constructor(renderDiv) {
        this.renderDiv = renderDiv;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderDiv.appendChild(this.renderer.domElement);
        
        // Set up camera position
        this.camera.position.z = 5;
        
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);

        // Text element for displaying load errors if available
        this.instructionText = document.getElementById('instruction-text');

        // Load the default GLTF model
        const loader = new GLTFLoader();
        loader.load(
            'assets/Stan.gltf',
            (gltf) => {
                this.scene.add(gltf.scene);
            },
            undefined,
            (error) => {
                const message = 'Failed to load assets/Stan.gltf';
                if (this.instructionText) {
                    this.instructionText.textContent = message;
                }
                console.error(message, error);
            }
        );
        
        // Start animation loop
        this.animate();
    }

    animate = () => {
        requestAnimationFrame(this.animate);
        this.renderer.render(this.scene, this.camera);
    }
}
