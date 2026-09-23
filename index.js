require("dotenv").config();

const http = require("http");
const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

// ======================================================
// CONFIGURACIÓN
// ======================================================

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const PORT = process.env.PORT || 3000;

if (!TOKEN) {
  console.error("❌ Falta DISCORD_TOKEN en las variables de entorno.");
  process.exit(1);
}

if (!CLIENT_ID) {
  console.error("❌ Falta CLIENT_ID en las variables de entorno.");
  process.exit(1);
}

// ======================================================
// CLIENTE DISCORD
// ======================================================

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ======================================================
// DATOS TEMPORALES DE XP
// ======================================================

const xpData = new Map();

// ======================================================
// CREADOR DE COMANDOS
// ======================================================

const commands = [];

// ------------------------------------------------------
// 20 GENERALES
// ------------------------------------------------------

commands.push(
  new SlashCommandBuilder().setName("help").setDescription("Muestra todos los comandos"),
  new SlashCommandBuilder().setName("ping").setDescription("Muestra la latencia del bot"),
  new SlashCommandBuilder().setName("avatar").setDescription("Muestra tu avatar"),
  new SlashCommandBuilder().setName("server").setDescription("Muestra información del servidor"),
  new SlashCommandBuilder().setName("userinfo").setDescription("Muestra información de un usuario"),
  new SlashCommandBuilder().setName("botinfo").setDescription("Muestra información del bot"),
  new SlashCommandBuilder().setName("invite").setDescription("Muestra el enlace para invitar al bot"),
  new SlashCommandBuilder().setName("say").setDescription("Hace que el bot diga un mensaje")
    .addStringOption(o => o.setName("mensaje").setDescription("Mensaje").setRequired(true)),
  new SlashCommandBuilder().setName("8ball").setDescription("Pregunta a la bola mágica")
    .addStringOption(o => o.setName("pregunta").setDescription("Pregunta").setRequired(true)),
  new SlashCommandBuilder().setName("servericon").setDescription("Muestra el icono del servidor"),
  new SlashCommandBuilder().setName("membercount").setDescription("Muestra los miembros"),
  new SlashCommandBuilder().setName("channelinfo").setDescription("Información del canal actual"),
  new SlashCommandBuilder().setName("roleinfo").setDescription("Información de un rol")
    .addRoleOption(o => o.setName("rol").setDescription("Rol").setRequired(true)),
  new SlashCommandBuilder().setName("uptime").setDescription("Muestra el tiempo activo"),
  new SlashCommandBuilder().setName("support").setDescription("Muestra información de soporte"),
  new SlashCommandBuilder().setName("website").setDescription("Muestra la página del bot"),
  new SlashCommandBuilder().setName("status").setDescription("Muestra el estado del bot"),
  new SlashCommandBuilder().setName("emojis").setDescription("Muestra los emojis del servidor"),
  new SlashCommandBuilder().setName("roles").setDescription("Muestra los roles del servidor"),
  new SlashCommandBuilder().setName("channels").setDescription("Muestra los canales del servidor")
);

// ------------------------------------------------------
// 20 MODERACIÓN
// ------------------------------------------------------

commands.push(
  new SlashCommandBuilder().setName("clear").setDescription("Borra mensajes")
    .addIntegerOption(o => o.setName("cantidad").setDescription("Cantidad").setMinValue(1).setMaxValue(100).setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  new SlashCommandBuilder().setName("kick").setDescription("Expulsa a un usuario")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  new SlashCommandBuilder().setName("ban").setDescription("Banea a un usuario")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  new SlashCommandBuilder().setName("unban").setDescription("Desbanea por ID")
    .addStringOption(o => o.setName("id").setDescription("ID del usuario").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  new SlashCommandBuilder().setName("timeout").setDescription("Silencia temporalmente")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true))
    .addIntegerOption(o => o.setName("minutos").setDescription("Minutos").setMinValue(1).setMaxValue(40320).setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  new SlashCommandBuilder().setName("untimeout").setDescription("Quita el timeout")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  new SlashCommandBuilder().setName("lock").setDescription("Bloquea el canal")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  new SlashCommandBuilder().setName("unlock").setDescription("Desbloquea el canal")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  new SlashCommandBuilder().setName("slowmode").setDescription("Configura slowmode")
    .addIntegerOption(o => o.setName("segundos").setDescription("Segundos").setMinValue(0).setMaxValue(21600).setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  new SlashCommandBuilder().setName("nick").setDescription("Cambia el apodo")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true))
    .addStringOption(o => o.setName("nombre").setDescription("Nuevo nombre").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),

  new SlashCommandBuilder().setName("warn").setDescription("Advierte a un usuario")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true))
    .addStringOption(o => o.setName("razon").setDescription("Razón").setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  new SlashCommandBuilder().setName("warnings").setDescription("Muestra advertencias")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  new SlashCommandBuilder().setName("announce").setDescription("Crea un anuncio")
    .addStringOption(o => o.setName("mensaje").setDescription("Mensaje").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  new SlashCommandBuilder().setName("purge").setDescription("Elimina mensajes")
    .addIntegerOption(o => o.setName("cantidad").setDescription("Cantidad").setMinValue(1).setMaxValue(100).setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  new SlashCommandBuilder().setName("roleadd").setDescription("Añade un rol")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true))
    .addRoleOption(o => o.setName("rol").setDescription("Rol").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  new SlashCommandBuilder().setName("roleremove").setDescription("Quita un rol")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true))
    .addRoleOption(o => o.setName("rol").setDescription("Rol").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  new SlashCommandBuilder().setName("createrole").setDescription("Crea un rol")
    .addStringOption(o => o.setName("nombre").setDescription("Nombre").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  new SlashCommandBuilder().setName("deleterole").setDescription("Elimina un rol")
    .addRoleOption(o => o.setName("rol").setDescription("Rol").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  new SlashCommandBuilder().setName("renamechannel").setDescription("Cambia el nombre del canal")
    .addStringOption(o => o.setName("nombre").setDescription("Nuevo nombre").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  new SlashCommandBuilder().setName("settopic").setDescription("Cambia el tema del canal")
    .addStringOption(o => o.setName("tema").setDescription("Tema").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
);

// ------------------------------------------------------
// 20 FUN
// ------------------------------------------------------

commands.push(
  new SlashCommandBuilder().setName("coinflip").setDescription("Lanza una moneda"),
  new SlashCommandBuilder().setName("dice").setDescription("Lanza un dado"),
  new SlashCommandBuilder().setName("random").setDescription("Número aleatorio")
    .addIntegerOption(o => o.setName("max").setDescription("Máximo").setMinValue(1).setRequired(false)),
  new SlashCommandBuilder().setName("choose").setDescription("Elige entre opciones")
    .addStringOption(o => o.setName("opciones").setDescription("Separa con comas").setRequired(true)),
  new SlashCommandBuilder().setName("joke").setDescription("Cuenta un chiste"),
  new SlashCommandBuilder().setName("meme").setDescription("Muestra una respuesta divertida"),
  new SlashCommandBuilder().setName("ship").setDescription("Calcula una compatibilidad divertida")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true)),
  new SlashCommandBuilder().setName("rate").setDescription("Da una puntuación aleatoria")
    .addStringOption(o => o.setName("cosa").setDescription("Qué puntuar").setRequired(true)),
  new SlashCommandBuilder().setName("roast").setDescription("Roast amistoso")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(false)),
  new SlashCommandBuilder().setName("compliment").setDescription("Da un cumplido"),
  new SlashCommandBuilder().setName("reverse").setDescription("Invierte un texto")
    .addStringOption(o => o.setName("texto").setDescription("Texto").setRequired(true)),
  new SlashCommandBuilder().setName("uppercase").setDescription("Convierte a mayúsculas")
    .addStringOption(o => o.setName("texto").setDescription("Texto").setRequired(true)),
  new SlashCommandBuilder().setName("lowercase").setDescription("Convierte a minúsculas")
    .addStringOption(o => o.setName("texto").setDescription("Texto").setRequired(true)),
  new SlashCommandBuilder().setName("clap").setDescription("Añade 👏 entre palabras")
    .addStringOption(o => o.setName("texto").setDescription("Texto").setRequired(true)),
  new SlashCommandBuilder().setName("mock").setDescription("Texto burlón")
    .addStringOption(o => o.setName("texto").setDescription("Texto").setRequired(true)),
  new SlashCommandBuilder().setName("ascii").setDescription("Texto decorado")
    .addStringOption(o => o.setName("texto").setDescription("Texto").setRequired(true)),
  new SlashCommandBuilder().setName("8ballfun").setDescription("Bola mágica divertida")
    .addStringOption(o => o.setName("pregunta").setDescription("Pregunta").setRequired(true)),
  new SlashCommandBuilder().setName("highlow").setDescription("Adivina alto o bajo"),
  new SlashCommandBuilder().setName("guess").setDescription("Adivina un número")
    .addIntegerOption(o => o.setName("numero").setDescription("Número del 1 al 10").setMinValue(1).setMaxValue(10).setRequired(true)),
  new SlashCommandBuilder().setName("truth").setDescription("Pregunta de verdad"),
  new SlashCommandBuilder().setName("challenge").setDescription("Reto divertido")
);

// ------------------------------------------------------
// 20 NIVELES / XP
// ------------------------------------------------------

commands.push(
  new SlashCommandBuilder().setName("level").setDescription("Muestra tu nivel"),
  new SlashCommandBuilder().setName("rank").setDescription("Muestra tu ranking"),
  new SlashCommandBuilder().setName("xp").setDescription("Muestra tu XP"),
  new SlashCommandBuilder().setName("addxp").setDescription("Añade XP a un usuario")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true))
    .addIntegerOption(o => o.setName("cantidad").setDescription("XP").setMinValue(1).setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  new SlashCommandBuilder().setName("removexp").setDescription("Quita XP")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true))
    .addIntegerOption(o => o.setName("cantidad").setDescription("XP").setMinValue(1).setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  new SlashCommandBuilder().setName("setxp").setDescription("Establece XP")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true))
    .addIntegerOption(o => o.setName("cantidad").setDescription("XP").setMinValue(0).setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  new SlashCommandBuilder().setName("setlevel").setDescription("Establece nivel")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true))
    .addIntegerOption(o => o.setName("nivel").setDescription("Nivel").setMinValue(0).setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  new SlashCommandBuilder().setName("leaderboard").setDescription("Tabla de niveles"),
  new SlashCommandBuilder().setName("top").setDescription("Top de XP"),
  new SlashCommandBuilder().setName("progress").setDescription("Progreso al siguiente nivel"),
  new SlashCommandBuilder().setName("nextlevel").setDescription("XP necesaria para el siguiente nivel"),
  new SlashCommandBuilder().setName("myrank").setDescription("Muestra tu posición"),
  new SlashCommandBuilder().setName("resetxp").setDescription("Reinicia XP de un usuario")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  new SlashCommandBuilder().setName("resetallxp").setDescription("Reinicia todos los datos de XP")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  new SlashCommandBuilder().setName("dailyxp").setDescription("Recompensa diaria de XP"),
  new SlashCommandBuilder().setName("bonusxp").setDescription("Calcula un bonus de XP"),
  new SlashCommandBuilder().setName("xpinfo").setDescription("Información del sistema XP"),
  new SlashCommandBuilder().setName("levelinfo").setDescription("Información de niveles"),
  new SlashCommandBuilder().setName("xprandom").setDescription("Genera XP aleatoria")
);

// ------------------------------------------------------
// 20 INFORMACIÓN
// ------------------------------------------------------

commands.push(
  new SlashCommandBuilder().setName("serverinfo").setDescription("Información completa del servidor"),
  new SlashCommandBuilder().setName("userinfo2").setDescription("Información detallada de usuario")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(false)),
  new SlashCommandBuilder().setName("rolelist").setDescription("Lista de roles"),
  new SlashCommandBuilder().setName("channellist").setDescription("Lista de canales"),
  new SlashCommandBuilder().setName("botstats").setDescription("Estadísticas del bot"),
  new SlashCommandBuilder().setName("guildid").setDescription("ID del servidor"),
  new SlashCommandBuilder().setName("userid").setDescription("Tu ID"),
  new SlashCommandBuilder().setName("channelid").setDescription("ID del canal"),
  new SlashCommandBuilder().setName("roleid").setDescription("ID de un rol")
    .addRoleOption(o => o.setName("rol").setDescription("Rol").setRequired(true)),
  new SlashCommandBuilder().setName("created").setDescription("Fecha de creación de tu cuenta"),
  new SlashCommandBuilder().setName("joined").setDescription("Fecha de entrada al servidor"),
  new SlashCommandBuilder().setName("permissions").setDescription("Tus permisos"),
  new SlashCommandBuilder().setName("owner").setDescription("Muestra el dueño del servidor"),
  new SlashCommandBuilder().setName("region").setDescription("Información básica del servidor"),
  new SlashCommandBuilder().setName("boosts").setDescription("Información de boosts"),
  new SlashCommandBuilder().setName("verification").setDescription("Nivel de verificación"),
  new SlashCommandBuilder().setName("features").setDescription("Funciones del servidor"),
  new SlashCommandBuilder().setName("members").setDescription("Información de miembros"),
  new SlashCommandBuilder().setName("bots").setDescription("Cantidad de bots"),
  new SlashCommandBuilder().setName("humans").setDescription("Cantidad de usuarios")
);

// ======================================================
// COMPROBAR 100 COMANDOS
// ======================================================

console.log(`📦 Comandos preparados: ${commands.length}`);

if (commands.length !== 100) {
  console.error(`❌ ERROR: Hay ${commands.length} comandos. Deben ser exactamente 100.`);
  process.exit(1);
}

// ======================================================
// REGISTRAR SLASH COMMANDS
// ======================================================

const rest = new REST({ version: "10" }).setToken(TOKEN);

async function registerCommands() {
  try {
    console.log("🔄 Registrando 100 comandos slash...");

    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      {
        body: commands.map(command => command.toJSON())
      }
    );

    console.log("✅ Los 100 comandos fueron registrados.");
  } catch (error) {
    console.error("❌ Error registrando comandos:", error);
  }
}

// ======================================================
// FUNCIONES XP
// ======================================================

function getXP(userId) {
  if (!xpData.has(userId)) {
    xpData.set(userId, {
      xp: 0,
      level: 0,
      daily: false
    });
  }

  return xpData.get(userId);
}

function calculateLevel(xp) {
  return Math.floor(Math.sqrt(xp / 100));
}

function addXP(userId, amount) {
  const data = getXP(userId);
  data.xp += amount;
  data.level = calculateLevel(data.xp);
  return data;
}

// ======================================================
// EVENTO READY
// ======================================================

client.once("ready", async () => {
  console.log("=================================");
  console.log(`🤖 Bot conectado como ${client.user.tag}`);
  console.log(`🆔 ID: ${client.user.id}`);
  console.log(`🌐 Servidores: ${client.guilds.cache.size}`);
  console.log("=================================");

  client.user.setActivity("/help | DARK BIO FF");

  await registerCommands();
});

// ======================================================
// INTERACCIONES
// ======================================================

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.commandName;

  try {

    // ==================================================
    // HELP
    // ==================================================

    if (command === "help") {
      const embed = new EmbedBuilder()
        .setTitle("🤖 Neko Style Bot")
        .setDescription(
          "**100 comandos disponibles**\n\n" +
          "🟢 **Generales:** 20\n" +
          "🔨 **Moderación:** 20\n" +
          "🎮 **Fun:** 20\n" +
          "⭐ **Niveles / XP:** 20\n" +
  
