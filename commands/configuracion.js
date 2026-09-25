const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ChannelType
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "database.json");

// ======================================================
// BASE DE DATOS
// ======================================================

function cargarDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, "{}");
    }

    const texto = fs.readFileSync(DB_PATH, "utf8");
    return texto ? JSON.parse(texto) : {};
  } catch (error) {
    console.error("Error leyendo database.json:", error);
    return {};
  }
}

function guardarDB(db) {
  fs.writeFileSync(
    DB_PATH,
    JSON.stringify(db, null, 2)
  );
}

function obtenerServidor(db, guildId) {
  if (!db.servidores) {
    db.servidores = {};
  }

  if (!db.servidores[guildId]) {
    db.servidores[guildId] = {
      bienvenida: {
        activa: false,
        canal: null,
        mensaje: "👋 ¡Bienvenido {usuario} a {servidor}!"
      },

      despedida: {
        activa: false,
        canal: null,
        mensaje: "👋 {usuario} ha salido del servidor."
      },

      autorol: {
        activo: false,
        rol: null
      }
    };
  }

  return db.servidores[guildId];
}

// ======================================================
// BIENVENIDA
// ======================================================

const bienvenida = {
  category: "configuracion",

  data: new SlashCommandBuilder()
    .setName("bienvenida")
    .setDescription("Configura el sistema de bienvenida")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    )
    .addSubcommand(sub =>
      sub
        .setName("activar")
        .setDescription("Activa las bienvenidas")
    )
    .addSubcommand(sub =>
      sub
        .setName("desactivar")
        .setDescription("Desactiva las bienvenidas")
    )
    .addSubcommand(sub =>
      sub
        .setName("canal")
        .setDescription("Establece el canal de bienvenida")
        .addChannelOption(option =>
          option
            .setName("canal")
            .setDescription("Canal donde llegarán las bienvenidas")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("mensaje")
        .setDescription("Cambia el mensaje de bienvenida")
        .addStringOption(option =>
          option
            .setName("texto")
            .setDescription("Mensaje de bienvenida")
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("ver")
        .setDescription("Muestra la configuración actual")
    ),

  async execute(interaction) {
    const db = cargarDB();
    const config = obtenerServidor(
      db,
      interaction.guild.id
    );

    const sub = interaction.options.getSubcommand();

    if (sub === "activar") {
      if (!config.bienvenida.canal) {
        return interaction.reply({
          content:
            "❌ Primero establece un canal con `/bienvenida canal`.",
          ephemeral: true
        });
      }

      config.bienvenida.activa = true;
      guardarDB(db);

      return interaction.reply(
        "✅ Sistema de bienvenida **activado**."
      );
    }

    if (sub === "desactivar") {
      config.bienvenida.activa = false;
      guardarDB(db);

      return interaction.reply(
        "🔴 Sistema de bienvenida **desactivado**."
      );
    }

    if (sub === "canal") {
      const canal = interaction.options.getChannel("canal");

      config.bienvenida.canal = canal.id;
      guardarDB(db);

      return interaction.reply(
        `✅ Canal de bienvenida establecido en ${canal}.`
      );
    }

    if (sub === "mensaje") {
      const texto = interaction.options.getString("texto");

      config.bienvenida.mensaje = texto;
      guardarDB(db);

      return interaction.reply(
        "✅ Mensaje de bienvenida actualizado."
      );
    }

    if (sub === "ver") {
      const canal = config.bienvenida.canal
        ? `<#${config.bienvenida.canal}>`
        : "No configurado";

      const embed = new EmbedBuilder()
        .setColor(0x57F287)
        .setTitle("👋 Configuración de bienvenida")
        .addFields(
          {
            name: "Estado",
            value: config.bienvenida.activa
              ? "🟢 Activado"
              : "🔴 Desactivado",
            inline: true
          },
          {
            name: "Canal",
            value: canal,
            inline: true
          },
          {
            name: "Mensaje",
            value: config.bienvenida.mensaje
          }
        );

      return interaction.reply({
        embeds: [embed]
      });
    }
  }
};

// ======================================================
// DESPEDIDA
// ======================================================

const despedida = {
  category: "configuracion",

  data: new SlashCommandBuilder()
    .setName("despedida")
    .setDescription("Configura el sistema de despedida")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    )
    .addSubcommand(sub =>
      sub
        .setName("activar")
        .setDescription("Activa las despedidas")
    )
    .addSubcommand(sub =>
      sub
        .setName("desactivar")
        .setDescription("Desactiva las despedidas")
    )
    .addSubcommand(sub =>
      sub
        .setName("canal")
        .setDescription("Establece el canal de despedida")
        .addChannelOption(option =>
          option
            .setName("canal")
            .setDescription("Canal donde llegarán las despedidas")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("mensaje")
        .setDescription("Cambia el mensaje de despedida")
        .addStringOption(option =>
          option
            .setName("texto")
            .setDescription("Mensaje de despedida")
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("ver")
        .setDescription("Muestra la configuración actual")
    ),

  async execute(interaction) {
    const db = cargarDB();
    const config = obtenerServidor(
      db,
      interaction.guild.id
    );

    const sub = interaction.options.getSubcommand();

    if (sub === "activar") {
      if (!config.despedida.canal) {
        return interaction.reply({
          content:
            "❌ Primero establece un canal con `/despedida canal`.",
          ephemeral: true
        });
      }

      config.despedida.activa = true;
      guardarDB(db);

      return interaction.reply(
        "✅ Sistema de despedida **activado**."
      );
    }

    if (sub === "desactivar") {
      config.despedida.activa = false;
      guardarDB(db);

      return interaction.reply(
        "🔴 Sistema de despedida **desactivado**."
      );
    }

    if (sub === "canal") {
      const canal = interaction.options.getChannel("canal");

      config.despedida.canal = canal.id;
      guardarDB(db);

      return interaction.reply(
        `✅ Canal de despedida establecido en ${canal}.`
      );
    }

    if (sub === "mensaje") {
      const texto = interaction.options.getString("texto");

      config.despedida.mensaje = texto;
      guardarDB(db);

      return interaction.reply(
        "✅ Mensaje de despedida actualizado."
      );
    }

    if (sub === "ver") {
      const canal = config.despedida.canal
        ? `<#${config.despedida.canal}>`
        : "No configurado";

      const embed = new EmbedBuilder()
        .setColor(0xED4245)
        .setTitle("👋 Configuración de despedida")
        .addFields(
          {
            name: "Estado",
            value: config.despedida.activa
              ? "🟢 Activado"
              : "🔴 Desactivado",
            inline: true
          },
          {
            name: "Canal",
            value: canal,
            inline: true
          },
          {
            name: "Mensaje",
            value: config.despedida.mensaje
          }
        );

      return interaction.reply({
        embeds: [embed]
      });
    }
  }
};

// ======================================================
// AUTOROL
// ======================================================

const autorol = {
  category: "configuracion",

  data: new SlashCommandBuilder()
    .setName("autorol")
    .setDescription("Configura el rol automático")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageRoles
    )
    .addSubcommand(sub =>
      sub
        .setName("activar")
        .setDescription("Activa el autorol")
    )
    .addSubcommand(sub =>
      sub
        .setName("desactivar")
        .setDescription("Desactiva el autorol")
    )
    .addSubcommand(sub =>
      sub
        .setName("rol")
        .setDescription("Establece el rol automático")
        .addRoleOption(option =>
          option
            .setName("rol")
            .setDescription("Rol que recibirá el usuario")
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("ver")
        .setDescription("Muestra la configuración del autorol")
    ),

  async execute(interaction) {
    const db = cargarDB();
    const config = obtenerServidor(
      db,
      interaction.guild.id
    );

    const sub = interaction.options.getSubcommand();

    if (sub === "activar") {
      if (!config.autorol.rol) {
        return interaction.reply({
          content:
            "❌ Primero establece un rol con `/autorol rol`.",
          ephemeral: true
        });
      }

      config.autorol.activo = true;
      guardarDB(db);

      return interaction.reply(
        "✅ Autorol **activado**."
      );
    }

    if (sub === "desactivar") {
      config.autorol.activo = false;
      guardarDB(db);

      return interaction.reply(
        "🔴 Autorol **desactivado**."
      );
    }

    if (sub === "rol") {
      const rol = interaction.options.getRole("rol");

      if (rol.id === interaction.guild.id) {
        return interaction.reply({
          content: "❌ No puedes utilizar el rol @everyone.",
          ephemeral: true
        });
      }

      config.autorol.rol = rol.id;
      guardarDB(db);

      return interaction.reply(
        `✅ El autorol será ${rol}.`
      );
    }

    if (sub === "ver") {
      const rol = config.autorol.rol
        ? `<@&${config.autorol.rol}>`
        : "No configurado";

      const embed = new EmbedBuilder()
        .setColor(0x9B59B6)
        .setTitle("⚙️ Configuración de autorol")
        .addFields(
          {
            name: "Estado",
            value: config.autorol.activo
              ? "🟢 Activado"
              : "🔴 Desactivado",
            inline: true
          },
          {
            name: "Rol",
            value: rol,
            inline: true
          }
        );

      return interaction.reply({
        embeds: [embed]
      });
    }
  }
};

// ======================================================
// CONFIG
// ======================================================

const configCommand = {
  category: "configuracion",

  data: new SlashCommandBuilder()
    .setName("config")
    .setDescription("Muestra la configuración del servidor")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    ),

  async execute(interaction) {
    const db = cargarDB();
    const config = obtenerServidor(
      db,
      interaction.guild.id
    );

    guardarDB(db);

    const bienvenidaCanal = config.bienvenida.canal
      ? `<#${config.bienvenida.canal}>`
      : "No configurado";

    const despedidaCanal = config.despedida.canal
      ? `<#${config.despedida.canal}>`
      : "No configurado";

    const autorolRol = config.autorol.rol
      ? `<@&${config.autorol.rol}>`
      : "No configurado";

    const embed = new EmbedBuilder()
      .setColor(0x9B59B6)
      .setTitle(`⚙️ Configuración • ${interaction.guild.name}`)
      .addFields(
        {
          name: "👋 Bienvenida",
          value:
            `${config.bienvenida.activa ? "🟢 Activa" : "🔴 Inactiva"}\n` +
            `Canal: ${bienvenidaCanal}`
        },
        {
          name: "🚪 Despedida",
          value:
            `${config.despedida.activa ? "🟢 Activa" : "🔴 Inactiva"}\n` +
            `Canal: ${despedidaCanal}`
        },
        {
          name: "🎭 Autorol",
          value:
            `${config.autorol.activo ? "🟢 Activo" : "🔴 Inactivo"}\n` +
            `Rol: ${autorolRol}`
        }
      )
      .setFooter({
        text: "DARK FF V1 • Configuración"
      });

    await interaction.reply({
      embeds: [embed]
    });
  }
};

// ======================================================
// RESET CONFIG
// ======================================================

const resetconfig = {
  category: "configuracion",

  data: new SlashCommandBuilder()
    .setName("resetconfig")
    .setDescription("Restablece la configuración del servidor")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.Administrator
    ),

  async execute(interaction) {
    const db = cargarDB();

    if (!db.servidores) {
      db.servidores = {};
    }

    delete db.servidores[interaction.guild.id];

    guardarDB(db);

    await interaction.reply(
      "♻️ La configuración de este servidor fue restablecida."
    );
  }
};

// ======================================================
// EXPORTAR
// ======================================================

module.exports = [
  bienvenida,
  despedida,
  autorol,
  configCommand,
  resetconfig
];
