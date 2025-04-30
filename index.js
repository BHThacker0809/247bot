const mineflayer = require('mineflayer');
const readline = require('readline');
const express = require('express');
const app = express();

app.use(express.json()); // To parse JSON bodies

// Serve black page
app.get('/', (req, res) => {
  res.send(`
    <html>
      <body style="background-color:black; margin:0;">
      </body>
    </html>
  `);
});

// Handle POST
app.post('/', (req, res) => {
  console.log('🔵 POST received:', req.body);
  res.json({ status: 'ok' });
});

// Handle GET
app.get('/api/status', (req, res) => {
  res.json({ message: 'Bot is running' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Web server is running on port ${PORT}`);
});


function createBot() {
  console.log('⏳ Starting bot...');

  const bot = mineflayer.createBot({
    host: 'mc.minebridge.lol',
    port: 25565,
    username: 'NPC',
    version: '1.21.4',
  });

  bot.once('spawn', () => {
    const msg = '✅ Bot spawned and is AFKing...';
    console.log(msg);

    bot.setControlState('jump', false);
    showOnlinePlayers();

    setInterval(() => {
      bot.lookAt(bot.entity.position.offset(Math.random(), 0, Math.random()));
    }, 10000);
  });

  bot.on('chat', (username, message) => {
    const msg = `<${username}> ${message}`;
    console.log(msg);
  });

  bot.on('kicked', (reason, loggedIn) => {
    const msg = `⛔ Bot was kicked: ${reason}`;
    console.log(msg);
  });

  bot.on('end', () => {
    const msg = '🔁 Bot disconnected. Reconnecting in 5 seconds...';
    console.log(msg);
    setTimeout(createBot, 5000);
  });

  bot.on('error', (err) => {
    const msg = `-> Bot error: ${err}`;
    console.error(msg);
  });

  bot.on('playerJoined', (player) => {
    const msg = `🟢 ${player.username} joined.`;
    console.log(msg);
    showOnlinePlayers();
  });

  bot.on('playerLeft', (player) => {
    const msg = `🔴 ${player.username} left.`;
    console.log(msg);
    showOnlinePlayers();
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on('line', (input) => {
    if (bot && bot.player && bot.player.username) {
      try {
        bot.chat(input);
      } catch (err) {
        const msg = `❌ Chat failed: ${err.message}`;
        console.error(msg);
      }
    } else {
      const msg = '⚠️ Bot is not ready yet. Please wait...';
      console.log(msg);
    }
  });

  function showOnlinePlayers() {
    const playerNames = Object.keys(bot.players);
    const msg = `Online amount: (${playerNames.length}): ${playerNames.join(', ')}`;
    console.log(msg);
  }
}

createBot();
