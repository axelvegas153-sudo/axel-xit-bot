const { Client, GatewayIntentBits, Collection, REST, Routes, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const express = require('express');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();
const commandsData = [];
const errors = [];

// CARGAR COMANDOS
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const category = require(filePath);

    for (const cmd of category) {
        // VALIDACIÓN
        if (!cmd.data ||!cmd.data.name) {
            errors.push({ archivo: file, comando: 'desconocido', campo: 'data.name', error: 'Falta nombre' });
            continue;
        }
        if (cmd.data.name.length > 32) {
            errors.push({ archivo: file, comando: cmd.data.name, campo: 'name', longitud: cmd.data.name.length, limite: 32 });
            continue;
        }
        if (cmd.data.description.length > 100) {
            errors.push({ archivo: file, comando: cmd.data.name, campo: 'description', longitud: cmd.data.description.length, limite: 100 });
            continue;
        }
        if (client.commands.has(cmd.data.name)) {
            errors.push({ archivo: file, comando: cmd.data.name, campo: 'name', error: 'Comando duplicado' });
            continue;
        }

        client.commands.set(cmd.data.name, cmd);
        commandsData.push(cmd.data.toJSON());
    }
}

// REGISTRAR SLASH COMMANDS
client.once('ready', async () => {
    console.log(`✅ DARK FF V1 encendido como ${client.user.tag}`);
    console.log(`📦 ${client.commands.size} comandos cargados`);

    if (errors.length > 0) {
        console.log(`❌ ${errors.length} errores:`);
        errors.forEach(e => console.log(e));
    }

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    try {
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commandsData });
        console.log('✅ Slash Commands registrados');
    } catch (error) {
        console.error(error);
    }
});

// MANEJADOR DE INTERACCIONES
client.on('interactionCreate', async interaction => {
    try {
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;
            await command.execute(interaction, client);
        }

        if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'help_menu') {
                const category = interaction.values[0];
                const cmd = client.commands.get('help');
                await cmd.handleSelect(interaction, category);
            }
        }

        if (interaction.isButton()) {
            if (interaction.customId === 'help_home') {
                const cmd = client.commands.get('help');
                await cmd.showHome(interaction);
            }
        }

    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: '❌ Ocurrió un error', ephemeral: true });
        } else {
            await interaction.reply({ content: '❌ Ocurrió un error', ephemeral: true });
        }
    }
});

// SERVIDOR HTTP PARA RAILWAY
const app = express();
app.get('/', (req, res) => res.send('DARK FF V1 Online'));
app.listen(process.env.PORT || 3000);

client.login(process.env.TOKEN);
