let userScore = 0;
let computerScore = 0;

const userboard = document.querySelector("#user");
const compboard = document.querySelector("#computer");

const rockL = document.querySelector("#rockHandL");
const rockR = document.querySelector("#rockHandR");

const scissorL = document.querySelector("#scissorHandL");
const scissorR = document.querySelector("#scissorHandR");

const paperL = document.querySelector("#paperHandL");
const paperR = document.querySelector("#paperHandR");

const choices = document.querySelectorAll(".choice");
const msg = document.querySelector("#msg");

// Map choices to their respective elements for better management
const handElements = {
  rock: { left: rockL, right: rockR },
  paper: { left: paperL, right: paperR },
  scissor: { left: scissorL, right: scissorR },
};

// Event listener for user choices
choices.forEach((choice) => {
  choice.addEventListener("click", () => {
    const userChoice = choice.getAttribute("id");

    // Hide all hands initially
    resetHands();

    // Add shaking animation
    rockL.classList.add("shake");
    rockR.classList.add("shake");

    handAction();

    // Play game after a delay
    setTimeout(() => playGame(userChoice), 2000);
  });
});

// Function to reset hands (hide all hand elements)
const resetHands = () => {
  Object.values(handElements).forEach(({ left, right }) => {
    left.style.display = "none";
    right.style.display = "none";
  });
};

// Function to show hands based on choice
const showHands = (choice, side) => {
  const hand = handElements[choice][side];
  hand.style.display = "block";
};

// Handle initial animation
const handAction = () => {
  rockL.style.display = "block";
  rockR.style.display = "block";

  setTimeout(() => {
    rockL.classList.remove("shake");
    rockR.classList.remove("shake");
  }, 2000);
};

// Generate computer choice
const genCompChoice = () => {
  const options = ["rock", "paper", "scissor"];
  return options[Math.floor(Math.random() * options.length)];
};

// Handle draw scenario
const drawGame = (userChoice, computChoice) => {
  handRemove(); 
  msg.innerHTML = `Game Draw`;
  msg.style = ("background-color: #023047");
  showHands(userChoice, "left");
  showHands(computChoice, "right");
};

// Handle winner display
const showWinner = (userWin, userChoice, computChoice) => {
  if (userWin) {
    msg.innerHTML = `YOU WIN!`;
    msg.style = ("background-color: green");
    userScore++;
  } else {
    msg.innerHTML = `YOU LOSE!`;
    msg.style = ("background-color: red");
    computerScore++;
  }

  handRemove();

  showHands(userChoice, "left");
  showHands(computChoice, "right");

  userboard.innerHTML = userScore;
  compboard.innerHTML = computerScore;
};

const handRemove = () =>{
  rockL.style = ("display:none");
  rockR.style = ("display:none");
}

// Main game logic
const playGame = (userChoice) => {
  const computChoice = genCompChoice();

  if (userChoice === computChoice) {
    drawGame(userChoice, computChoice);
  } else {
    const winConditions = {
      rock: "scissor",
      paper: "rock",
      scissor: "paper",
    };

    const userWin = winConditions[userChoice] === computChoice;
    showWinner(userWin, userChoice, computChoice);
  }
};
