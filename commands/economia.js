const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const databasePath = path.join(
  __dirname,
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

    const db = JSON.parse(
      fs.readFileSync(databasePath, "utf8")
    );

    db.economia ??= {};
    db.niveles ??= {};
    db.servidores ??= {};
    db.usuarios ??= {};

    return db;
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

function obtenerUsuario(db, id) {
  if (!db.economia[id]) {
    db.economia[id] = {
      dinero: 0,
      banco: 0,
      ultimoDaily: 0
    };
  }

  db.economia[id].dinero =
    Number(db.economia[id].dinero) || 0;

  db.economia[id].banco =
    Number(db.economia[id].banco) || 0;

  db.economia[id].ultimoDaily =
    Number(db.economia[id].ultimoDaily) || 0;

  return db.economia[id];
}

module.exports = [

  // /balance
  {
    data: new SlashCommandBuilder()
      .setName("balance")
      .setDescription("Muestra tu dinero y dinero del banco"),

    async execute(interaction) {
      const db = cargarDB();
      const usuario = obtenerUsuario(db, interaction.user.id);

      guardarDB(db);

      const total =
        usuario.dinero + usuario.banco;

      const embed = new EmbedBuilder()
        .setColor(0xE11D48)
        .setTitle("💰 Balance")
        .setDescription(
          `👤 **${interaction.user.username}**\n\n` +
          `💵 Dinero: **$${usuario.dinero.toLocaleString()}**\n` +
          `🏦 Banco: **$${usuario.banco.toLocaleString()}**\n` +
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
  },

  // /daily
  {
    data: new SlashCommandBuilder()
      .setName("daily")
      .setDescription("Reclama tu recompensa diaria"),

    async execute(interaction) {
      const db = cargarDB();
      const usuario = obtenerUsuario(db, interaction.user.id);

      const ahora = Date.now();
      const cooldown = 24 * 60 * 60 * 1000;

      const restante =
        cooldown - (ahora - usuario.ultimoDaily);

      if (restante > 0) {
        const horas = Math.floor(
          restante / 3600000
        );

        const minutos = Math.floor(
          (restante % 3600000) / 60000
        );

        return interaction.reply({
          content:
            `⏰ Ya reclamaste tu recompensa.\n` +
            `Vuelve en **${horas}h ${minutos}m**.`,
          ephemeral: true
        });
      }

      const recompensa = 1000;

      usuario.dinero += recompensa;
      usuario.ultimoDaily = ahora;

      guardarDB(db);

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x22C55E)
            .setTitle("🎁 Recompensa diaria")
            .setDescription(
              `🎉 Recibiste **$${recompensa.toLocaleString()}**.\n\n` +
              `💰 Dinero actual: **$${usuario.dinero.toLocaleString()}**`
            )
            .setFooter({
              text: "DARK FF V1 • Economía"
            })
        ]
      });
    }
  },

  // /work
  {
    data: new SlashCommandBuilder()
      .setName("work")
      .setDescription("Trabaja para ganar dinero"),

    async execute(interaction) {
      const db = cargarDB();
      const usuario = obtenerUsuario(db, interaction.user.id);

      const trabajos = [
        "🎮 Jugaste unas partidas",
        "🔧 Arreglaste algo",
        "💻 Hiciste un trabajo online",
        "📦 Entregaste un pedido",
        "🛠️ Ayudaste en un proyecto"
      ];

      const trabajo =
        trabajos[Math.floor(Math.random() * trabajos.length)];

      const recompensa =
        Math.floor(Math.random() * 501) + 500;

      usuario.dinero += recompensa;

      guardarDB(db);

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x3B82F6)
            .setTitle("💼 Trabajo completado")
            .setDescription(
              `${trabajo}\n\n` +
              `💵 Ganaste: **$${recompensa.toLocaleString()}**\n` +
              `💰 Balance: **$${usuario.dinero.toLocaleString()}**`
            )
        ]
      });
    }
  },

  // /pay
  {
    data: new SlashCommandBuilder()
      .setName("pay")
      .setDescription("Envía dinero a otro usuario")
      .addUserOption(option =>
        option
          .setName("usuario")
          .setDescription("Usuario que recibirá el dinero")
          .setRequired(true)
      )
      .addIntegerOption(option =>
        option
          .setName("cantidad")
          .setDescription("Cantidad de dinero")
          .setMinValue(1)
          .setRequired(true)
      ),

    async execute(interaction) {
      const db = cargarDB();

      const receptor =
        interaction.options.getUser("usuario");

      const cantidad =
        interaction.options.getInteger("cantidad");

      if (receptor.bot) {
        return interaction.reply({
          content: "❌ No puedes enviar dinero a un bot.",
          ephemeral: true
        });
      }

      if (receptor.id === interaction.user.id) {
        return interaction.reply({
          content: "❌ No puedes enviarte dinero a ti mismo.",
          ephemeral: true
        });
      }

      const emisor = obtenerUsuario(
        db,
        interaction.user.id
      );

      const usuarioReceptor = obtenerUsuario(
        db,
        receptor.id
      );

      if (emisor.dinero < cantidad) {
        return interaction.reply({
          content:
            `❌ No tienes suficiente dinero.\n` +
            `Tienes **$${emisor.dinero.toLocaleString()}**.`,
          ephemeral: true
        });
      }

      emisor.dinero -= cantidad;
      usuarioReceptor.dinero += cantidad;

      guardarDB(db);

      await interaction.reply(
        `💸 ${interaction.user} envió **$${cantidad.toLocaleString()}** a ${receptor}.`
      );
    }
  },

  // /deposit
  {
    data: new SlashCommandBuilder()
      .setName("deposit")
      .setDescription("Deposita dinero en el banco")
      .addIntegerOption(option =>
        option
          .setName("cantidad")
          .setDescription("Cantidad a depositar")
          .setMinValue(1)
          .setRequired(true)
      ),

    async execute(interaction) {
      const db = cargarDB();
      const usuario = obtenerUsuario(db, interaction.user.id);

      const cantidad =
        interaction.options.getInteger("cantidad");

      if (usuario.dinero < cantidad) {
        return interaction.reply({
          content: "❌ No tienes suficiente dinero.",
          ephemeral: true
        });
      }

      usuario.dinero -= cantidad;
      usuario.banco += cantidad;

      guardarDB(db);

      await interaction.reply(
        `🏦 Depositaste **$${cantidad.toLocaleString()}** en el banco.`
      );
    }
  },

  // /withdraw
  {
    data: new SlashCommandBuilder()
      .setName("withdraw")
      .setDescription("Retira dinero del banco")
      .addIntegerOption(option =>
        option
          .setName("cantidad")
          .setDescription("Cantidad a retirar")
          .setMinValue(1)
          .setRequired(true)
      ),

    async execute(interaction) {
      const db = cargarDB();
      const usuario = obtenerUsuario(db, interaction.user.id);

      const cantidad =
        interaction.options.getInteger("cantidad");

      if (usuario.banco < cantidad) {
        return interaction.reply({
          content: "❌ No tienes suficiente dinero en el banco.",
          ephemeral: true
        });
      }

      usuario.banco -= cantidad;
      usuario.dinero += cantidad;

      guardarDB(db);

      await interaction.reply(
        `💵 Retiraste **$${cantidad.toLocaleString()}** del banco.`
      );
    }
  },

  // /depositall
  {
    data: new SlashCommandBuilder()
      .setName("depositall")
      .setDescription("Deposita todo tu dinero en el banco"),

    async execute(interaction) {
      const db = cargarDB();
      const usuario = obtenerUsuario(db, interaction.user.id);

      if (usuario.dinero <= 0) {
        return interaction.reply({
          content: "❌ No tienes dinero para depositar.",
          ephemeral: true
        });
      }

      const cantidad = usuario.dinero;

      usuario.dinero = 0;
      usuario.banco += cantidad;

      guardarDB(db);

      await interaction.reply(
        `🏦 Depositaste todo: **$${cantidad.toLocaleString()}**.`
      );
    }
  },

  // /withdrawall
  {
    data: new SlashCommandBuilder()
      .setName("withdrawall")
      .setDescription("Retira todo tu dinero del banco"),

    async execute(interaction) {
      const db = cargarDB();
      const usuario = obtenerUsuario(db, interaction.user.id);

      if (usuario.banco <= 0) {
        return interaction.reply({
          content: "❌ No tienes dinero en el banco.",
          ephemeral: true
        });
      }

      const cantidad = usuario.banco;

      usuario.banco = 0;
      usuario.dinero += cantidad;

      guardarDB(db);

      await interaction.reply(
        `💵 Retiraste todo del banco: **$${cantidad.toLocaleString()}**.`
      );
    }
  },

  // /richest
  {
    data: new SlashCommandBuilder()
      .setName("richest")
      .setDescription("Muestra los usuarios con más dinero"),

    async execute(interaction) {
      const db = cargarDB();

      const lista = Object.entries(db.economia)
        .map(([id, datos]) => ({
          id,
          total:
            (Number(datos.dinero) || 0) +
            (Number(datos.banco) || 0)
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

      if (lista.length === 0) {
        return interaction.reply(
          "💰 Todavía no hay usuarios en el ranking."
        );
      }

      const texto = [];

      for (let i = 0; i < lista.length; i++) {
        const usuario =
          await interaction.client.users
            .fetch(lista[i].id)
            .catch(() => null);

        const nombre =
          usuario?.username || `Usuario ${lista[i].id}`;

        texto.push(
          `**${i + 1}.** ${nombre} — 💰 $${lista[i].total.toLocaleString()}`
        );
      }

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xF59E0B)
            .setTitle("🏆 Ranking de riqueza")
            .setDescription(texto.join("\n"))
        ]
      });
    }
  },

  // /coinflip
  {
    data: new SlashCommandBuilder()
      .setName("coinflip")
      .setDescription("Lanza una moneda"),

    async execute(interaction) {
      const resultado =
        Math.random() < 0.5
          ? "🪙 Cara"
          : "🪙 Cruz";

      await interaction.reply(
        `🪙 La moneda cayó en **${resultado}**.`
      );
    }
  },

  // /dice
  {
    data: new SlashCommandBuilder()
      .setName("dice")
      .setDescription("Lanza un dado"),

    async execute(interaction) {
      const resultado =
        Math.floor(Math.random() * 6) + 1;

      await interaction.reply(
        `🎲 Sacaste **${resultado}**.`
      );
    }
  },

  // /give
  {
    data: new SlashCommandBuilder()
      .setName("give")
      .setDescription("Da dinero a un usuario")
      .setDefaultMemberPermissions(
        PermissionFlagsBits.Administrator
      )
      .addUserOption(option =>
        option
          .setName("usuario")
          .setDescription("Usuario")
          .setRequired(true)
      )
      .addIntegerOption(option =>
        option
          .setName("cantidad")
          .setDescription("Cantidad")
          .setMinValue(1)
          .setRequired(true)
      ),

    async execute(interaction) {
      if (!interaction.memberPermissions?.has(
        PermissionFlagsBits.Administrator
      )) {
        return interaction.reply({
          content: "❌ Necesitas permisos de administrador.",
          ephemeral: true
        });
      }

      const db = cargarDB();

      const usuario =
        interaction.options.getUser("usuario");

      const cantidad =
        interaction.options.getInteger("cantidad");

      const cuenta =
        obtenerUsuario(db, usuario.id);

      cuenta.dinero += cantidad;

      guardarDB(db);

      await interaction.reply(
        `💰 Se añadieron **$${cantidad.toLocaleString()}** a ${usuario}.`
      );
    }
  },

  // /bank
  {
    data: new SlashCommandBuilder()
      .setName("bank")
      .setDescription("Muestra cuánto dinero tienes en el banco"),

    async execute(interaction) {
      const db = cargarDB();
      const usuario = obtenerUsuario(db, interaction.user.id);

      await interaction.reply(
        `🏦 Tienes **$${usuario.banco.toLocaleString()}** en el banco.`
      );
    }
  },

  // /dicebet
  {
    data: new SlashCommandBuilder()
      .setName("dicebet")
      .setDescription("Juega una apuesta de dados")
      .addIntegerOption(option =>
        option
          .setName("cantidad")
          .setDescription("Cantidad a apostar")
          .setMinValue(1)
          .setRequired(true)
      ),

    async execute(interaction) {
      const db = cargarDB();
      const usuario = obtenerUsuario(db, interaction.user.id);

      const cantidad =
        interaction.options.getInteger("cantidad");

      if (usuario.dinero < cantidad) {
        return interaction.reply({
          content: "❌ No tienes suficiente dinero.",
          ephemeral: true
        });
      }

      const resultado =
        Math.floor(Math.random() * 6) + 1;

      if (resultado >= 4) {
        usuario.dinero += cantidad;

        guardarDB(db);

        return interaction.reply(
          `🎲 Sacaste **${resultado}** y ganaste **$${cantidad.toLocaleString()}**.`
        );
      }

      usuario.dinero -= cantidad;

      guardarDB(db);

      await interaction.reply(
        `🎲 Sacaste **${resultado}** y perdiste **$${cantidad.toLocaleString()}**.`
      );
    }
  }

];
