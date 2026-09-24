const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits
} = require("discord.js");

const commands = [
  new SlashCommandBuilder().setName("help").setDescription("Muestra los comandos"),
  new SlashCommandBuilder().setName("ping").setDescription("Muestra la latencia"),
  new SlashCommandBuilder().setName("botinfo").setDescription("Información del bot"),
  new SlashCommandBuilder().setName("serverinfo").setDescription("Información del servidor"),
  new SlashCommandBuilder().setName("userinfo").setDescription("Información de usuario")
    .addUserOption(o=>o.setName("usuario").setDescription("Usuario")),
  new SlashCommandBuilder().setName("avatar").setDescription("Muestra un avatar")
    .addUserOption(o=>o.setName("usuario").setDescription("Usuario")),
  new SlashCommandBuilder().setName("servericon").setDescription("Icono del servidor"),
  new SlashCommandBuilder().setName("members").setDescription("Número de miembros"),
  new SlashCommandBuilder().setName("roles").setDescription("Lista de roles"),
  new SlashCommandBuilder().setName("channels").setDescription("Lista de canales"),

  new SlashCommandBuilder().setName("kick").setDescription("Expulsa un usuario")
    .addUserOption(o=>o.setName("usuario").setDescription("Usuario").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  new SlashCommandBuilder().setName("ban").setDescription("Banea un usuario")
    .addUserOption(o=>o.setName("usuario").setDescription("Usuario").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  new SlashCommandBuilder().setName("clear").setDescription("Borra mensajes")
    .addIntegerOption(o=>o.setName("cantidad").setDescription("Cantidad").setMinValue(1).setMaxValue(100).setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  new SlashCommandBuilder().setName("timeout").setDescription("Aplica timeout")
    .addUserOption(o=>o.setName("usuario").setDescription("Usuario").setRequired(true))
    .addIntegerOption(o=>o.setName("minutos").setDescription("Minutos").setMinValue(1).setMaxValue(40320).setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  new SlashCommandBuilder().setName("untimeout").setDescription("Quita timeout")
    .addUserOption(o=>o.setName("usuario").setDescription("Usuario").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  new SlashCommandBuilder().setName("warn").setDescription("Advierte a un usuario")
    .addUserOption(o=>o.setName("usuario").setDescription("Usuario").setRequired(true))
    .addStringOption(o=>o.setName("razon").setDescription("Razón").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  new SlashCommandBuilder().setName("lock").setDescription("Bloquea el canal")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  new SlashCommandBuilder().setName("unlock").setDescription("Desbloquea el canal")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  new SlashCommandBuilder().setName("slowmode").setDescription("Configura slowmode")
    .addIntegerOption(o=>o.setName("segundos").setDescription("Segundos").setMinValue(0).setMaxValue(21600).setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  new SlashCommandBuilder().setName("say").setDescription("Envía un mensaje")
    .addStringOption(o=>o.setName("texto").setDescription("Texto").setRequired(true)),

  new SlashCommandBuilder().setName("embed").setDescription("Crea un embed")
    .addStringOption(o=>o.setName("texto").setDescription("Texto").setRequired(true)),

  new SlashCommandBuilder().setName("choose").setDescription("Elige una opción")
    .addStringOption(o=>o.setName("opciones").setDescription("Usa | para separar").setRequired(true)),

  new SlashCommandBuilder().setName("8ball").setDescription("Bola mágica")
    .addStringOption(o=>o.setName("pregunta").setDescription("Pregunta").setRequired(true)),

  new SlashCommandBuilder().setName("roll").setDescription("Lanza un dado")
    .addIntegerOption(o=>o.setName("caras").setDescription("Caras").setMinValue(2).setMaxValue(100)),

  new SlashCommandBuilder().setName("coinflip").setDescription("Lanza una moneda"),

  new SlashCommandBuilder().setName("calc").setDescription("Calculadora")
    .addStringOption(o=>o.setName("operacion").setDescription("Ejemplo: 5+5").setRequired(true)),

  new SlashCommandBuilder().setName("joke").setDescription("Broma"),
  new SlashCommandBuilder().setName("fact").setDescription("Dato curioso"),
  new SlashCommandBuilder().setName("quote").setDescription("Frase"),
  new SlashCommandBuilder().setName("motivate").setDescription("Motivación"),

  new SlashCommandBuilder().setName("hug").setDescription("Abrazo amistoso")
    .addUserOption(o=>o.setName("usuario").setDescription("Usuario").setRequired(true)),

  new SlashCommandBuilder().setName("highfive").setDescription("Choca los cinco")
    .addUserOption(o=>o.setName("usuario").setDescription("Usuario").setRequired(true)),

  new SlashCommandBuilder().setName("reverse").setDescription("Invierte texto")
    .addStringOption(o=>o.setName("texto").setDescription("Texto").setRequired(true)),

  new SlashCommandBuilder().setName("uppercase").setDescription("Mayúsculas")
    .addStringOption(o=>o.setName("texto").setDescription("Texto").setRequired(true)),

  new SlashCommandBuilder().setName("lowercase").setDescription("Minúsculas")
    .addStringOption(o=>o.setName("texto").setDescription("Texto").setRequired(true)),

  new SlashCommandBuilder().setName("random").setDescription("Número aleatorio")
    .addIntegerOption(o=>o.setName("min").setDescription("Mínimo").setRequired(true))
    .addIntegerOption(o=>o.setName("max").setDescription("Máximo").setRequired(true)),

  new SlashCommandBuilder().setName("color").setDescription("Color aleatorio"),
  new SlashCommandBuilder().setName("dice").setDescription("Dado"),
  new SlashCommandBuilder().setName("rate").setDescription("Puntúa algo")
    .addStringOption(o=>o.setName("texto").setDescription("Texto").setRequired(true)),

  new SlashCommandBuilder().setName("rank").setDescription("Muestra tu nivel"),
  new SlashCommandBuilder().setName("level").setDescription("Muestra tu nivel"),
  new SlashCommandBuilder().setName("xp").setDescription("Muestra tu XP"),
  new SlashCommandBuilder().setName("leaderboard").setDescription("Ranking de XP"),
  new SlashCommandBuilder().setName("daily").setDescription("Recompensa diaria"),
  new SlashCommandBuilder().setName("balance").setDescription("Muestra tus monedas"),

  new SlashCommandBuilder().setName("pay").setDescription("Paga monedas")
    .addUserOption(o=>o.setName("usuario").setDescription("Usuario").setRequired(true))
    .addIntegerOption(o=>o.setName("cantidad").setDescription("Cantidad").setMinValue(1).setRequired(true)),

  new SlashCommandBuilder().setName("work").setDescription("Trabaja y gana monedas"),
  new SlashCommandBuilder().setName("gamble").setDescription("Apuesta monedas")
    .addIntegerOption(o=>o.setName("cantidad").setDescription("Cantidad").setMinValue(1).setRequired(true)),

  new SlashCommandBuilder().setName("profile").setDescription("Tu perfil"),
  new SlashCommandBuilder().setName("stats").setDescription("Estadísticas"),
  new SlashCommandBuilder().setName("uptime").setDescription("Tiempo activo"),
  new SlashCommandBuilder().setName("status").setDescription("Estado del bot"),
  new SlashCommandBuilder().setName("node").setDescription("Versión de Node"),
  new SlashCommandBuilder().setName("discordjs").setDescription("Versión de Discord.js"),
  new SlashCommandBuilder().setName("time").setDescription("Hora actual"),
  new SlashCommandBuilder().setName("date").setDescription("Fecha actual"),
  new SlashCommandBuilder().setName("userid").setDescription("Tu ID"),
  new SlashCommandBuilder().setName("guildid").setDescription("ID del servidor"),
  new SlashCommandBuilder().setName("channelid").setDescription("ID del canal"),
  new SlashCommandBuilder().setName("botid").setDescription("ID del bot"),
  new SlashCommandBuilder().setName("commands").setDescription("Cantidad de comandos")
];

module.exports = commands.map(c=>c.toJSON());
