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

// =====================================================
// CONFIGURACIÓN RAILWAY
// =====================================================

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID || "1552176112497336340";
const PORT = process.env.PORT || 3000;

if (!TOKEN) {
  console.error("❌ Falta TOKEN en Railway.");
  process.exit(1);
}

// =====================================================
// SERVIDOR WEB
// =====================================================

const app = express();

app.get("/", (req, res) => {
  res.send("🤖 Faisal Bot está online.");
});

app.get("/health", (req, res) => {
  res.json({
    status: "online",
    bot: "Faisal Bot"
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌐 Web activa en puerto ${PORT}`);
});

// =====================================================
// BASE DE DATOS
// =====================================================

const DB_FILE = "./database.json";

let db = {};

try {
  if (fs.existsSync(DB_FILE)) {
    db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  }
} catch (error) {
  console.error("❌ Error leyendo database.json");
  db = {};
}

function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error("❌ Error guardando database:", error);
  }
}

function getGuild(guildId) {
  if (!db[guildId]) {
    db[guildId] = {
      automod: false,
      warns: {},
      economy: {},
      levels: {},
      inventory: {},
      language: "es"
    };
  }

  return db[guildId];
}

function getUser(guildId, userId) {
  const guild = getGuild(guildId);

  if (!guild.economy[userId]) {
    guild.economy[userId] = {
      coins: 100
    };
  }

  if (!guild.levels[userId]) {
    guild.levels[userId] = {
      xp: 0,
      level: 1
    };
  }

  if (!guild.inventory[userId]) {
    guild.inventory[userId] = [];
  }

  return {
    economy: guild.economy[userId],
    level: guild.levels[userId],
    inventory: guild.inventory[userId]
  };
}

// =====================================================
// CLIENT
// =====================================================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// =====================================================
// 100 COMANDOS
// =====================================================

const commands = [

  // ==============================
  // 1-20 UTILIDAD
  // ==============================

  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Ver la latencia"),

  new SlashCommandBuilder()
    .setName("help")
    .setDescription("Ver todos los comandos"),

  new SlashCommandBuilder()
    .setName("hola")
    .setDescription("Saludar"),

  new SlashCommandBuilder()
    .setName("dado")
    .setDescription("Lanzar un dado"),

  new SlashCommandBuilder()
    .setName("moneda")
    .setDescription("Lanzar una moneda"),

  new SlashCommandBuilder()
    .setName("8ball")
    .setDescription("Preguntar a la bola 8")
    .addStringOption(o =>
      o.setName("pregunta")
        .setDescription("Tu pregunta")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Ver avatar")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("user")
    .setDescription("Información de usuario")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("server")
    .setDescription("Información del servidor"),

  new SlashCommandBuilder()
    .setName("botinfo")
    .setDescription("Información del bot"),

  new SlashCommandBuilder()
    .setName("say")
    .setDescription("Enviar un mensaje")
    .addStringOption(o =>
      o.setName("texto")
        .setDescription("Mensaje")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("choose")
    .setDescription("Elegir una opción")
    .addStringOption(o =>
      o.setName("opciones")
        .setDescription("Separa las opciones con |")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("reverse")
    .setDescription("Invertir texto")
    .addStringOption(o =>
      o.setName("texto")
        .setDescription("Texto")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("calc")
    .setDescription("Calculadora básica")
    .addNumberOption(o =>
      o.setName("numero1")
        .setDescription("Primer número")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("operador")
        .setDescription("Operador")
        .setRequired(true)
        .addChoices(
          { name: "+ Suma", value: "+" },
          { name: "- Resta", value: "-" },
          { name: "× Multiplicación", value: "*" },
          { name: "÷ División", value: "/" }
        )
    )
    .addNumberOption(o =>
      o.setName("numero2")
        .setDescription("Segundo número")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("dice")
    .setDescription("Dado personalizado")
    .addIntegerOption(o =>
      o.setName("caras")
        .setDescription("Número de caras")
        .setMinValue(2)
        .setMaxValue(100)
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("clap")
    .setDescription("Aplaudir"),

  new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("Cara o cruz"),

  new SlashCommandBuilder()
    .setName("time")
    .setDescription("Ver hora del servidor"),

  new SlashCommandBuilder()
    .setName("channel")
    .setDescription("Información del canal"),

  new SlashCommandBuilder()
    .setName("role")
    .setDescription("Información de un rol")
    .addRoleOption(o =>
      o.setName("rol")
        .setDescription("Rol")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Crear invitación del bot"),

  // ==============================
  // 21-40 MODERACIÓN
  // ==============================

  new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Borrar mensajes")
    .addIntegerOption(o =>
      o.setName("cantidad")
        .setDescription("Cantidad")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Expulsar usuario")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Banear usuario")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Desbanear usuario")
    .addStringOption(o =>
      o.setName("id")
        .setDescription("ID")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Aplicar timeout")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName("minutos")
        .setDescription("Minutos")
        .setMinValue(1)
        .setMaxValue(40320)
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("untimeout")
    .setDescription("Quitar timeout")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Advertir usuario")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("motivo")
        .setDescription("Motivo")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("Ver advertencias")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("unwarn")
    .setDescription("Quitar advertencia")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Bloquear canal"),

  new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Desbloquear canal"),

  new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("Cambiar slowmode")
    .addIntegerOption(o =>
      o.setName("segundos")
        .setDescription("Segundos")
        .setMinValue(0)
        .setMaxValue(21600)
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("nick")
    .setDescription("Cambiar nickname")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("nombre")
        .setDescription("Nuevo nombre")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("roleadd")
    .setDescription("Añadir rol")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .addRoleOption(o =>
      o.setName("rol")
        .setDescription("Rol")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("roleremove")
    .setDescription("Quitar rol")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .addRoleOption(o =>
      o.setName("rol")
        .setDescription("Rol")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("automod")
    .setDescription("Activar AutoMod")
    .addStringOption(o =>
      o.setName("estado")
        .setDescription("Estado")
        .setRequired(true)
        .addChoices(
          { name: "ON", value: "on" },
          { name: "OFF", value: "off" }
        )
    ),

  new SlashCommandBuilder()
    .setName("announce")
    .setDescription("Crear anuncio")
    .addStringOption(o =>
      o.setName("mensaje")
        .setDescription("Mensaje")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("serverlock")
    .setDescription("Bloquear canal actual"),

  new SlashCommandBuilder()
    .setName("serverunlock")
    .setDescription("Desbloquear canal actual"),

  new SlashCommandBuilder()
    .setName("modinfo")
    .setDescription("Información de moderación"),

  new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Eliminar mensajes rápidamente")
    .addIntegerOption(o =>
      o.setName("cantidad")
        .setDescription("Cantidad")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    ),

  // ==============================
  // 41-60 DIVERSIÓN
  // ==============================

  new SlashCommandBuilder()
    .setName("meme")
    .setDescription("Meme"),

  new SlashCommandBuilder()
    .setName("joke")
    .setDescription("Chiste"),

  new SlashCommandBuilder()
    .setName("fact")
    .setDescription("Dato curioso"),

  new SlashCommandBuilder()
    .setName("ship")
    .setDescription("Compatibilidad")
    .addUserOption(o =>
      o.setName("usuario1")
        .setDescription("Usuario 1")
        .setRequired(true)
    )
    .addUserOption(o =>
      o.setName("usuario2")
        .setDescription("Usuario 2")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("hug")
    .setDescription("Abrazo amistoso")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("highfive")
    .setDescription("Chocar los cinco")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("pat")
    .setDescription("Palmadita amistosa")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("poke")
    .setDescription("Toquecito")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("ppt")
    .setDescription("Piedra papel tijera")
    .addStringOption(o =>
      o.setName("eleccion")
        .setDescription("Elección")
        .setRequired(true)
        .addChoices(
          { name: "🪨 Piedra", value: "piedra" },
          { name: "📄 Papel", value: "papel" },
          { name: "✂️ Tijera", value: "tijera" }
        )
    ),

  new SlashCommandBuilder()
    .setName("random")
    .setDescription("Número aleatorio")
    .addIntegerOption(o =>
      o.setName("max")
        .setDescription("Máximo")
        .setMinValue(1)
        .setMaxValue(1000000)
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("rate")
    .setDescription("Dar porcentaje a algo")
    .addStringOption(o =>
      o.setName("texto")
        .setDescription("Texto")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("choose2")
    .setDescription("Elegir entre dos")
    .addStringOption(o =>
      o.setName("opcion1")
        .setDescription("Opción 1")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("opcion2")
        .setDescription("Opción 2")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("compliment")
    .setDescription("Dar cumplido amistoso")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("roast")
    .setDescription("Broma ligera")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("truth")
    .setDescription("Pregunta de verdad"),

  new SlashCommandBuilder()
    .setName("challenge")
    .setDescription("Desafío divertido"),

  new SlashCommandBuilder()
    .setName("fortune")
    .setDescription("Fortuna aleatoria"),

  new SlashCommandBuilder()
    .setName("magic")
    .setDescription("Respuesta mágica"),

  new SlashCommandBuilder()
    .setName("emoji")
    .setDescription("Emoji aleatorio"),

  new SlashCommandBuilder()
    .setName("color")
    .setDescription("Color hexadecimal aleatorio"),

  new SlashCommandBuilder()
    .setName("quote")
    .setDescription("Frase aleatoria"),

  // ==============================
  // 61-80 ECONOMÍA / NIVELES
  // ==============================

  new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Ver monedas")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Recompensa diaria"),

  new SlashCommandBuilder()
    .setName("work")
    .setDescription("Trabajar"),

  new SlashCommandBuilder()
    .setName("pay")
    .setDescription("Enviar monedas")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName("cantidad")
        .setDescription("Cantidad")
        .setMinValue(1)
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("shop")
    .setDescription("Ver tienda"),

  new SlashCommandBuilder()
    .setName("buy")
    .setDescription("Comprar artículo")
    .addStringOption(o =>
      o.setName("item")
        .setDescription("Artículo")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("inventory")
    .setDescription("Ver inventario"),

  new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Top de monedas"),

  new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Ver nivel")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("xp")
    .setDescription("Ver XP")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("leveltop")
    .setDescription("Top de niveles"),

  new SlashCommandBuilder()
    .setName("givecoins")
    .setDescription("Dar monedas")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName("cantidad")
        .setDescription("Cantidad")
        .setMinValue(1)
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("resetcoins")
    .setDescription("Reiniciar monedas")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Ver perfil"),

  new SlashCommandBuilder()
    .setName("rep")
    .setDescription("Dar reputación")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("economy")
    .setDescription("Información de economía"),

  new SlashCommandBuilder()
    .setName("levelinfo")
    .setDescription("Información de niveles"),

  new SlashCommandBuilder()
    .setName("mycoins")
    .setDescription("Ver tus monedas"),

  new SlashCommandBuilder()
    .setName("myxp")
    .setDescription("Ver tu XP"),

  new SlashCommandBuilder()
    .setName("myinventory")
    .setDescription("Ver tu inventario"),

  // ==============================
  // 81-100 INFORMACIÓN / CONFIG
  // ==============================

  new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Estadísticas del servidor"),

  new SlashCommandBuilder()
    .setName("members")
    .setDescription("Cantidad de miembros"),

  new SlashCommandBuilder()
    .setName("roles")
    .setDescription("Lista de roles"),

  new SlashCommandBuilder()
    .setName("channels")
    .setDescription("Lista de canales"),

  new SlashCommandBuilder()
    .setName("owner")
    .setDescription("Ver propietario"),

  new SlashCommandBuilder()
    .setName("created")
    .setDescription("Fecha de creación del servidor"),

  new SlashCommandBuilder()
    .setName("config")
    .setDescription("Ver configuración"),

  new SlashCommandBuilder()
    .setName("language")
    .setDescription("Idioma actual"),

  new SlashCommandBuilder()
    .setName("setlanguage")
    .setDescription("Cambiar idioma")
    .addStringOption(o =>
      o.setName("idioma")
        .setDescription("Idioma")
        .setRequired(true)
        .addChoices(
          { name: "🇪🇸 Español", value: "es" },
          { name: "🇺🇸 English", value: "en" },
          { name: "🇧🇷 Português", value: "pt" }
        )
    ),

  new SlashCommandBuilder()
    .setName("support")
    .setDescription("Información de soporte"),

  new SlashCommandBuilder()
    .setName("status")
    .setDescription("Estado del bot"),

  new SlashCommandBuilder()
    .setName("uptime")
    .setDescription("Tiempo encendido"),

  new SlashCommandBuilder()
    .setName("commands")
    .setDescription("Cantidad de comandos"),

  new SlashCommandBuilder()
    .setName("guilds")
    .setDescription("Servidores del bot")
