const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const commands = [];

const DB_PATH = path.join(__dirname, "..", "database.json");

/* =========================================================
   BASE DE DATOS
========================================================= */

function cargarDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(
        DB_PATH,
        JSON.stringify({}, null, 2)
      );
    }

    const contenido = fs.readFileSync(
      DB_PATH,
      "utf8"
    );

    if (!contenido.trim()) return {};

    return JSON.parse(contenido);
  } catch (error) {
    console.error("Error cargando database.json:", error);
    return {};
  }
}

function guardarDB(db) {
  try {
    fs.writeFileSync(
      DB_PATH,
      JSON.stringify(db, null, 2)
    );
  } catch (error) {
    console.error("Error guardando database.json:", error);
  }
}

function prepararTienda(db, guildId) {
  if (!db.tienda) {
    db.tienda = {};
  }

  if (!db.tienda[guildId]) {
    db.tienda[guildId] = {
      items: {}
    };
  }

  if (!db.tienda[guildId].items) {
    db.tienda[guildId].items = {};
  }
}

function obtenerEconomia(db, guildId, userId) {
  if (!db.economia) {
    db.economia = {};
  }

  if (!db.economia[guildId]) {
    db.economia[guildId] = {};
  }

  if (!db.economia[guildId][userId]) {
    db.economia[guildId][userId] = {
      wallet: 0,
      bank: 0,
      lastDaily: 0,
      lastWeekly: 0,
      lastWork: 0,
      lastBeg: 0,
      lastRob: 0
    };
  }

  return db.economia[guildId][userId];
}

function obtenerInventario(db, guildId, userId) {
  if (!db.inventarios) {
    db.inventarios = {};
  }

  if (!db.inventarios[guildId]) {
    db.inventarios[guildId] = {};
  }

  if (!db.inventarios[guildId][userId]) {
    db.inventarios[guildId][userId] = {};
  }

  return db.inventarios[guildId][userId];
}

function dinero(cantidad) {
  return Number(cantidad || 0).toLocaleString("es-ES");
}


/* =========================================================
   /shop
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription("Muestra los objetos disponibles en la tienda."),

  async execute(interaction) {
    const db = cargarDB();

    prepararTienda(
      db,
      interaction.guild.id
    );

    const items =
      db.tienda[interaction.guild.id].items;

    const lista = Object.entries(items);

    if (lista.length === 0) {
      return interaction.reply({
        content:
          "🛒 La tienda está vacía.",
        ephemeral: true
      });
    }

    const descripcion = lista
      .slice(0, 20)
      .map(([id, item]) =>
        `**${id}** — ${item.emoji || "📦"} ${item.name}\n` +
        `💰 Precio: **$${dinero(item.price)}**\n` +
        `${item.description || "Sin descripción."}`
      )
      .join("\n\n");

    const embed = new EmbedBuilder()
      .setTitle("🛒 Tienda")
      .setDescription(descripcion)
      .setFooter({
        text: "Usa /buy para comprar un objeto."
      })
      .setTimestamp();

    guardarDB(db);

    return interaction.reply({
      embeds: [embed]
    });
  }
});


/* =========================================================
   /buy
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("buy")
    .setDescription("Compra un objeto de la tienda.")
    .addStringOption(option =>
      option
        .setName("item")
        .setDescription("ID del objeto")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("cantidad")
        .setDescription("Cantidad que quieres comprar")
        .setRequired(false)
        .setMinValue(1)
    ),

  async execute(interaction) {
    const db = cargarDB();

    prepararTienda(
      db,
      interaction.guild.id
    );

    const itemId =
      interaction.options
        .getString("item")
        .toLowerCase();

    const cantidad =
      interaction.options
        .getInteger("cantidad") || 1;

    const item =
      db.tienda[interaction.guild.id].items[itemId];

    if (!item) {
      return interaction.reply({
        content:
          "❌ Ese objeto no existe en la tienda.",
        ephemeral: true
      });
    }

    const total =
      item.price * cantidad;

    const economia =
      obtenerEconomia(
        db,
        interaction.guild.id,
        interaction.user.id
      );

    if (economia.wallet < total) {
      return interaction.reply({
        content:
          `❌ Necesitas **$${dinero(total)}** y tienes **$${dinero(economia.wallet)}**.`,
        ephemeral: true
      });
    }

    const inventario =
      obtenerInventario(
        db,
        interaction.guild.id,
        interaction.user.id
      );

    economia.wallet -= total;

    inventario[itemId] =
      (inventario[itemId] || 0) + cantidad;

    guardarDB(db);

    return interaction.reply(
      `✅ Compraste **${cantidad}x ${item.name}** por **$${dinero(total)}**.`
    );
  }
});


/* =========================================================
   /sell
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("sell")
    .setDescription("Vende un objeto de tu inventario.")
    .addStringOption(option =>
      option
        .setName("item")
        .setDescription("ID del objeto")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("cantidad")
        .setDescription("Cantidad que quieres vender")
        .setRequired(false)
        .setMinValue(1)
    ),

  async execute(interaction) {
    const db = cargarDB();

    prepararTienda(
      db,
      interaction.guild.id
    );

    const itemId =
      interaction.options
        .getString("item")
        .toLowerCase();

    const cantidad =
      interaction.options
        .getInteger("cantidad") || 1;

    const item =
      db.tienda[interaction.guild.id].items[itemId];

    if (!item) {
      return interaction.reply({
        content:
          "❌ Ese objeto no existe.",
        ephemeral: true
      });
    }

    const inventario =
      obtenerInventario(
        db,
        interaction.guild.id,
        interaction.user.id
      );

    const cantidadActual =
      inventario[itemId] || 0;

    if (cantidadActual < cantidad) {
      return interaction.reply({
        content:
          `❌ Solo tienes **${cantidadActual}x ${item.name}**.`,
        ephemeral: true
      });
    }

    const precioVenta =
      Math.floor(item.price * 0.5);

    const total =
      precioVenta * cantidad;

    inventario[itemId] -= cantidad;

    if (inventario[itemId] <= 0) {
      delete inventario[itemId];
    }

    const economia =
      obtenerEconomia(
        db,
        interaction.guild.id,
        interaction.user.id
      );

    economia.wallet += total;

    guardarDB(db);

    return interaction.reply(
      `💸 Vendiste **${cantidad}x ${item.name}** por **$${dinero(total)}**.`
    );
  }
});


/* =========================================================
   /item
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("item")
    .setDescription("Muestra información de un objeto.")
    .addStringOption(option =>
      option
        .setName("item")
        .setDescription("ID del objeto")
        .setRequired(true)
    ),

  async execute(interaction) {
    const db = cargarDB();

    prepararTienda(
      db,
      interaction.guild.id
    );

    const itemId =
      interaction.options
        .getString("item")
        .toLowerCase();

    const item =
      db.tienda[interaction.guild.id].items[itemId];

    if (!item) {
      return interaction.reply({
        content:
          "❌ Ese objeto no existe.",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(
        `${item.emoji || "📦"} ${item.name}`
      )
      .setDescription(
        item.description ||
        "Sin descripción."
      )
      .addFields(
        {
          name: "🆔 ID",
          value: `\`${itemId}\``,
          inline: true
        },
        {
          name: "💰 Precio",
          value: `$${dinero(item.price)}`,
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
   /inventory
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("inventory")
    .setDescription("Muestra tu inventario.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario que quieres consultar")
        .setRequired(false)
    ),

  async execute(interaction) {
    const db = cargarDB();

    const usuario =
      interaction.options.getUser("usuario") ||
      interaction.user;

    const inventario =
      obtenerInventario(
        db,
        interaction.guild.id,
        usuario.id
      );

    prepararTienda(
      db,
      interaction.guild.id
    );

    const items =
      db.tienda[interaction.guild.id].items;

    const lista =
      Object.entries(inventario);

    if (lista.length === 0) {
      return interaction.reply({
        content:
          `🎒 ${usuario.username} no tiene objetos.`,
        ephemeral: true
      });
    }

    const descripcion =
      lista
        .map(([id, cantidad]) => {
          const item = items[id];

          return item
            ? `${item.emoji || "📦"} **${item.name}** — x${cantidad}`
            : `📦 **${id}** — x${cantidad}`;
        })
        .join("\n");

    const embed = new EmbedBuilder()
      .setTitle(
        `🎒 Inventario de ${usuario.username}`
      )
      .setDescription(descripcion)
      .setTimestamp();

    guardarDB(db);

    return interaction.reply({
      embeds: [embed]
    });
  }
});


/* =========================================================
   /use
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("use")
    .setDescription("Usa un objeto de tu inventario.")
    .addStringOption(option =>
      option
        .setName("item")
        .setDescription("ID del objeto")
        .setRequired(true)
    ),

  async execute(interaction) {
    const db = cargarDB();

    prepararTienda(
      db,
      interaction.guild.id
    );

    const itemId =
      interaction.options
        .getString("item")
        .toLowerCase();

    const items =
      db.tienda[interaction.guild.id].items;

    const item = items[itemId];

    if (!item) {
      return interaction.reply({
        content:
          "❌ Ese objeto no existe.",
        ephemeral: true
      });
    }

    const inventario =
      obtenerInventario(
        db,
        interaction.guild.id,
        interaction.user.id
      );

    if (!inventario[itemId] || inventario[itemId] <= 0) {
      return interaction.reply({
        content:
          `❌ No tienes **${item.name}**.`,
        ephemeral: true
      });
    }

    /*
      Si el objeto tiene un efecto configurado,
      se puede ampliar aquí posteriormente.
    */

    inventario[itemId]--;

    if (inventario[itemId] <= 0) {
      delete inventario[itemId];
    }

    guardarDB(db);

    return interaction.reply(
      `✨ Usaste **${item.name}** correctamente.`
    );
  }
});


/* =========================================================
   /gift
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("gift")
    .setDescription("Regala un objeto a otro usuario.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario que recibirá el objeto")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("item")
        .setDescription("ID del objeto")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("cantidad")
        .setDescription("Cantidad")
        .setRequired(false)
        .setMinValue(1)
    ),

  async execute(interaction) {
    const db = cargarDB();

    prepararTienda(
      db,
      interaction.guild.id
    );

    const usuario =
      interaction.options.getUser("usuario");

    const itemId =
      interaction.options
        .getString("item")
        .toLowerCase();

    const cantidad =
      interaction.options
        .getInteger("cantidad") || 1;

    if (usuario.id === interaction.user.id) {
      return interaction.reply({
        content:
          "❌ No puedes regalarte un objeto a ti mismo.",
        ephemeral: true
      });
    }

    if (usuario.bot) {
      return interaction.reply({
        content:
          "❌ No puedes regalar objetos a bots.",
        ephemeral: true
      });
    }

    const item =
      db.tienda[interaction.guild.id].items[itemId];

    if (!item) {
      return interaction.reply({
        content:
          "❌ Ese objeto no existe.",
        ephemeral: true
      });
    }

    const inventarioOrigen =
      obtenerInventario(
        db,
        interaction.guild.id,
        interaction.user.id
      );

    if (
      !inventarioOrigen[itemId] ||
      inventarioOrigen[itemId] < cantidad
    ) {
      return interaction.reply({
        content:
          `❌ No tienes suficientes objetos.`,
        ephemeral: true
      });
    }

    const inventarioDestino =
      obtenerInventario(
        db,
        interaction.guild.id,
        usuario.id
      );

    inventarioOrigen[itemId] -= cantidad;

    if (inventarioOrigen[itemId] <= 0) {
      delete inventarioOrigen[itemId];
    }

    inventarioDestino[itemId] =
      (inventarioDestino[itemId] || 0) +
      cantidad;

    guardarDB(db);

    return interaction.reply(
      `🎁 Regalaste **${cantidad}x ${item.name}** a ${usuario}.`
    );
  }
});


/* =========================================================
   /additem
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("additem")
    .setDescription("Añade un objeto a la tienda.")
    .setDefaultMemberPermissions(8)
    .addStringOption(option =>
      option
        .setName("id")
        .setDescription("ID único del objeto")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("nombre")
        .setDescription("Nombre del objeto")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("precio")
        .setDescription("Precio")
        .setRequired(true)
        .setMinValue(1)
    )
    .addStringOption(option =>
      option
        .setName("descripcion")
        .setDescription("Descripción")
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName("emoji")
        .setDescription("Emoji del objeto")
        .setRequired(false)
    ),

  async execute(interaction) {
    const db = cargarDB();

    prepararTienda(
      db,
      interaction.guild.id
    );

    const id =
      interaction.options
        .getString("id")
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "");

    const nombre =
      interaction.options.getString("nombre");

    const precio =
      interaction.options.getInteger("precio");

    const descripcion =
      interaction.options.getString("descripcion") ||
      "Sin descripción.";

    const emoji =
      interaction.options.getString("emoji") ||
      "📦";

    if (!id) {
      return interaction.reply({
        content:
          "❌ El ID no es válido.",
        ephemeral: true
      });
    }

    if (
      db.tienda[interaction.guild.id]
        .items[id]
    ) {
      return interaction.reply({
        content:
          "❌ Ya existe un objeto con ese ID.",
        ephemeral: true
      });
    }

    db.tienda[interaction.guild.id].items[id] = {
      name: nombre,
      price: precio,
      description: descripcion,
      emoji
    };

    guardarDB(db);

    return interaction.reply(
      `✅ Se añadió **${nombre}** a la tienda por **$${dinero(precio)}**.`
    );
  }
});


/* =========================================================
   /removeitem
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("removeitem")
    .setDescription("Elimina un objeto de la tienda.")
    .setDefaultMemberPermissions(8)
    .addStringOption(option =>
      option
        .setName("id")
        .setDescription("ID del objeto")
        .setRequired(true)
    ),

  async execute(interaction) {
    const db = cargarDB();

    prepararTienda(
      db,
      interaction.guild.id
    );

    const id =
      interaction.options
        .getString("id")
        .toLowerCase();

    const item =
      db.tienda[interaction.guild.id].items[id];

    if (!item) {
      return interaction.reply({
        content:
          "❌ Ese objeto no existe.",
        ephemeral: true
      });
    }

    delete db.tienda[
      interaction.guild.id
    ].items[id];

    guardarDB(db);

    return interaction.reply(
      `🗑️ Se eliminó **${item.name}** de la tienda.`
    );
  }
});


/* =========================================================
   /edititem
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("edititem")
    .setDescription("Edita un objeto de la tienda.")
    .setDefaultMemberPermissions(8)
    .addStringOption(option =>
      option
        .setName("id")
        .setDescription("ID del objeto")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("nombre")
        .setDescription("Nuevo nombre")
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option
        .setName("precio")
        .setDescription("Nuevo precio")
        .setRequired(false)
        .setMinValue(1)
    )
    .addStringOption(option =>
      option
        .setName("descripcion")
        .setDescription("Nueva descripción")
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName("emoji")
        .setDescription("Nuevo emoji")
        .setRequired(false)
    ),

  async execute(interaction) {
    const db = cargarDB();

    prepararTienda(
      db,
      interaction.guild.id
    );

    const id =
      interaction.options
        .getString("id")
        .toLowerCase();

    const item =
      db.tienda[interaction.guild.id].items[id];

    if (!item) {
      return interaction.reply({
        content:
          "❌ Ese objeto no existe.",
        ephemeral: true
      });
    }

    const nombre =
      interaction.options.getString("nombre");

    const precio =
      interaction.options.getInteger("precio");

    const descripcion =
      interaction.options.getString("descripcion");

    const emoji =
      interaction.options.getString("emoji");

    if (nombre !== null) {
      item.name = nombre;
    }

    if (precio !== null) {
      item.price = precio;
    }

    if (descripcion !== null) {
      item.description = descripcion;
    }

    if (emoji !== null) {
      item.emoji = emoji;
    }

    guardarDB(db);

    return interaction.reply(
      `✅ El objeto **${item.name}** fue actualizado.`
    );
  }
});


/* =========================================================
   /shopconfig
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("shopconfig")
    .setDescription("Muestra la configuración de la tienda.")
    .setDefaultMemberPermissions(8),

  async execute(interaction) {
    const db = cargarDB();

    prepararTienda(
      db,
      interaction.guild.id
    );

    const items =
      db.tienda[interaction.guild.id].items;

    const cantidad =
      Object.keys(items).length;

    const embed = new EmbedBuilder()
      .setTitle("⚙️ Configuración de tienda")
      .addFields(
        {
          name: "🛒 Estado",
          value: "🟢 Activa",
          inline: true
        },
        {
          name: "📦 Objetos",
          value: `${cantidad}`,
          inline: true
        }
      )
      .setTimestamp();

    guardarDB(db);

    return interaction.reply({
      embeds: [embed]
    });
  }
});


/* =========================================================
   /shopreset
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("shopreset")
    .setDescription("Reinicia todos los objetos de la tienda.")
    .setDefaultMemberPermissions(8),

  async execute(interaction) {
    const db = cargarDB();

    prepararTienda(
      db,
      interaction.guild.id
    );

    db.tienda[
      interaction.guild.id
    ].items = {};

    guardarDB(db);

    return interaction.reply(
      "♻️ La tienda fue reiniciada correctamente."
    );
  }
});


/* =========================================================
   /shophelp
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("shophelp")
    .setDescription("Muestra los comandos de la tienda."),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("🛒 DARK FF V1 — TIENDA")
      .setDescription(
        "Sistema de tienda e inventario."
      )
      .addFields(
        {
          name: "🛍️ Tienda",
          value:
            "`/shop`\n" +
            "`/item`\n" +
            "`/buy`\n" +
            "`/sell`"
        },
        {
          name: "🎒 Inventario",
          value:
            "`/inventory`\n" +
            "`/use`\n" +
            "`/gift`"
        },
        {
          name: "⚙️ Administración",
          value:
            "`/additem`\n" +
            "`/removeitem`\n" +
            "`/edititem`\n" +
            "`/shopconfig`\n" +
            "`/shopreset`"
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
