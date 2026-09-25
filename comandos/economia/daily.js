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
      return {
        economia: {},
        niveles: {},
        servidores: {},
        usuarios: {}
      };
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
    .setName("daily")
    .setDescription("Reclama tu recompensa diaria"),

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
    }

    const usuario = db.economia[userId];

    const ahora = Date.now();
    const cooldown = 24 * 60 * 60 * 1000;

    const ultimoDaily = Number(usuario.ultimoDaily) || 0;
    const tiempoRestante = cooldown - (ahora - ultimoDaily);

    if (tiempoRestante > 0) {
      const horas = Math.floor(
        tiempoRestante / (60 * 60 * 1000)
      );

      const minutos = Math.floor(
        (tiempoRestante % (60 * 60 * 1000)) /
        (60 * 1000)
      );

      return interaction.reply({
        content:
          `⏰ Ya reclamaste tu recompensa diaria.\n` +
          `Vuelve en **${horas}h ${minutos}m**.`,
        ephemeral: true
      });
    }

    const recompensa = 1000;

    usuario.dinero =
      (Number(usuario.dinero) || 0) + recompensa;

    usuario.ultimoDaily = ahora;

    guardarDB(db);

    const embed = new EmbedBuilder()
      .setColor(0x22C55E)
      .setTitle("🎁 Recompensa diaria")
      .setDescription(
        `🎉 **${interaction.user.username}**, recibiste tu recompensa diaria.\n\n` +
        `💰 Ganaste: **$${recompensa.toLocaleString()}**\n` +
        `💵 Dinero actual: **$${usuario.dinero.toLocaleString()}**`
      )
      .setFooter({
        text: "DARK FF V1 • Economía"
      });

    await interaction.reply({
      embeds: [embed]
    });
  }
};
