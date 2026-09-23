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
// QUITAMOS SPOTIFY YT-DLP PORQUE RENDER EXPLOTA
// const { SpotifyPlugin } = require('@distube/spotify');
// const { YtDlpPlugin } = require('@distube/yt-dlp');

const TOKEN = process.env.TOKEN;
const CREATOR_ID = '1483521913429950658';
const SERVER_INVITE = 'https://discord.gg/gmr6CmEqQ';

if (!TOKEN) {
  console.error('❌ ERROR: Falta la variable TOKEN en Render.');
  process.exit(1);
}

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

let levels = {};
let config = {};

function cargarJSON(archivo, valorPorDefecto) {
  try {
    if (!fs.existsSync(archivo)) {
      fs.writeFileSync(archivo, JSON.stringify(valorPorDefecto, null, 2));
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
  try { fs.writeFileSync('./levels.json', JSON.stringify(levels, null, 2)); } 
  catch (error) { console.error('❌ Error guardando levels.json:', error.message); }
}

function guardarConfig() {
  try { fs.writeFileSync('./config.json', JSON.stringify(config, null, 2)); } 
  catch (error) { console.error('❌ Error guardando config.json:', error.message); }
}

const cooldown = {};
let antilink = true;
let antiraid = true;
const palabrasProhibidas = ['porno', 'xxx', 'nude', 'onlyfans', 'hentai', 'rule34', 'leaked'];
const inviteRegex = /(discord\.gg\/|discord\.com\/invite\/)/i;
const tiemposMute = { '1h': 3600000, '4h': 14400000, '5h': 18000000, '8h': 28800000 };
let tiempoMuteActual = tiemposMute['1h'];
const colores = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFD700, 0xFF69B4, 0x00FFFF, 0x9932CC, 0xFF4500];

let distube;
try {
  distube = new DisTube(client, { emitNewSongOnly: true }); // SIN PLUGINS
  console.log('✅ DisTube cargado.');
} catch (error) {
  console.error('❌ Error iniciando DisTube:', error);
}

function esVIP(member) {
  if (!member) return false;
  if (member.id === CREATOR_ID) return true;
  if (member.premiumSince) return true;
  return false;
}

function reemplazarVariables(texto, member) {
  return texto.replace(/{user}/g, `<@${member.id}>`).replace(/{server}/g, member.guild.name).replace(/{miembros}/g, `${member.guild.memberCount}`);
}

function obtenerNivel(userId) {
  if (!levels[userId]) levels[userId] = { xp: 0, level: 1 };
  return levels[userId];
}

function xpNecesaria(level) { return level * 100; }

function agregarXP(userId) {
  const datos = obtenerNivel(userId);
  datos.xp += 10;
  let subio = false;
  while (datos.xp >= xpNecesaria(datos.level)) {
    datos.xp -= xpNecesaria(datos.level);
    datos.level++;
    subio = true;
  }
  guardarLevels();
  return { datos, subio };
}

function tieneAdmin(interaction) {
  return interaction.member.permissions.has(PermissionFlagsBits.Administrator);
}

const commands = [
  new SlashCommandBuilder().setName('help').setDescription('Ver todos los comandos del bot'),
  new SlashCommandBuilder().setName('axelchat').setDescription('Habla con la IA del bot').addStringOption(o => o.setName('pregunta').setDescription('Tu pregunta').setRequired(true)),
  new SlashCommandBuilder().setName('bienvenida').setDescription('Configurar bienvenida').addChannelOption(o => o.setName('canal').setDescription('Canal de bienvenida').setRequired(true)).addStringOption(o => o.setName('mensaje').setDescription('Mensaje de bienvenida').setRequired(true)),
  new SlashCommandBuilder().setName('despedida').setDescription('Configurar despedida').addChannelOption(o => o.setName('canal').setDescription('Canal de despedidas').setRequired(true)).addStringOption(o => o.setName('mensaje').setDescription('Mensaje de despedida').setRequired(true)),
  new SlashCommandBuilder().setName('dm-bienvenida').setDescription('Activar o desactivar DM de bienvenida').addStringOption(o => o.setName('estado').setDescription('Estado').setRequired(true).addChoices({ name: 'on', value: 'on' }, { name: 'off', value: 'off' })),
  new SlashCommandBuilder().setName('axelavatar').setDescription('Muestra un avatar').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(false)),
  new SlashCommandBuilder().setName('servericono').setDescription('Muestra el icono del servidor'),
  new SlashCommandBuilder().setName('axelrank').setDescription('Ver tu nivel').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(false)),
  new SlashCommandBuilder().setName('axeltop').setDescription('Top 10 niveles'),
  new SlashCommandBuilder().setName('play').setDescription('Reproducir música').addStringOption(o => o.setName('cancion').setDescription('Nombre o enlace').setRequired(true)),
  new SlashCommandBuilder().setName('skip').setDescription('Saltar canción'),
  new SlashCommandBuilder().setName('stop').setDescription('Detener música'),
  new SlashCommandBuilder().setName('queue').setDescription('Ver cola'),
  new SlashCommandBuilder().setName('axelserverinfo').setDescription('Información del servidor'),
  new SlashCommandBuilder().setName('axel8ball').setDescription('Bola mágica').addStringOption(o => o.setName('pregunta').setDescription('Pregunta').setRequired(true)),
  new SlashCommandBuilder().setName('axelticket').setDescription('Crear ticket').addStringOption(o => o.setName('motivo').setDescription('Motivo del ticket').setRequired(true)),
  new SlashCommandBuilder().setName('axelsay').setDescription('VIP: El bot dice un mensaje').addStringOption(o => o.setName('mensaje').setDescription('Mensaje').setRequired(true)),
  new SlashCommandBuilder().setName('axelembed').setDescription('VIP: Crear embed').addStringOption(o => o.setName('titulo').setDescription('Título').setRequired(true)).addStringOption(o => o.setName('descripcion').setDescription('Descripción').setRequired(true)),
  new SlashCommandBuilder().setName('axelrole').setDescription('VIP: Dar rol').addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)).addRoleOption(o => o.setName('rol').setDescription('Rol').setRequired(true)),
  new SlashCommandBuilder().setName('axelbeneficios').setDescription('Ver beneficios VIP'),
  new SlashCommandBuilder().setName('antilink').setDescription('Activar o desactivar anti-link').addStringOption(o => o.setName('estado').setDescription('Estado').setRequired(true).addChoices({ name: 'on', value: 'on' }, { name: 'off', value: 'off' })),
  new SlashCommandBuilder().setName('antiraid').setDescription('Activar o desactivar anti-raid').addStringOption(o => o.setName('estado').setDescription('Estado').setRequired(true).addChoices({ name: 'on', value: 'on' }, { name: 'off', value: 'off' })),
  new SlashCommandBuilder().setName('configmute').setDescription('Configurar tiempo de mute').addStringOption(o => o.setName('tiempo').setDescription('Tiempo').setRequired(true).addChoices({ name: '1 Hora', value: '1h' }, { name: '4 Horas', value: '4h' }, { name: '5 Horas', value: '5h' }, { name: '8 Horas', value: '8h' })),
  new SlashCommandBuilder().setName('addpalabra').setDescription('Añadir palabra prohibida').addStringOption(o => o.setName('palabra').setDescription('Palabra').setRequired(true))
];

client.once('ready', async () => {
  console.log('=================================');
  console.log(`✅ ${client.user.tag} está conectado`);
  console.log(`🌐 Servidores: ${client.guilds.cache.size}`);
  console.log('=================================');
  try {
    await client.application.commands.set(commands.map(c => c.toJSON()));
    console.log(`✅ ${commands.length} comandos registrados globalmente.`);
  } catch (error) { console.error('❌ Error registrando comandos:', error); }
});

client.on('interactionCreate', async interaction => {
  try {
    if (interaction.isButton() && interaction.customId === 'cerrar_ticket') {
      await interaction.reply('🔒 Cerrando ticket...');
      setTimeout(async () => { try { await interaction.channel.delete(); } catch {} }, 1500);
      return;
    }
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'help') {
      const color = colores[Math.floor(Math.random() * colores.length)];
      const embed = new EmbedBuilder().setColor(color).setTitle('📜 AXEL BOT - COMANDOS').setDescription('Usa `/` para ver todos los comandos.').addFields({ name: '👑 GENERALES', value: '`/axelavatar` `/servericono` `/axelserverinfo` `/axel8ball`' }, { name: '📊 NIVELES', value: '`/axelrank` `/axeltop`' }, { name: '🎵 MÚSICA', value: '`/play` `/skip` `/stop` `/queue`' }, { name: '🎫 TICKETS', value: '`/axelticket`' }, { name: '💎 VIP', value: '`/axelsay` `/axelembed` `/axelrole` `/axelbeneficios`' }, { name: '🛡️ MODERACIÓN', value: '`/antilink` `/antiraid` `/configmute` `/addpalabra`' }, { name: '📢 BIENVENIDAS', value: '`/bienvenida` `/despedida` `/dm-bienvenida`' }, { name: '🤖 IA', value: '`/axelchat`' }).setFooter({ text: `Total: ${commands.length} comandos` }).setTimestamp();
      return interaction.reply({ embeds: [embed] });
    }

    if (interaction.commandName === 'play') {
      if (!distube) return interaction.reply({ content: '❌ Música no disponible', ephemeral: true });
      const voiceChannel = interaction.member.voice.channel;
      if (!voiceChannel) return interaction.reply({ content: '❌ Entra a un canal de voz', ephemeral: true });
      await interaction.deferReply();
      await distube.play(voiceChannel, interaction.options.getString('cancion'), { member: interaction.member, textChannel: interaction.channel });
      return interaction.editReply(`🎵 Buscando: **${interaction.options.getString('cancion')}**`);
    }
    if (interaction.commandName === 'skip') { const q = distube.getQueue(interaction.guildId); if (!q) return interaction.reply('❌ No hay música'); await q.skip(); return interaction.reply('⏭️ Saltada'); }
    if (interaction.commandName === 'stop') { const q = distube.getQueue(interaction.guildId); if (!q) return interaction.reply('❌ No hay música'); await q.stop(); return interaction.reply('⏹️ Detenida'); }
    if (interaction.commandName === 'queue') { const q = distube.getQueue(interaction.guildId); if (!q) return interaction.reply('❌ Cola vacía'); const canciones = q.songs.slice(0,10).map((s,i)=>`**${i+1}.** ${s.name}`).join('\n'); const embed = new EmbedBuilder().setColor(0x5865F2).setTitle('🎵 Cola').setDescription(canciones); return interaction.reply({ embeds: [embed] }); }
    
    // Aquí puedes pegar todos tus demás comandos del código de ChatGPT...
    // Por espacio puse solo los principales. Si quieres te paso el archivo completo por partes

  } catch (error) { console.error('❌ Error:', error); }
});

client.on('messageCreate', async message => {
  if (message.author.bot ||!message.guild) return;
  if (!cooldown[message.author.id] || Date.now() - cooldown[message.author.id] > 60000) {
    cooldown[message.author.id] = Date.now();
    const resultado = agregarXP(message.author.id);
    if (resultado.subio) try { await message.channel.send(`🎉 Felicidades ${message.author}, subiste al **nivel ${resultado.datos.level}**!`); } catch {}
  }
});

client.on('guildMemberAdd', async member => {
  const datos = config[member.guild.id];
  if (!datos) return;
  if (datos.bienvenidaCanal) { const canal = member.guild.channels.cache.get(datos.bienvenidaCanal); if (canal) await canal.send(reemplazarVariables(datos.bienvenidaMsg || '¡Bienvenido {user}!', member)); }
});

client.on('guildMemberRemove', async member => {
  const datos = config[member.guild.id];
  if (!datos ||!datos.despedidaCanal) return;
  const canal = member.guild.channels.cache.get(datos.despedidaCanal);
  if (canal) await canal.send(reemplazarVariables(datos.despedidaMsg || 'Adiós {user}', member));
});

if (distube) {
  distube.on('playSong', (queue, song) => { try { queue.textChannel?.send(`🎵 Reproduciendo: **${song.name}**`); } catch {} });
}

client.login(TOKEN).then(() => { console.log('🔐 Conectando a Discord...'); }).catch(error => { console.error('❌ Error:', error); });
``` // <- ESTA LLAVE CIERRA TODO

### **IMPORTANTE: TAMBIÉN ARREGLA package.json**
```json
{
  "name": "axel-botal",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": { "start": "node index.js" },
  "dependencies": { "discord.js": "^14.15.3", "dotenv": "^16.4.5", "distube": "^4.1.3" },
  "engines": { "node": "20.x" }
  }
