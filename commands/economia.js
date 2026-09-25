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

    return JSON.parse(fs.readFileSync(databasePath, "utf8"));
  } catch (error) {
    console.error("Error leyendo database.json:", error);
    return {};
  }
}

function guardarDB(db) {
  fs.writeFileSync(
    databasePath,
    JSON.stringify(db, null, 2)
  );
}

function obtenerUsuario(db, id) {
  if (!db.economia) db.economia = {};

  if (!db.economia[id]) {
    db.economia[id] = {
      dinero: 0,
      banco: 0,
      inventario: []
    };
  }

  return db.economia[id];
}

module.exports = [

  {
    category: "economia",
    data: new SlashCommandBuilder()
      .setName("balance")
      .setDescription("Muestra tu dinero"),

    async execute(interaction) {
      const db = cargarDB();
      const u = obtenerUsuario(db, interaction.user.id);

      guardarDB(db);

      const embed = new EmbedBuilder()
        .setColor(0xE11D48)
        .setTitle("💰 Tu balance")
        .setDescription(
          `💵 Dinero: **${u.dinero}** monedas\n` +
          `🏦 Banco: **${u.banco}** monedas`
        )
        .setFooter({
          text: "DARK FF V1 • Economía"
        });

      await interaction.reply({
        embeds: [embed]
      });
    }
  },

  {
    category: "economia",
    data: new SlashCommandBuilder()
      .setName("daily")
      .setDescription("Reclama tu recompensa diaria"),

    async execute(interaction) {
      const db = cargarDB();
      const u = obtenerUsuario(db, interaction.user.id);

      const recompensa = 500;

      u.dinero += recompensa;

      guardarDB(db);

      await interaction.reply(
        `🎁 ${interaction.user}, recibiste **${recompensa} monedas**.`
      );
    }
  },

  {
    category: "economia",
    data: new SlashCommandBuilder()
      .setName("work")
      .setDescription("Trabaja para ganar monedas"),

    async execute(interaction) {
      const db = cargarDB();
      const u = obtenerUsuario(db, interaction.user.id);

      const ganancia =
        Math.floor(Math.random() * 401) + 100;

      u.dinero += ganancia;

      guardarDB(db);

      await interaction.reply(
        `💼 Trabajaste y ganaste **${ganancia} monedas**.\n` +
        `💰 Ahora tienes **${u.dinero} monedas**.`
      );
    }
  },

  {
    category: "economia",
    data: new SlashCommandBuilder()
      .setName("pay")
      .setDescription("Envía monedas a otro usuario")
      .addUserOption(o =>
        o.setName("usuario")
          .setDescription("Usuario que recibirá las monedas")
          .setRequired(true)
      )
      .addIntegerOption(o =>
        o.setName("cantidad")
          .setDescription("Cantidad de monedas")
          .setMinValue(1)
          .setRequired(true)
      ),

    async execute(interaction) {
      const objetivo = interaction.options.getUser("usuario");
      const cantidad = interaction.options.getInteger("cantidad");

      if (objetivo.bot) {
        return interaction.reply({
          content: "❌ No puedes enviar dinero a un bot.",
          ephemeral: true
        });
      }

      if (objetivo.id === interaction.user.id) {
        return interaction.reply({
          content: "❌ No puedes enviarte dinero a ti mismo.",
          ephemeral: true
        });
      }

      const db = cargarDB();

      const emisor = obtenerUsuario(db, interaction.user.id);
      const receptor = obtenerUsuario(db, objetivo.id);

      if (emisor.dinero < cantidad) {
        return interaction.reply({
          content: "❌ No tienes suficientes monedas.",
          ephemeral: true
        });
      }

      emisor.dinero -= cantidad;
      receptor.dinero += cantidad;

      guardarDB(db);

      await interaction.reply(
        `💸 **${interaction.user.username}** envió ` +
        `**${cantidad} monedas** a **${objetivo.username}**.`
      );
    }
  },

  {
    category: "economia",
    data: new SlashCommandBuilder()
      .setName("deposit")
      .setDescription("Deposita monedas en tu banco")
      .addIntegerOption(o =>
        o.setName("cantidad")
          .setDescription("Cantidad a depositar")
          .setMinValue(1)
          .setRequired(true)
      ),

    async execute(interaction) {
      const cantidad = interaction.options.getInteger("cantidad");

      const db = cargarDB();
      const u = obtenerUsuario(db, interaction.user.id);

      if (u.dinero < cantidad) {
        return interaction.reply({
          content: "❌ No tienes suficientes monedas.",
          ephemeral: true
        });
      }

      u.dinero -= cantidad;
      u.banco += cantidad;

      guardarDB(db);

      await interaction.reply(
        `🏦 Depositaste **${cantidad} monedas**.\n\n` +
        `💵 Dinero: **${u.dinero}**\n` +
        `🏦 Banco: **${u.banco}**`
      );
    }
  },

  {
    category: "economia",
    data: new SlashCommandBuilder()
      .setName("withdraw")
      .setDescription("Retira monedas de tu banco")
      .addIntegerOption(o =>
        o.setName("cantidad")
          .setDescription("Cantidad a retirar")
          .setMinValue(1)
          .setRequired(true)
      ),

    async execute(interaction) {
      const cantidad = interaction.options.getInteger("cantidad");

      const db = cargarDB();
      const u = obtenerUsuario(db, interaction.user.id);

      if (u.banco < cantidad) {
        return interaction.reply({
          content: "❌ No tienes suficientes monedas en el banco.",
          ephemeral: true
        });
      }

      u.banco -= cantidad;
      u.dinero += cantidad;

      guardarDB(db);

      await interaction.reply(
        `💵 Retiraste **${cantidad} monedas**.\n\n` +
        `💵 Dinero: **${u.dinero}**\n` +
        `🏦 Banco: **${u.banco}**`
      );
    }
  },

  {
    category: "economia",
    data: new SlashCommandBuilder()
      .setName("bank")
      .setDescription("Muestra tu dinero del banco"),

    async execute(interaction) {
      const db = cargarDB();
      const u = obtenerUsuario(db, interaction.user.id);

      await interaction.reply(
        `🏦 **Banco de ${interaction.user.username}**\n\n` +
        `💰 Saldo: **${u.banco} monedas**`
      );
    }
  },

  {
    category: "economia",
    data: new SlashCommandBuilder()
      .setName("depositall")
      .setDescription("Deposita todo tu dinero"),

    async execute(interaction) {
      const db = cargarDB();
      const u = obtenerUsuario(db, interaction.user.id);

      if (u.dinero <= 0) {
        return interaction.reply({
          content: "❌ No tienes dinero para depositar.",
          ephemeral: true
        });
      }

      const cantidad = u.dinero;

      u.dinero = 0;
      u.banco += cantidad;

      guardarDB(db);

      await interaction.reply(
        `🏦 Depositaste todo: **${cantidad} monedas**.`
      );
    }
  },

  {
    category: "economia",
    data: new SlashCommandBuilder()
      .setName("withdrawall")
      .setDescription("Retira todo tu dinero del banco"),

    async execute(interaction) {
      const db = cargarDB();
      const u = obtenerUsuario(db, interaction.user.id);

      if (u.banco <= 0) {
        return interaction.reply({
          content: "❌ No tienes dinero en el banco.",
          ephemeral: true
        });
      }

      const cantidad = u.banco;

      u.banco = 0;
      u.dinero += cantidad;

      guardarDB(db);

      await interaction.reply(
        `💵 Retiraste todo: **${cantidad} monedas**.`
      );
    }
  },

  {
    category: "economia",
    data: new SlashCommandBuilder()
      .setName("give")
      .setDescription("Da monedas a un usuario")
      .addUserOption(o =>
        o.setName("usuario")
          .setDescription("Usuario")
          .setRequired(true)
      )
      .addIntegerOption(o =>
        o.setName("cantidad")
          .setDescription("Cantidad")
          .setMinValue(1)
          .setRequired(true)
      )
      .setDefaultMemberPermissions(
        PermissionFlagsBits.Administrator
      ),

    async execute(interaction) {
      const objetivo = interaction.options.getUser("usuario");
      const cantidad = interaction.options.getInteger("cantidad");

      const db = cargarDB();
      const u = obtenerUsuario(db, objetivo.id);

      u.dinero += cantidad;

      guardarDB(db);

      await interaction.reply(
        `💰 Se dieron **${cantidad} monedas** a ${objetivo}.`
      );
    }
  },

  {
    category: "economia",
    data: new SlashCommandBuilder()
      .setName("richest")
      .setDescription("Muestra los usuarios con más dinero"),

    async execute(interaction) {
      const db = cargarDB();

      const lista = Object.entries(db.economia || {})
        .sort((a, b) =>
          (b[1].dinero + b[1].banco) -
          (a[1].dinero + a[1].banco)
        )
        .slice(0, 10);

      if (!lista.length) {
        return interaction.reply("💰 Todavía no hay usuarios.");
      }

      let texto = "";

      lista.forEach((item, index) => {
        const total = item[1].dinero + item[1].banco;

        texto +=
          `**${index + 1}.** <@${item[0]}> — **${total}** monedas\n`;
      });

      const embed = new EmbedBuilder()
        .setColor(0xF59E0B)
        .setTitle("🏆 Richest")
        .setDescription(texto);

      await interaction.reply({
        embeds: [embed]
      });
    }
  },

  {
    category: "economia",
    data: new SlashCommandBuilder()
      .setName("coinflip")
      .setDescription("Lanza una moneda"),

    async execute(interaction) {
      const resultado =
        Math.random() < 0.5 ? "🪙 Cara" : "🪙 Cruz";

      await interaction.reply(
        `La moneda cayó en **${resultado}**.`
      );
    }
  },

  {
    category: "economia",
    data: new SlashCommandBuilder()
      .setName("dice")
      .setDescription("Lanza un dado"),

    async execute(interaction) {
      const numero =
        Math.floor(Math.random() * 6) + 1;

      await interaction.reply(
        `🎲 Sacaste **${numero}**.`
      );
    }
  }

];
