const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "database.json");

const OWNER_ID = process.env.OWNER_ID || "1483521913429950658";

function cargarDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify({}, null, 2));
    }

    const contenido = fs.readFileSync(DB_PATH, "utf8");

    return contenido.trim()
      ? JSON.parse(contenido)
      : {};
  } catch {
    return {};
  }
}

function guardarDB(db) {
  fs.writeFileSync(
    DB_PATH,
    JSON.stringify(db, null, 2)
  );
}

function prepararPremium(db) {
  if (!db.premium) {
    db.premium = {
      usuarios: {},
      servidores: {},
      configuracion: {
        activado: true
      }
    };
  }

  if (!db.premium.usuarios) {
    db.premium.usuarios = {};
  }

  if (!db.premium.servidores) {
    db.premium.servidores = {};
  }

  if (!db.premium.configuracion) {
    db.premium.configuracion = {
      activado: true
    };
  }
}

function esOwner(interaction) {
  return interaction.user.id === OWNER_ID;
}

function tienePremiumUsuario(db, userId) {
  const premium = db.premium?.usuarios?.[userId];

  if (!premium) return false;

  if (premium.expira && Date.now() > premium.expira) {
    delete db.premium.usuarios[userId];
    guardarDB(db);
    return false;
  }

  return premium.activo === true;
}

function tienePremiumServidor(db, guildId) {
  const premium = db.premium?.servidores?.[guildId];

  if (!premium) return false;

  if (premium.expira && Date.now() > premium.expira) {
    delete db.premium.servidores[guildId];
    guardarDB(db);
    return false;
  }

  return premium.activo === true;
}

const commands = [];

/* =========================================================
   /premium
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("premium")
    .setDescription("Muestra tu estado Premium"),

  async execute(interaction) {
    const db = cargarDB();
    prepararPremium(db);

    const usuarioPremium = tienePremiumUsuario(
      db,
      interaction.user.id
    );

    const servidorPremium = interaction.guildId
      ? tienePremiumServidor(db, interaction.guildId)
      : false;

    const embed = new EmbedBuilder()
      .setTitle("💎 DARK FF V1 Premium")
      .setDescription(
        usuarioPremium || servidorPremium
          ? "✨ Tienes acceso a funciones Premium."
          : "🔒 Actualmente no tienes Premium."
      )
      .addFields(
        {
          name: "👤 Premium personal",
          value: usuarioPremium ? "🟢 Activo" : "🔴 Inactivo",
          inline: true
        },
        {
          name: "🏠 Premium del servidor",
          value: servidorPremium ? "🟢 Activo" : "🔴 Inactivo",
          inline: true
        }
      )
      .setColor(0xf1c40f);

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
});

/* =========================================================
   /premiuminfo
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("premiuminfo")
    .setDescription("Muestra información sobre Premium"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("💎 DARK FF V1 Premium")
      .setDescription(
        "Premium permite habilitar funciones especiales del bot."
      )
      .addFields(
        {
          name: "⚡ Funciones",
          value:
            "• Funciones Premium\n" +
            "• Configuraciones avanzadas\n" +
            "• Características exclusivas\n" +
            "• Acceso a futuras funciones Premium"
        },
        {
          name: "🔐 Activación",
          value:
            "Las activaciones son administradas por el propietario del bot."
        }
      )
      .setColor(0xf1c40f);

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
});

/* =========================================================
   /premiumstatus
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("premiumstatus")
    .setDescription("Comprueba el estado Premium"),

  async execute(interaction) {
    const db = cargarDB();
    prepararPremium(db);

    const usuario = tienePremiumUsuario(
      db,
      interaction.user.id
    );

    const servidor = interaction.guildId
      ? tienePremiumServidor(db, interaction.guildId)
      : false;

    await interaction.reply({
      content:
        `💎 **Estado Premium**\n\n` +
        `👤 Usuario: ${usuario ? "🟢 Activo" : "🔴 Inactivo"}\n` +
        `🏠 Servidor: ${servidor ? "🟢 Activo" : "🔴 Inactivo"}`,
      ephemeral: true
    });
  }
});

/* =========================================================
   /premiumfeatures
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("premiumfeatures")
    .setDescription("Muestra las funciones Premium"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("✨ Funciones Premium")
      .setDescription(
        [
          "💎 Sistema Premium",
          "⚡ Funciones exclusivas",
          "🛠️ Configuraciones avanzadas",
          "📊 Funciones adicionales",
          "🚀 Futuras características Premium"
        ].join("\n")
      )
      .setColor(0xf1c40f);

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
});

/* =========================================================
   /premiumactivate
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("premiumactivate")
    .setDescription("Activa Premium para un usuario o servidor")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option
        .setName("tipo")
        .setDescription("Tipo de Premium")
        .setRequired(true)
        .addChoices(
          {
            name: "Usuario",
            value: "usuario"
          },
          {
            name: "Servidor",
            value: "servidor"
          }
        )
    )
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario que recibirá Premium")
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option
        .setName("dias")
        .setDescription("Duración en días")
        .setMinValue(1)
        .setMaxValue(3650)
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!esOwner(interaction)) {
      return interaction.reply({
        content:
          "❌ Solo el propietario del bot puede activar Premium.",
        ephemeral: true
      });
    }

    const db = cargarDB();
    prepararPremium(db);

    const tipo = interaction.options.getString("tipo");
    const dias =
      interaction.options.getInteger("dias") || 30;

    const expira =
      Date.now() +
      dias * 24 * 60 * 60 * 1000;

    if (tipo === "usuario") {
      const usuario =
        interaction.options.getUser("usuario");

      if (!usuario) {
        return interaction.reply({
          content:
            "❌ Debes seleccionar un usuario.",
          ephemeral: true
        });
      }

      db.premium.usuarios[usuario.id] = {
        activo: true,
        activadoPor: interaction.user.id,
        activadoEn: Date.now(),
        expira
      };

      guardarDB(db);

      return interaction.reply(
        `💎 Premium activado para **${usuario.tag}** durante **${dias} días**.`
      );
    }

    if (!interaction.guildId) {
      return interaction.reply({
        content:
          "❌ Este comando debe ejecutarse dentro de un servidor.",
        ephemeral: true
      });
    }

    db.premium.servidores[interaction.guildId] = {
      activo: true,
      activadoPor: interaction.user.id,
      activadoEn: Date.now(),
      expira
    };

    guardarDB(db);

    await interaction.reply(
      `💎 Premium del servidor activado durante **${dias} días**.`
    );
  }
});

/* =========================================================
   /premiumremove
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("premiumremove")
    .setDescription("Elimina Premium de un usuario o servidor")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option
        .setName("tipo")
        .setDescription("Tipo de Premium")
        .setRequired(true)
        .addChoices(
          {
            name: "Usuario",
            value: "usuario"
          },
          {
            name: "Servidor",
            value: "servidor"
          }
        )
    )
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!esOwner(interaction)) {
      return interaction.reply({
        content:
          "❌ Solo el propietario del bot puede quitar Premium.",
        ephemeral: true
      });
    }

    const db = cargarDB();
    prepararPremium(db);

    const tipo = interaction.options.getString("tipo");

    if (tipo === "usuario") {
      const usuario =
        interaction.options.getUser("usuario");

      if (!usuario) {
        return interaction.reply({
          content:
            "❌ Debes seleccionar un usuario.",
          ephemeral: true
        });
      }

      if (!db.premium.usuarios[usuario.id]) {
        return interaction.reply({
          content:
            "❌ Ese usuario no tiene Premium.",
          ephemeral: true
        });
      }

      delete db.premium.usuarios[usuario.id];

      guardarDB(db);

      return interaction.reply(
        `🗑️ Premium eliminado de **${usuario.tag}**.`
      );
    }

    if (!interaction.guildId) {
      return interaction.reply({
        content:
          "❌ Este comando debe ejecutarse dentro de un servidor.",
        ephemeral: true
      });
    }

    if (!db.premium.servidores[interaction.guildId]) {
      return interaction.reply({
        content:
          "❌ Este servidor no tiene Premium.",
        ephemeral: true
      });
    }

    delete db.premium.servidores[interaction.guildId];

    guardarDB(db);

    await interaction.reply(
      "🗑️ Premium eliminado de este servidor."
    );
  }
});

/* =========================================================
   /premiumusers
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("premiumusers")
    .setDescription("Muestra los usuarios Premium")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    if (!esOwner(interaction)) {
      return interaction.reply({
        content:
          "❌ Solo el propietario del bot puede usar este comando.",
        ephemeral: true
      });
    }

    const db = cargarDB();
    prepararPremium(db);

    const usuarios =
      Object.entries(db.premium.usuarios);

    if (!usuarios.length) {
      return interaction.reply({
        content:
          "💎 No hay usuarios Premium activos.",
        ephemeral: true
      });
    }

    let texto = "";

    for (const [id, datos] of usuarios) {
      const usuario =
        await interaction.client.users
          .fetch(id)
          .catch(() => null);

      if (usuario) {
        texto += `• ${usuario.tag} — <@${id}>\n`;
      } else {
        texto += `• <@${id}>\n`;
      }

      if (texto.length > 3500) {
        texto += "\n...";
        break;
      }
    }

    const embed = new EmbedBuilder()
      .setTitle("💎 Usuarios Premium")
      .setDescription(texto)
      .setColor(0xf1c40f);

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
});

/* =========================================================
   /premiumconfig
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("premiumconfig")
    .setDescription("Muestra la configuración Premium")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    if (!esOwner(interaction)) {
      return interaction.reply({
        content:
          "❌ Solo el propietario del bot puede usar este comando.",
        ephemeral: true
      });
    }

    const db = cargarDB();
    prepararPremium(db);

    const usuarios =
      Object.keys(db.premium.usuarios).length;

    const servidores =
      Object.keys(db.premium.servidores).length;

    const embed = new EmbedBuilder()
      .setTitle("⚙️ Configuración Premium")
      .addFields(
        {
          name: "💎 Sistema",
          value: db.premium.configuracion.activado
            ? "🟢 Activado"
            : "🔴 Desactivado",
          inline: true
        },
        {
          name: "👤 Usuarios",
          value: `\`${usuarios}\``,
          inline: true
        },
        {
          name: "🏠 Servidores",
          value: `\`${servidores}\``,
          inline: true
        }
      )
      .setColor(0xf1c40f);

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
});

/* =========================================================
   /premiumhelp
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("premiumhelp")
    .setDescription("Muestra los comandos Premium"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("💎 Comandos Premium")
      .setDescription(
        [
          "`/premium` — Estado Premium.",
          "`/premiuminfo` — Información.",
          "`/premiumstatus` — Estado detallado.",
          "`/premiumfeatures` — Funciones Premium.",
          "`/premiumactivate` — Activar Premium.",
          "`/premiumremove` — Quitar Premium.",
          "`/premiumusers` — Usuarios Premium.",
          "`/premiumconfig` — Configuración.",
          "`/premiumhelp` — Esta ayuda."
        ].join("\n")
      )
      .setColor(0xf1c40f);

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
});

/* =========================================================
   EXPORTACIÓN
========================================================= */

module.exports = commands;
