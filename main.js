import { Game } from './game.js';
import { SpeechManager } from './SpeechManager.js';

// Get the render target div
const renderDiv = document.getElementById('renderDiv');

// Check if renderDiv exists
if (!renderDiv) {
    console.error('Fatal Error: renderDiv element not found.');
} else {
    // Initialize the game with the render target
    const game = new Game(renderDiv);

    const instructionEl = document.getElementById('instruction-text');

    let activeMode = '';
    let fadeTimeout = null;

    const showInstruction = (msg) => {
        if (!instructionEl) return;
        instructionEl.textContent = msg;
        instructionEl.style.opacity = '1';
        if (fadeTimeout) clearTimeout(fadeTimeout);
        fadeTimeout = setTimeout(() => {
            instructionEl.style.opacity = '0';
        }, 2000);
    };

    const speechManager = new SpeechManager(
        (finalTranscript, interimTranscript) => {
            const transcript = finalTranscript ?? interimTranscript ?? '';
            const modeInfo = activeMode ? `Mode: ${activeMode}` : '';
            const text = [transcript.trim(), modeInfo].filter(Boolean).join(' - ');
            if (text) showInstruction(text);
        },
        (active) => {
            if (active) {
                showInstruction('Listening...');
            }
        },
        (cmd) => {
            activeMode = cmd;
            showInstruction(`Mode: ${activeMode}`);
        }
    );

    speechManager.requestPermissionAndStart();
}
