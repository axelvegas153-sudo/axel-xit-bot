require("dotenv").config();
const express = require("express");
const fs = require("fs");
const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits
} = require("discord.js");

// ================= CONFIG =================
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID || null;
const PORT = process.env.PORT || 3000;

if (!TOKEN || !CLIENT_ID) {
  console.error("❌ Faltan DISCORD_TOKEN o CLIENT_ID en Railway.");
  process.exit(1);
}

// ================= WEB =================
const app = express();
app.get("/", (_, res) => res.send("DARK BIO FF BOT ONLINE ✅"));
app.get("/health", (_, res) => res.json({ online: true }));
app.listen(PORT, "0.0.0.0", () =>
  console.log(`🌐 Web activa en puerto ${PORT}`)
);

// ================= DATABASE =================
const DB_FILE = "./database.json";

function loadDB() {
  try {
    if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, "{}");
    return JSON.parse(fs.readFileSync(DB_FILE, "utf8") || "{}");
  } catch {
    return {};
  }
}

let db = loadDB();

function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error("Error guardando DB:", e);
  }
}

function guildData(guildId) {
  if (!db[guildId]) {
    db[guildId] = {
      xp: {},
      warnings: {},
      economy: {},
      config: { automod: false }
    };
  }
  return db[guildId];
}

function userData(guildId, userId) {
  const g = guildData(guildId);
  if (!g.xp[userId]) g.xp[userId] = { xp: 0, level: 1 };
  if (!g.economy[userId]) {
    g.economy[userId] = { coins: 100, lastDaily: 0 };
  }
  if (!g.warnings[userId]) g.warnings[userId] = [];
  return {
    xp: g.xp[userId],
    economy: g.economy[userId],
    warnings: g.warnings[userId]
  };
}

// ================= CLIENT =================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ================= COMMANDS =================
const commands = [
  // -------- GENERALES --------
  new SlashCommandBuilder().setName("help")
    .setDescription("Muestra todos los comandos"),
  new SlashCommandBuilder().setName("ping")
    .setDescription("Muestra la latencia"),
  new SlashCommandBuilder().setName("botinfo")
    .setDescription("Información del bot"),
  new SlashCommandBuilder().setName("serverinfo")
    .setDescription("Información del servidor"),
  new SlashCommandBuilder().setName("userinfo")
    .setDescription("Información de un usuario")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(false)),
  new SlashCommandBuilder().setName("avatar")
    .setDescription("Muestra el avatar")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(false)),
  new SlashCommandBuilder().setName("banner")
    .setDescription("Muestra el banner de un usuario")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(false)),
  new SlashCommandBuilder().setName("servericon")
    .setDescription("Muestra el icono del servidor"),
  new SlashCommandBuilder().setName("members")
    .setDescription("Cantidad de miembros"),
  new SlashCommandBuilder().setName("roleinfo")
    .setDescription("Información de un rol")
    .addRoleOption(o => o.setName("rol").setDescription("Rol").setRequired(true)),
  new SlashCommandBuilder().setName("channelinfo")
    .setDescription("Información del canal"),
  new SlashCommandBuilder().setName("say")
    .setDescription("Repite un mensaje")
    .addStringOption(o => o.setName("texto").setDescription("Texto").setRequired(true)),
  new SlashCommandBuilder().setName("embed")
    .setDescription("Crea un embed")
    .addStringOption(o => o.setName("texto").setDescription("Texto").setRequired(true)),
  new SlashCommandBuilder().setName("choose")
    .setDescription("Elige entre opciones")
    .addStringOption(o => o.setName("opciones").setDescription("Separadas por |").setRequired(true)),
  new SlashCommandBuilder().setName("8ball")
    .setDescription("Pregunta a la bola mágica")
    .addStringOption(o => o.setName("pregunta").setDescription("Pregunta").setRequired(true)),
  new SlashCommandBuilder().setName("roll")
    .setDescription("Lanza un dado")
    .addIntegerOption(o => o.setName("caras").setDescription("Número de caras").setMinValue(2).setMaxValue(100).setRequired(false)),
  new SlashCommandBuilder().setName("coinflip")
    .setDescription("Lanza una moneda"),
  new SlashCommandBuilder().setName("calc")
    .setDescription("Calculadora")
    .addStringOption(o => o.setName("operacion").setDescription("Ej: 5+5*2").setRequired(true)),
  new SlashCommandBuilder().setName("uptime")
    .setDescription("Tiempo encendido del bot"),
  new SlashCommandBuilder().setName("support")
    .setDescription("Información de soporte"),

  // -------- MODERACIÓN --------
  new SlashCommandBuilder().setName("kick")
    .setDescription("Expulsa un usuario")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true))
    .addStringOption(o => o.setName("razon").setDescription("Razón").setRequired(false)),
  new SlashCommandBuilder().setName("ban")
    .setDescription("Banea un usuario")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true))
    .addStringOption(o => o.setName("razon").setDescription("Razón").setRequired(false)),
  new SlashCommandBuilder().setName("unban")
    .setDescription("Desbanea por ID")
    .addStringOption(o => o.setName("id").setDescription("ID").setRequired(true)),
  new SlashCommandBuilder().setName("timeout")
    .setDescription("Silencia temporalmente")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true))
    .addIntegerOption(o => o.setName("minutos").setDescription("Minutos").setMinValue(1).setMaxValue(40320).setRequired(true)),
  new SlashCommandBuilder().setName("untimeout")
    .setDescription("Quita el timeout")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true)),
  new SlashCommandBuilder().setName("clear")
    .setDescription("Borra mensajes")
    .addIntegerOption(o => o.setName("cantidad").setDescription("1-100").setMinValue(1).setMaxValue(100).setRequired(true)),
  new SlashCommandBuilder().setName("warn")
    .setDescription("Advierte a un usuario")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true))
    .addStringOption(o => o.setName("razon").setDescription("Razón").setRequired(true)),
  new SlashCommandBuilder().setName("warnings")
    .setDescription("Muestra advertencias")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(false)),
  new SlashCommandBuilder().setName("clearwarns")
    .setDescription("Borra advertencias")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true)),
  new SlashCommandBuilder().setName("lock")
    .setDescription("Bloquea el canal"),
  new SlashCommandBuilder().setName("unlock")
    .setDescription("Desbloquea el canal"),
  new SlashCommandBuilder().setName("slowmode")
    .setDescription("Configura slowmode")
    .addIntegerOption(o => o.setName("segundos").setDescription("0-21600").setMinValue(0).setMaxValue(21600).setRequired(true)),
  new SlashCommandBuilder().setName("nickname")
    .setDescription("Cambia el apodo")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true))
    .addStringOption(o => o.setName("nombre").setDescription("Nuevo nombre").setRequired(true)),
  new SlashCommandBuilder().setName("role")
    .setDescription("Añade o quita un rol")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true))
    .addRoleOption(o => o.setName("rol").setDescription("Rol").setRequired(true)),
  new SlashCommandBuilder().setName("automod")
    .setDescription("Activa o desactiva automod")
    .addBooleanOption(o => o.setName("estado").setDescription("Activado").setRequired(true)),
  new SlashCommandBuilder().setName("announce")
    .setDescription("Anuncio")
    .addStringOption(o => o.setName("texto").setDescription("Texto").setRequired(true)),
  new SlashCommandBuilder().setName("purgeuser")
    .setDescription("Borra mensajes recientes de un usuario")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true)),
  new SlashCommandBuilder().setName("serverlock")
    .setDescription("Bloquea el canal actual"),
  new SlashCommandBuilder().setName("serverunlock")
    .setDescription("Desbloquea el canal"),
  new SlashCommandBuilder().setName("modhelp")
    .setDescription("Ayuda de moderación"),

  // -------- FUN --------
  new SlashCommandBuilder().setName("joke")
    .setDescription("Broma"),
  new SlashCommandBuilder().setName("roast")
    .setDescription("Roast amistoso")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true)),
  new SlashCommandBuilder().setName("shipfriend")
    .setDescription("Compatibilidad de amistad")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true)),
  new SlashCommandBuilder().setName("hug")
    .setDescription("Abrazo amistoso")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true)),
  new SlashCommandBuilder().setName("pat")
    .setDescription("Acaricia amistosamente")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true)),
  new SlashCommandBuilder().setName("highfive")
    .setDescription("Choca los cinco")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true)),
  new SlashCommandBuilder().setName("rps")
    .setDescription("Piedra papel tijera")
    .addStringOption(o => o.setName("eleccion").setDescription("piedra/papel/tijera").setRequired(true)),
  new SlashCommandBuilder().setName("reverse")
    .setDescription("Invierte texto")
    .addStringOption(o => o.setName("texto").setDescription("Texto").setRequired(true)),
  new SlashCommandBuilder().setName("uppercase")
    .setDescription("Mayúsculas")
    .addStringOption(o => o.setName("texto").setDescription("Texto").setRequired(true)),
  new SlashCommandBuilder().setName("lowercase")
    .setDescription("Minúsculas")
    .addStringOption(o => o.setName("texto").setDescription("Texto").setRequired(true)),
  new SlashCommandBuilder().setName("random")
    .setDescription("Número aleatorio")
    .addIntegerOption(o => o.setName("min").setDescription("Mínimo").setRequired(true))
    .addIntegerOption(o => o.setName("max").setDescription("Máximo").setRequired(true)),
  new SlashCommandBuilder().setName("color")
    .setDescription("Color aleatorio"),
  new SlashCommandBuilder().setName("fact")
    .setDescription("Dato curioso"),
  new SlashCommandBuilder().setName("motivate")
    .setDescription("Mensaje motivador"),
  new SlashCommandBuilder().setName("quote")
    .setDescription("Frase"),
  new SlashCommandBuilder().setName("dice")
    .setDescription("Dado de 6 caras"),
  new SlashCommandBuilder().setName("rate")
    .setDescription("Puntúa algo")
    .addStringOption(o => o.setName("texto").setDescription("Qué puntuar").setRequired(true)),
  new SlashCommandBuilder().setName("truth")
    .setDescription("Pregunta de verdad"),
  new SlashCommandBuilder().setName("challenge")
    .setDescription("Reto divertido"),
  new SlashCommandBuilder().setName("clap")
    .setDescription("Aplausos"),
  new SlashCommandBuilder().setName("mock")
    .setDescription("Texto alternado")
    .addStringOption(o => o.setName("texto").setDescription("Texto").setRequired(true)),
  new SlashCommandBuilder().setName("sayrandom")
    .setDescription("Mensaje aleatorio"),

  // -------- XP / NIVELES --------
  new SlashCommandBuilder().setName("rank")
    .setDescription("Muestra tu nivel")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(false)),
  new SlashCommandBuilder().setName("level")
    .setDescription("Muestra tu nivel"),
  new SlashCommandBuilder().setName("xp")
    .setDescription("Muestra tu XP"),
  new SlashCommandBuilder().setName("leaderboard")
    .setDescription("Ranking de XP"),
  new SlashCommandBuilder().setName("top")
    .setDescription("Top de niveles"),
  new SlashCommandBuilder().setName("daily")
    .setDescription("Recompensa diaria"),
  new SlashCommandBuilder().setName("balance")
    .setDescription("Muestra tus monedas")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(false)),
  new SlashCommandBuilder().setName("pay")
    .setDescription("Paga monedas")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true))
    .addIntegerOption(o => o.setName("cantidad").setDescription("Cantidad").setMinValue(1).setRequired(true)),
  new SlashCommandBuilder().setName("givecoins")
    .setDescription("Da monedas")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true))
    .addIntegerOption(o => o.setName("cantidad").setDescription("Cantidad").setMinValue(1).setRequired(true)),
  new SlashCommandBuilder().setName("addxp")
    .setDescription("Añade XP")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true))
    .addIntegerOption(o => o.setName("cantidad").setDescription("Cantidad").setMinValue(1).setRequired(true)),
  new SlashCommandBuilder().setName("setxp")
    .setDescription("Establece XP")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true))
    .addIntegerOption(o => o.setName("cantidad").setDescription("Cantidad").setMinValue(0).setRequired(true)),
  new SlashCommandBuilder().setName("economy")
    .setDescription("Información de economía"),
  new SlashCommandBuilder().setName("work")
    .setDescription("Trabaja y gana monedas"),
  new SlashCommandBuilder().setName("crime")
    .setDescription("Intenta ganar monedas"),
  new SlashCommandBuilder().setName("gamble")
    .setDescription("Juego de azar simple")
    .addIntegerOption(o => o.setName("cantidad").setDescription("Cantidad").setMinValue(1).setRequired(true)),
  new SlashCommandBuilder().setName("resetxp")
    .setDescription("Reinicia XP")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true)),
  new SlashCommandBuilder().setName("resetmoney")
    .setDescription("Reinicia monedas")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true)),
  new SlashCommandBuilder().setName("profile")
    .setDescription("Perfil del usuario")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(false)),
  new SlashCommandBuilder().setName("stats")
    .setDescription("Estadísticas"),
  new SlashCommandBuilder().setName("cooldowns")
    .setDescription("Información de recompensas"),

  // -------- INFORMACIÓN --------
  new SlashCommandBuilder().setName("roles")
    .setDescription("Lista de roles"),
  new SlashCommandBuilder().setName("channels")
    .setDescription("Lista de canales"),
  new SlashCommandBuilder().setName("bots")
    .setDescription("Cantidad de bots"),
  new SlashCommandBuilder().setName("humans")
    .setDescription("Cantidad de humanos"),
  new SlashCommandBuilder().setName("created")
    .setDescription("Fecha de creación de tu cuenta"),
  new SlashCommandBuilder().setName("joined")
    .setDescription("Fecha de entrada al servidor")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(false)),
  new SlashCommandBuilder().setName("permissions")
    .setDescription("Tus permisos"),
  new SlashCommandBuilder().setName("serverowner")
    .setDescription("Dueño del servidor"),
  new SlashCommandBuilder().setName("boosters")
    .setDescription("Lista de boosters"),
  new SlashCommandBuilder().setName("online")
    .setDescription("Miembros conectados"),
  new SlashCommandBuilder().setName("status")
    .setDescription("Estado del bot"),
  new SlashCommandBuilder().setName("node")
    .setDescription("Versión de Node"),
  new SlashCommandBuilder().setName("discordjs")
    .setDescription("Versión de Discord.js"),
  new SlashCommandBuilder().setName("time")
    .setDescription("Hora del sistema"),
  new SlashCommandBuilder().setName("date")
    .setDescription("Fecha del sistema"),
  new SlashCommandBuilder().setName("guildid")
    .setDescription("ID del servidor"),
  new SlashCommandBuilder().setName("userid")
    .setDescription("Tu ID"),
  new SlashCommandBuilder().setName("channelid")
    .setDescription("ID del canal"),
  new SlashCommandBuilder().setName("roleid")
    .setDescription("Muestra el ID de un rol")
    .addRoleOption(o => o.setName("rol").setDescription("Rol").setRequired(true)),
  new SlashCommandBuilder().setName("botid")
    .setDescription("ID del bot"),
  new SlashCommandBuilder().setName("commands")
    .setDescription("Cantidad de comandos")
].map(c => c.toJSON());

// ================= HELP =================
const helpText = `**DARK BIO FF — COMANDOS**

⚙️ GENERALES
/help /ping /botinfo /serverinfo /userinfo /avatar
/banner /servericon /members /roleinfo /channelinfo /say
/embed /choose /8ball /roll /coinflip /calc /uptime /support

🛡️ MODERACIÓN
/kick /ban /unban /timeout /untimeout /clear /warn
/warnings /clearwarns /lock /unlock /slowmode /nickname /role
/automod /announce /purgeuser /serverlock /serverunlock /modhelp

🎮 FUN
/joke /roast /shipfriend /hug /pat /highfive /rps
/reverse /uppercase /lowercase /random /color /fact /motivate
/quote /dice /rate /truth /challenge /clap /mock /sayrandom

⭐ XP Y ECONOMÍA
/rank /level /xp /leaderboard /top /daily /balance /pay
/givecoins /addxp /setxp /economy /work /crime /gamble
/resetxp /resetmoney /profile /stats /cooldowns

ℹ️ INFORMACIÓN
/roles /channels /bots /humans /created /joined /permissions
/serverowner /boosters /online /status /node /discordjs /time
/date /guildid /userid /channelid /roleid /botid /commands`;

function hasPerm(i, p) {
  return i.memberPermissions?.has(p);
}

async function deny(i) {
  return i.reply({ content: "❌ No tienes permisos para usar este comando.", ephemeral: true });
}

function safeCalc(str) {
  if (!/^[0-9+\-*/().%\s]+$/.test(str)) return null;
  try {
    const tokens = str.match(/(\d+(?:\.\d+)?)|[+\-*/%()]/g);
    if (!tokens) return null;
    const prec = { "+": 1, "-": 1, "*": 2, "/": 2, "%": 2 };
    const out = [], ops = [];
    for (const t of tokens) {
      if (!isNaN(t)) out.push(Number(t));
      else if (t === "(") ops.push(t);
      else if (t === ")") {
        while (ops.length && ops.at(-1) !== "(") out.push(ops.pop());
        if (ops.pop() !== "(") return null;
      } else {
        while (ops.length && ops.at(-1) !== "(" &&
          prec[ops.at(-1)] >= prec[t]) out.push(ops.pop());
        ops.push(t);
      }
    }
    while (ops.length) {
      if (ops.at(-1) === "(") return null;
      out.push(ops.pop());
    }
    const s = [];
    for (const t of out) {
      if (typeof t === "number") s.push(t);
      else {
        const b = s.pop(), a = s.pop();
        if (a === undefined || b === undefined) return null;
        if (t === "+") s.push(a + b);
        if (t === "-") s.push(a - b);
        if (t === "*") s.push(a * b);
        if (t === "/") s.push(a / b);
        if (t === "%") s.push(a % b);
      }
    }
    return s.length === 1 && Number.isFinite(s[0]) ? s[0] : null;
  } catch { return null; }
}

// ================= READY =================
client.once("ready", async () => {
  console.log(`✅ ${client.user.tag} conectado.`);
  const rest = new REST({ version: "10" }).setToken(TOKEN);

  try {
    if (GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        { body: commands }
      );
      console.log(`✅
