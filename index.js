require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent
  ] 
});

client.once('ready', () => {
  console.log(`✅ Axel XIT está online como ${client.user.tag}`);
});

client.on('messageCreate', message => {
  if (message.author.bot) return;

  if (message.content === '!hola') {
    message.reply('Hola! Soy **Axel XIT** y estoy 24/7 prendido 🔥');
  }
  
  if (message.content === '!ping') {
    message.reply('Pong! Latencia: ' + client.ws.ping + 'ms');
  }
});

client.login(process.env.TOKEN);
