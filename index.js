const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const fs = require('fs');
require('dotenv').config();

// CONFIG
const CREATOR_ID = '1483521913429950658'; // PEGA TU ID DE DISCORD
const SERVER_INVITE = 'https://discord.gg/gmr6CmEqQ';
const TOKEN = process.env.TOKEN;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration
  ]
});

// DB Y VARIABLES
let levels = {};
let config = {}; // CONFIG DE BIENVENIDA/DESPEDIDA POR SERVER
try { levels = require('./levels.json'); } catch { levels = {}; }
try { config = require('./config.json'); } catch { config = {}; }
let cooldown = {};
let joinCache = [];
let raidMode = false;
let antilink = true;
let antiraid = true;

// ANTI-SPAM CONFIG
const palabrasProhibidas = ['porno', 'xxx', 'nude', 'onlyfans', 'hentai', 'rule34', 'leaked'];
const inviteRegex = /(discord\.gg\/|discord\.com\/invite\/)/i;
let linkWarnings = {};
const tiemposMute = { '1h': 3600000, '4h': 14400000, '5h': 18000000, '8h': 28800000 };
let tiempoMuteActual = tiemposMute['1h'];

// COLORES PARA HELP
const colores = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFD700, 0xFF69B4, 0x00FFFF, 0x9932CC, 0xFF4500];

// DISTUBE
const distube = new DisTube(client, { emitNewSongOnly: true, plugins: [new SpotifyPlugin(), new YtDlpPlugin()] });

// FUNCION VIP
function esVIP(member) {
    if (member.id === CREATOR_ID) return true;
    if (member.premiumSince) return true;
    return false;
}

// FUNCION GUARDAR CONFIG
function guardarConfig() {
    fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
}

// COMANDOS
const commands = [
    new SlashCommandBuilder().setName('help').setDescription('Ver todos los comandos del bot'),
    new SlashCommandBuilder().setName('axelchat').setDescription('Habla con la IA del bot').addStringOption(opt => opt.setName('pregunta').setRequired(true)),
    new SlashCommandBuilder().setName('bienvenida').setDescription('Configurar bienvenidas').addChannelOption(opt => opt.setName('canal').setRequired(true)).addStringOption(opt => opt.setName('mensaje').setRequired(true)),
    new SlashCommandBuilder().setName('despedida').setDescription('Configurar despedidas').addChannelOption(opt => opt.setName('canal').setRequired(true)).addStringOption(opt => opt.setName('mensaje').setRequired(true)),
    new SlashCommandBuilder().setName('dm-bienvenida').setDescription('Activar/Desactivar DM de bienvenida').addStringOption(opt => opt.setName('estado').setRequired(true).addChoices({name: 'on', value: 'on'}, {name: 'off', value: 'off'})),
    new SlashCommandBuilder().setName('axelavatar').setDescription('Muestra avatar').addUserOption(opt => opt.setName('usuario').setRequired(false)),
    new SlashCommandBuilder().setName('servericono').setDescription('Muestra icono del server'),
    new SlashCommandBuilder().setName('axelrank').setDescription('Ver tu nivel').addUserOption(opt => opt.setName('usuario').setRequired(false)),
    new SlashCommandBuilder().setName('axeltop').setDescription('Top 10 niveles'),
    new SlashCommandBuilder().setName('play').setDescription('Reproducir musica').addStringOption(opt => opt.setName('cancion').setRequired(true)),
    new SlashCommandBuilder().setName('skip').setDescription('Saltar cancion'),
    new SlashCommandBuilder().setName('stop').setDescription('Detener musica'),
    new SlashCommandBuilder().setName('queue').setDescription('Ver cola'),
    new SlashCommandBuilder().setName('axelserverinfo').setDescription('Info completa del servidor'),
    new SlashCommandBuilder().setName('axel8ball').setDescription('Bola mágica').addStringOption(opt => opt.setName('pregunta').setRequired(true)),
    new SlashCommandBuilder().setName('axelticket').setDescription('Crear ticket').addStringOption(opt => opt.setName('motivo').setRequired(true)),
    new SlashCommandBuilder().setName('axelsay').setDescription('VIP: El bot dice lo que quieras').addStringOption(opt => opt.setName('mensaje').setRequired(true)),
    new SlashCommandBuilder().setName('axelembed').setDescription('VIP: Crear embed').addStringOption(opt => opt.setName('titulo').setRequired(true)).addStringOption(opt => opt.setName('descripcion').setRequired(true)),
    new SlashCommandBuilder().setName('axelrole').setDescription('VIP: Dar rol').addUserOption(opt => opt.setName('usuario').setRequired(true)).addRoleOption(opt => opt.setName('rol').setRequired(true)),
    new SlashCommandBuilder().setName('axelbeneficios').setDescription('Ver beneficios VIP'),
    new SlashCommandBuilder().setName('antilink').setDescription('Activar/Desactivar anti-link').addStringOption(opt => opt.setName('estado').setRequired(true).addChoices({name: 'on', value: 'on'}, {name: 'off', value: 'off'})),
    new SlashCommandBuilder().setName('antiraid').setDescription('Activar/Desactivar anti-raid').addStringOption(opt => opt.setName('estado').setRequired(true).addChoices({name: 'on', value: 'on'}, {name: 'off', value: 'off'})),
    new SlashCommandBuilder().setName('configmute').setDescription('Configurar tiempo de mute').addStringOption(opt => opt.setName('tiempo').setRequired(true).addChoices({ name: '1 Hora', value: '1h' }, { name: '4 Horas', value: '4h' }, { name: '5 Horas', value: '5h' }, { name: '8 Horas', value: '8h' })),
    new SlashCommandBuilder().setName('addpalabra').setDescription('Añadir palabra prohibida').addStringOption(opt => opt.setName('palabra').setRequired(true)),
];

// READY - GLOBAL
client.once('ready', async () => {
    console.log(`✅ ${client.user.tag} encendido`);
    await client.application.commands.set(commands); // GLOBAL PARA TODOS
    console.log(`✅ ${commands.length} Comandos registrados GLOBALMENTE`);
});

// INTERACCIONES
client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {

        // HELP CON COLORES
        if (interaction.commandName === 'help') {
            const colorRandom = colores[Math.floor(Math.random() * colores.length)];
            const embed = new EmbedBuilder()
         .setColor(colorRandom)
         .setTitle('📜 Axel BOT - LISTA DE COMANDOS')
         .setDescription('Usa `/` para ver todos los comandos')
         .addFields(
                {name: '👑 GENERALES', value: '`/axelavatar` `/servericono` `/axelserverinfo` `/axel8ball`', inline: false},
                {name: '📊 NIVELES', value: '`/axelrank` `/axeltop`', inline: true},
                {name: '🎵 MUSICA', value: '`/play` `/skip` `/stop` `/queue`', inline: true},
                {name: '🎫 TICKETS', value: '`/axelticket`', inline: true},
                {name: '💎 VIP', value: '`/axelsay` `/axelembed` `/axelrole` `/axelbeneficios`', inline: false},
                {name: '🛡️ MODERACIÓN', value: '`/antilink` `/antiraid` `/configmute` `/addpalabra`', inline: false},
                {name: '📢 BIENVENIDAS', value: '`/bienvenida` `/despedida` `/dm-bienvenida`', inline: false},
                {name: '🤖 IA', value: '`/axelchat`', inline: true},
                {name: '❓ AYUDA', value: '`/help`', inline: true}
            )
         .setFooter({text: `Total: ${commands.length} comandos`})
         .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }

        // IA CHAT
        if (interaction.commandName === 'axelchat') {
            const pregunta = interaction.options.getString('pregunta');
            await interaction.deferReply();
            const respuestasIA = [
                `Basado en tu pregunta: "${pregunta}"... Yo digo que sí se puede 💪`,
                `Mmm buena pregunta 🤔 Sobre "${pregunta}" te diría que investigues más.`,
                `Claro que sí! Respecto a "${pregunta}", aquí va mi consejo: Sé tu mejor versión.`,
                `JAJA "${pregunta}" suena interesante. Yo como bot digo: Dale con todo 🔥`
            ];
            const respuesta = respuestasIA[Math.floor(Math.random() * respuestasIA.length)];
            const embed = new EmbedBuilder().setColor(0x5865F2).setTitle('🤖 AXEL IA').addFields({name: 'Tu pregunta', value: pregunta}, {name: 'Mi respuesta', value: respuesta});
            await interaction.editReply({ embeds: [embed] });
        }

        // BIENVENIDA
        if (interaction.commandName === 'bienvenida') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply('❌ No tienes permisos');
            const canal = interaction.options.getChannel('canal');
            const mensaje = interaction.options.getString('mensaje');
            if (!config[interaction.guild.id]) config[interaction.guild.id] = {};
            config[interaction.guild.id].bienvenidaCanal = canal.id;
            config[interaction.guild.id].bienvenidaMsg = mensaje;
            guardarConfig();
            await interaction.reply(`✅ Bienvenida configurada en ${canal}\nMensaje: ${mensaje}\nVariables: {user} {server} {miembros}`);
        }

        // DESPEDIDA
        if (interaction.commandName === 'despedida') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply('❌ No tienes permisos');
            const canal = interaction.options.getChannel('canal');
            const mensaje = interaction.options.getString('mensaje');
            if (!config[interaction.guild.id]) config[interaction.guild.id] = {};
            config[interaction.guild.id].despedidaCanal = canal.id;
            config[interaction.guild.id].despedidaMsg = mensaje;
            guardarConfig();
            await interaction.reply(`✅ Despedida configurada en ${canal}\nMensaje: ${mensaje}`);
        }

        // DM BIENVENIDA
        if (interaction.commandName === 'dm-bienvenida') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply('❌ No tienes permisos');
            const estado = interaction.options.getString('estado') === 'on';
            if (!config[interaction.guild.id]) config[interaction.guild.id] = {};
            config[interaction.guild.id].dmBienvenida = estado;
            guardarConfig();
            await interaction.reply(`✅ DM de bienvenida: **${estado? 'ACTIVADO' : 'DESACTIVADO'}**`);
        }

        // AVATAR
        if (interaction.commandName === 'axelavatar') {
            const user = interaction.options.getUser('usuario') || interaction.user;
            const avatar = user.displayAvatarURL({ dynamic: true, size: 1024 });
            const embed = new EmbedBuilder().setColor(0x5865F2).setTitle(`Avatar de ${user.username}`).setImage(avatar);
            await interaction.reply({ embeds: [embed] });
        }

        // SERVERINFO
        if (interaction.commandName === 'axelserverinfo') {
            const guild = interaction.guild;
            const embed = new EmbedBuilder().setColor(0x5865F2).setTitle(`📊 Info de ${guild.name}`).setThumbnail(guild.iconURL()).addFields({name: '👑 Dueño', value: `<@${guild.ownerId}>`, inline: true},{name: '👥 Miembros', value: `${guild.memberCount}`, inline: true},{name: '💎 Boosts', value: `${guild.premiumSubscriptionCount}`, inline: true}).setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }

        // 8BALL
        if (interaction.commandName === 'axel8ball') {
            const pregunta = interaction.options.getString('pregunta');
            const respuestas = ['Sí 🔮', 'No ❌', 'Tal vez 🤔', 'Obvio que sí ✅', 'Ni de broma 🚫'];
            const respuesta = respuestas[Math.floor(Math.random() * respuestas.length)];
            const embed = new EmbedBuilder().setColor(0x9932CC).setTitle('🎱 Bola Mágica 8').addFields({name: 'Pregunta', value: pregunta},{name: 'Respuesta', value: respuesta});
            await interaction.reply({ embeds: [embed] });
        }

        // TICKET
        if (interaction.commandName === 'axelticket') {
            const motivo = interaction.options.getString('motivo');
            const canal = await interaction.guild.channels.create({ name: `ticket-${interaction.user.username}`, type: 0, permissionOverwrites: [{ id: interaction.guild.id, deny: ['ViewChannel'] }, { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages'] }] });
            const embed = new EmbedBuilder().setColor(0xFF0000).setTitle('🎫 Ticket Creado').setDescription(`Hola ${interaction.user}, un staff te atenderá pronto.\n**Motivo:** ${motivo}`);
            const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('cerrar_ticket').setLabel('🔒 Cerrar Ticket').setStyle(ButtonStyle.Danger));
            await canal.send({ embeds: [embed], components: [row] });
            await interaction.reply({ content: `✅ Ticket creado: ${canal}`, ephemeral: true });
        }

        // VIP COMMANDS
        if (interaction.commandName === 'axelsay') {
            if (!esVIP(interaction.member)) return interaction.reply({content: `❌ **COMANDO VIP** 💎\nMejora el server: ${SERVER_INVITE}`, ephemeral: true});
            await interaction.reply(interaction.options.getString('mensaje'));
        }
        if (interaction.commandName === 'axelembed') {
            if (!esVIP(interaction.member)) return interaction.reply({content: `❌ **COMANDO VIP** 💎\nMejora el server: ${SERVER_INVITE}`, ephemeral: true});
            const embed = new EmbedBuilder().setColor(0xFFD700).setTitle(interaction.options.getString('titulo')).setDescription(interaction.options.getString('descripcion'));
            await interaction.reply({ embeds: [embed] });
        }
        if (interaction.commandName === 'axelrole') {
            if (!esVIP(interaction.member)) return interaction.reply({content: `❌ **COMANDO VIP** 💎\nMejora el server: ${SERVER_INVITE}`, ephemeral: true});
            const usuario = interaction.options.getUser('usuario');
            const rol = interaction.options.getRole('rol');
            const member = interaction.guild.members.cache.get(usuario.id);
            await member.roles.add(rol);
            await interaction.reply(`✅ Le di **${rol.name}** a ${usuario}`);
        }
        if (interaction.commandName === 'axelbeneficios') {
            const embed = new EmbedBuilder().setColor(0xFFD700).setTitle('💎 BENEFICIOS VIP').setDescription('Desbloquea estos comandos mejorando el servidor:').addFields({name: '/axelsay', value: 'El bot dice lo que quieras'},{name: '/axelembed', value: 'Crear embeds personalizados'},{name: '/axelrole', value: 'Dar roles a otros usuarios'});
            await interaction.reply({ embeds: [embed] });
        }

        // CONFIG MOD
        if (interaction.commandName === 'configmute') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.reply('❌ No tienes permisos');
            tiempoMuteActual = tiemposMute[interaction.options.getString('tiempo')];
            await interaction.reply(`✅ Mute actualizado a: **${interaction.options.getString('tiempo')}**`);
        }
        if (interaction.commandName === 'antilink') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply('❌ No tienes permisos');
            antilink = interaction.options.getString('estado') === 'on';
            await interaction.reply(`✅ Anti-Link: **${antilink? 'ON' : 'OFF'}**`);
        }
        if (interaction.commandName === 'antiraid') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply('❌ No tienes permisos');
            antiraid = interaction.options.getString('estado') === 'on';
            await interaction.reply(`✅ Anti-Raid: **${antiraid? 'ON' : 'OFF'}**`);
        }
        if (interaction.commandName === 'addpalabra') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply('❌ Solo Admins');
            const palabra = interaction.options.getString('palabra').toLowerCase();
            palabrasProhibidas.push(palabra);
            await interaction.reply(`✅ Palabra **${palabra}** añadida a la lista negra`);
        }
    }

    if (interaction.isButton()) {
        if (interaction.customId === 'cerrar_ticket') {
            await interaction.reply('🔒 Cerrando en 5 seg...');
            setTimeout(() => interaction.channel.delete(), 5000);
        }
    }
});

// MENSAJES - NIVELES + ANTI-SPAM
client.on('messageCreate', async message => {
    if (message.author.bot) return;

    // NIVELES
    const guildId = message.guild.id; const userId = message.author.id;
    if (!levels[guildId]) levels[guildId] = {};
    if (!levels[guildId][userId]) levels[guildId][userId] = { xp: 0, level: 1 };
    const ahora = Date.now();
    if (!cooldown[userId] || ahora - cooldown[userId] > 60000) {
        cooldown[userId] = ahora;
        levels[guildId][userId].xp += Math.floor(Math.random() * 10) + 15;
        const xpNeeded = levels[guildId][userId].level * 100;
        if (levels[guildId][userId].xp >= xpNeeded) {
            levels[guildId][userId].xp -= xpNeeded;
            levels[guildId][userId].level++;
            message.channel.send(`🎉 ${message.author} subió a **Nivel ${levels[guildId][userId].level}**`);
        }
        fs.writeFileSync('./levels.json', JSON.stringify(levels));
    }

    // ANTI-SPAM
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        const contenido = message.content.toLowerCase();
        if (antilink && inviteRegex.test(contenido)) {
            await message.delete();
            await message.member.timeout(tiempoMuteActual, 'Invite otro server');
            return message.channel.send(`🔨 ${message.author} muteado por mandar invite`).then(m => setTimeout(() => m.delete(), 5000));
        }
        if (antilink && palabrasProhibidas.some(p => contenido.includes(p))) {
            await message.delete();
            await message.member.timeout(tiempoMuteActual, 'Contenido +18');
            return message.channel.send(`🔞 ${message.author} muteado por +18`).then(m => setTimeout(() => m.delete(), 5000));
        }
    }
});

// BIENVENIDA Y DESPEDIDA
client.on('guildMemberAdd', async member => {
    const guildConfig = config[member.guild.id];

    // ANTI-RAID
    if (antiraid) {
        if (raidMode) return member.kick('Anti-Raid');
        joinCache.push(Date.now());
        joinCache = joinCache.filter(time => Date.now() - time < 10000);
        if (joinCache.length >= 5) {
            raidMode = true;
            member.guild.setInvitesDisabled(true);
            member.guild.systemChannel?.send('🚨 **ANTI-RAID ACTIVADO** Cerrando invitaciones 1 minuto');
            setTimeout(() => { raidMode = false; member.guild.setInvitesDisabled(false); }, 60000);
        }
    }

    // BIENVENIDA EN CANAL
    if (guildConfig?.bienvenidaCanal) {
        const canal = member.guild.channels.cache.get(guildConfig.bienvenidaCanal);
        if (canal) {
            let msg = guildConfig.bienvenidaMsg.replace('{user}', member).replace('{server}', member.guild.name).replace('{miembros}', member.guild.memberCount);
            const embed = new EmbedBuilder().setColor(0x00FF00).setTitle('👋 BIENVENIDO').setDescription(msg).setThumbnail(member.user.displayAvatarURL());
            canal.send({ embeds: [embed] });
        }
    }

    // DM BIENVENIDA
    if (guildConfig?.dmBienvenida) {
        try {
            const embed = new EmbedBuilder().setColor(0x00FF00).setTitle(`Bienvenido a ${member.guild.name}`).setDescription('Gracias por unirte! Lee las reglas y disfruta 💎');
            await member.send({ embeds: [embed] });
        
