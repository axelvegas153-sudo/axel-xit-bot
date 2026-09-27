const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const express = require('express');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.GuildMembers, 
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();
const commandsData = [];

// CARGAR COMANDOS
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const category = require(`./commands/${file}`);
    for (const cmd of category) {
        if ('data' in cmd && 'execute' in cmd) {
            client.commands.set(cmd.data.name, cmd);
            commandsData.push(cmd.data.toJSON());
        } else {
            console.log(`[ADVERTENCIA] El comando en ${file} no tiene "data" o "execute"`);
        }
    }
}

client.once('ready', async () => {
    console.log(`✅ DARK FF V1 Online como ${client.user.tag}`);
    console.log(`📦 ${client.commands.size} comandos cargados`);

    // REGISTRAR SLASH COMMANDS EN DISCORD
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    try {
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commandsData });
        console.log('✅ Slash Commands registrados globalmente');
    } catch (error) {
        console.error(error);
    }
});

// CUANDO USAN UN COMANDO
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try { 
        await command.execute(interaction, client); 
    }
    catch (error) { 
        console.error(error);
        await interaction.reply({ content: '❌ Hubo un error al ejecutar este comando', ephemeral: true }); 
    }
});

// SERVIDOR HTTP PARA RAILWAY
const app = express();
app.get('/', (req, res) => res.send('DARK FF V1 ONLINE ✅'));
app.listen(process.env.PORT || 3000);

client.login(process.env.TOKEN);
