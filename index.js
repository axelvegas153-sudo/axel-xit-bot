const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, EmbedBuilder } = require('discord.js');
require('dotenv').config();

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers // Para bienvenida
    ] 
});

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
let welcomeChannelId = null; // Aquí guardamos el canal de bienvenida

// 1. TODOS LOS COMANDOS / ESTILO NEKOTINA
const commands = [
    // MUSICA
    new SlashCommandBuilder().setName('play').setDescription('Reproduce una canción').addStringOption(opt => opt.setName('cancion').setDescription('Link o nombre').setRequired(true)),
    new SlashCommandBuilder().setName('skip').setDescription('Salta la canción actual'),
    new SlashCommandBuilder().setName('stop').setDescription('Detiene la música y limpia la cola'),
    new SlashCommandBuilder().setName('queue').setDescription('Muestra la cola de música'),
    new SlashCommandBuilder().setName('pause').setDescription('Pausa la música'),
    new SlashCommandBuilder().setName('resume').setDescription('Reanuda la música'),
    
    // UTILIDADES
    new SlashCommandBuilder().setName('ping').setDescription('Mira el ping de AXEL XIT'),
    new SlashCommandBuilder().setName('userinfo').setDescription('Muestra info de un usuario').addUserOption(opt => opt.setName('usuario').setDescription('El usuario')),
    new SlashCommandBuilder().setName('server').setDescription('Info del servidor'),
    new SlashCommandBuilder().setName('avatar').setDescription('Muestra el avatar de alguien').addUserOption(opt => opt.setName('usuario').setDescription('El usuario')),
    
    // CONFIG
    new SlashCommandBuilder().setName('setwelcome').setDescription('Pone el canal de bienvenida').addChannelOption(opt => opt.setName('canal').setDescription('Canal de bienvenida').setRequired(true)),
    
    // AXEL XIT
    new SlashCommandBuilder().setName('hola').setDescription('Saludo de AXEL XIT'),
    new SlashCommandBuilder().setName('help').setDescription('Lista todos los comandos de AXEL XIT'),

].map(command => command.toJSON());

// 2. REGISTRAR COMANDOS EN DISCORD
const rest = new REST({ version: '10' }).setToken(TOKEN);
(async () => {
    try {
        console.log('Registrando comandos / de AXEL XIT...');
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('Comandos / registrados!');
    } catch (error) { console.error(error); }
})();

// 3. CUANDO USAN UN COMANDO /
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    // MUSICA - Esqueleto. Para música real ocupamos @discordjs/voice
    if (interaction.commandName === 'play') {
        const cancion = interaction.options.getString('cancion');
        await interaction.reply(`🔥 Buscando: **${cancion}**...\n*Para música real hay que instalar módulos extra*`);
    }
    if (interaction.commandName === 'skip') await interaction.reply('⏭️ Canción saltada');
    if (interaction.commandName === 'stop') await interaction.reply('⏹️ Música detenida y cola limpiada');
    if (interaction.commandName === 'queue') await interaction.reply('📜 La cola está vacía por ahora');
    if (interaction.commandName === 'pause') await interaction.reply('⏸️ Música pausada');
    if (interaction.commandName === 'resume') await interaction.reply('▶️ Música reanudada');

    // UTILIDADES
    if (interaction.commandName === 'ping') await interaction.reply(`🏓 Pong! Mi ping es ${client.ws.ping}ms`);
    
    if (interaction.commandName === 'userinfo') {
        const user = interaction.options.getUser('usuario') || interaction.user;
        const embed = new EmbedBuilder().setColor(0xFF00FF).setTitle(`Info de ${user.username}`).setThumbnail(user.displayAvatarURL()).addFields({name: 'ID', value: user.id}, {name: 'Cuenta creada', value: `<t:${Math.floor(user.createdTimestamp/1000)}:R>`});
        await interaction.reply({ embeds: [embed] });
    }
    
    if (interaction.commandName === 'server') {
        const embed = new EmbedBuilder().setColor(0x00FFFF).setTitle(`Info de ${interaction.guild.name}`).setThumbnail(interaction.guild.iconURL()).addFields({name: 'Miembros', value: `${interaction.guild.memberCount}`}, {name: 'Creado', value: `<t:${Math.floor(interaction.guild.createdTimestamp/1000)}:R>`});
        await interaction.reply({ embeds: [embed] });
    }

    if (interaction.commandName === 'avatar') {
        const user = interaction.options.getUser('usuario') || interaction.user;
        await interaction.reply({ embeds: [new EmbedBuilder().setTitle(`Avatar de ${user.username}`).setImage(user.displayAvatarURL({size: 1024}))] });
    }

    // CONFIG
    if (interaction.commandName === 'setwelcome') {
        const canal = interaction.options.getChannel('canal');
        welcomeChannelId = canal.id;
        await interaction.reply(`✅ Canal de bienvenida puesto en: ${canal}`);
    }

    // AXEL XIT
    if (interaction.commandName === 'hola') await interaction.reply('Hola! Soy **AXEL XIT** y estoy 24/7 prendido 🔥');
    
    if (interaction.commandName === 'help') {
        const embed = new EmbedBuilder()
      .setColor(0xFF00FF)
      .setTitle('🔥 COMANDOS DE AXEL XIT 🔥')
      .setDescription('Todos los comandos van con `/`')
      .addFields(
            {name: '🎵 Música', value: '`/play` `/skip` `/stop` `/queue` `/pause` `/resume`'},
            {name: '⚙️ Utilidades', value: '`/ping` `/userinfo` `/server` `/avatar`'},
            {name: '🛡️ Config', value: '`/setwelcome`'},
            {name: '🤖 AXEL', value: '`/hola` `/help`'},
        ).setFooter({text: 'Creado por @Axel XIT'});
        await interaction.reply({ embeds: [embed] });
    }
});

// 4. BIENVENIDA AUTOMÁTICA
client.on('guildMemberAdd', async member => {
    if (!welcomeChannelId) return;
    
    const channel = member.guild.channels.cache.get(welcomeChannelId);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor(0xFF00FF)
      .setTitle(`🔥 BIENVENIDO A ${member.guild.name} 🔥`)
      .setDescription(`Hey ${member}! Eres el miembro #${member.guild.memberCount}\n\nUsa \`/help\` para ver mis comandos`)
      .setThumbnail(member.user.displayAvatarURL())
      .setImage('https://i.imgur.com/Z4QbQqP.gif')
      .setFooter({text: `AXEL XIT te cuida 24/7`});

    channel.send({ embeds: [embed] });
});


client.once('ready', () => {
    console.log(`✅ Axel XIT está online como ${client.user.tag}`);
});

client.login(TOKEN);
