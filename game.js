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

        // 3D model placeholder
        this.model = null;

        // Mode can be 'drag', 'rotate', or 'scale'
        this.mode = 'drag';

        // Hand tracking
        this.handLandmarker = null;
        this.video = document.createElement('video');
        this.video.style.display = 'none';
        this.renderDiv.appendChild(this.video);
        this.lastPinch = null;

        // Set up camera position
        this.camera.position.z = 5;

        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);

        // Load example model
        this.loadModel();

        // Initialize tasks and start animation loop
        this.init();
    }

    async init() {
        await this.startCamera();
        await this.initHandLandmarker();
        this.animate();
    }

    async initHandLandmarker() {
        const vision = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
        );
        this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath:
                    'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
                delegate: 'GPU'
            },
            runningMode: 'VIDEO',
            numHands: 1
        });
    }

    async startCamera() {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        this.video.srcObject = stream;
        await this.video.play();
    }

    loadModel() {
        const loader = new GLTFLoader();
        loader.load('assets/Stan.gltf', (gltf) => {
            this.model = gltf.scene;
            this.scene.add(this.model);
        }, undefined, (err) => {
            console.error('Error loading model', err);
        });
    }

    animate = () => {
        requestAnimationFrame(this.animate);

        if (this.handLandmarker && this.video.readyState >= 2) {
            const results = this.handLandmarker.detectForVideo(
                this.video,
                performance.now()
            );

            if (results.landmarks.length > 0) {
                const pinch = this.checkPinch(results.landmarks[0]);
                if (pinch) this.handlePinch(pinch);
                else this.lastPinch = null;
            } else {
                this.lastPinch = null;
            }
        }

        this.renderer.render(this.scene, this.camera);
    }

    checkPinch(landmarks) {
        const index = landmarks[8];
        const thumb = landmarks[4];
        const dist = Math.hypot(index.x - thumb.x, index.y - thumb.y);
        if (dist < 0.05) {
            return { x: index.x, y: index.y };
        }
        return null;
    }

    handlePinch(pos) {
        if (this.lastPinch && this.model) {
            const dx = pos.x - this.lastPinch.x;
            const dy = pos.y - this.lastPinch.y;
            if (this.mode === 'drag') {
                const factor = 5;
                this.model.position.x += dx * factor;
                this.model.position.y += -dy * factor;
            } else if (this.mode === 'rotate') {
                const factor = Math.PI;
                this.model.rotation.y += dx * factor;
                this.model.rotation.x += dy * factor;
            } else if (this.mode === 'scale') {
                const scaleAmount = 1 + dy;
                this.model.scale.multiplyScalar(scaleAmount);
            }
        }
        this.lastPinch = pos;
    }
}

