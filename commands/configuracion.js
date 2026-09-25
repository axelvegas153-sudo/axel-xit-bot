const fs = require("fs");
const path = require("path");
const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const databasePath = path.join(__dirname, "..", "database.json");

function cargarDB() {
  try {
    if (!fs.existsSync(databasePath)) {
      fs.writeFileSync(databasePath, "{}");
    }

    return JSON.parse(
      fs.readFileSync(databasePath, "utf8")
    );
  } catch {
    return {};
  }
}

function guardarDB(db) {
  fs.writeFileSync(
    databasePath,
    JSON.stringify(db, null, 2)
  );
}

module.exports = [

  {
    category: "configuracion",
    data: new SlashCommandBuilder()
      .setName("config")
      .setDescription("Muestra la configuración del servidor")
      .setDefaultMemberPermissions(
        PermissionFlagsBits.ManageGuild
      ),

    async execute(interaction) {
      const db = cargarDB();

      const config =
        db.configuracion?.[interaction.guild.id] || {};

      await interaction.reply(
        `⚙️ **Configuración de ${interaction.guild.name}**\n\n` +
        `👋 Bienvenida: ${config.welcomeChannel ? `<#${config.welcomeChannel}>` : "No configurada"}\n` +
        `👋 Despedida: ${config.goodbyeChannel ? `<#${config.goodbyeChannel}>` : "No configurada"}`
      );
    }
  },

  {
    category: "configuracion",
    data: new SlashCommandBuilder()
      .setName("setwelcome")
      .setDescription("Configura el canal de bienvenida")
      .addChannelOption(o =>
        o.setName("canal")
          .setDescription("Canal de bienvenida")
          .setRequired(true)
      )
      .setDefaultMemberPermissions(
        PermissionFlagsBits.ManageGuild
      ),

    async execute(interaction) {
      const canal =
        interaction.options.getChannel("canal");

      const db = cargarDB();

      if (!db.configuracion) {
        db.configuracion = {};
      }

      if (!db.configuracion[interaction.guild.id]) {
        db.configuracion[interaction.guild.id] = {};
      }

      db.configuracion[interaction.guild.id].welcomeChannel =
        canal.id;

      guardarDB(db);

      await interaction.reply(
        `👋 Canal de bienvenida configurado: ${canal}`
      );
    }
  },

  {
    category: "configuracion",
    data: new SlashCommandBuilder()
      .setName("setgoodbye")
      .setDescription("Configura el canal de despedidas")
      .addChannelOption(o =>
        o.setName("canal")
          .setDescription("Canal de despedidas")
          .setRequired(true)
      )
      .setDefaultMemberPermissions(
        PermissionFlagsBits.ManageGuild
      ),

    async execute(interaction) {
      const canal =
        interaction.options.getChannel("canal");

      const db = cargarDB();

      if (!db.configuracion) {
        db.configuracion = {};
      }

      if (!db.configuracion[interaction.guild.id]) {
        db.configuracion[interaction.guild.id] = {};
      }

      db.configuracion[interaction.guild.id].goodbyeChannel =
        canal.id;

      guardarDB(db);

      await interaction.reply(
        `👋 Canal de despedidas configurado: ${canal}`
      );
    }
  },

  {
    category: "configuracion",
    data: new SlashCommandBuilder()
      .setName("setlogs")
      .setDescription("Configura el canal de logs")
      .addChannelOption(o =>
        o.setName("canal")
          .setDescription("Canal de logs")
          .setRequired(true)
      )
      .setDefaultMemberPermissions(
        PermissionFlagsBits.ManageGuild
      ),

    async execute(interaction) {
      const canal =
        interaction.options.getChannel("canal");

      const db = cargarDB();

      if (!db.configuracion) {
        db.configuracion = {};
      }

      if (!db.configuracion[interaction.guild.id]) {
        db.configuracion[interaction.guild.id] = {};
      }

      db.configuracion[interaction.guild.id].logsChannel =
        canal.id;

      guardarDB(db);

      await interaction.reply(
        `📋 Canal de logs configurado: ${canal}`
      );
    }
  },

  {
    category: "configuracion",
    data: new SlashCommandBuilder()
      .setName("setautorole")
      .setDescription("Configura el rol automático")
      .addRoleOption(o =>
        o.setName("rol")
          .setDescription("Rol automático")
          .setRequired(true)
      )
      .setDefaultMemberPermissions(
        PermissionFlagsBits.ManageGuild
      ),

    async execute(interaction) {
      const rol =
        interaction.options.getRole("rol");

      const db = cargarDB();

      if (!db.configuracion) {
        db.configuracion = {};
      }

      if (!db.configuracion[interaction.guild.id]) {
        db.configuracion[interaction.guild.id] = {};
      }

      db.configuracion[interaction.guild.id].autorole =
        rol.id;

      guardarDB(db);

      await interaction.reply(
        `🎭 Rol automático configurado: ${rol}`
      );
    }
  },

  {
    category: "configuracion",
    data: new SlashCommandBuilder()
      .setName("setlevelchannel")
      .setDescription("Configura el canal de niveles")
      .addChannelOption(o =>
        o.setName("canal")
          .setDescription("Canal")
          .setRequired(true)
      )
      .setDefaultMemberPermissions(
        PermissionFlagsBits.ManageGuild
      ),

    async execute(interaction) {
      const canal =
        interaction.options.getChannel("canal");

      const db = cargarDB();

      if (!db.configuracion) {
        db.configuracion = {};
      }

      if (!db.configuracion[interaction.guild.id]) {
        db.configuracion[interaction.guild.id] = {};
      }

      db.configuracion[interaction.guild.id].levelChannel =
        canal.id;

      guardarDB(db);

      await interaction.reply(
        `⭐ Canal de niveles configurado: ${canal}`
      );
    }
  }

];
