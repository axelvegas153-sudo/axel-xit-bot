const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const express = require('express');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent] });
client.commands = new Collection();
const commandsData = [];

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const category = require(`./commands/${file}`);
    for (const cmd of category) {
        client.commands.set(cmd.data.name, cmd);
        commandsData.push(cmd.data.toJSON());
    }
}

client.once('ready', async () => {
    console.log(`✅ DARK FF V1 Online - ${client.commands.size} comandos`);
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commandsData });
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try { await command.execute(interaction, client); }
    catch (error) { await interaction.reply({ content: '❌ Error', ephemeral: true }); }
});

express().listen(process.env.PORT || 3000);
client.login(process.env.TOKEN);
