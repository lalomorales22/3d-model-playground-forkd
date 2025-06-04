import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { AudioManager } from './audioManager.js';
import { SpeechManager } from './SpeechManager.js';

export class Game {
    constructor(renderDiv) {
        this.renderDiv = renderDiv;
        this.loader = new GLTFLoader();
        this.currentModel = null;
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

        this._initDragAndDrop();

        // Start animation loop
        this.animate();
    }

    _initDragAndDrop() {
        this.renderDiv.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        this.renderDiv.addEventListener('drop', (e) => {
            e.preventDefault();
            const file = e.dataTransfer.files && e.dataTransfer.files[0];
            if (!file) return;

            const ext = file.name.split('.').pop().toLowerCase();
            if (ext !== 'gltf' && ext !== 'glb') {
                console.warn('Unsupported file type:', file.name);
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const contents = event.target.result;
                this.loader.parse(contents, '', (gltf) => {
                    if (this.currentModel) {
                        this.scene.remove(this.currentModel);
                    }
                    this.currentModel = gltf.scene;
                    this.scene.add(this.currentModel);
                }, (err) => {
                    console.error('Error loading model:', err);
                });
            };

            if (ext === 'glb') {
                reader.readAsArrayBuffer(file);
            } else {
                reader.readAsText(file);
            }
        });
    }

    animate = () => {
        requestAnimationFrame(this.animate);
        this.renderer.render(this.scene, this.camera);
    }
}