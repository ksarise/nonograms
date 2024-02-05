import { generateElement } from "./generateElement.js";
import data from "../base.json" assert { type: "json" };
import {openModal, modalText, modalTime, modalButton, isOpen, closeModal} from './modal.js';
const body = document.body;
const wrap = generateElement("div", "page-wrap", body, "wrap");
const header = generateElement("header", "header", wrap, "header");
const restartButton = generateElement("button", "restart", header, "restart");
const themeContainer = generateElement("div", "theme-container", header, "theme");
const themeInput = generateElement("input", "theme-input", themeContainer, "",'theme-mode', "checkbox");
const themeLabel = generateElement("label", "theme-label", themeContainer, "", false, false, 'theme-mode');
const main = generateElement("main", "main", wrap, "main");
const mainContainer = generateElement("section","main-container", main);
const picturesPanel = generateElement("div", "pictures-panel", mainContainer);
const stopWatchContainer = generateElement("div", "stop-watch-container", mainContainer);
const stopWatch = generateElement("div", "stop-watch", stopWatchContainer, "00:00");
const matrixContainer = generateElement("section","matrix-container", main);
const matrix = generateElement("div", "matrix", matrixContainer);
const horHintsPanel = generateElement("div", "horHintsPanel", matrixContainer);
const vertHintsPanel = generateElement("div", "vertHintsPanel", matrixContainer);

//switch theme mode
themeContainer.addEventListener("click", () => {
  if (themeInput.checked) {
    wrap.classList.add("dark-theme");
  } else {
    wrap.classList.remove("dark-theme");
  }
})

//example matrix
const picture2 = [[1,0,0,1,1], [1,0,1,0,1], [0,1,1,0,0], [0,1,1,1,1], [0,1,1,0,1]];
let u = 0;
// console.log('import', data[u].id);

function dataToPicture(y) {
  console.log('u', y, data[y].matrix);
  // const id2 =  data[y].id;
  const picture =  data[y].matrix;
  console.log('picture',picture, 'id');
  return picture;
}
//create panel for game choose
function createPicturePanel () {
  for (let i = 0; i < data.length; i += 1) {
    const pictureBlock = generateElement("div", "picture-block", picturesPanel,data[i].name);
    const pictureImg = generateElement("img", "picture-img", pictureBlock );
    pictureImg.src = data[i].img;
    pictureImg.addEventListener('click', () => startGame(i));
  }
}

createPicturePanel();

//create stop-watch timer 
let seconds = 0;
function swTimer () {
  seconds += 1;
  const minutes = Math.floor(seconds / 60);
  stopWatch.textContent = `${minutes.toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
  console.log('seconds', seconds);
}

let swInterval;
let isSWTimerStarted = false;
function startSWTimer () {
  if (!isSWTimerStarted) {
    isSWTimerStarted = true;
    swInterval= setInterval(swTimer, 1000);
  }
}


//create cells
function createCells(y){
  let picture = dataToPicture(y);
  // console.log('prepic cells',y, picture[0][0])
  let count = 0;
  const len = picture.reduce((count, row) => count + row.length, 0);
  let checkArray = Array.from({ length: len }, (item) => 0);
  for (let i = 0; i < picture.length; i += 1) {
    const row = generateElement("div", "row", matrix);
    for (let j = 0; j < picture[i].length; j += 1) {
      const cell = generateElement("div", "gram", row, picture[i][j].toString(), count);
      count += 1;
      cell.addEventListener('click', () => {
        checkCell(cell, checkArray, picture, Number(cell.id));
        startSWTimer();
        console.log(isSWTimerStarted, 'seconds',seconds);
      })
    }
  }
}


//check identity to picture
function checkCell (cell, arr1, arr2, id) {
  if (!cell.classList.contains('black')) {
    arr1[id] = 1;
    cell.classList.add('black');
    checkWin(arr2, arr1);
  } else {
    arr1[id] = 0;
    cell.classList.remove('black');
  }
  console.log('check', arr1);
}


//check condition for win
function checkWin(arr1, arr2) {
  let equal = (arr1.flat().every((value, index) => value == arr2[index]));
  if (equal) {
    clearInterval(swInterval);
    openModal();
    modalText.textContent = "WIN";
    modalTime.textContent = `Great! You have solved the nonogram in ${seconds} seconds!`;
  } else {
    console.log('more');

  }
  console.log('matrix', equal, arr1.flat());
}


function createClues (y) {
  let picture = dataToPicture(y);
  console.log('prepic clues', y, picture[0][0])
  //compute values for vertical clues
  const vertHints = [];
  for (let i = 0; i < picture.length; i += 1) {
    const temp = []
    let accI = 0;
    for (let j = 0; j < picture[i].length; j += 1) {
        if (picture[i][j] === 1) {
            accI += 1;
        } else if ( accI >0) {
            temp.push(accI);
            accI = 0;
        }     
    }
    if (accI > 0 ) {
      temp.push(accI);
    }
    vertHints.push(temp);
  }

  //compute values for horizontal clues
  const horHints = [];
  for (let j = 0; j < picture.length; j += 1) {
    const temp = []
    let accJ = 0;
    for (let i = 0; i < picture[j].length; i += 1) {
        if (picture[i][j] === 1) {
            accJ += 1;
        } else if ( accJ >0) {
            temp.push(accJ);
            accJ = 0;
        }     
    }
    if (accJ > 0 ) {
      temp.push(accJ);
    }
    horHints.push(temp);
  }

  //create horizontal clues
  

  for (let i = 0; i < picture.length; i += 1){
    const hHintRow = generateElement("div", "hHintRow", horHintsPanel);
    horHints[i].forEach((element) => {
      const hHint = generateElement("div", "hHint", hHintRow, element.toString());
    })
  }

  //create vertical clues
  
  for (let i = 0; i < picture.length; i += 1){
    const vHintRow = generateElement("div", "vHintRow", vertHintsPanel);
    vertHints[i].forEach((element) => {
      const vHint = generateElement("div", "vHint", vHintRow, element.toString());
    })
  }
}


//game state controls

function startGame(u) {
  clearInterval(swInterval);
  stopWatch.textContent = "00:00";
  closeModal();
  cleanCells();
  cleanMatrix();
  console.log('start',u);
  dataToPicture(u);
  createCells(u);
  createClues(u);
}

startGame(u);

//restart button
restartButton.addEventListener('click', () => {
  clearInterval(swInterval);
  if (u <= 2){
  startGame(u);
  u += 1;
  } else {
    u = 0;
    startGame(u);
  }
  console.log("restart",u);
});
modalButton.addEventListener('click', () => startGame(u));
//clean matrix
function cleanMatrix () {
  matrix.replaceChildren();
  vertHintsPanel.replaceChildren();
  horHintsPanel.replaceChildren();
}
//clean filled cells
function cleanCells () {
  const cells = document.querySelectorAll(".black");
  cells.forEach((cell) => {
    cell.classList.remove("black");
  });
}
