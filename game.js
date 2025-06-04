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

        // Initial interaction mode
        this.currentMode = 'drag';

        // Grab instruction text element if it exists
        this.instructionEl = document.getElementById('instruction-text');
        this.updateInstruction(`Mode: ${this.currentMode}`);

        // Set up speech manager for voice commands
        this.speechManager = new SpeechManager(
            null,
            null,
            (cmd) => this.handleVoiceCommand(cmd)
        );
        // Begin listening (will request microphone permissions)
        if (this.speechManager) {
            this.speechManager.requestPermissionAndStart();
        }
    
        // Start animation loop
        this.animate();
    }

    handleVoiceCommand(command) {
        const validModes = ['drag', 'rotate', 'scale', 'animate'];
        if (validModes.includes(command)) {
            this.currentMode = command;
            this.updateInstruction(`Mode: ${this.currentMode}`);
        }
    }

    updateInstruction(text) {
        if (this.instructionEl) {
            this.instructionEl.textContent = text;
        }
    }

    animate = () => {
        requestAnimationFrame(this.animate);
        this.renderer.render(this.scene, this.camera);
    }
}
