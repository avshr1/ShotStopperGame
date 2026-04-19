

const canvas = document.getElementById("gameCanvas")
const ctx = canvas.getContext("2d")

// Game state object — tracks everything happening in the game
let gameState = {
    saves: 0,
    goals: 0,
    currentShot: 1,
    totalShots: 10,
    phase: "waiting",   // waiting | flying | result
    mouseX: canvas.width / 2
}

// Ball object — position, speed, and curve
let ball = {
    x: canvas.width / 2,
    y: canvas.height - 80,
    radius: 14,
    targetX: canvas.width / 2,
    speedY: 0,
    curveX: 0,
    active: false
}

// Goalkeeper object
let keeper = {
    x: canvas.width / 2,
    y: 140,
    width: 52,
    height: 20,
    color: "#f9ca24"
}

// Goal dimensions
const goal = {
    x: canvas.width / 2 - 160,
    y: 80,
    width: 320,
    height: 90,
    postWidth: 8
}

// Wind
let wind = {
    speed: 0,
    direction: "none"
}


function drawField() {
    // Sky gradient
    let sky = ctx.createLinearGradient(0, 0, 0, canvas.height)
    sky.addColorStop(0, "#87CEEB")
    sky.addColorStop(1, "#b8e4f0")
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Grass
    ctx.fillStyle = "#3a9e4a"
    ctx.fillRect(0, canvas.height * 0.35, canvas.width, canvas.height)

    // Grass stripes
    for (let i = 0; i < 7; i++) {
        if (i % 2 === 0) {
            ctx.fillStyle = "rgba(0,0,0,0.04)"
            ctx.fillRect(i * 100, canvas.height * 0.35, 100, canvas.height)
        }
    }

    // Penalty spot
    ctx.fillStyle = "rgba(255,255,255,0.5)"
    ctx.beginPath()
    ctx.arc(canvas.width / 2, canvas.height - 80, 4, 0, Math.PI * 2)
    ctx.fill()

    // Penalty arc
    ctx.strokeStyle = "rgba(255,255,255,0.3)"
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(canvas.width / 2, canvas.height - 80, 80, Math.PI, Math.PI * 2)
    ctx.stroke()
}

function drawGoal() {
    // Net background
    ctx.fillStyle = "rgba(255,255,255,0.08)"
    ctx.fillRect(goal.x + goal.postWidth, goal.y, goal.width - goal.postWidth * 2, goal.height)

    // Net lines vertical
    ctx.strokeStyle = "rgba(255,255,255,0.15)"
    ctx.lineWidth = 0.8
    for (let x = goal.x + goal.postWidth; x < goal.x + goal.width - goal.postWidth; x += 20) {
        ctx.beginPath()
        ctx.moveTo(x, goal.y)
        ctx.lineTo(x, goal.y + goal.height)
        ctx.stroke()
    }

    // Net lines horizontal
    for (let y = goal.y; y < goal.y + goal.height; y += 20) {
        ctx.beginPath()
        ctx.moveTo(goal.x + goal.postWidth, y)
        ctx.lineTo(goal.x + goal.width - goal.postWidth, y)
        ctx.stroke()
    }

    // Posts
    ctx.fillStyle = "#ffffff"
    ctx.shadowColor = "rgba(0,0,0,0.3)"
    ctx.shadowBlur = 6

    // Left post
    ctx.fillRect(goal.x, goal.y, goal.postWidth, goal.height + goal.postWidth)
    // Right post
    ctx.fillRect(goal.x + goal.width - goal.postWidth, goal.y, goal.postWidth, goal.height + goal.postWidth)
    // Crossbar
    ctx.fillRect(goal.x, goal.y, goal.width, goal.postWidth)

    ctx.shadowBlur = 0
}

function drawKeeper() {
    let kx = keeper.x - keeper.width / 2
    let ky = keeper.y

    // Body
    ctx.fillStyle = keeper.color
    ctx.beginPath()
    ctx.roundRect(kx, ky, keeper.width, keeper.height, 6)
    ctx.fill()

    // Gloves
    ctx.fillStyle = "#e67e22"
    ctx.beginPath()
    ctx.arc(kx + 4, ky + keeper.height / 2, 7, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(kx + keeper.width - 4, ky + keeper.height / 2, 7, 0, Math.PI * 2)
    ctx.fill()

    // Jersey number
    ctx.fillStyle = "rgba(0,0,0,0.3)"
    ctx.font = "bold 11px Inter"
    ctx.textAlign = "center"
    ctx.fillText("1", keeper.x, ky + 14)
}

function drawBall() {
    if (!ball.active) return

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.2)"
    ctx.beginPath()
    ctx.ellipse(ball.x, ball.y + ball.radius, ball.radius * 0.8, ball.radius * 0.3, 0, 0, Math.PI * 2)
    ctx.fill()

    // Ball
    ctx.fillStyle = "#ffffff"
    ctx.strokeStyle = "#222"
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    // Pentagon patches
    ctx.fillStyle = "#222"
    ctx.beginPath()
    ctx.arc(ball.x, ball.y, ball.radius * 0.28, 0, Math.PI * 2)
    ctx.fill()
}

function drawArrow(direction) {
    // Custom cursor arrow showing goalkeeper direction
    ctx.fillStyle = "rgba(255,255,255,0.6)"
    ctx.font = "20px Arial"
    ctx.textAlign = "center"
    if (direction === "left") ctx.fillText("◀", keeper.x - keeper.width / 2 - 14, keeper.y + 14)
    if (direction === "right") ctx.fillText("▶", keeper.x + keeper.width / 2 + 14, keeper.y + 14)
}

// Main draw loop — called 60 times per second
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawField()
    drawGoal()
    drawKeeper()
    drawBall()
}




// Generate random wind for each shot
function generateWind() {
    let directions = ["left", "right", "none"]
    let speeds = ["Light", "Moderate", "Strong"]
    let speedValues = [2, 4, 7]
    let randomDir = directions[Math.floor(Math.random() * directions.length)]
    let randomSpeedIndex = Math.floor(Math.random() * speeds.length)

    wind.direction = randomDir
    wind.speed = speedValues[randomSpeedIndex]

    // Update wind display in the UI
    document.getElementById("wind-arrow").textContent =
        randomDir === "left" ? "←" : randomDir === "right" ? "→" : "—"
    document.getElementById("wind-strength").textContent =
        randomDir === "none" ? "None" : speeds[randomSpeedIndex]
}

// Pick a random target for the ball to fly toward
function generateTarget() {
    let targets = [
        goal.x + 30,                        // left post area
        goal.x + goal.width / 2 - 40,       // left of center
        goal.x + goal.width / 2,            // center
        goal.x + goal.width / 2 + 40,       // right of center
        goal.x + goal.width - 30            // right post area
    ]
    return targets[Math.floor(Math.random() * targets.length)]
}

// Launch the ball — called after a short delay each round
function launchBall() {
    generateWind()

    ball.x = canvas.width / 2
    ball.y = canvas.height - 80
    ball.active = true
    ball.targetX = generateTarget()
    ball.speedY = 5 + (gameState.currentShot * 0.3) // gets faster each shot

    // Curve based on wind + random spin
    let spin = (Math.random() - 0.5) * 3
    let windEffect = wind.direction === "left" ? -wind.speed * 0.15
                   : wind.direction === "right" ? wind.speed * 0.15 : 0
    ball.curveX = spin + windEffect

    gameState.phase = "flying"
}

// Move the ball each frame — called in the game loop
function updateBall() {
    if (!ball.active || gameState.phase !== "flying") return

    // Move ball toward target X and upward toward goal
    let dx = ball.targetX - ball.x
    ball.x += dx * 0.04 + ball.curveX
    ball.y -= ball.speedY

    // Check if ball reached the goal area
    if (ball.y <= goal.y + goal.height) {
        checkResult()
    }
}

// Check if it's a save or a goal
function checkResult() {
    ball.active = false
    gameState.phase = "result"

    // Did the keeper overlap with where the ball ended up?
    let keeperLeft  = keeper.x - keeper.width / 2 - 10
    let keeperRight = keeper.x + keeper.width / 2 + 10
    let saved = ball.x >= keeperLeft && ball.x <= keeperRight

    // Was the ball even on target? (inside the goal posts)
    let onTarget = ball.x > goal.x + goal.postWidth &&
                   ball.x < goal.x + goal.width - goal.postWidth

    if (!onTarget) {
        showResult("OFF TARGET", "#f1c40f")
    } else if (saved) {
        gameState.saves++
        document.getElementById("saves-count").textContent = gameState.saves
        showResult("SAVED!", "#2ecc71")
    } else {
        gameState.goals++
        document.getElementById("goals-count").textContent = gameState.goals
        showResult("GOAL!", "#e74c3c")
    }
}

// Show the result message then move to next shot
function showResult(message, color) {
    let msg = document.getElementById("result-msg")
    msg.textContent = message
    msg.style.color = color
    msg.style.display = "block"

    setTimeout(function() {
        msg.style.display = "none"
        nextShot()
    }, 1500)
}

// Move to the next shot or end the game
function nextShot() {
    if (gameState.currentShot >= gameState.totalShots) {
        endGame()
        return
    }

    gameState.currentShot++
    document.getElementById("shot-count").textContent =
        gameState.currentShot + "/" + gameState.totalShots

    ball.active = false
    gameState.phase = "waiting"

    // Wait a moment then launch next ball
    setTimeout(launchBall, 1200)
}

// End the game and show game over screen
function endGame() {
    document.getElementById("game-ui").style.display = "none"
    document.getElementById("gameover-screen").style.display = "flex"
    document.getElementById("final-saves").textContent = gameState.saves
    document.getElementById("final-total").textContent = gameState.totalShots

    // Message based on performance
    let ratio = gameState.saves / gameState.totalShots
    let msg = ratio === 1    ? "🧤 Perfect! Unbeatable!" :
              ratio >= 0.8   ? "🔥 Outstanding keeping!" :
              ratio >= 0.6   ? "👏 Solid performance!" :
              ratio >= 0.4   ? "😅 Room to improve!" :
                               "😬 Back to training..."

    document.getElementById("final-message").textContent = msg
    document.getElementById("gameover-title").textContent =
        ratio >= 0.7 ? "CLEAN SHEET!" : "FULL TIME"
}

// Start a fresh game
function startGame() {
    gameState.saves = 0
    gameState.goals = 0
    gameState.currentShot = 1
    gameState.phase = "waiting"

    document.getElementById("saves-count").textContent = "0"
    document.getElementById("goals-count").textContent = "0"
    document.getElementById("shot-count").textContent = "1/10"

    document.getElementById("start-screen").style.display = "none"
    document.getElementById("gameover-screen").style.display = "none"
    document.getElementById("game-ui").style.display = "flex"

    ball.active = false

    setTimeout(launchBall, 1500)
}




// Mouse movement — moves the goalkeeper
canvas.addEventListener("mousemove", function(e) {
    let rect = canvas.getBoundingClientRect()
    let mouseX = e.clientX - rect.left

    // Clamp keeper inside the goal
    let minX = goal.x + goal.postWidth + keeper.width / 2
    let maxX = goal.x + goal.width - goal.postWidth - keeper.width / 2
    keeper.x = Math.max(minX, Math.min(maxX, mouseX))
})



function gameLoop() {
    updateBall()
    draw()
    requestAnimationFrame(gameLoop)
}

// Kick everything off
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("start-btn").addEventListener("click", startGame)
    document.getElementById("restart-btn").addEventListener("click", startGame)
    gameLoop()
})