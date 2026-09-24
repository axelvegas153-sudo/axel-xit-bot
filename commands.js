const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const commands = [
  // INFO
  new SlashCommandBuilder().setName("help").setDescription("Muestra todos los comandos del bot"),
  new SlashCommandBuilder().setName("ping").setDescription("Muestra la latencia del bot"),
  new SlashCommandBuilder().setName("botinfo").setDescription("Información del bot"),
  new SlashCommandBuilder().setName("serverinfo").setDescription("Información del servidor"),
  new SlashCommandBuilder().setName("userinfo").setDescription("Información de un usuario").addUserOption(o=>o.setName("usuario").setDescription("Usuario")),
  new SlashCommandBuilder().setName("avatar").setDescription("Muestra el avatar de un usuario").addUserOption(o=>o.setName("usuario").setDescription("Usuario")),
  new SlashCommandBuilder().setName("servericon").setDescription("Muestra el icono del servidor"),
  new SlashCommandBuilder().setName("members").setDescription("Muestra el número de miembros"),
  new SlashCommandBuilder().setName("roles").setDescription("Lista todos los roles del servidor"),
  new SlashCommandBuilder().setName("channels").setDescription("Lista todos los canales"),

  // MODERACIÓN
  new SlashCommandBuilder().setName("kick").setDescription("Expulsa a un usuario").addUserOption(o=>o.setName("usuario").setDescription("Usuario").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  new SlashCommandBuilder().setName("ban").setDescription("Banea a un usuario").addUserOption(o=>o.setName("usuario").setDescription("Usuario").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  new SlashCommandBuilder().setName("clear").setDescription("Borra mensajes").addIntegerOption(o=>o.setName("cantidad").setDescription("Cantidad 1-100").setMinValue(1).setMaxValue(100).setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  new SlashCommandBuilder().setName("timeout").setDescription("Aplica timeout a un usuario").addUserOption(o=>o.setName("usuario").setDescription("Usuario").setRequired(true)).addIntegerOption(o=>o.setName("minutos").setDescription("Minutos").setMinValue(1).setMaxValue(40320).setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  new SlashCommandBuilder().setName("untimeout").setDescription("Quita el timeout a un usuario").addUserOption(o=>o.setName("usuario").setDescription("Usuario").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  // UTILS
  new SlashCommandBuilder().setName("Mensaje bot").setDescription("Hace que el bot diga algo").addStringOption(o=>o.setName("texto").setDescription("Texto").setRequired(true)),
  new SlashCommandBuilder().setName("choose").setDescription("Elige una opción al azar").addStringOption(o=>o.setName("opciones").setDescription("Separa con | ej: pizza|hamburguesa").setRequired(true)),
  new SlashCommandBuilder().setName("8ball").setDescription("Bola mágica").addStringOption(o=>o.setName("pregunta").setDescription("Haz tu pregunta").setRequired(true)),
  new SlashCommandBuilder().setName("roll").setDescription("Lanza un dado").addIntegerOption(o=>o.setName("caras").setDescription("Número de caras").setMinValue(2).setMaxValue(100)),
  new SlashCommandBuilder().setName("coinflip").setDescription("Lanza una moneda"),
  new SlashCommandBuilder().setName("calc").setDescription("Calculadora").addStringOption(o=>o.setName("operacion").setDescription("Ejemplo: 5+5*2").setRequired(true)),
  new SlashCommandBuilder().setName("random").setDescription("Número aleatorio").addIntegerOption(o=>o.setName("min").setDescription("Mínimo").setRequired(true)).addIntegerOption(o=>o.setName("max").setDescription("Máximo").setRequired(true)),

  // NIVEL + ECONOMIA
  new SlashCommandBuilder().setName("rank").setDescription("Muestra tu nivel").addUserOption(o=>o.setName("usuario").setDescription("Usuario")),
  new SlashCommandBuilder().setName("xp").setDescription("Muestra tu XP").addUserOption(o=>o.setName("usuario").setDescription("Usuario")),
  new SlashCommandBuilder().setName("leaderboard").setDescription("Top 10 de XP del servidor"),
  new SlashCommandBuilder().setName("daily").setDescription("Reclama tu recompensa diaria"),
  new SlashCommandBuilder().setName("balance").setDescription("Muestra tus monedas"),
  new SlashCommandBuilder().setName("pay").setDescription("Envía monedas a alguien").addUserOption(o=>o.setName("usuario").setDescription("Usuario").setRequired(true)).addIntegerOption(o=>o.setName("cantidad").setDescription("Cantidad").setMinValue(1).setRequired(true)),
  new SlashCommandBuilder().setName("work").setDescription("Trabaja y gana monedas"),
  new SlashCommandBuilder().setName("gamble").setDescription("Apuesta tus monedas").addIntegerOption(o=>o.setName("cantidad").setDescription("Cantidad").setMinValue(1).setRequired(true)),
  new SlashCommandBuilder().setName("profile").setDescription("Muestra tu perfil"),

  // DARK FF EXCLUSIVOS
  new SlashCommandBuilder().setName("lenguaje").setDescription("Cambia el idioma del bot").addStringOption(o=>o.setName("idioma").setDescription("Idioma").setRequired(true).addChoices({name: "Español", value: "es"}, {name: "English", value: "en"})),
  new SlashCommandBuilder().setName("ia").setDescription("Pregúntale cualquier cosa a la IA").addStringOption(o=>o.setName("pregunta").setDescription("Qué quieres saber").setRequired(true)),
  new SlashCommandBuilder().setName("ask").setDescription("Pregúntale cualquier cosa a la IA").addStringOption(o=>o.setName("pregunta").setDescription("Qué quieres saber").setRequired(true)),
  new SlashCommandBuilder().setName("crear").setDescription("Crea una imagen con IA").addStringOption(o=>o.setName("prompt").setDescription("Describe la imagen: ej: Goku anime 4k").setRequired(true)),
  new SlashCommandBuilder().setName("funar").setDescription("Funa a alguien sin groserías").addUserOption(o=>o.setName("usuario").setDescription("A quien funar").setRequired(true)).addStringOption(o=>o.setName("motivo").setDescription("Por qué")),
  new SlashCommandBuilder().setName("push").setDescription("Empuja a alguien").addUserOption(o=>o.setName("usuario").setDescription("A quien empujar").setRequired(true)),
  new SlashCommandBuilder().setName("punch").setDescription("Golpea a alguien").addUserOption(o=>o.setName("usuario").setDescription("A quien golpear").setRequired(true)),
  new SlashCommandBuilder().setName("ship").setDescription("Mide la compatibilidad entre 2 personas").addUserOption(o=>o.setName("persona1").setDescription("Primera persona").setRequired(true)).addUserOption(o=>o.setName("persona2").setDescription("Segunda persona").setRequired(true)),
  new SlashCommandBuilder().setName("afk").setDescription("Ponerte en ausente").addStringOption(o=>o.setName("motivo").setDescription("Razón por la que estás AFK")),
  new SlashCommandBuilder().setName("birthday-set").setDescription("Poner tu fecha de cumpleaños").addStringOption(o=>o.setName("fecha").setDescription("Formato: DD/MM").setRequired(true)),
  new SlashCommandBuilder().setName("birthday-setup").setDescription("Configurar canal y rol de cumpleaños").addChannelOption(o=>o.setName("canal").setDescription("Canal de felicitaciones").setRequired(true)).addRoleOption(o=>o.setName("rol").setDescription("Rol Cumpleañero").setRequired(true)),
  new SlashCommandBuilder().setName("ticket-setup").setDescription("Enviar panel de tickets").addChannelOption(o=>o.setName("canal").setDescription("Canal donde enviar panel").setRequired(true)),
  new SlashCommandBuilder().setName("ticket-close").setDescription("Cerrar el ticket actual"),
];

module.exports = commands.map(c=>c.toJSON());
