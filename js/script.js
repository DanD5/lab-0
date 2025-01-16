// This code was written with the help of ChatGPT

import { MESSAGES } from '../lang/messages/en/user.js';

// Button Class: Represents a button with an ID, color, size, and position
class Button {
    constructor(id, color, width, height) {
        this.id = id; // Unique ID for the button
        this.color = color; // Background color of the button
        this.position = { x: 0, y: 0 }; // Position of the button (default to top-left corner)
        this.width = width; // Width of the button in em
        this.height = height; // Height of the button in em
    }

    // Creates a button DOM element with the specified properties
    createButton() {
        const button = document.createElement("button");
        button.style.backgroundColor = this.color; // Set the button color
        button.style.position = "absolute"; // Position it absolutely within the container
        button.style.height = `${this.height}em`; // Set button height
        button.style.width = `${this.width}em`; // Set button width
        button.innerHTML = this.id; // Display the button ID
        button.setAttribute('data-id', this.id); // Store the ID for reference during the game
        return button;
    }
}

// Game Class: Manages the overall game flow and interactions
class Game {
    constructor(buttonCount) {
        this.buttonCount = buttonCount; // Number of buttons to create
        this.buttons = []; // Array to store button instances
        this.correctOrder = []; // Array to store the correct order of button IDs
        this.clickedButtons = []; // Array to store clicked button IDs
        this.gameOver = false; // Flag to track the game's state
        this.buttonWidth = 10; // Default button width in em
        this.buttonHeight = 5; // Default button height in em
    }

    // Generates buttons and positions them in the container
    generateButtons() {
        const buttonContainer = document.getElementById("buttonContainer");
        buttonContainer.innerHTML = ""; // Clear any existing buttons
        this.buttons = []; // Clear previous button instances
        this.correctOrder = []; // Reset the correct order

        // Calculate the total width required for all buttons with spacing
        const availableWidth = window.innerWidth; // Screen width
        const buttonSpacing = 20; // Space between buttons in pixels
        const buttonWidthInPixels = this.buttonWidth * 16; // Convert button width from em to pixels
        const totalRowWidth = this.buttonCount * (buttonWidthInPixels + buttonSpacing);

        // Adjust button size if they don't fit within the available width
        if (totalRowWidth > availableWidth) {
            const maxButtonsPerRow = Math.floor(availableWidth / (buttonWidthInPixels + buttonSpacing));
            this.buttonWidth = Math.floor((availableWidth - (maxButtonsPerRow - 1) * buttonSpacing) / maxButtonsPerRow / 16);
        }

        // Position the buttons evenly across the screen
        const rowWidth = this.buttonCount * (this.buttonWidth * 16 + buttonSpacing);
        const startX = (window.innerWidth - rowWidth) / 2; // Center the row horizontally

        for (let i = 0; i < this.buttonCount; i++) {
            const color = HelperFunctions.getColor();
            const button = new Button(i + 1, color, this.buttonWidth, this.buttonHeight);
            this.buttons.push(button); // Add button to the array
            this.correctOrder.push(button.id); // Add button ID to the correct order array
            const buttonElem = button.createButton();
            button.position.x = startX + i * (this.buttonWidth * 16 + buttonSpacing); // Set horizontal position
            button.position.y = window.innerHeight / 2 - 30; // Set vertical position (centered)
            buttonElem.style.left = `${button.position.x}px`;
            buttonElem.style.top = `${button.position.y}px`;
            buttonContainer.appendChild(buttonElem); // Add button to the DOM
        }
    }

    // Starts the game by generating buttons and initiating scrambling
    startGame() {
        this.generateButtons(); // Create and display buttons
        this.clickedButtons = []; // Reset clicked buttons for a new game
        this.gameOver = false; // Reset game state

        // Delay before scrambling the buttons
        setTimeout(() => {
            this.scrambleButtons();
        }, this.buttonCount * 1000 - 2000); // Timing based on button count
    }

    // Randomly rearranges the buttons on the screen
    scrambleButtons() {
        let scrambleCount = 0; // Number of scrambles performed
        const scrambleInterval = setInterval(() => {
            if (scrambleCount < this.buttonCount) {
                this.buttons.forEach((button) => {
                    button.position = HelperFunctions.getRandomPosition(); // Get a new random position
                    const buttonElem = document.querySelector(`button[data-id='${button.id}']`);
                    buttonElem.style.left = `${button.position.x}px`;
                    buttonElem.style.top = `${button.position.y}px`;
                });
                scrambleCount++;
            } else {
                clearInterval(scrambleInterval); // Stop scrambling
                this.enableButtons(); // Allow player interaction
            }
        }, 2000); // Scramble every 2 seconds
    }

    // Makes buttons clickable and hides their numbers
    enableButtons() {
        this.buttons.forEach((button) => {
            const buttonElem = document.querySelector(`button[data-id='${button.id}']`);
            buttonElem.innerHTML = ""; // Hide button number
            buttonElem.addEventListener('click', this.handleButtonClick.bind(this)); // Add click handler
        });
    }

    // Handles a button click
    handleButtonClick(event) {
        if (this.gameOver) return; // Ignore clicks if the game is over

        const clickedButtonId = parseInt(event.target.getAttribute('data-id'));
        this.clickedButtons.push(clickedButtonId); // Track the clicked button

        // Check if the click matches the correct order
        if (clickedButtonId === this.correctOrder[this.clickedButtons.length - 1]) {
            event.target.innerHTML = clickedButtonId; // Reveal the button ID
            if (this.clickedButtons.length === this.buttonCount) {
                this.showMessage(MESSAGES.excellentMemory); // Victory message
                this.gameOver = true;
            }
        } else {
            this.showMessage(MESSAGES.wrongOrder); // Failure message
            this.revealCorrectOrder(); // Show the correct order
            this.gameOver = true;
        }
    }

    // Reveals the correct order of button IDs
    revealCorrectOrder() {
        this.buttons.forEach((button) => {
            const buttonElem = document.querySelector(`button[data-id='${button.id}']`);
            buttonElem.innerHTML = button.id; // Display button ID
        });
    }

    // Displays a message to the player
    showMessage(message) {
        const messageElem = document.getElementById("messageLabel");
        messageElem.innerText = message;
    }
}

// Helper Functions Class: Contains utility methods for randomization
class HelperFunctions {
    static colorPool = ["#FF5733", "#33FF57", "#3357FF", "#FF33A6", "#A633FF", "#33FFF2", "#FFD633"]; // Predefined colors
    static currentIndex = 0; // Tracks the current color index

    static getColor() {
        const color = this.colorPool[this.currentIndex]; // Get the current color
        this.currentIndex = (this.currentIndex + 1) % this.colorPool.length; // Move to the next color, wrap around if needed
        return color;
    }

    // Generates a random position within the screen bounds
    static getRandomPosition() {
        const x = Math.floor(Math.random() * (window.innerWidth - 100)); // Prevent overflow
        const y = Math.floor(Math.random() * (window.innerHeight - 100)); // Prevent overflow
        return { x, y };
    }
}

// Event listener to start the game when the "Go" button is clicked
document.getElementById("startButton").addEventListener('click', () => {
    const buttonCount = parseInt(document.getElementById("buttonCount").value);
    if (buttonCount >= 3 && buttonCount <= 7) {
        const game = new Game(buttonCount);
        game.startGame(); // Start the game
        document.getElementById("messageLabel").innerText = MESSAGES.validation;
    } else {
        alert(MESSAGES.validation); // Validate input
    }
});