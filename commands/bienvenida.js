const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "database.json");

/* =========================
   BASE DE DATOS
========================= */

function loadDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, "{}", "utf8");
    }

    const raw = fs.readFileSync(DB_PATH, "utf8").trim();

    if (!raw) return {};

    const db = JSON.parse(raw);

    if (!db.bienvenida) {
      db.bienvenida = {};
    }

    return db;
  } catch (error) {
    console.error("Error leyendo database.json:", error);

    return {
      bienvenida: {}
    };
  }
}

function saveDB(db) {
  try {
    fs.writeFileSync(
      DB_PATH,
      JSON.stringify(db, null, 2),
      "utf8"
    );

    return true;
  } catch (error) {
    console.error("Error guardando database.json:", error);

    return false;
  }
}

/* =========================
   CONFIGURACIÓN
========================= */

function getConfig(db, guildId) {
  if (!db.bienvenida[guildId]) {
    db.bienvenida[guildId] = {
      bienvenidaActiva: false,
      despedidaActiva: false,

      canalBienvenida: null,
      canalDespedida: null,

      mensajeBienvenida:
        "👋 ¡Bienvenido {usuario} a **{servidor}**! Ahora somos **{miembros}** miembros.",

      mensajeDespedida:
        "👋 **{usuario}** ha salido de **{servidor}**. Ahora somos **{miembros}** miembros.",

      usarEmbed: true
    };
  }

  return db.bienvenida[guildId];
}

/* =========================
   VARIABLES
========================= */

function reemplazarVariables(
  texto,
  user,
  guild
) {
  return texto
    .replace(
      /{usuario}/g,
      `${user}`
    )
    .replace(
      /{nombre}/g,
      user.username
    )
    .replace(
      /{servidor}/g,
      guild.name
    )
    .replace(
      /{miembros}/g,
      `${guild.memberCount}`
    )
    .replace(
      /{id}/g,
      user.id
    );
}

/* =========================
   CREAR MENSAJE
========================= */

function crearEmbed(
  titulo,
  descripcion,
  user,
  guild
) {
  return new EmbedBuilder()
    .setTitle(titulo)
    .setDescription(descripcion)
    .setThumbnail(
      user.displayAvatarURL({
        extension: "png",
        size: 256
      })
    )
    .setColor(0x5865f2)
    .setFooter({
      text: guild.name
    })
    .setTimestamp();
}

/* =========================
   COMANDO
========================= */

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bienvenida")
    .setDescription(
      "👋 Sistema de bienvenida y despedida"
    )

    /* ESTADO */
    .addSubcommand(sub =>
      sub
        .setName("estado")
        .setDescription(
          "Muestra la configuración actual"
        )
    )

    /* ACTIVAR BIENVENIDA */
    .addSubcommand(sub =>
      sub
        .setName("activar")
        .setDescription(
          "Activa las bienvenidas"
        )
    )

    /* DESACTIVAR BIENVENIDA */
    .addSubcommand(sub =>
      sub
        .setName("desactivar")
        .setDescription(
          "Desactiva las bienvenidas"
        )
    )

    /* ACTIVAR DESPEDIDA */
    .addSubcommand(sub =>
      sub
        .setName("activar-despedida")
        .setDescription(
          "Activa las despedidas"
        )
    )

    /* DESACTIVAR DESPEDIDA */
    .addSubcommand(sub =>
      sub
        .setName("desactivar-despedida")
        .setDescription(
          "Desactiva las despedidas"
        )
    )

    /* CANAL BIENVENIDA */
    .addSubcommand(sub =>
      sub
        .setName("canal")
        .setDescription(
          "Configura el canal de bienvenida"
        )
        .addChannelOption(option =>
          option
            .setName("canal")
            .setDescription(
              "Canal de bienvenida"
            )
            .setRequired(true)
        )
    )

    /* CANAL DESPEDIDA */
    .addSubcommand(sub =>
      sub
        .setName("canal-despedida")
        .setDescription(
          "Configura el canal de despedida"
        )
        .addChannelOption(option =>
          option
            .setName("canal")
            .setDescription(
              "Canal de despedida"
            )
            .setRequired(true)
        )
    )

    /* MENSAJE BIENVENIDA */
    .addSubcommand(sub =>
      sub
        .setName("mensaje")
        .setDescription(
          "Cambia el mensaje de bienvenida"
        )
        .addStringOption(option =>
          option
            .setName("texto")
            .setDescription(
              "Mensaje personalizado"
            )
            .setRequired(true)
            .setMaxLength(1000)
        )
    )

    /* MENSAJE DESPEDIDA */
    .addSubcommand(sub =>
      sub
        .setName("mensaje-despedida")
        .setDescription(
          "Cambia el mensaje de despedida"
        )
        .addStringOption(option =>
          option
            .setName("texto")
            .setDescription(
              "Mensaje personalizado"
            )
            .setRequired(true)
            .setMaxLength(1000)
        )
    )

    /* EMBED */
    .addSubcommand(sub =>
      sub
        .setName("embed")
        .setDescription(
          "Activa o desactiva los embeds"
        )
        .addBooleanOption(option =>
          option
            .setName("activo")
            .setDescription(
              "Usar embeds"
            )
            .setRequired(true)
        )
    )

    /* PROBAR */
    .addSubcommand(sub =>
      sub
        .setName("probar")
        .setDescription(
          "Prueba el mensaje de bienvenida"
        )
    )

    /* RESET */
    .addSubcommand(sub =>
      sub
        .setName("reset")
        .setDescription(
          "Restablece la configuración"
        )
    ),

  /* =========================
     EXECUTE
  ========================= */

  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content:
          "❌ Este comando solo funciona en servidores.",
        ephemeral: true
      });
    }

    if (
      !interaction.member.permissions.has(
        PermissionFlagsBits.ManageGuild
      )
    ) {
      return interaction.reply({
        content:
          "❌ Necesitas el permiso **Gestionar servidor**.",
        ephemeral: true
      });
    }

    const sub =
      interaction.options.getSubcommand();

    const db = loadDB();

    const config =
      getConfig(
        db,
        interaction.guild.id
      );

    /* =========================
       ESTADO
    ========================= */

    if (sub === "estado") {
      const embed =
        new EmbedBuilder()
          .setTitle(
            "👋 Configuración de bienvenida"
          )
          .addFields(
            {
              name: "👋 Bienvenida",
              value:
                config.bienvenidaActiva
                  ? "🟢 Activada"
                  : "🔴 Desactivada",
              inline: true
            },
            {
              name: "🚪 Despedida",
              value:
                config.despedidaActiva
                  ? "🟢 Activada"
                  : "🔴 Desactivada",
              inline: true
            },
            {
              name: "📢 Canal bienvenida",
              value:
                config.canalBienvenida
                  ? `<#${config.canalBienvenida}>`
                  : "No configurado",
              inline: false
            },
            {
              name: "📢 Canal despedida",
              value:
                config.canalDespedida
                  ? `<#${config.canalDespedida}>`
                  : "No configurado",
              inline: false
            },
            {
              name: "🖼️ Embeds",
              value:
                config.usarEmbed
                  ? "🟢 Activados"
                  : "🔴 Desactivados",
              inline: true
            }
          )
          .setColor(0x5865f2)
          .setTimestamp();

      return interaction.reply({
        embeds: [embed]
      });
    }

    /* =========================
       ACTIVAR
    ========================= */

    if (sub === "activar") {
      config.bienvenidaActiva =
        true;

      saveDB(db);

      return interaction.reply({
        content:
          "👋 **Bienvenidas activadas.**"
      });
    }

    /* =========================
       DESACTIVAR
    ========================= */

    if (sub === "desactivar") {
      config.bienvenidaActiva =
        false;

      saveDB(db);

      return interaction.reply({
        content:
          "⛔ **Bienvenidas desactivadas.**"
      });
    }

    /* =========================
       ACTIVAR DESPEDIDA
    ========================= */

    if (
      sub ===
      "activar-despedida"
    ) {
      config.despedidaActiva =
        true;

      saveDB(db);

      return interaction.reply({
        content:
          "🚪 **Despedidas activadas.**"
      });
    }

    /* =========================
       DESACTIVAR DESPEDIDA
    ========================= */

    if (
      sub ===
      "desactivar-despedida"
    ) {
      config.despedidaActiva =
        false;

      saveDB(db);

      return interaction.reply({
        content:
          "⛔ **Despedidas desactivadas.**"
      });
    }

    /* =========================
       CANAL BIENVENIDA
    ========================= */

    if (sub === "canal") {
      const canal =
        interaction.options.getChannel(
          "canal"
        );

      config.canalBienvenida =
        canal.id;

      saveDB(db);

      return interaction.reply({
        content:
          `📢 El canal de bienvenida ahora es ${canal}.`
      });
    }

    /* =========================
       CANAL DESPEDIDA
    ========================= */

    if (
      sub ===
      "canal-despedida"
    ) {
      const canal =
        interaction.options.getChannel(
          "canal"
        );

      config.canalDespedida =
        canal.id;

      saveDB(db);

      return interaction.reply({
        content:
          `📢 El canal de despedida ahora es ${canal}.`
      });
    }

    /* =========================
       MENSAJE BIENVENIDA
    ========================= */

    if (sub === "mensaje") {
      const texto =
        interaction.options.getString(
          "texto"
        );

      config.mensajeBienvenida =
        texto;

      saveDB(db);

      return interaction.reply({
        content:
          "✅ Mensaje de bienvenida actualizado."
      });
    }

    /* =========================
       MENSAJE DESPEDIDA
    ========================= */

    if (
      sub ===
      "mensaje-despedida"
    ) {
      const texto =
        interaction.options.getString(
          "texto"
        );

      config.mensajeDespedida =
        texto;

      saveDB(db);

      return interaction.reply({
        content:
          "✅ Mensaje de despedida actualizado."
      });
    }

    /* =========================
       EMBED
    ========================= */

    if (sub === "embed") {
      const activo =
        interaction.options.getBoolean(
          "activo"
        );

      config.usarEmbed =
        activo;

      saveDB(db);

      return interaction.reply({
        content:
          activo
            ? "🟢 Embeds activados."
            : "🔴 Embeds desactivados."
      });
    }

    /* =========================
       PROBAR
    ========================= */

    if (sub === "probar") {
      const texto =
        reemplazarVariables(
          config.mensajeBienvenida,
          interaction.user,
          interaction.guild
        );

      if (!config.usarEmbed) {
        return interaction.reply({
          content: texto
        });
      }

      const embed =
        crearEmbed(
          "👋 ¡Bienvenido!",
          texto,
          interaction.user,
          interaction.guild
        );

      return interaction.reply({
        embeds: [embed]
      });
    }

    /* =========================
       RESET
    ========================= */

    if (sub === "reset") {
      delete db.bienvenida[
        interaction.guild.id
      ];

      saveDB(db);

      return interaction.reply({
        content:
          "♻️ La configuración de bienvenida fue restablecida."
      });
    }
  },

  /* =========================
     NUEVO MIEMBRO
  ========================= */

  async guildMemberAdd(member) {
    const db = loadDB();

    const config =
      getConfig(
        db,
        member.guild.id
      );

    if (
      !config.bienvenidaActiva ||
      !config.canalBienvenida
    ) {
      return;
    }

    const canal =
      member.guild.channels.cache.get(
        config.canalBienvenida
      );

    if (!canal) return;

    const texto =
      reemplazarVariables(
        config.mensajeBienvenida,
        member.user,
        member.guild
      );

    if (!config.usarEmbed) {
      return canal.send({
        content: texto
      }).catch(() => {});
    }

    const embed =
      crearEmbed(
        "👋 ¡Nuevo miembro!",
        texto,
        member.user,
        member.guild
      );

    return canal.send({
      embeds: [embed]
    }).catch(() => {});
  },

  /* =========================
     MIEMBRO SALE
  ========================= */

  async guildMemberRemove(member) {
    const db = loadDB();

    const config =
      getConfig(
        db,
        member.guild.id
      );

    if (
      !config.despedidaActiva ||
      !config.canalDespedida
    ) {
      return;
    }

    const canal =
      member.guild.channels.cache.get(
        config.canalDespedida
      );

    if (!canal) return;

    const texto =
      reemplazarVariables(
        config.mensajeDespedida,
        member.user,
        member.guild
      );

    if (!config.usarEmbed) {
      return canal.send({
        content: texto
      }).catch(() => {});
    }

    const embed =
      crearEmbed(
        "🚪 Hasta pronto",
        texto,
        member.user,
        member.guild
      );

    return canal.send({
      embeds: [embed]
    }).catch(() => {});
  }
};
