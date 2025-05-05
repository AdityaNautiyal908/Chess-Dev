class SoundManager {
    constructor() {
        this.sounds = {
            move: new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'),
            capture: new Audio('https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3'),
            check: new Audio('https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3'),
            gameStart: new Audio('https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3'),
            buttonClick: new Audio('https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3'),
            gameOver: new Audio('https://assets.mixkit.co/active_storage/sfx/2575/2575-preview.mp3')
        };

        // Set volume for all sounds
        Object.values(this.sounds).forEach(sound => {
            sound.volume = 0.3;
        });
    }

    play(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].currentTime = 0;
            this.sounds[soundName].play();
        }
    }
} 