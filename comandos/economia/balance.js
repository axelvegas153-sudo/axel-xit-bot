const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const databasePath = path.join(
  __dirname,
  "..",
  "..",
  "database.json"
);

function cargarDB() {
  try {
    if (!fs.existsSync(databasePath)) {
      fs.writeFileSync(
        databasePath,
        JSON.stringify(
          {
            economia: {},
            niveles: {},
            servidores: {},
            usuarios: {}
          },
          null,
          2
        )
      );
    }

    return JSON.parse(
      fs.readFileSync(databasePath, "utf8")
    );
  } catch (error) {
    console.error("❌ Error leyendo database.json:", error);
    return {
      economia: {},
      niveles: {},
      servidores: {},
      usuarios: {}
    };
  }
}

function guardarDB(db) {
  fs.writeFileSync(
    databasePath,
    JSON.stringify(db, null, 2)
  );
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Muestra tu dinero y tu banco"),

  async execute(interaction) {
    const db = cargarDB();

    if (!db.economia) {
      db.economia = {};
    }

    const userId = interaction.user.id;

    if (!db.economia[userId]) {
      db.economia[userId] = {
        dinero: 0,
        banco: 0
      };

      guardarDB(db);
    }

    const usuario = db.economia[userId];

    const dinero = Number(usuario.dinero) || 0;
    const banco = Number(usuario.banco) || 0;
    const total = dinero + banco;

    const embed = new EmbedBuilder()
      .setColor(0xE11D48)
      .setTitle("💰 Balance")
      .setDescription(
        `👤 **${interaction.user.username}**\n\n` +
        `💵 Dinero: **$${dinero.toLocaleString()}**\n` +
        `🏦 Banco: **$${banco.toLocaleString()}**\n` +
        `💎 Total: **$${total.toLocaleString()}**`
      )
      .setThumbnail(
        interaction.user.displayAvatarURL({
          size: 256
        })
      )
      .setFooter({
        text: "DARK FF V1 • Economía"
      });

    await interaction.reply({
      embeds: [embed]
    });
  }
};
