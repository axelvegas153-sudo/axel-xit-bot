require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = '1552176112497336340';
const app = express();
app.use(express.json());
app.use(express.static('public'));
app.listen(process.env.PORT || 3000, () => console.log('Axel XIT BOT Web encendida'));

let db = fs.existsSync('./database.json')? JSON.parse(fs.readFileSync('./database.json')) : {};
function saveDB() { fs.writeFileSync('./database.json', JSON.stringify(db, null, 2)); }

// ========== 12 IDIOMAS ==========
const lang = {
  es: { name: '🇪🇸 Español', ping: 'Pong!', help: 'Comandos disponibles', welcome: 'Bienvenido {user}!', lang: 'Idioma cambiado a Español 🇪🇸', auto_on: 'Auto MOD ACTIVADO', auto_off: 'Auto MOD DESACTIVADO', ia_on: 'Modo IA ACTIVADO', ia_off: 'Modo IA DESACTIVADO' },
  en: { name: '🇺🇸 English', ping: 'Pong!', help: 'Available commands', welcome: 'Welcome {user}!', lang: 'Language changed to English 🇺🇸', auto_on: 'Auto MOD ENABLED', auto_off: 'Auto MOD DISABLED', ia_on: 'AI Mode ENABLED', ia_off: 'AI Mode DISABLED' },
  pt: { name: '🇧🇷 Português', ping: 'Pong!', help: 'Comandos disponíveis', welcome: 'Bem-vindo {user}!', lang: 'Idioma alterado para Português 🇧🇷', auto_on: 'Auto MOD ATIVADO', auto_off: 'Auto MOD DESATIVADO', ia_on: 'Modo IA ATIVADO', ia_off: 'Modo IA DESATIVADO' },
  fr: { name: '🇫🇷 Français', ping: 'Pong!', help: 'Commandes disponibles', welcome: 'Bienvenue {user}!', lang: 'Langue changée en Français 🇫🇷', auto_on: 'Auto MOD ACTIVÉ', auto_off: 'Auto MOD DÉSACTIVÉ', ia_on: 'Mode IA ACTIVÉ', ia_off: 'Mode IA DÉSACTIVÉ' },
  de: { name: '🇩🇪 Deutsch', ping: 'Pong!', help: 'Verfügbare Befehle', welcome: 'Willkommen {user}!', lang: 'Sprache geändert zu Deutsch 🇩🇪', auto_on: 'Auto MOD AKTIVIERT', auto_off: 'Auto MOD DEAKTIVIERT', ia_on: 'KI-Modus AKTIVIERT', ia_off: 'KI-Modus DEAKTIVIERT' },
  it: { name: '🇮🇹 Italiano', ping: 'Pong!', help: 'Comandi disponibili', welcome: 'Benvenuto {user}!', lang: 'Lingua cambiata in Italiano 🇮🇹', auto_on: 'Auto MOD ATTIVATO', auto_off: 'Auto MOD DISATTIVATO', ia_on: 'Modalità IA ATTIVATA', ia_off: 'Modalità IA DISATTIVATA' },
  jp: { name: '🇯🇵 日本語', ping: 'ポン!', help: '利用可能なコマンド', welcome: 'ようこそ {user}!', lang: '言語を日本語に変更しました 🇯🇵', auto_on: '自動MOD有効', auto_off: '自動MOD無効', ia_on: 'AIモード有効', ia_off: 'AIモード無効' },
  kr: { name: '🇰🇷 한국어', ping: '퐁!', help: '사용 가능한 명령어', welcome: '{user}님 환영합니다!', lang: '언어가 한국어로 변경되었습니다 🇰🇷', auto_on: '자동 MOD 활성화', auto_off: '자동 MOD 비활성화', ia_on: 'AI 모드 활성화', ia_off: 'AI 모드 비활성화' },
  cn: { name: '🇨🇳 中文', ping: '乒!', help: '可用命令', welcome: '欢迎 {user}!', lang: '语言已更改为中文 🇨🇳', auto_on: '自动MOD已启用', auto_off: '自动MOD已禁用', ia_on: 'AI模式已启用', ia_off: 'AI模式已禁用' },
  ru: { name: '🇷🇺 Русский', ping: 'Понг!', help: 'Доступные команды', welcome: 'Добро пожаловать {user}!', lang: 'Язык изменен на Русский 🇷🇺', auto_on: 'Авто МОД ВКЛ', auto_off: 'Авто МОД ВЫКЛ', ia_on: 'Режим ИИ ВКЛ', ia_off: 'Режим ИИ ВЫКЛ' },
  ar: { name: '🇸🇦 العربية', ping: 'بونغ!', help: 'الأوامر المتاحة', welcome: 'مرحبا {user}!', lang: 'تم تغيير اللغة إلى العربية 🇸🇦', auto_on: 'تم تفعيل المود التلقائي', auto_off: 'تم إلغاء المود التلقائي', ia_on: 'تم تفعيل وضع الذكاء الاصطناعي', ia_off: 'تم إلغاء وضع الذكاء الاصطناعي' },
  hi: { name: '🇮🇳 हिंदी', ping: 'पोंग!', help: 'उपलब्ध कमांड', welcome: 'स्वागत है {user}!', lang: 'भाषा हिंदी में बदल दी गई 🇮🇳', auto_on: 'ऑटो MOD सक्षम', auto_off: 'ऑटो MOD अक्षम', ia_on: 'AI मोड सक्षम', ia_off: 'AI मोड अक्षम' }
};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ========== COMANDOS ==========
const commands = [
  new SlashCommandBuilder().setName('ping').setDescription('Ver latencia'),
  new SlashCommandBuilder().setName('help').setDescription('Ver comandos'),
  new SlashCommandBuilder().setName('hola').setDescription('Saludar'),
  new SlashCommandBuilder().setName('dado').setDescription('Tirar dado'),
  new SlashCommandBuilder().setName('user').setDescription('Info usuario').addUserOption(o => o.setName('usuario').setRequired(false)),
  new SlashCommandBuilder().setName('server').setDescription('Info servidor'),
  new SlashCommandBuilder().setName('avatar').setDescription('Ver avatar').addUserOption(o => o.setName('usuario').setRequired(false)),
  new SlashCommandBuilder().setName('clear').setDescription('Borrar mensajes').addIntegerOption(o => o.setName('cantidad').setRequired(true)),
  new SlashCommandBuilder().setName('kick').setDescription('Expulsar').addUserOption(o => o.setName('usuario').setRequired(true)),
  new SlashCommandBuilder().setName('ban').setDescription('Banear').addUserOption(o => o.setName('usuario').setRequired(true)),
  new SlashCommandBuilder().setName('warn').setDescription('Advertir').addUserOption(o => o.setName('usuario').setRequired(true)).addStringOption(o => o.setName('motivo').setRequired(true)),
  new SlashCommandBuilder().setName('automod').setDescription('Activar Auto MOD').addStringOption(o => o.setName('estado').setRequired(true).addChoices({name: 'ON', value: 'on'}, {name: 'OFF', value: 'off'})),
  new SlashCommandBuilder().setName('ia').setDescription('Activar/Desactivar IA').addStringOption(o => o.setName('estado').setRequired(true).addChoices({name: 'ON', value: 'on'}, {name: 'OFF', value: 'off'})),
  new SlashCommandBuilder().setName('ask').setDescription('Preguntarle a la IA').addStringOption(o => o.setName('pregunta').setRequired(true)),
  new SlashCommandBuilder().setName('lenguaje').setDescription('Cambiar idioma del servidor')
   .addStringOption(o => o.setName('idioma').setDescription('Elige idioma').setRequired(true)
     .addChoices(
        { name: '🇪🇸 Español', value: 'es' },
        { name: '🇺🇸 English', value: 'en' },
        { name: '🇧🇷 Português', value: 'pt' },
        { name: '🇫🇷 Français', value: 'fr' },
        { name: '🇩🇪 Deutsch', value: 'de' },
        { name: '🇮🇹 Italiano', value: 'it' },
        { name: '🇯🇵 日本語', value: 'jp' },
        { name: '🇰🇷 한국어', value: 'kr' },
        { name: '🇨🇳 中文', value: 'cn' },
        { name: '🇷🇺 Русский', value: 'ru' },
        { name: '🇸🇦 العربية', value: 'ar' },
        { name: '🇮🇳 हिंदी', value: 'hi' }
      ))
].map(c => c.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

client.once('ready', async () => {
  console.log(`✅ Axel XIT BOT encendido: ${client.user.tag}`);
  await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
  console.log('Comandos / registrados');
});

// ========== AUTO MOD + IA ==========
client.on('messageCreate', async message => {
  if (message.author.bot) return;
  const guildId = message.guild.id;
  if (!db[guildId]) db[guildId] = { lang: 'es', automod: false, ia: false, warns: {} };

  // AUTO MOD
  if (db[guildId].automod) {
    const badWords = ['nword', 'puta', 'mierda', 'link'];
    const msg = message.content.toLowerCase();
    if (msg.includes('http://') || msg.includes('https://') || msg.includes('discord.gg')) {
      message.delete();
      message.channel.send(`${message.author} Links prohibidos por Auto MOD`).then(m => setTimeout(() => m.delete(), 3000));
      return;
    }
    if (badWords.some(word => msg.includes(word))) {
      message.delete();
      db[guildId].warns[message.author.id] = (db[guildId].warns[message.author.id] || 0) + 1;
      saveDB();
      message.channel.send(`${message.author} Lenguaje no permitido. Warns: ${db[guildId].warns[message.author.id]}/3`).then(m => setTimeout(() => m.delete(), 5000));
      if (db[guildId].warns[message.author.id] >= 3) {
        message.member.kick('3 advertencias');
        message.channel.send(`${message.author.tag} fue expulsado`);
      }
    }
  }

  // IA
  if (db[guildId].ia && message.mentions.has(client.user)) {
    const pregunta = message.content.replace(`<@${client.user.id}>`, '').trim();
    await message.channel.sendTyping();
    const respuestas = [`IA Axel: Sobre "${pregunta}" te puedo ayudar`, `Buena pregunta! Respecto a ${pregunta}...`, `Según yo: ${pregunta} depende del contexto`];
    message.reply(respuestas[Math.floor(Math.random() * respuestas.length)]);
  }
});

// ========== INTERACCIONES ==========
client.on('interactionCreate', async i => {
  if (!i.isChatInputCommand()) return;
  const guildId = i.guild.id;
  if (!db[guildId]) db[guildId] = { lang: 'es', automod: false, ia: false, warns: {} };
  const idioma = db[guildId].lang;
  const t = lang[idioma];

  await i.deferReply();

  if (i.commandName === 'ping') return i.editReply(`${t.ping} ${client.ws.ping}ms`);
  if (i.commandName === 'help') return i.editReply(`${t.help}\n/ping /help /hola /dado /user /server /avatar /clear /kick /ban /warn /automod /ia /ask /lenguaje`);
  if (i.commandName === 'hola') return i.editReply(t.welcome.replace('{user}', i.user.username));
  if (i.commandName === 'dado') return i.editReply(`${Math.floor(Math.random() * 6) + 1} 🎲`);

  if (i.commandName === 'user') {
    const user = i.options.getUser('usuario') || i.user;
    const embed = new EmbedBuilder().setTitle('Info Usuario').setThumbnail(user.displayAvatarURL()).addFields({name: 'Nombre', value: user.tag}, {name: 'ID', value: user.id});
    return i.editReply({ embeds: [embed] });
  }

  if (i.commandName === 'server') {
    const embed = new EmbedBuilder().setTitle('Info Servidor').addFields({name: 'Nombre', value: i.guild.name}, {name: 'Miembros', value: `${i.guild.memberCount}`});
    return i.editReply({ embeds: [embed] });
  }

  if (i.commandName === 'avatar') {
    const user = i.options.getUser('usuario') || i.user;
    return i.editReply(user.displayAvatarURL({ size: 512 }));
  }

  if (i.commandName === 'clear') {
    if (!i.member.permissions.has(PermissionFlagsBits.ManageMessages)) return i.editReply('No tienes permisos');
    const amount = i.options.getInteger('cantidad');
    await i.channel.bulkDelete(amount);
    return i.editReply(`Borré ${amount} mensajes`);
  }

  if (i.commandName === 'kick') {
    if (!i.member.permissions.has(PermissionFlagsBits.KickMembers)) return i.editReply('No tienes permisos');
    const user = i.options.getUser('usuario');
    const member = await i.guild.members.fetch(user.id);
    await member.kick();
    return i.editReply(`Expulsé a ${user.tag}`);
  }

  if (i.commandName === 'ban') {
    if (!i.member.permissions.has(PermissionFlagsBits.BanMembers)) return i.editReply('No tienes permisos');
    const user = i.options.getUser('usuario');
    await i.guild.members.ban(user.id);
    return i.editReply(`Baneé a ${user.tag}`);
  }

  if (i.commandName === 'warn') {
    if (!i.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return i.editReply('No tienes permisos');
    const user = i.options.getUser('usuario');
    const motivo = i.options.getString('motivo');
    db[guildId].warns[user.id] = (db[guildId].warns[user.id] || 0) + 1;
    saveDB();
    return i.editReply(`Advertí a ${user.tag}. Motivo: ${motivo}. Warns: ${db[guildId].warns[user.id]}`);
  }

  if (i.commandName === 'automod') {
    const estado = i.options.getString('estado');
    db[guildId].automod = estado === 'on';
    saveDB();
    return i.editReply(estado === 'on'? t.auto_on : t.auto_off);
  }

  if (i.commandName === 'ia') {
    const estado = i.options.getString('estado');
    db[guildId].ia = estado === 'on';
    saveDB();
    return i.editReply(estado === 'on'? t.ia_on : t.ia_off);
  }

  if (i.commandName === 'ask') {
    const pregunta = i.options.getString('pregunta');
    await i.editReply(`🤖 IA Axel: Sobre "${pregunta}"... Respuesta generada`);
  }

  if (i.commandName === 'lenguaje') {
    const newLang = i.options.getString('idioma');
    db[guildId].lang = newLang;
    saveDB();
    return i.editReply(lang[newLang].lang);
  }
});

client.login(TOKEN);
