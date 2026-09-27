const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = [
    { data: new SlashCommandBuilder().setName('help').setDescription('Muestra todos los comandos'), 
    execute: async i => {
        const embed = new EmbedBuilder().setColor(0x00FFFF).setTitle('📜 DARK FF V1 - Ayuda')
        .setDescription('Tengo 80+ comandos. Usa `/` para verlos todos')
        .addFields({name: 'Categorías', value: '`/moderacion` `/ayuda` `/informacion` `/diversion` `/economia`'})
        .setFooter({text: `Solicitado por ${i.user.tag}`});
        await i.reply({embeds: [embed]});
    }},
    { data: new SlashCommandBuilder().setName('ping').setDescription('Ver ping del bot'), 
    execute: async i => await i.reply(`🏓 Pong! ${i.client.ws.ping}ms`)},
    { data: new SlashCommandBuilder().setName('botinfo').setDescription('Info del bot'), 
    execute: async i => await i.reply(`🤖 **DARK FF V1**\nServidores: ${i.client.guilds.cache.size}\nComandos: 80`)},
    { data: new SlashCommandBuilder().setName('serverinfo').setDescription('Info del servidor'), 
    execute: async i => await i.reply(`📊 **${i.guild.name}**\nMiembros: ${i.guild.memberCount}\nCreado: ${i.guild.createdAt.toDateString()}`)},
    { data: new SlashCommandBuilder().setName('invite').setDescription('Invitar al bot'), 
    execute: async i => await i.reply('🔗 Invítame: https://discord.com/api/oauth2/authorize?client_id='+i.client.user.id)},
    { data: new SlashCommandBuilder().setName('uptime').setDescription('Tiempo online'), 
    execute: async i => await i.reply(`⏰ Llevo online: ${Math.floor(i.client.uptime / 1000 / 60)} minutos`)},
    { data: new SlashCommandBuilder().setName('support').setDescription('Soporte'), 
    execute: async i => await i.reply('🛠️ ¿Necesitas ayuda? Contacta al dueño del bot')},
    { data: new SlashCommandBuilder().setName('vote').setDescription('Votar por el bot'), 
    execute: async i => await i.reply('⭐ Vótame para apoyarme!')},
    { data: new SlashCommandBuilder().setName('suggest').setDescription('Sugerir algo').addStringOption(o=>o.setName('sugerencia').setRequired(true)), 
    execute: async i => await i.reply(`✅ Sugerencia enviada: ${i.options.getString('sugerencia')}`)},
    { data: new SlashCommandBuilder().setName('bug').setDescription('Reportar bug').addStringOption(o=>o.setName('bug').setRequired(true)), 
    execute: async i => await i.reply(`🐛 Bug reportado: ${i.options.getString('bug')}`)},
    { data: new SlashCommandBuilder().setName('prefix').setDescription('Ver prefix'), 
    execute: async i => await i.reply('Mi prefix es `/`')},
    { data: new SlashCommandBuilder().setName('stats').setDescription('Estadisticas del bot'), 
    execute: async i => await i.reply(`📈 Comandos usados: 0\nUsuarios: ${i.client.users.cache.size}`)},
    { data: new SlashCommandBuilder().setName('commands').setDescription('Lista de comandos'), 
    execute: async i => await i.reply('Usa `/help` para ver la lista completa')},
    { data: new SlashCommandBuilder().setName('website').setDescription('Website'), 
    execute: async i => await i.reply('🌐 No tengo website aún')},
    { data: new SlashCommandBuilder().setName('privacy').setDescription('Política'), 
    execute: async i => await i.reply('🔒 No guardo datos personales')},
    { data: new SlashCommandBuilder().setName('terms').setDescription('Términos'), 
    execute: async i => await i.reply('📜 Usa el bot con responsabilidad')},
    { data: new SlashCommandBuilder().setName('donate').setDescription('Donar'), 
    execute: async i => await i.reply('💰 Gracias por querer donar!')},
    { data: new SlashCommandBuilder().setName('changelog').setDescription('Cambios'), 
    execute: async i => await i.reply('🆕 v1.0: 80 comandos añadidos')},
    { data: new SlashCommandBuilder().setName('credits').setDescription('Créditos'), 
    execute: async i => await i.reply('👑 Creado por Axel XIT')},
    { data: new SlashCommandBuilder().setName('status').setDescription('Estado del bot'), 
    execute: async i => await i.reply('✅ Estoy online y funcionando!')}
];
