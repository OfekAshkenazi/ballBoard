'use strict'
const WALL = 'WALL'
const FLOOR = 'FLOOR'
const BALL = 'BALL'
const GAMER = 'GAMER'
var glue = 'glue'
const GAMER_IMG = '<img src="img/gamer-purple.png">'
const BALL_IMG = '<img src="img/ball.png">'
const glue_IMG = '<img src="img/glue.png">'
var ballGintrvalSpawnRate
var glueGintrevalSpawnRate
var eatingAudio = new Audio('pacman_eatfruit.mp3')
var gIsGlue
// Model:
var gGlueCount = 0
var gBoard
var gBallCount = 0
const ballsToWin = 10
var gBallsCollect = 0
var gGamerPos

function onInitGame() {
    gIsGlue = false
    gGlueCount = 0
    gBallCount = 0
    gBallsCollect = 0
    gGamerPos = { i: 2, j: 9 }
    gBoard = buildBoard()
    renderBoard(gBoard)
    ballGintrvalSpawnRate = setInterval(spawnNewBalls, 4000)
    glueGintrevalSpawnRate = setInterval(spawnNewGlues, 5000)
    updateBallCounter()
    var elRestBtn = document.querySelector('.restBtn')
    elRestBtn.style.display = 'none'

}
function buildBoard() {
    const board = []
    // DONE: Create the Matrix 10 * 12 
    // DONE: Put FLOOR everywhere and WALL at edges
    const rowCount = 12
    const colCount = 12
    for (var i = 0; i < rowCount; i++) {
        board[i] = []
        for (var j = 0; j < colCount; j++) {
            board[i][j] = { type: FLOOR, gameElement: null }
            if (i === 0 || i === rowCount - 1 || j === 0 || j === colCount - 1) {
                board[i][j].type = WALL
            }
        }
    }
    // DONE: Place the gamer and two balls
    board[gGamerPos.i][gGamerPos.j].gameElement = GAMER
    board[5][5].gameElement = BALL
    board[7][2].gameElement = BALL
    board[5][0].type = FLOOR
    board[11][5].type = FLOOR
    board[0][5].type = FLOOR
    board[5][11].type = FLOOR

    // console.log(board)
    return board
}
// Render the board to an HTML table
function renderBoard(board) {

    const elBoard = document.querySelector('.board')
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]

            var cellClass = getClassName({ i: i, j: j })
            /// short if :)
            cellClass += (currCell.type === WALL) ? ' wall' : ' floor'
            //// of this 
            // if (currCell.gameElement === glue) cellClass += ' glue'  //// try to render the board also but not working as i thougt
            // else if (currCell.type === FLOOR) cellClass += ' floor'
            // else if (currCell.type === WALL) cellClass += ' wall'

            strHTML += `\t<td class="cell ${cellClass}"  onclick="moveTo(${i},${j})" >\n`

            if (currCell.gameElement === GAMER) {
                strHTML += GAMER_IMG
            } else if (currCell.gameElement === BALL) {
                strHTML += BALL_IMG
            }

            strHTML += '\t</td>\n'
        }
        strHTML += '</tr>\n'
    }

    elBoard.innerHTML = strHTML
}
// Move the player to a specific location from mouse
function moveTo(i, j) {
    if (gIsGlue) return
    // console.log(countNegsBalls)
    console.log(i, j)
    if (i === 5 && j === 12) tpPlayer({ i: 5, j: 0 })
    if (i === 5 && j === -1) tpPlayer({ i: 5, j: 11 })
    if (i === -1 && j === 5) tpPlayer({ i: 11, j: 5 })
    if (i === 12 && j === 5) tpPlayer({ i: 0, j: 5 })
    var targetCell = gBoard[i][j]
    if (targetCell.type === WALL) return

    // Calculate distance to make sure we are moving to a neighbor cell
    const iAbsDiff = Math.abs(i - gGamerPos.i)
    const jAbsDiff = Math.abs(j - gGamerPos.j)
    // console.log(iAbsDiff)
    // if (i === 5 && j === 11) {
    //     targetCell = gBoard[5][0]

    // }
    // If the clicked Cell is one of the four allowed
    if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {

        if (targetCell.gameElement === BALL) {
            console.log('Collecting!')
            eatingAudio.play()
            gBallsCollect++
            updateBallCounter()

        }
        if (targetCell.gameElement === glue) {
            whenUserGlue()
            // renderCell(gGamerPos, GAMER)
        }


        // DONE: Move the gamer
        // REMOVING FROM
        // update Model
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
        // update DOM
        renderCell(gGamerPos, '')

        // ADD TO
        // update Model
        targetCell.gameElement = GAMER
        gGamerPos = { i, j }
        // update DOM
        renderCell(gGamerPos, GAMER_IMG)


    }
    displayCountBalls()

    checkWin()

}
// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
    const cellSelector = '.' + getClassName(location)
    // cell-i-j 
    const elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value

}
// Move the player by keyboard arrows
function onHandleKey(event) {
    const i = gGamerPos.i
    const j = gGamerPos.j
    console.log('event.key:', event.key)

    switch (event.key) {
        case 'ArrowLeft':
            moveTo(i, j - 1)
            break
        case 'ArrowRight':
            moveTo(i, j + 1)
            break
        case 'ArrowUp':
            moveTo(i - 1, j)
            break
        case 'ArrowDown':
            moveTo(i + 1, j)
            break
    }
}
// Returns the class name for a specific cell
function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j
    return cellClass
}
/// function for update html div eatingBalls counter
function updateBallCounter() {
    var elBallCounter = document.querySelector('.h3')
    elBallCounter.innerText = `how much ball you eat ${gBallsCollect}`
}
//// bring a single empty pos
function getEmptyCellLocation() {
    var listOfEmptyCells = []
    for (var i = 0; i < gBoard.length; i++) {

        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j]
            if (currCell.type === WALL || currCell.gameElement) continue
            listOfEmptyCells.push({ i, j })


        }
    }
    var randomCell = getRandomInt(0, listOfEmptyCells.length)
    return listOfEmptyCells.splice(randomCell, 1)[0]

}
//// function that from boolean stock the player for 3 sec and using settimeout
function whenUserGlue() {
    gIsGlue = true
    setTimeout(() => {
        gIsGlue = false
    }, 3000)


}
//// function for remove the glue get pos from who start it (spawnnewglues )
//  the function have safe if on the boolean so if he true dont strat
function removeGlues(location) {
    if (gIsGlue) return
    gBoard[location.i][location.j].gameElement = null
    renderCell(location, '')
}
/// finding empty space and Rnd new glues every few seconds
function spawnNewGlues() {
    var cellLocation = getEmptyCellLocation()
    gBoard[cellLocation.i][cellLocation.j].gameElement = glue
    renderCell(cellLocation, glue_IMG)
    gGlueCount++
    displayCountBalls()
    if (gGlueCount === 30) clearInterval(glueGintrevalSpawnRate)
    setTimeout(removeGlues, 5000, cellLocation)
}

function spawnNewBalls() {
    var cellLocation = getEmptyCellLocation()
    gBoard[cellLocation.i][cellLocation.j].gameElement = BALL
    // console.log(gBoard)
    renderCell(cellLocation, BALL_IMG)
    gBallCount++
    displayCountBalls()
    if (gBallCount === 30) clearInterval(ballGintrvalSpawnRate)
}
/// this function calling to search negs around and display them . 
function displayCountBalls() {
    var elNegsCount = document.querySelector('.countNegs')
    var countNegsBalls = countBalls(gGamerPos.i, gGamerPos.j, gBoard)
    elNegsCount.innerText = `the balls around you : ${countNegsBalls} `
}
/// 
function checkWin() {
    var elRestBtn = document.querySelector('.restBtn')
    if (gBallsCollect === ballsToWin) {
        clearInterval(glueGintrevalSpawnRate)
        clearInterval(ballGintrvalSpawnRate)
        elRestBtn.style.display = 'block'
        alert('wow you got 10 balls nice job')
    }
}

function restartBtn() {
    onInitGame()
}

function tpPlayer(location) {
    gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
    renderCell(gGamerPos, '')

    gBoard[location.i][location.j].gameElement = GAMER
    gGamerPos = { i: location.i, j: location.j }
    renderCell(gGamerPos, GAMER_IMG)
}

function countBalls(cellI, cellJ, mat) {
    var negsCount = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= mat[i].length) continue
            if (mat[i][j].gameElement === BALL) negsCount++
            if (mat[i][j].gameElement === glue) negsCount++
        }
    }
    return negsCount
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}