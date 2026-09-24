const { REST, Routes } = require('discord.js');
const { clientId, token } = require('./config.json'); // o process.env.TOKEN
const fs = require('fs');

const commands = [];
const commandFiles = fs.readdirSync('./').filter(file => file === 'commands.js');
const commandsJson = require('./commands.js');

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN || token);

(async () => {
	try {
		console.log(`Empezando a actualizar ${commandsJson.length} comandos.`);

		// ELIMINA TODOS LOS COMANDOS VIEJOS PRIMERO
		await rest.put(Routes.applicationCommands(clientId), { body: [] });
		
	// ESPERA 2 SEGUNDOS
		await new Promise(r => setTimeout(r, 2000));

		// REGISTRA LOS NUEVOS
		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commandsJson },
		);

		console.log(`Se actualizaron correctamente ${data.length} comandos.`);
	} catch (error) {
		console.error(error);
	}
})();
