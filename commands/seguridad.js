const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits
} = require("discord.js");

const commands = [];


/* =========================================================
   /security
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("security")
    .setDescription("Muestra el estado de seguridad del servidor."),

  async execute(interaction) {
    const guild = interaction.guild;

    const embed = new EmbedBuilder()
      .setTitle("🛡️ Seguridad del servidor")
      .setDescription("Información básica de seguridad de DARK FF V1.")
      .addFields(
        {
          name: "🔐 Verificación",
          value: `${guild.verificationLevel}`,
          inline: true
        },
        {
          name: "👥 Miembros",
          value: `${guild.memberCount}`,
          inline: true
        },
        {
          name: "🤖 Bot",
          value: "DARK FF V1 activo",
          inline: true
        }
      )
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
});


/* =========================================================
   /setverification
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("setverification")
    .setDescription("Cambia el nivel de verificación del servidor.")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    )
    .addIntegerOption(option =>
      option
        .setName("nivel")
        .setDescription("Nivel de verificación")
        .setRequired(true)
        .addChoices(
          { name: "Ninguno", value: 0 },
          { name: "Bajo", value: 1 },
          { name: "Medio", value: 2 },
          { name: "Alto", value: 3 },
          { name: "Muy alto", value: 4 }
        )
    ),

  async execute(interaction) {
    const nivel =
      interaction.options.getInteger("nivel");

    const nombres = [
      "Ninguno",
      "Bajo",
      "Medio",
      "Alto",
      "Muy alto"
    ];

    await interaction.guild.setVerificationLevel(nivel);

    return interaction.reply(
      `🔐 Nivel de verificación cambiado a **${nombres[nivel]}**.`
    );
  }
});


/* =========================================================
   /lockdown
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("lockdown")
    .setDescription("Bloquea el canal actual para miembros.")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageChannels
    ),

  async execute(interaction) {
    const canal = interaction.channel;

    await canal.permissionOverwrites.edit(
      interaction.guild.roles.everyone,
      {
        SendMessages: false
      }
    );

    return interaction.reply(
      "🔒 **Canal bloqueado.** Los miembros no pueden enviar mensajes."
    );
  }
});


/* =========================================================
   /unlockdown
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("unlockdown")
    .setDescription("Desbloquea el canal actual.")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageChannels
    ),

  async execute(interaction) {
    const canal = interaction.channel;

    await canal.permissionOverwrites.edit(
      interaction.guild.roles.everyone,
      {
        SendMessages: null
      }
    );

    return interaction.reply(
      "🔓 **Canal desbloqueado.**"
    );
  }
});


/* =========================================================
   /antiraid
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("antiraid")
    .setDescription("Activa o desactiva el modo anti-raid.")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    )
    .addBooleanOption(option =>
      option
        .setName("estado")
        .setDescription("Activar o desactivar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const estado =
      interaction.options.getBoolean("estado");

    return interaction.reply(
      estado
        ? "🚨 **Anti-Raid activado.** Recuerda que este comando solo cambia el estado visual; para protección automática hay que conectar un sistema de detección."
        : "🟢 **Anti-Raid desactivado.**"
    );
  }
});


/* =========================================================
   /securitycheck
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("securitycheck")
    .setDescription("Realiza una revisión básica de seguridad."),

  async execute(interaction) {
    const guild = interaction.guild;

    const problemas = [];

    if (guild.verificationLevel === 0) {
      problemas.push("⚠️ Nivel de verificación bajo.");
    }

    if (!guild.systemChannel) {
      problemas.push("ℹ️ No hay canal del sistema configurado.");
    }

    const embed = new EmbedBuilder()
      .setTitle("🔎 Revisión de seguridad")
      .setDescription(
        problemas.length
          ? problemas.join("\n")
          : "✅ No se detectaron problemas básicos."
      )
      .addFields({
        name: "🛡️ Estado",
        value: problemas.length
          ? "Revisar configuración"
          : "Configuración básica correcta"
      })
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
});


/* =========================================================
   /permissions
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("permissions")
    .setDescription("Muestra tus permisos en el servidor.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario que quieres revisar")
        .setRequired(false)
    ),

  async execute(interaction) {
    const usuario =
      interaction.options.getUser("usuario") ||
      interaction.user;

    const miembro =
      await interaction.guild.members
        .fetch(usuario.id)
        .catch(() => null);

    if (!miembro) {
      return interaction.reply({
        content: "❌ Usuario no encontrado.",
        ephemeral: true
      });
    }

    const permisos = miembro.permissions.toArray();

    const lista = permisos.length
      ? permisos.map(p => `\`${p}\``).join(", ")
      : "Sin permisos especiales.";

    const embed = new EmbedBuilder()
      .setTitle(`🔐 Permisos de ${usuario.tag}`)
      .setDescription(lista.slice(0, 4000))
      .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
});


/* =========================================================
   /admincheck
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("admincheck")
    .setDescription("Comprueba si un usuario tiene permisos de administrador.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(false)
    ),

  async execute(interaction) {
    const usuario =
      interaction.options.getUser("usuario") ||
      interaction.user;

    const miembro =
      await interaction.guild.members
        .fetch(usuario.id)
        .catch(() => null);

    if (!miembro) {
      return interaction.reply({
        content: "❌ Usuario no encontrado.",
        ephemeral: true
      });
    }

    const admin =
      miembro.permissions.has(
        PermissionFlagsBits.Administrator
      );

    return interaction.reply(
      admin
        ? `👑 **${usuario.tag}** tiene permisos de administrador.`
        : `👤 **${usuario.tag}** no tiene permisos de administrador.`
    );
  }
});


/* =========================================================
   /botpermissions
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("botpermissions")
    .setDescription("Muestra los permisos que tiene DARK FF V1."),

  async execute(interaction) {
    const bot =
      interaction.guild.members.me;

    if (!bot) {
      return interaction.reply({
        content: "❌ No pude obtener mi información.",
        ephemeral: true
      });
    }

    const permisos =
      bot.permissions.toArray();

    const lista = permisos.length
      ? permisos.map(p => `\`${p}\``).join(", ")
      : "Sin permisos especiales.";

    const embed = new EmbedBuilder()
      .setTitle("🤖 Permisos de DARK FF V1")
      .setDescription(lista.slice(0, 4000))
      .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
});


/* =========================================================
   /securityhelp
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("securityhelp")
    .setDescription("Muestra los comandos de seguridad."),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("🛡️ DARK FF V1 — SEGURIDAD")
      .setDescription(
        "Herramientas para revisar y proteger la configuración del servidor."
      )
      .addFields(
        {
          name: "🔐 Protección",
          value:
            "`/security`\n`/securitycheck`\n`/antiraid`"
        },
        {
          name: "🔒 Canales",
          value:
            "`/lockdown`\n`/unlockdown`"
        },
        {
          name: "⚙️ Configuración",
          value:
            "`/setverification`"
        },
        {
          name: "👤 Permisos",
          value:
            "`/permissions`\n`/admincheck`\n`/botpermissions`"
        }
      )
      .setFooter({
        text: "DARK FF V1"
      })
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
});


/* =========================================================
   EXPORTACIÓN
========================================================= */

module.exports = commands;
