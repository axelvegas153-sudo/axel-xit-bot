require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');
const fs = require('fs');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = 'PON_AQUI_TU_CLIENT_ID';
const app = express();
app.use(express.json());
app.use(express.static('public'));
app.listen(process.env.PORT || 3000, () => console.log('Axel XIT BOT Web encendida'));

let db = fs.existsSync('./database.json')? JSON.parse(fs.readFileSync('./database.json')) : {};

const lang = {
  es: { ping: 'Pong!', help: 'Lista de comandos', lang: 'Idioma cambiado a Español 🇪🇸', welcome: 'Bienvenido {user} a Axel XIT BOT!' },
  en: { ping: 'Pong!', help: 'Command list', lang: 'Language changed to English 🇺🇸', welcome: 'Welcome {user} to Axel XIT BOT!' },
  pt: { ping: 'Pong!', help: 'Lista de comandos', lang: 'Idioma alterado para Português 🇧🇷', welcome: 'Bem-vindo {user} ao Axel XIT BOT!' }
};

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

const commands = [
  new SlashCommandBuilder().setName('ping').setDescription('Ver latencia'),
  new SlashCommandBuilder().setName('help').setDescription('Ver comandos'),
  new SlashCommandBuilder().setName('hola').setDescription('Saludar'),
  new SlashCommandBuilder().setName('dado').setDescription('Tirar dado'),
  new SlashCommandBuilder().setName('lenguaje')
.setDescription('Cambiar idioma del servidor')
.addStringOption(o => o.setName('idioma').setDescription('Elige idioma').setRequired(true)
 .addChoices({ name: '🇪🇸 Español', value: 'es' }, { name: '🇺🇸 English', value: 'en' }, { name: '🇧🇷 Português', value: 'pt' }))
].map(c => c.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);
client.once('ready', async () => {
  console.log(`✅ Axel XIT BOT encendido: ${client.user.tag}`);
  await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
});

client.on('interactionCreate', async i => {
  if (!i.isChatInputCommand()) return;
  const guildId = i.guild.id;
  const idioma = db[guildId]?.lang || 'es';
  const t = lang[idioma];
  await i.deferReply();
  if (i.commandName === 'ping') i.editReply(`${t.ping} ${client.ws.ping}ms`);
  if (i.commandName === 'dado') i.editReply(`${Math.floor(Math.random() * 6) + 1} 🎲`);
  if (i.commandName === 'lenguaje') {
    const newLang = i.options.getString('idioma');
    db[guildId] = { lang: newLang };
    fs.writeFileSync('./database.json', JSON.stringify(db));
    i.editReply(lang[newLang].lang);
  }
});

client.login(TOKEN);