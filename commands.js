const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const commands = [
  // INFO
  new SlashCommandBuilder().setName("help").setDescription("Muestra los comandos"),
  new SlashCommandBuilder().setName("ping").setDescription("Muestra la latencia"),
  new SlashCommandBuilder().setName("botinfo").setDescription("Información del bot"),
  new SlashCommandBuilder().setName("serverinfo").setDescription("Información del servidor"),
  new SlashCommandBuilder().setName("userinfo").setDescription("Información de usuario").addUserOption(o=>o.setName("usuario").setDescription("Usuario")),
  new SlashCommandBuilder().setName("avatar").setDescription("Muestra un avatar").addUserOption(o=>o.setName("usuario").setDescription("Usuario")),
  new SlashCommandBuilder().setName("servericon").setDescription("Icono del servidor"),
  new SlashCommandBuilder().setName("members").setDescription("Número de miembros"),
  new SlashCommandBuilder().setName("roles").setDescription("Lista de roles"),
  new SlashCommandBuilder().setName("channels").setDescription("Lista de canales"),

  // MOD
  new SlashCommandBuilder().setName("kick").setDescription("Expulsa un usuario").addUserOption(o=>o.setName("usuario").setDescription("Usuario").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  new SlashCommandBuilder().setName("ban").setDescription("Banea un usuario").addUserOption(o=>o.setName("usuario").setDescription("Usuario").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  new SlashCommandBuilder().setName("clear").setDescription("Borra mensajes").addIntegerOption(o=>o.setName("cantidad").setDescription("Cantidad").setMinValue(1).setMaxValue(100).setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  new SlashCommandBuilder().setName("timeout").setDescription("Aplica timeout").addUserOption(o=>o.setName("usuario").setDescription("Usuario").setRequired(true)).addIntegerOption(o=>o.setName("minutos").setDescription("Minutos").setMinValue(1).setMaxValue(40320).setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  new SlashCommandBuilder().setName("untimeout").setDescription("Quita timeout").addUserOption(o=>o.setName("usuario").setDescription("Usuario").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  new SlashCommandBuilder().setName("warn").setDescription("Advierte a un usuario").addUserOption(o=>o.setName("usuario").setDescription("Usuario").setRequired(true)).addStringOption(o=>o.setName("razon").setDescription("Razón").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  new SlashCommandBuilder().setName("lock").setDescription("Bloquea el canal").setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  new SlashCommandBuilder().setName("unlock").setDescription("Desbloquea el canal").setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  new SlashCommandBuilder().setName("slowmode").setDescription("Configura slowmode").addIntegerOption(o=>o.setName("segundos").setDescription("Segundos").setMinValue(0).setMaxValue(21600).setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  // UTILS
  new SlashCommandBuilder().setName("say").setDescription("Envía un mensaje").addStringOption(o=>o.setName("texto").setDescription("Texto").setRequired(true)), // ARREGLADO
  new SlashCommandBuilder().setName("embed").setDescription("Crea un embed").addStringOption(o=>o.setName("texto").setDescription("Texto").setRequired(true)),
  new SlashCommandBuilder().setName("choose").setDescription("Elige una opción").addStringOption(o=>o.setName("opciones").setDescription("Usa | para separar").setRequired(true)),
  new SlashCommandBuilder().setName("8ball").setDescription("Bola mágica").addStringOption(o=>o.setName("pregunta").setDescription("Pregunta").setRequired(true)),
  new SlashCommandBuilder().setName("roll").setDescription("Lanza un dado").addIntegerOption(o=>o.setName("caras").setDescription("Caras").setMinValue(2).setMaxValue(100)), // ARREGLADO
  new SlashCommandBuilder().setName("coinflip").setDescription("Lanza una moneda"),
  new SlashCommandBuilder().setName("calc").setDescription("Calculadora").addStringOption(o=>o.setName("operacion").setDescription("Ejemplo: 5+5").setRequired(true)), // ARREGLADO
  new SlashCommandBuilder().setName("random").setDescription("Número aleatorio").addIntegerOption(o=>o.setName("min").setDescription("Mínimo").setRequired(true)).addIntegerOption(o=>o.setName("max").setDescription("Máximo").setRequired(true)),

  // NIVEL + ECONOMIA
  new SlashCommandBuilder().setName("rank").setDescription("Muestra tu nivel").addUserOption(o=>o.setName("usuario").setDescription("Usuario")),
  new SlashCommandBuilder().setName("xp").setDescription("Muestra tu XP").addUserOption(o=>o.setName("usuario").setDescription("Usuario")),
  new SlashCommandBuilder().setName("leaderboard").setDescription("Ranking de XP"),
  new SlashCommandBuilder().setName("daily").setDescription("Recompensa diaria"),
  new SlashCommandBuilder().setName("balance").setDescription("Muestra tus monedas"),
  new SlashCommandBuilder().setName("pay").setDescription("Paga monedas").addUserOption(o=>o.setName("usuario").setDescription("Usuario").setRequired(true)).addIntegerOption(o=>o.setName("cantidad").setDescription("Cantidad").setMinValue(1).setRequired(true)),
  new SlashCommandBuilder().setName("work").setDescription("Trabaja y gana monedas"),
  new SlashCommandBuilder().setName("gamble").setDescription("Apuesta monedas").addIntegerOption(o=>o.setName("cantidad").setDescription("Cantidad").setMinValue(1).setRequired(true)),
  new SlashCommandBuilder().setName("profile").setDescription("Tu perfil"),

  // NUEVOS DARK FF
  new SlashCommandBuilder().setName("lenguaje").setDescription("Cambia el idioma del bot").addStringOption(o=>o.setName("idioma").setDescription("Idioma").setRequired(true).addChoices({name: "Español", value: "es"}, {name: "English", value: "en"})),
  new SlashCommandBuilder().setName("ia").setDescription("Pregúntale cualquier cosa a la IA").addStringOption(o=>o.setName("pregunta").setDescription("Qué quieres saber").setRequired(true)),
  new SlashCommandBuilder().setName("ask").setDescription("Pregúntale cualquier cosa a la IA").addStringOption(o=>o.setName("pregunta").setDescription("Qué quieres saber").setRequired(true)),
  new SlashCommandBuilder().setName("crear").setDescription("Crea una imagen con IA").addStringOption(o=>o.setName("prompt").setDescription("Describe: ej: Goku anime 4k").setRequired(true)),
  new SlashCommandBuilder().setName("funar").setDescription("Funa a alguien sin groserías").addUserOption(o=>o.setName("usuario").setDescription("A quien funar").setRequired(true)).addStringOption(o=>o.setName("motivo").setDescription("Por qué")),
  new SlashCommandBuilder().setName("push").setDescription("Empuja a alguien").addUserOption(o=>o.setName("usuario").setDescription("A quien empujar").setRequired(true)),
  new SlashCommandBuilder().setName("punch").setDescription("Golpea a alguien").addUserOption(o=>o.setName("usuario").setDescription("A quien golpear").setRequired(true)),
  new SlashCommandBuilder().setName("ship").setDescription("Mide el amor entre 2 personas").addUserOption(o=>o.setName("persona1").setDescription("Primera persona").setRequired(true)).addUserOption(o=>o.setName("persona2").setDescription("Segunda persona").setRequired(true)),
  new SlashCommandBuilder().setName("afk").setDescription("Ponerte en ausente").addStringOption(o=>o.setName("motivo").setDescription("Razón por la que estás AFK")),
  new SlashCommandBuilder().setName("birthday-set").setDescription("Poner tu fecha de cumpleaños").addStringOption(o=>o.setName("fecha").setDescription("Formato: DD/MM").setRequired(true)),
  new SlashCommandBuilder().setName("birthday-setup").setDescription("Configurar canal y rol de cumple").addChannelOption(o=>o.setName("canal").setDescription("Canal de felicitaciones").setRequired(true)).addRoleOption(o=>o.setName("rol").setDescription("Rol Cumpleañero").setRequired(true)),
  new SlashCommandBuilder().setName("ticket-setup").setDescription("Panel de tickets").addChannelOption(o=>o.setName("canal").setDescription("Canal donde enviar panel").setRequired(true)),
  new SlashCommandBuilder().setName("ticket-close").setDescription("Cerrar el ticket actual"),
];

module.exports = commands.map(c=>c.toJSON());
