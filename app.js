class IntervalTimer {
    constructor() {
        this.timeDisplay = document.querySelector('.time');
        this.phaseDisplay = document.querySelector('.phase');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.progressBar = document.querySelector('.progress');
        this.roundInfo = document.querySelector('.round-info');
        
        this.isRunning = false;
        this.currentRound = 0;
        this.timeLeft = 0;
        this.timerId = null;
        this.currentPhase = 'work';
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
    }

    getSettings() {
        return {
            workTime: parseInt(document.getElementById('workTime').value),
            restTime: parseInt(document.getElementById('restTime').value),
            rounds: parseInt(document.getElementById('rounds').value)
        };
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    updateDisplay() {
        this.timeDisplay.textContent = this.formatTime(this.timeLeft);
        this.roundInfo.textContent = `Round: ${this.currentRound}/${this.getSettings().rounds}`;
        
        const settings = this.getSettings();
        const totalTime = this.currentPhase === 'work' ? settings.workTime : settings.restTime;
        const progress = ((totalTime - this.timeLeft) / totalTime) * 100;
        this.progressBar.style.width = `${progress}%`;
    }

    start() {
        if (this.isRunning) return;
        
        if (!this.timerId) {
            const settings = this.getSettings();
            this.timeLeft = settings.workTime;
            this.currentRound = 1;
            this.currentPhase = 'work';
            this.phaseDisplay.textContent = 'Work!';
        }

        this.isRunning = true;
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        
        this.timerId = setInterval(() => this.tick(), 1000);
    }

    pause() {
        this.isRunning = false;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        clearInterval(this.timerId);
    }

    reset() {
        this.pause();
        this.timerId = null;
        this.timeLeft = 0;
        this.currentRound = 0;
        this.currentPhase = 'work';
        this.phaseDisplay.textContent = 'Get Ready!';
        this.progressBar.style.width = '0%';
        this.updateDisplay();
    }

    tick() {
        this.timeLeft--;
        this.updateDisplay();

        if (this.timeLeft <= 0) {
            this.handlePhaseComplete();
        }
    }

    handlePhaseComplete() {
        const settings = this.getSettings();
        
        if (this.currentPhase === 'work') {
            if (this.currentRound >= settings.rounds) {
                this.completeWorkout();
                return;
            }
            this.currentPhase = 'rest';
            this.timeLeft = settings.restTime;
            this.phaseDisplay.textContent = 'Rest!';
            this.playSound(400, 'rest');
        } else {
            this.currentPhase = 'work';
            this.currentRound++;
            this.timeLeft = settings.workTime;
            this.phaseDisplay.textContent = 'Work!';
            this.playSound(800, 'work');
        }
    }

    completeWorkout() {
        this.pause();
        this.timerId = null;
        this.phaseDisplay.textContent = 'Workout Complete!';
        this.playSound(1000, 'complete');
    }

    playSound(frequency, type) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        gainNode.gain.value = 0.1;

        const duration = type === 'complete' ? 1.5 : 0.15;
        
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + duration);
        
        setTimeout(() => {
            oscillator.stop();
            audioContext.close();
        }, duration * 1000);
    }
}

// Initialize the timer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const timer = new IntervalTimer();
});