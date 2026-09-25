const fs = require("fs");
const path = require("path");
const {
  SlashCommandBuilder,
  EmbedBuilder,
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

function usuarioNivel(db, id) {
  if (!db.niveles) db.niveles = {};

  if (!db.niveles[id]) {
    db.niveles[id] = {
      xp: 0,
      nivel: 1
    };
  }

  return db.niveles[id];
}

module.exports = [

  {
    category: "niveles",
    data: new SlashCommandBuilder()
      .setName("rank")
      .setDescription("Muestra tu nivel y XP"),

    async execute(interaction) {
      const db = cargarDB();
      const u = usuarioNivel(db, interaction.user.id);

      const necesario = u.nivel * 100;

      const embed = new EmbedBuilder()
        .setColor(0x8B5CF6)
        .setTitle(`⭐ Nivel de ${interaction.user.username}`)
        .setDescription(
          `🏆 Nivel: **${u.nivel}**\n` +
          `✨ XP: **${u.xp}/${necesario}**`
        );

      await interaction.reply({
        embeds: [embed]
      });
    }
  },

  {
    category: "niveles",
    data: new SlashCommandBuilder()
      .setName("level")
      .setDescription("Muestra tu nivel"),

    async execute(interaction) {
      const db = cargarDB();
      const u = usuarioNivel(db, interaction.user.id);

      await interaction.reply(
        `⭐ Tu nivel es **${u.nivel}** con **${u.xp} XP**.`
      );
    }
  },

  {
    category: "niveles",
    data: new SlashCommandBuilder()
      .setName("xp")
      .setDescription("Muestra tu experiencia"),

    async execute(interaction) {
      const db = cargarDB();
      const u = usuarioNivel(db, interaction.user.id);

      await interaction.reply(
        `✨ Tienes **${u.xp} XP**.`
      );
    }
  },

  {
    category: "niveles",
    data: new SlashCommandBuilder()
      .setName("addxp")
      .setDescription("Añade XP a un usuario")
      .addUserOption(o =>
        o.setName("usuario")
          .setDescription("Usuario")
          .setRequired(true)
      )
      .addIntegerOption(o =>
        o.setName("cantidad")
          .setDescription("XP")
          .setMinValue(1)
          .setRequired(true)
      )
      .setDefaultMemberPermissions(
        PermissionFlagsBits.Administrator
      ),

    async execute(interaction) {
      const usuario =
        interaction.options.getUser("usuario");

      const cantidad =
        interaction.options.getInteger("cantidad");

      const db = cargarDB();
      const u = usuarioNivel(db, usuario.id);

      u.xp += cantidad;

      while (u.xp >= u.nivel * 100) {
        u.xp -= u.nivel * 100;
        u.nivel++;
      }

      guardarDB(db);

      await interaction.reply(
        `✨ Se añadieron **${cantidad} XP** a ${usuario}.\n` +
        `🏆 Nivel actual: **${u.nivel}**`
      );
    }
  },

  {
    category: "niveles",
    data: new SlashCommandBuilder()
      .setName("setlevel")
      .setDescription("Establece el nivel de un usuario")
      .addUserOption(o =>
        o.setName("usuario")
          .setDescription("Usuario")
          .setRequired(true)
      )
      .addIntegerOption(o =>
        o.setName("nivel")
          .setDescription("Nivel")
          .setMinValue(1)
          .setRequired(true)
      )
      .setDefaultMemberPermissions(
        PermissionFlagsBits.Administrator
      ),

    async execute(interaction) {
      const usuario =
        interaction.options.getUser("usuario");

      const nivel =
        interaction.options.getInteger("nivel");

      const db = cargarDB();
      const u = usuarioNivel(db, usuario.id);

      u.nivel = nivel;
      u.xp = 0;

      guardarDB(db);

      await interaction.reply(
        `🏆 ${usuario} ahora está en el nivel **${nivel}**.`
      );
    }
  },

  {
    category: "niveles",
    data: new SlashCommandBuilder()
      .setName("topxp")
      .setDescription("Muestra el ranking de XP"),

    async execute(interaction) {
      const db = cargarDB();

      const lista = Object.entries(db.niveles || {})
        .sort((a, b) =>
          (b[1].nivel * 100 + b[1].xp) -
          (a[1].nivel * 100 + a[1].xp)
        )
        .slice(0, 10);

      if (!lista.length) {
        return interaction.reply(
          "⭐ Todavía no hay jugadores con XP."
        );
      }

      let texto = "";

      lista.forEach((item, index) => {
        texto +=
          `**${index + 1}.** <@${item[0]}> — Nivel **${item[1].nivel}**\n`;
      });

      const embed = new EmbedBuilder()
        .setColor(0x8B5CF6)
        .setTitle("🏆 Ranking de niveles")
        .setDescription(texto);

      await interaction.reply({
        embeds: [embed]
      });
    }
  }

];
