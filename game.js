const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');

let player = { x: 280, y: 350, size: 30, color: '#00d4ff' };
let obstacles = [];
let score = 0;
let gameActive = false;

// Supabase Configuration (Initialize with your keys)
const _supabase = supabase.createClient('YOUR_SUPABASE_URL', 'YOUR_PUBLIC_ANON_KEY');

function spawnObstacle() {
    const size = Math.random() * (40 - 20) + 20;
    obstacles.push({
        x: Math.random() * (canvas.width - size),
        y: -size,
        size: size,
        speed: 3 + (score / 10) // Gets faster as you score
    });
}

function update() {
    if (!gameActive) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.size, player.size);

    // Handle Obstacles
    obstacles.forEach((obs, index) => {
        obs.y += obs.speed;
        ctx.fillStyle = '#ff4b2b';
        ctx.fillRect(obs.x, obs.y, obs.size, obs.size);

        // Collision Detection
        if (player.x < obs.x + obs.size && player.x + player.size > obs.x &&
            player.y < obs.y + obs.size && player.y + player.size > obs.y) {
            gameOver();
        }

        // Score point
        if (obs.y > canvas.height) {
            obstacles.splice(index, 1);
            score++;
            scoreEl.innerText = score;
        }
    });

    requestAnimationFrame(update);
}

async function gameOver() {
    gameActive = false;
    alert(`Game Over! Score: ${score}`);
    
    // Save to Supabase
    const { data, error } = await _supabase
        .from('leaderboard')
        .insert([{ player_name: 'Guest', score: score }]);
    
    location.reload(); 
}

// Controls
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && player.x > 0) player.x -= 20;
    if (e.key === 'ArrowRight' && player.x < canvas.width - player.size) player.x += 20;
});

document.getElementById('startBtn').onclick = () => {
    gameActive = true;
    setInterval(spawnObstacle, 1000);
    update();
};

