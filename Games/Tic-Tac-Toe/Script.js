let boxes = document.querySelectorAll(".box");
let reset = document.querySelector(".reset");
let newGame = document.querySelector("#new-game");
let msgContainer = document.querySelector(".winning") ;
let msg = document.querySelector("#msg");

let turnO = true;

const resetGame = () => {
    turnO = true;
    enableBtn();
    msgContainer.classList.add("hide");
}

const winPatterns = [
    [0,1,2],
    [0,3,6],
    [0,4,8],
    [1,4,7],
    [2,5,8],
    [2,4,6],
    [3,4,5],
    [6,7,8],
]

boxes.forEach((box) =>{
    box.addEventListener("click", () => {
     if(turnO) {
        box.innerHTML = "O";
        box.style=("background-color: #C4D9FF; color: #E8F9FF;");

        turnO = false;
     }
     else{
        box.innerHTML = "X";
        box.style=("background-color: #E8F9FF; color: #C4D9FF;");
        turnO = true;
     }
     box.disabled = true;
     checkWinner();

    });
});

const checkWinner = () =>{
    for(let patten of winPatterns){
        let val1 = boxes[patten[0]].innerText;
        let val2 = boxes[patten[1]].innerText;
        let val3 = boxes[patten[2]].innerText;

        if(val1!="" && val2!="" && val3!=""){
            if(val1===val2 && val2===val3){
               showWinner(val1);
            }
        }
    }
}

const disabeBtn = () =>{
    for(let box of boxes){
        box.disabled = true;
    }
}

const enableBtn = () =>{
    for(let box of boxes){
        box.disabled = false;
        box.innerText = "";
        box.style=("background-color: #FBFBFB");
    }
}

const showWinner = (winner) =>{
     disabeBtn();
     msg.innerText = `Congrulation, Winner is ${winner}`;
     msgContainer.classList.remove("hide");
}

newGame.addEventListener("click", resetGame);
reset.addEventListener("click", resetGame);