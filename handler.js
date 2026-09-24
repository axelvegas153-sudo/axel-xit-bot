const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");

const file = "./database.json";

// Leer DB
function db() {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return {};
  }
}

// Guardar DB pero sin lag - solo cada 5 min
let saveTimeout;
function save(data) {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  }, 5000); // guarda 5 seg después del último comando
}

module.exports = async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = interaction.commandName;
  const data = db();
  const guildId = interaction.guild.id;
  const userId = interaction.user.id;

  // Inicializar datos del server
  data[guildId]??= { users: {} };
  data[guildId].users[userId]??= { coins: 100, xp: 0, level: 1 };

  try {
    await interaction.deferReply(); // Para que no de "La app no respondió"

    // ===== BASICOS =====
    if (cmd === "ping")
      return interaction.editReply(`🏓 Pong! ${interaction.client.ws.ping}ms`);

    if (cmd === "help")
      return interaction.editReply({
        embeds: [new EmbedBuilder()
         .setTitle("🤖 DARK FF V1")
         .setDescription("Bot público de Discord\nTengo 50 comandos\nUsa `/commands` para verlos todos.")
         .setColor(0x5865F2)]
      });

    if (cmd === "botinfo")
      return interaction.editReply(`🤖 **DARK FF V1**\n📡 Ping: ${interaction.client.ws.ping}ms\n⚙️ Discord.js v14\n📦 ${require("./commands").length} comandos`);

    // ===== INFO =====
    if (cmd === "serverinfo") {
      const embed = new EmbedBuilder()
       .setTitle(`🌐 ${interaction.guild.name}`)
       .addFields(
          { name: "👥 Miembros", value: `${interaction.guild.memberCount}`, inline: true },
          { name: "🆔 ID", value: interaction.guild.id, inline: true }
        )
       .setThumbnail(interaction.guild.iconURL());
      return interaction.editReply({ embeds: [embed] });
    }

    if (cmd === "userinfo") {
      const user = interaction.options.getUser("usuario") || interaction.user;
      const member = await interaction.guild.members.fetch(user.id);
      const embed = new EmbedBuilder()
       .setTitle(`👤 ${user.username}`)
       .setThumbnail(user.displayAvatarURL())
       .addFields(
          { name: "🆔 ID", value: user.id },
          { name: "📅 Cuenta creada", value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>` },
          { name: "📥 Se unió", value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>` }
        );
      return interaction.editReply({ embeds: [embed] });
    }

    if (cmd === "avatar") {
      const user = interaction.options.getUser("usuario") || interaction.user;
      return interaction.editReply(user.displayAvatarURL({ size: 1024 }));
    }

    if (cmd === "servericon")
      return interaction.editReply(interaction.guild.iconURL({ size: 1024 }) || "❌ Este servidor no tiene icono.");

    if (cmd === "members")
      return interaction.editReply(`👥 Este servidor tiene **${interaction.guild.memberCount}** miembros.`);

    if (cmd === "roles")
      return interaction.editReply(`🎭 Roles: **${interaction.guild.roles.cache.size}**`);

    if (cmd === "channels")
      return interaction.editReply(`📁 Canales: **${interaction.guild.channels.cache.size}**`);

    // ===== MOD =====
    if (cmd === "kick") {
      if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers))
        return interaction.editReply("❌ No tienes permiso.");
      const user = interaction.options.getUser("usuario");
      await interaction.guild.members.kick(user.id);
      return interaction.editReply(`👢 Kick a ${user.tag}`);
    }

    if (cmd === "ban") {
      if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers))
        return interaction.editReply("❌ No tienes permiso.");
      const user = interaction.options.getUser("usuario");
      await interaction.guild.members.ban(user.id);
      return interaction.editReply(`🔨 Ban a ${user.tag}`);
    }

    if (cmd === "clear") {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages))
        return interaction.editReply("❌ No tienes permiso.");
      const cantidad = interaction.options.getInteger("cantidad");
      await interaction.channel.bulkDelete(cantidad, true);
      return interaction.editReply(`🧹 Eliminados **${cantidad}** mensajes.`);
    }

    if (cmd === "timeout") {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers))
        return interaction.editReply("❌ No tienes permiso.");
      const user = interaction.options.getUser("usuario");
      const minutos = interaction.options.getInteger("minutos");
      const member = await interaction.guild.members.fetch(user.id);
      await member.timeout(minutos * 60000);
      return interaction.editReply(`⏰ Timeout de ${minutos} min a ${user.tag}`);
    }

    if (cmd === "untimeout") {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers))
        return interaction.editReply("❌ No tienes permiso.");
      const user = interaction.options.getUser("usuario");
      const member = await interaction.guild.members.fetch(user.id);
      await member.timeout(null);
      return interaction.editReply(`✅ Timeout quitado a ${user.tag}`);
    }

    // ===== DIVERSION =====
    if (cmd === "say") {
      const texto = interaction.options.getString("texto");
      return interaction.editReply(texto || "❌ Escribe un texto.");
    }

    if (cmd === "choose") {
      const opciones = interaction.options.getString("opciones");
      const lista = opciones?.split("|").map(x => x.trim()).filter(Boolean);
      if (!lista?.length) return interaction.editReply("❌ Separa las opciones con |");
      return interaction.editReply(`🎯 Elegí: **${lista[Math.floor(Math.random() * lista.length)]}**`);
    }

    if (cmd === "coinflip")
      return interaction.editReply(Math.random() <.5? "🪙 **Cara**" : "🪙 **Cruz**");

    if (cmd === "roll") {
      const n = interaction.options.getInteger("caras") || 6;
      return interaction.editReply(`🎲 Resultado: **${Math.floor(Math.random() * n) + 1}**`);
    }

    if (cmd === "dice")
      return interaction.editReply(`🎲 **${Math.floor(Math.random() * 6) + 1}**`);

    if (cmd === "8ball") {
      const respuestas = ["Sí.", "No.", "Probablemente.", "No estoy seguro.", "Definitivamente sí.", "Definitivamente no."];
      return interaction.editReply(`🔮 ${respuestas[Math.floor(Math.random() * respuestas.length)]}`);
    }

    if (cmd === "calc") {
      const op = interaction.options.getString("operacion");
      return interaction.editReply(`🧮 Resultado: **${eval(op)}**`);
    }

    if (cmd === "uppercase") {
      const texto = interaction.options.getString("texto");
      return interaction.editReply(texto?.toUpperCase() || "❌ Falta el texto.");
    }

    if (cmd === "lowercase") {
      const texto = interaction.options.getString("texto");
      return interaction.editReply(texto?.toLowerCase() || "❌ Falta el texto.");
    }

    if (cmd === "reverse") {
      const texto = interaction.options.getString("texto");
      return interaction.editReply(texto?.split("").reverse().join("") || "❌ Falta el texto.");
    }

    if (cmd === "random") {
      const min = interaction.options.getInteger("min");
      const max = interaction.options.getInteger("max");
      return interaction.editReply(`🎲 Número: **${Math.floor(Math.random() * (max - min + 1)) + min}**`);
    }

    if (cmd === "color")
      return interaction.editReply(`🎨 Color: **#${Math.floor(Math.random()*16777215).toString(16)}**`);

    if (cmd === "rate") {
      const texto = interaction.options.getString("texto");
      return interaction.editReply(`${texto}: **${Math.floor(Math.random() * 10) + 1}/10**`);
    }

    if (cmd === "joke") return interaction.editReply("¿Por qué el café fue a la policía? Porque estaba molido ☕");
    if (cmd === "fact") return interaction.editReply("Dato: Los pulpos tienen 3 corazones 🐙");
    if (cmd === "quote") return interaction.editReply('"El éxito es ir de fracaso en fracaso sin perder el entusiasmo"');
    if (cmd === "motivate") return interaction.editReply("Tú puedes con eso bro 💪");

    // ===== ECONOMIA + XP =====
    if (cmd === "daily") {
      data[guildId].users[userId].coins += 100;
      save(data);
      return interaction.editReply("🎁 Recibiste **100 monedas**.");
    }

    if (cmd === "balance") {
      return interaction.editReply(`💰 Tienes **${data[guildId].users[userId].coins} monedas**.`);
    }

    if (cmd === "pay") {
      const target = interaction.options.getUser("usuario");
      const cantidad = interaction.options.getInteger("cantidad");
      if (data[guildId].users[userId].coins < cantidad) return interaction.editReply("❌ No tienes suficientes monedas.");
      data[guildId].users[userId].coins -= cantidad;
      data[guildId].users[target.id]??= { coins: 100, xp: 0, level: 1 };
      data[guildId].users[target.id].coins += cantidad;
      save(data);
      return interaction.editReply(`✅ Pagaste **${cantidad}** monedas a ${target.username}`);
    }

    if (cmd === "work") {
      const ganancia = Math.floor(Math.random() * 50) + 10;
      data[guildId].users[userId].coins += ganancia;
      save(data);
      return interaction.editReply(`💼 Trabajaste y ganaste **${ganancia}** monedas`);
    }

    if (cmd === "gamble") {
      const cantidad = interaction.options.getInteger("cantidad");
      if (data[guildId].users[userId].coins < cantidad) return interaction.editReply("❌ No tienes suficientes monedas.");
      if (Math.random() < 0.5) {
        data[guildId].users[userId].coins -= cantidad;
        save(data);
        return interaction.editReply(`😭 Perdiste **${cantidad}** monedas`);
      } else {
        data[guildId].users[userId].coins += cantidad;
        save(data);
        return interaction.editReply(`🎉 Ganaste **${cantidad}** monedas`);
      }
    }

    if (cmd === "rank" || cmd === "level" || cmd === "xp") {
      const u = data[guildId].users[userId];
      return interaction.editReply(`⭐ **Nivel ${u.level}** | XP: ${u.xp}/100`);
    }

    if (cmd === "leaderboard") return interaction.editReply("🏆 Top: 1. Tú - Nivel 1");

    // ===== INFO BOT =====
    if (cmd === "uptime")
      return interaction.editReply(`⏱️ Uptime: **${Math.floor(process.uptime())} segundos**`);

    if (cmd === "status")
      return interaction.editReply("🟢 **DARK FF V1 está online.**");

    if (cmd === "node")
      return interaction.editReply(`🟢 Node.js: **${process.version}**`);

    if (cmd === "discordjs")
      return interaction.editReply(`📦 Discord.js: **v14**`);

    if (cmd === "userid")
      return interaction.editReply(`🆔 Tu ID: **${interaction.user.id}**`);

    if (cmd === "guildid")
      return interaction.editReply(`🆔 Servidor: **${interaction.guild.id}**`);

    if (cmd === "channelid")
      return interaction.editReply(`🆔 Canal: **${interaction.channel.id}**`);

    if (cmd === "botid")
      return interaction.editReply(`🤖 ID del bot: **${interaction.client.user.id}**`);

    if (cmd === "commands")
      return interaction.editReply(`📜 Tengo **${require("./commands").length}** comandos. Usa /help`);

    if (cmd === "profile") {
      const u = data[guildId].users[userId];
      return interaction.editReply(`👤 Perfil de ${interaction.user.username}\n💰 ${u.coins} monedas\n⭐ Nivel ${u.level}`);
    }

    if (cmd === "stats")
      return interaction.editReply(`📊 Ping: ${interaction.client.ws.ping}ms\n🖥️ Servidores: ${interaction.client.guilds.cache.size}`);

    if (cmd === "time") return interaction.editReply(`🕐 <t:${Math.floor(Date.now()/1000)}:T>`);
    if (cmd === "date") return interaction.editReply(`📅 <t:${Math.floor(Date.now()/1000)}:D>`);

    return interaction.editReply("⚠️ Este comando todavía no tiene función.");

  } catch (error) {
    console.error(error);
    if (!interaction.replied)
      await interaction.editReply("❌ Ocurrió un error ejecutando el comando.");
  }
};
