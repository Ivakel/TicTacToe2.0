function miniMax(currGame, turn) {
  let moves = getAvailMoves(currGame);
  const player = "";

  if (turn) {
    player = "o";
  } else {
    player = "x";
  }

  const drawMoves = [];

  const gameCopy = JSON.parse(JSON.stringify(currGame));
  for (let i = 0; i < moves.length; i++) {
    let [a, b] = moves[i];
    gameCopy[a][b] = player;
    let winner = gameOver(gameCopy);

    //check if its a draw
    if (winner === -1) {
      if (isDraw(gameCopy)) {
        // return the bias for the draw
        // drawMoves.push([a, b]);
      }
    }
    if (winner === 0) {
      return;
    }
  }
}

function isDraw(currGame) {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (currGame[i][j] === ".") {
        return false;
      }
    }
  }
  return true;
}
//gets this cross: \
function getCross1(currGame) {
  let n = 0;
  let str = "";

  while (n < 3) {
    str += currGame[n][n];
    n += 1;
  }
  return str;
}

// gets this cross: /
function getCross2(currGame) {
  let n = 0;
  let str = "";

  while (n < 3) {
    str += currGame[2 - n][n];
    n += 1;
  }
  return str;
}

//gets available moves from the board
function getAvailMoves(currGame) {
  //   if (level === 2) {
  //     move = findWin();
  //     if (move[0] !== -1) {
  //       return [move];
  //     }
  //   }

  let moves = [];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (currGame[i][j] === ".") {
        moves.push([i, j]);
      }
    }
  }
  return moves;
}

//Joins a row to a string
function join(row) {
  let r = ""; // string to append each row element
  for (let i = 0; i < 3; i++) {
    r += row[i];
  }
  // console.log(r);
  return r;
}

// checks if anyone won the game
function gameOver(currGame) {
  //check for each row
  for (let i = 0; i < 3; i++) {
    let str = join(currGame[i]);

    if (wins.has(str)) {
      //check if someone won
      if (str === "xxx") {
        return 1;
      }

      return 0;
    }
  }
  //check for each column and crosses
  let cols = getCols(currGame);

  cols.push(getCross1(currGame));
  cols.push(getCross2(currGame));

  for (let i = 0; i < cols.length; i++) {
    let str = cols[i];
    if (wins.has(str)) {
      if (str === "xxx") {
        return 1;
      }
      return 0;
    }
  }
  return -1;
}
