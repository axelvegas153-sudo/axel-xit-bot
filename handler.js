const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");

const file = "./database.json";

function db() {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return {};
  }
}

function save(data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

module.exports = async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = interaction.commandName;
  const data = db();

  try {
    if (cmd === "ping")
      return interaction.reply(`🏓 Pong! ${interaction.client.ws.ping}ms`);

    if (cmd === "help")
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setTitle("🤖 DARK FF V1")
          .setDescription("Bot público de Discord\n\nUsa `/commands` para ver los comandos.")
          .setColor(0x5865F2)]
      });

    if (cmd === "botinfo")
      return interaction.reply(`🤖 **DARK FF V1**\n📡 Ping: ${interaction.client.ws.ping}ms\n⚙️ Discord.js v14`);

    if (cmd === "serverinfo")
      return interaction.reply(
        `🌐 **${interaction.guild.name}**\n👥 Miembros: ${interaction.guild.memberCount}\n🆔 ${interaction.guild.id}`
      );

    if (cmd === "userinfo") {
      const user = interaction.options.getUser("usuario") || interaction.user;
      return interaction.reply(
        `👤 **${user.username}**\n🆔 ${user.id}\n📅 Cuenta creada: <t:${Math.floor(user.createdTimestamp / 1000)}:D>`
      );
    }

    if (cmd === "avatar") {
      const user = interaction.options.getUser("usuario") || interaction.user;
      return interaction.reply(user.displayAvatarURL({ size: 1024 }));
    }

    if (cmd === "members")
      return interaction.reply(`👥 Este servidor tiene **${interaction.guild.memberCount}** miembros.`);

    if (cmd === "roles")
      return interaction.reply(`🎭 Roles: **${interaction.guild.roles.cache.size}**`);

    if (cmd === "channels")
      return interaction.reply(`📁 Canales: **${interaction.guild.channels.cache.size}**`);

    if (cmd === "say") {
      const texto = interaction.options.getString("texto");
      return interaction.reply(texto || "❌ Escribe un texto.");
    }

    if (cmd === "choose") {
      const opciones = interaction.options.getString("opciones");
      const lista = opciones?.split(",").map(x => x.trim()).filter(Boolean);
      if (!lista?.length) return interaction.reply("❌ Separa las opciones con comas.");
      return interaction.reply(`🎯 Elegí: **${lista[Math.floor(Math.random() * lista.length)]}**`);
    }

    if (cmd === "coinflip")
      return interaction.reply(Math.random() < .5 ? "🪙 **Cara**" : "🪙 **Cruz**");

    if (cmd === "roll") {
      const n = interaction.options.getInteger("numero") || 100;
      return interaction.reply(`🎲 Resultado: **${Math.floor(Math.random() * n) + 1}**`);
    }

    if (cmd === "8ball") {
      const respuestas = [
        "Sí.", "No.", "Probablemente.", "No estoy seguro.",
        "Definitivamente sí.", "Definitivamente no."
      ];
      return interaction.reply(`🔮 ${respuestas[Math.floor(Math.random() * respuestas.length)]}`);
    }

    if (cmd === "uppercase") {
      const texto = interaction.options.getString("texto");
      return interaction.reply(texto?.toUpperCase() || "❌ Falta el texto.");
    }

    if (cmd === "lowercase") {
      const texto = interaction.options.getString("texto");
      return interaction.reply(texto?.toLowerCase() || "❌ Falta el texto.");
    }

    if (cmd === "reverse") {
      const texto = interaction.options.getString("texto");
      return interaction.reply(texto?.split("").reverse().join("") || "❌ Falta el texto.");
    }

    if (cmd === "dice")
      return interaction.reply(`🎲 **${Math.floor(Math.random() * 6) + 1}**`);

    if (cmd === "uptime")
      return interaction.reply(`⏱️ Uptime: **${Math.floor(process.uptime())} segundos**`);

    if (cmd === "status")
      return interaction.reply("🟢 **DARK FF V1 está online.**");

    if (cmd === "node")
      return interaction.reply(`🟢 Node.js: **${process.version}**`);

    if (cmd === "discordjs")
      return interaction.reply(`📦 Discord.js: **${require("discord.js").version}**`);

    if (cmd === "userid")
      return interaction.reply(`🆔 Tu ID: **${interaction.user.id}**`);

    if (cmd === "guildid")
      return interaction.reply(`🆔 Servidor: **${interaction.guild.id}**`);

    if (cmd === "channelid")
      return interaction.reply(`🆔 Canal: **${interaction.channel.id}**`);

    if (cmd === "botid")
      return interaction.reply(`🤖 ID del bot: **${interaction.client.user.id}**`);

    if (cmd === "commands")
      return interaction.reply("📜 Usa `/help` para ver los comandos disponibles.");

    if (cmd === "daily") {
      const id = interaction.user.id;
      data[id] ??= { coins: 0 };
      data[id].coins += 100;
      save(data);
      return interaction.reply("🎁 Recibiste **100 monedas**.");
    }

    if (cmd === "balance") {
      const id = interaction.user.id;
      data[id] ??= { coins: 0 };
      return interaction.reply(`💰 Tienes **${data[id].coins || 0} monedas**.`);
    }

    if (cmd === "rank" || cmd === "level" || cmd === "xp")
      return interaction.reply("⭐ Sistema de XP preparado. Próximamente se ampliará.");

    if (cmd === "clear") {
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages))
        return interaction.reply({ content: "❌ No tienes permiso.", ephemeral: true });

      const cantidad = interaction.options.getInteger("cantidad") || 10;
      await interaction.channel.bulkDelete(Math.min(cantidad, 100), true);
      return interaction.channel.send(`🧹 Eliminados **${cantidad}** mensajes.`);
    }

    if (cmd === "servericon")
      return interaction.reply(interaction.guild.iconURL({ size: 1024 }) || "❌ Este servidor no tiene icono.");

    return interaction.reply({
      content: "⚠️ Este comando todavía no tiene una función configurada.",
      ephemeral: true
    });

  } catch (error) {
    console.error(error);
    if (!interaction.replied)
      await interaction.reply({ content: "❌ Ocurrió un error ejecutando el comando.", ephemeral: true });
  }
};
