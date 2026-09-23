require('dotenv').config();

const fs = require('fs');
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType
} = require('discord.js');

const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { YtDlpPlugin } = require('@distube/yt-dlp');

// ======================================================
// CONFIG
// ======================================================

const TOKEN = process.env.TOKEN;

const CREATOR_ID = '1483521913429950658';
const SERVER_INVITE = 'https://discord.gg/gmr6CmEqQ';

if (!TOKEN) {
  console.error('❌ ERROR: Falta la variable TOKEN en Render.');
  process.exit(1);
}

// ======================================================
// CLIENTE DISCORD
// ======================================================

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

// ======================================================
// ARCHIVOS
// ======================================================

let levels = {};
let config = {};

function cargarJSON(archivo, valorPorDefecto) {
  try {
    if (!fs.existsSync(archivo)) {
      fs.writeFileSync(
        archivo,
        JSON.stringify(valorPorDefecto, null, 2)
      );
      return valorPorDefecto;
    }

    return JSON.parse(fs.readFileSync(archivo, 'utf8'));
  } catch (error) {
    console.error(`❌ Error leyendo ${archivo}:`, error.message);
    return valorPorDefecto;
  }
}

levels = cargarJSON('./levels.json', {});
config = cargarJSON('./config.json', {});

function guardarLevels() {
  try {
    fs.writeFileSync(
      './levels.json',
      JSON.stringify(levels, null, 2)
    );
  } catch (error) {
    console.error('❌ Error guardando levels.json:', error.message);
  }
}

function guardarConfig() {
  try {
    fs.writeFileSync(
      './config.json',
      JSON.stringify(config, null, 2)
    );
  } catch (error) {
    console.error('❌ Error guardando config.json:', error.message);
  }
}

// ======================================================
// VARIABLES
// ======================================================

const cooldown = {};
const joinCache = {};

let antilink = true;
let antiraid = true;

const palabrasProhibidas = [
  'porno',
  'xxx',
  'nude',
  'onlyfans',
  'hentai',
  'rule34',
  'leaked'
];

const inviteRegex =
  /(discord\.gg\/|discord\.com\/invite\/)/i;

const tiemposMute = {
  '1h': 60 * 60 * 1000,
  '4h': 4 * 60 * 60 * 1000,
  '5h': 5 * 60 * 60 * 1000,
  '8h': 8 * 60 * 60 * 1000
};

let tiempoMuteActual = tiemposMute['1h'];

const colores = [
  0xFF0000,
  0x00FF00,
  0x0000FF,
  0xFFD700,
  0xFF69B4,
  0x00FFFF,
  0x9932CC,
  0xFF4500
];

// ======================================================
// DISTUBE
// ======================================================

let distube;

try {
  distube = new DisTube(client, {
    emitNewSongOnly: true,
    plugins: [
      new SpotifyPlugin(),
      new YtDlpPlugin({ update: true })
    ]
  });

  console.log('✅ DisTube cargado.');
} catch (error) {
  console.error('❌ Error iniciando DisTube:', error);
}

// ======================================================
// FUNCIONES
// ======================================================

function esVIP(member) {
  if (!member) return false;

  if (member.id === CREATOR_ID) {
    return true;
  }

  if (member.premiumSince) {
    return true;
  }

  return false;
}

function reemplazarVariables(texto, member) {
  return texto
    .replace(/{user}/g, `<@${member.id}>`)
    .replace(/{server}/g, member.guild.name)
    .replace(/{miembros}/g, `${member.guild.memberCount}`);
}

// ======================================================
// COMANDOS
// ======================================================

const commands = [

  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Ver todos los comandos del bot'),

  new SlashCommandBuilder()
    .setName('axelchat')
    .setDescription('Habla con la IA del bot')
    .addStringOption(option =>
      option
        .setName('pregunta')
        .setDescription('Tu pregunta')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('bienvenida')
    .setDescription('Configurar bienvenida')
    .addChannelOption(option =>
      option
        .setName('canal')
        .setDescription('Canal de bienvenida')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('mensaje')
        .setDescription('Mensaje de bienvenida')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('despedida')
    .setDescription('Configurar despedida')
    .addChannelOption(option =>
      option
        .setName('canal')
        .setDescription('Canal de despedidas')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('mensaje')
        .setDescription('Mensaje de despedida')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('dm-bienvenida')
    .setDescription('Activar o desactivar DM de bienvenida')
    .addStringOption(option =>
      option
        .setName('estado')
        .setDescription('Estado')
        .setRequired(true)
        .addChoices(
          { name: 'on', value: 'on' },
          { name: 'off', value: 'off' }
        )
    ),

  new SlashCommandBuilder()
    .setName('axelavatar')
    .setDescription('Muestra un avatar')
    .addUserOption(option =>
      option
        .setName('usuario')
        .setDescription('Usuario')
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName('servericono')
    .setDescription('Muestra el icono del servidor'),

  new SlashCommandBuilder()
    .setName('axelrank')
    .setDescription('Ver tu nivel')
    .addUserOption(option =>
      option
        .setName('usuario')
        .setDescription('Usuario')
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName('axeltop')
    .setDescription('Top 10 niveles'),

  new SlashCommandBuilder()
    .setName('play')
    .setDescription('Reproducir música')
    .addStringOption(option =>
      option
        .setName('cancion')
        .setDescription('Nombre o enlace')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Saltar canción'),

  new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Detener música'),

  new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Ver cola'),

  new SlashCommandBuilder()
    .setName('axelserverinfo')
    .setDescription('Información del servidor'),

  new SlashCommandBuilder()
    .setName('axel8ball')
    .setDescription('Bola mágica')
    .addStringOption(option =>
      option
        .setName('pregunta')
        .setDescription('Pregunta')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('axelticket')
    .setDescription('Crear ticket')
    .addStringOption(option =>
      option
        .setName('motivo')
        .setDescription('Motivo del ticket')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('axelsay')
    .setDescription('VIP: El bot dice un mensaje')
    .addStringOption(option =>
      option
        .setName('mensaje')
        .setDescription('Mensaje')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('axelembed')
    .setDescription('VIP: Crear embed')
    .addStringOption(option =>
      option
        .setName('titulo')
        .setDescription('Título')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('descripcion')
        .setDescription('Descripción')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('axelrole')
    .setDescription('VIP: Dar rol')
    .addUserOption(option =>
      option
        .setName('usuario')
        .setDescription('Usuario')
        .setRequired(true)
    )
    .addRoleOption(option =>
      option
        .setName('rol')
        .setDescription('Rol')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('axelbeneficios')
    .setDescription('Ver beneficios VIP'),

  new SlashCommandBuilder()
    .setName('antilink')
    .setDescription('Activar o desactivar anti-link')
    .addStringOption(option =>
      option
        .setName('estado')
        .setDescription('Estado')
        .setRequired(true)
        .addChoices(
          { name: 'on', value: 'on' },
          { name: 'off', value: 'off' }
        )
    ),

  new SlashCommandBuilder()
    .setName('antiraid')
    .setDescription('Activar o desactivar anti-raid')
    .addStringOption(option =>
      option
        .setName('estado')
        .setDescription('Estado')
        .setRequired(true)
        .addChoices(
          { name: 'on', value: 'on' },
          { name: 'off', value: 'off' }
        )
    ),

  new SlashCommandBuilder()
    .setName('configmute')
    .setDescription('Configurar tiempo de mute')
    .addStringOption(option =>
      option
        .setName('tiempo')
        .setDescription('Tiempo')
        .setRequired(true)
        .addChoices(
          { name: '1 Hora', value: '1h' },
          { name: '4 Horas', value: '4h' },
          { name: '5 Horas', value: '5h' },
          { name: '8 Horas', value: '8h' }
        )
    ),

  new SlashCommandBuilder()
    .setName('addpalabra')
    .setDescription('Añadir palabra prohibida')
    .addStringOption(option =>
      option
        .setName('palabra')
        .setDescription('Palabra')
        .setRequired(true)
    )
];

// ======================================================
// READY
// ======================================================

client.once('ready', async () => {
  try {
    console.log('');
    console.log('=================================');
    console.log(`✅ ${client.user.tag} está conectado`);
    console.log(`🌐 Servidores: ${client.guilds.cache.size}`);
    console.log('=================================');

    await client.application.commands.set(
      commands.map(command => command.toJSON())
    );

    console.log(
      `✅ ${commands.length} comandos registrados globalmente.`
    );

  } catch (error) {
    console.error('❌ Error registrando comandos:', error);
  }
});

// ======================================================
// INTERACCIONES
// ======================================================

client.on('interactionCreate', async interaction => {

  try {

    // ==================================================
    // SLASH COMMANDS
    // ==================================================

    if (interaction.isChatInputCommand()) {

      // HELP
      if (interaction.commandName === 'help') {

        const color =
          colores[Math.floor(Math.random() * colores.length)];

        const embed = new EmbedBuilder()
          .setColor(color)
          .setTitle('📜 AXEL BOT - COMANDOS')
          .setDescription('Usa `/` para ver todos los comandos.')
          .addFields(
            {
              name: '👑 GENERALES',
              value:
                '`/axelavatar` `/servericono` `/axelserverinfo` `/axel8ball`'
            },
            {
              name: '📊 NIVELES',
              value: '`/axelrank` `/axeltop`'
            },
            {
              name: '🎵 MÚSICA',
              value: '`/play` `/skip` `/stop` `/queue`'
            },
            {
              name: '🎫 TICKETS',
              value: '`/axelticket`'
            },
            {
              name: '💎 VIP',
              value:
                '`/axelsay` `/axelembed` `/axelrole` `/axelbeneficios`'
            },
            {
              name: '🛡️ MODERACIÓN',
              value:
                '`/antilink` `/antiraid` `/configmute` `/addpalabra`'
            },
            {
              name: '📢 BIENVENIDAS',
              value:
                '`/bienvenida` `/despedida` `/dm-bienvenida`'
            },
            {
              name: '🤖 IA',
              value: '`/axelchat`'
            }
          )
          .setFooter({
            text: `Total: ${commands.length} comandos`
          })
          .setTimestamp();

        return interaction.reply({
          embeds: [embed]
        });
      }

      // AXEL CHAT
      if (interaction.commandName === 'axelchat') {

        const pregunta =
          interaction.options.getString('pregunta');

        const respuestas = [
          `Sobre "${pregunta}", yo digo que sí se puede 💪`,
          `Buena pregunta 🤔. Investiga un poco más sobre "${pregunta}".`,
          `Claro que sí. Sobre "${pregunta}", sigue aprendiendo 🔥`,
          `JAJA "${pregunta}" suena interesante 😂`
        ];

        const respuesta =
          respuestas[
            Math.floor(Math.random() * respuestas.length)
          ];

        const embed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle('🤖 AXEL IA')
          .addFields(
            {
              name: 'Tu pregunta',
              value: pregunta.slice(0, 1024)
            },
            {
              name: 'Mi respuesta',
              value: respuesta
            }
          );

        return interaction.reply({
          embeds: [embed]
        });
      }

      // BIENVENIDA
      if (interaction.commandName === 'bienvenida') {

        if (
          !interaction.member.permissions.has(
            PermissionFlagsBits.Administrator
          )
        ) {
          return interaction.reply({
            content: '❌ No tienes permisos de administrador.',
            ephemeral: true
          });
        }

        const canal =
          interaction.options.getChannel('canal');

        const mensaje =
          interaction.options.getString('mensaje');

        if (!config[interaction.guild.id]) {
          config[interaction.guild.id] = {};
        }

        config[interaction.guild.id].bienvenidaCanal =
          canal.id;

        config[interaction.guild.id].bienvenidaMsg =
          mensaje;

        guardarConfig();

        return interaction.reply(
          `✅ Bienvenida configurada en ${canal}.\n` +
          `Mensaje: ${mensaje}\n\n` +
          `Variables disponibles: {user} {server} {miembros}`
        );
      }

      // DESPEDIDA
      if (interaction.commandName === 'despedida') {

        if (
          !interaction.member.permissions.has(
            PermissionFlagsBits.Administrator
          )
        ) {
          return interaction.reply({
            content: '❌ No tienes permisos de administrador.',
            ephemeral: true
          });
        }

        const canal =
          interaction.options.getChannel('canal');

        const mensaje =
          interaction.options.getString('mensaje');

        if (!config[interaction.guild.id]) {
          config[interaction.guild.id] = {};
        }

        config[interaction.guild.id].despedidaCanal =
          canal.id;

        config[interaction.guild.id].despedidaMsg =
          mensaje;

        guardarConfig();

        return interaction.reply(
          `✅ Despedida configurada en ${canal}.`
        );
      }

      // DM BIENVENIDA
      if (interaction.commandName === 'dm-bienvenida') {

        if (
          !interaction.member.permissions.has(
            PermissionFlagsBits.Administrator
          )
        ) {
          return interaction.reply({
            content: '❌ No tienes permisos.',
            ephemeral: true
          });
        }

        const estado =
          interaction.options.getString('estado') === 'on';

        if (!config[interaction.guild.id]) {
          config[interaction.guild.id] = {};
        }

        config[interaction.guild.id].dmBienvenida =
          estado;

        guardarConfig();

        return interaction.reply(
          `✅ DM de bienvenida: **${
            estado ? 'ACTIVADO' : 'DESACTIVADO'
          }**`
        );
      }

      // AVATAR
      if (interaction.commandName === 'axelavatar') {

        const user =
          interaction.options.getUser('usuario') ||
          interaction.user;

        const avatar =
          user.displayAvatarURL({
            extension: 'png',
            size: 1024
          });

        const embed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle(`Avatar de ${user.username}`)
          .setImage(avatar);

        return interaction.reply({
          embeds: [embed]
        });
      }

      // SERVER ICON
      if (interaction.commandName === 'servericono') {

        const icon = interaction.guild.iconURL({
          extension: 'png',
          size: 1024
        });

        if (!icon) {
          return interaction.reply(
            '❌ Este servidor no tiene icono.'
          );
        }

        const embed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle(`🖼️ Icono de ${interaction.guild.name}`)
          .setImage(icon);

        return interaction.reply({
          embeds: [embed]
        });
      }

      // SERVER INFO
      if (interaction.commandName === 'axelserverinfo') {

        const guild = interaction.guild;

        const embed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle(`📊 Info de ${guild.name}`)
          .setThumbnail(
            guild.iconURL({
              extension: 'png',
              size: 512
            })
          )
          .addFields(
            {
              name: '👑 Dueño',
              value: `<@${guild.ownerId}>`,
              inline: true
            },
            {
              name: '👥 Miembros',
              value: `${guild.memberCount}`,
              inline: true
            },
            {
              name: '💎 Boosts',
              value: `${guild.premiumSubscriptionCount || 0}`,
              inline: true
            }
          )
          .setTimestamp();

        return interaction.reply({
          embeds: [embed]
        });
      }

      // 8BALL
      if (interaction.commandName === 'axel8ball') {

        const pregunta =
          interaction.options.getString('pregunta');

        const respuestas = [
          'Sí 🔮',
          'No ❌',
          'Tal vez 🤔',
          'Obvio que sí ✅',
          'Ni de broma 🚫'
        ];

        const respuesta =
          respuestas[
            Math.floor(Math.random() * respuestas.length)
          ];

        const embed = new EmbedBuilder()
          .setColor(0x9932CC)
          .setTitle('🎱 Bola Mágica 8')
          .addFields(
            {
              name: 'Pregunta',
              value: pregunta
            },
            {
              name: 'Respuesta',
              value: respuesta
            }
          );

        return interaction.reply({
          embeds: [embed]
        });
      }

      // TICKET
      if (interaction.commandName === 'axelticket') {

        const motivo =
          interaction.options.getString('motivo');

        const canal =
          await interaction.guild.channels.create({
            name:
              `ticket-${interaction.user.username}`
                .toLowerCase()
                .replace(/[^a-z0-9-_]/g, '')
                .slice(0, 90),

            type: ChannelType.GuildText,

            permissionOverwrites: [
              {
                id: interaction.guild.id,
                deny: [PermissionFlagsBits.ViewChannel]
              },
              {
                id: interaction.user.id,
                allow: [
                  PermissionFlagsBits.ViewChannel,
                  PermissionFlagsBits.SendMessages,
                  PermissionFlagsBits.ReadMessageHistory
                ]
              }
            ]
          });

        const embed = new EmbedBuilder()
          .setColor(0xFF000
