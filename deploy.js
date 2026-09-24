const { REST, Routes } = require('discord.js');
const commandsJson = require('./commands.js');

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
	try {
		console.log(`Borrando comandos viejos...`);
		await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: [] });
		await new Promise(r => setTimeout(r, 2000));

		console.log(`Registrando ${commandsJson.length} comandos nuevos...`);
		const data = await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
			{ body: commandsJson },
	);
		console.log(`Listo! ${data.length} comandos actualizados en tu server.`);
	} catch (error) {
		console.error(error);
	}
})();
