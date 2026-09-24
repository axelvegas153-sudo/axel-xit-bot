const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const fetch = require('node-fetch'); // npm i node-fetch@2

const file = "./database.json";

// Leer DB
function db() {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return {};
  }
}

// Guardar DB
let saveTimeout;
function save(data) {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  }, 5000);
}

// XP AL HABLAR
module.exports.client = (client) => {
  client.on("messageCreate", async (message) => {
    if(message.author.bot) return;
    const data = db();
    const guildId = message.guild.id;
    const userId = message.author.id;

    data[guildId]??= { users: {} };
    data[guildId].users[userId]??= { coins: 100, xp: 0, level: 1 };

    data[guildId].users[userId].xp += 1;

    const xpNecesaria = data[guildId].users[userId].level * 100;
    if(data[guildId].users[userId].xp >= xpNecesaria){
      data[guildId].users[userId].level += 1;
      data[guildId].users[userId].xp = 0;
      message.channel.send(`🎉 ${message.author} subió a nivel ${data[guildId].users[userId].level}!`);
    }
    save(data);
  });
}

module.exports = async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = interaction.commandName;
  const data = db();
  const guildId = interaction.guild.id;
  const userId = interaction.user.id;

  data[guildId]??= { users: {} };
  data[guildId].users[userId]??= { coins: 100, xp: 0, level: 1 };

  try {
    await interaction.deferReply();

    // ===== BASICOS =====
    if (cmd === "ping") return interaction.editReply(`🏓 Pong! ${interaction.client.ws.ping}ms`);
    if (cmd === "help") return interaction.editReply({ embeds: [new EmbedBuilder().setTitle("🤖 DARK FF V1").setDescription("Bot público de Discord\nTengo 50+ comandos\nUsa `/commands` para verlos todos.").setColor(0x5865F2)] });
    if (cmd === "botinfo") return interaction.editReply(`🤖 **DARK FF V1**\n📡 Ping: ${interaction.client.ws.ping}ms\n⚙️ Discord.js v14\n📦 ${require("./commands").length} comandos`);

    // ===== INFO =====
    if (cmd === "serverinfo") {
      const embed = new EmbedBuilder().setTitle(`🌐 ${interaction.guild.name}`).addFields({ name: "👥 Miembros", value: `${interaction.guild.memberCount}`, inline: true }, { name: "🆔 ID", value: interaction.guild.id, inline: true }).setThumbnail(interaction.guild.iconURL());
      return interaction.editReply({ embeds: [embed] });
    }
    if (cmd === "userinfo") {
      const user = interaction.options.getUser("usuario") || interaction.user;
      const member = await interaction.guild.members.fetch(user.id);
      const embed = new EmbedBuilder().setTitle(`👤 ${user.username}`).setThumbnail(user.displayAvatarURL()).addFields({ name: "🆔 ID", value: user.id }, { name: "📅 Cuenta creada", value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>` }, { name: "📥 Se unió", value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>` });
      return interaction.editReply({ embeds: [embed] });
    }
    if (cmd === "avatar") {
      const user = interaction.options.getUser("usuario") || interaction.user;
      return interaction.editReply(user.displayAvatarURL({ size: 1024 }));
    }
    if (cmd === "servericon") return interaction.editReply(interaction.guild.iconURL({ size: 1024 }) || "❌ Este servidor no tiene icono.");
    if (cmd === "members") return interaction.editReply(`👥 Este servidor tiene **${interaction.guild.memberCount}** miembros.`);
    if (cmd === "roles") return interaction.editReply(`🎭 Roles: **${interaction.guild.roles.cache.size}**`);
    if (cmd === "channels") return interaction.editReply(`📁 Canales: **${interaction.guild.channels.cache.size}**`);

    // ===== MOD =====
    if (cmd === "kick") {
      if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) return interaction.editReply("❌ No tienes permiso.");
      const user = interaction.options.getUser("usuario");
      await interaction.guild.members.kick(user.id);
      return interaction.editReply(`👢 Kick a ${user.tag}`);
    }
    if (cmd === "ban") {
      if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) return interaction.editReply("❌ No tienes permiso.");
      const user = interaction.options.getUser("usuario");
      await interaction.guild.members.ban(user.id);
      return interaction.editReply(`🔨 Ban a ${user.tag}`);
    }
    if (cmd === "clear") {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) return interaction.editReply("❌ No tienes permiso.");
      const cantidad = interaction.options.getInteger("cantidad");
      await interaction.channel.bulkDelete(cantidad, true);
      return interaction.editReply(`🧹 Eliminados **${cantidad}** mensajes.`);
    }
    if (cmd === "timeout") {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.editReply("❌ No tienes permiso.");
      const user = interaction.options.getUser("usuario");
      const minutos = interaction.options.getInteger("minutos");
      const member = await interaction.guild.members.fetch(user.id);
      await member.timeout(minutos * 60000);
      return interaction.editReply(`⏰ Timeout de ${minutos} min a ${user.tag}`);
    }
    if (cmd === "untimeout") {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.editReply("❌ No tienes permiso.");
      const user = interaction.options.getUser("usuario");
      const member = await interaction.guild.members.fetch(user.id);
      await member.timeout(null);
      return interaction.editReply(`✅ Timeout quitado a ${user.tag}`);
    }

    // ===== LENGUAJE =====
    if (cmd === "lenguaje") {
      const idioma = interaction.options.getString("idioma");
      return interaction.editReply(idioma === "es"? "🌎 Ahora hablo Español 🇪🇸" : "🌎 Now I speak English 🇺🇸");
    }

    // ===== DIVERSION =====
    if (cmd === "say") return interaction.editReply(interaction.options.getString("texto") || "❌ Escribe un texto.");
    if (cmd === "choose") {
      const lista = interaction.options.getString("opciones")?.split("|").map(x => x.trim()).filter(Boolean);
      if (!lista?.length) return interaction.editReply("❌ Separa las opciones con |");
      return interaction.editReply(`🎯 Elegí: **${lista[Math.floor(Math.random() * lista.length)]}**`);
    }
    if (cmd === "coinflip") return interaction.editReply(Math.random() <.5? "🪙 **Cara**" : "🪙 **Cruz**");
    if (cmd === "roll") return interaction.editReply(`🎲 Resultado: **${Math.floor(Math.random() * (interaction.options.getInteger("caras") || 6)) + 1}**`);
    if (cmd === "dice") return interaction.editReply(`🎲 **${Math.floor(Math.random() * 6) + 1}**`);
    if (cmd === "8ball") return interaction.editReply(`❓ ${interaction.options.getString("pregunta")}\n🔮 ${["Sí.","No.","Probablemente.","No estoy seguro.","Definitivamente sí.","Definitivamente no."][Math.floor(Math.random() * 6)]}`);
    if (cmd === "calc") return interaction.editReply(`🧮 Resultado: **${eval(interaction.options.getString("operacion"))}**`);
    if (cmd === "uppercase") return interaction.editReply(interaction.options.getString("texto")?.toUpperCase() || "❌ Falta el texto.");
    if (cmd === "lowercase") return interaction.editReply(interaction.options.getString("texto")?.toLowerCase() || "❌ Falta el texto.");
    if (cmd === "reverse") return interaction.editReply(interaction.options.getString("texto")?.split("").reverse().join("") || "❌ Falta el texto.");
    if (cmd === "random") return interaction.editReply(`🎲 Número: **${Math.floor(Math.random() * (interaction.options.getInteger("max") - interaction.options.getInteger("min") + 1)) + interaction.options.getInteger("min")}**`);
    if (cmd === "color") return interaction.editReply(`🎨 Color: **#${Math.floor(Math.random()*16777215).toString(16)}**`);
    if (cmd === "rate") return interaction.editReply(`${interaction.options.getString("texto")}: **${Math.floor(Math.random() * 10) + 1}/10**`);
    if (cmd === "joke") return interaction.editReply("¿Por qué el café fue a la policía? Porque estaba molido ☕");
    if (cmd === "fact") return interaction.editReply("Dato: Los pulpos tienen 3 corazones 🐙");
    if (cmd === "quote") return interaction.editReply('"El éxito es ir de fracaso en fracaso sin perder el entusiasmo"');
    if (cmd === "motivate") return interaction.editReply(`💪 **Motivación:** ${interaction.options.getString("frase")}\nTú puedes con eso bro!`);

    // ===== NUEVOS COMANDOS NEKO =====
    const pushGifs = ["https://media.tenor.com/ZK1JxQZQZQZ.gif","https://media.tenor.com/2KZQZQZQZQZ.gif","https://media.tenor.com/9KZQZQZQZQZ.gif"];
    if (cmd === "push") {
      const u = interaction.options.getUser("usuario");
      if (u.id === interaction.user.id) return interaction.editReply("🤦 No te puedes empujar a ti mismo");
      const embed = new EmbedBuilder().setTitle("👊 EMPUJÓN").setDescription(`${interaction.user} empujó a ${u}`).setImage(pushGifs[Math.floor(Math.random() * pushGifs.length)]).setColor(0xff0000);
      return interaction.editReply({ embeds: [embed] });
    }
    if (cmd === "ship") {
      const p1 = interaction.options.getUser("persona1");
      const p2 = interaction.options.getUser("persona2");
      const porcentaje = (p1.id + p2.id).split('').reduce((a,b)=>a+b.charCodeAt(0),0) % 101;
      let nivel = porcentaje > 80? "❤️ Amor verdadero" : porcentaje > 60? "💗 Me gustas" : porcentaje > 40? "💜 Me caes bien" : "💙 Amigos";
      const embed = new EmbedBuilder().setTitle("💘 SHIP").setDescription(`**${p1.username}** ❤️ **${p2.username}**`).addFields({ name: "Compatibilidad", value: `${porcentaje}%`, inline: true }, { name: "Nivel", value: nivel, inline: true }).setColor(0xff69b4);
      return interaction.editReply({ embeds: [embed] });
    }
    if (cmd === "funar") return interaction.editReply(`📢 **FUNADO** 📢\n${interaction.options.getUser("usuario")} ${interaction.options.getString("motivo") || "hacer cosas raras"}\nSin toxicidad ❤️`);

    // ===== IA =====
    if (cmd === "ia") {
      try {
        const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(interaction.options.getString("pregunta"))}?model=openai`);
        let respuestaIA = await res.text();
        if(respuestaIA.length > 1000) respuestaIA = respuestaIA.slice(0, 997) + "...";
        const embed = new EmbedBuilder().setTitle("🤖 DARK FF IA").addFields({ name: "❓ Pregunta", value: interaction.options.getString("pregunta") }, { name: "💡 Respuesta", value: respuestaIA }).setColor(0x5865F2);
        return interaction.editReply({ embeds: [embed] });
      } catch { return interaction.editReply("❌ La IA falló"); }
    }
    if (cmd === "crear") {
      const embed = new EmbedBuilder().setTitle("🎨 IMAGEN GENERADA").setDescription(`**Prompt:** ${interaction.options.getString("prompt")}`).setImage(`https://image.pollinations.ai/prompt/${encodeURIComponent(interaction.options.getString("prompt") + ", 4k, anime style")}`).setColor(0x9b59b6);
      return interaction.editReply({ embeds: [embed] });
    }

    // ===== ECONOMIA + XP =====
    if (cmd === "daily") { data[guildId].users[userId].coins += 100; save(data); return interaction.editReply("🎁 Recibiste **100 monedas**."); }
    if (cmd === "balance") return interaction.editReply(`💰 Tienes **${data[guildId].users[userId].coins} monedas**.`);
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
    if (cmd === "work") { const ganancia = Math.floor(Math.random() * 50) + 10; data[guildId].users[userId].coins += ganancia; save(data); return interaction.editReply(`💼 Trabajaste y ganaste **${ganancia}** monedas`); }
    if (cmd === "gamble") {
      const cantidad = interaction.options.getInteger("cantidad");
      if (data[guildId].users[userId].coins < cantidad) return interaction.editReply("❌ No tienes suficientes monedas.");
      if (Math.random() < 0.5) { data[guildId].users[userId].coins -= cantidad; save(data); return interaction.editReply(`😭 Perdiste **${cantidad}** monedas`); }
      else { data[guildId].users[userId].coins += cantidad; save(data); return interaction.editReply(`🎉 Ganaste **${cantidad}** monedas`); }
    }
    if (cmd === "rank" || cmd === "level" || cmd === "xp") {
      const u = interaction.options.getUser("usuario") || interaction.user;
      const udata = data[guildId].users[u.id] || { coins: 100, xp: 0, level: 1 };
      const embed = new EmbedBuilder().setTitle(`⭐ XP DE ${u.username}`).addFields({ name: "Nivel", value: `${udata.level}`, inline: true }, { name: "XP", value: `${udata.xp}/${udata.level * 100}`, inline: true }).setThumbnail(u.displayAvatarURL()).setColor(0xffd700);
      return interaction.editReply({ embeds: [embed] });
    }
    if (cmd === "leaderboard") {
      const users = Object.entries(data[guildId].users).sort((a,b) => b[1].level - a[1].level).slice(0, 10);
      let texto = "";
      users.forEach(([id, u], i) => texto += `**${i+1}.** <@${id}> - Nivel ${u.level} | ${u.xp} XP\n`);
      return interaction.editReply({ embeds: [new EmbedBuilder().setTitle("🏆 TOP XP").setDescription(texto || "Nadie aún").setColor(0xffd700)] });
    }

    // ===== INFO BOT =====
    if (cmd === "uptime") return interaction.editReply(`⏱️ Uptime: **${Math.floor(process.uptime())} segundos**`);
    if (cmd === "status") return interaction.editReply("🟢 **DARK FF V1 está online.**");
    if (cmd === "node") return interaction.editReply(`🟢 Node.js: **${process.version}**`);
    if (cmd === "discordjs") return interaction.editReply(`📦 Discord.js: **v14**`);
    if (cmd === "userid") return interaction.editReply(`🆔 Tu ID: **${interaction.user.id}**`);
    if (cmd === "guildid") return interaction.editReply(`🆔 Servidor: **${interaction.guild.id}**`);
    if (cmd === "channelid") return interaction.editReply(`🆔 Canal: **${interaction.channel.id}**`);
    if (cmd === "botid") return interaction.editReply(`🤖 ID del bot: **${interaction.client.user.id}**`);
    if (cmd === "commands") return interaction.editReply(`📜 Tengo **${require("./commands").length}** comandos. Usa /help`);
    if (cmd === "profile") { const u = data[guildId].users[userId]; return interaction.editReply(`👤 Perfil de ${interaction.user.username}\n💰 ${u.coins} monedas\n⭐ Nivel ${u.level} | XP ${u.xp}`); }
    if (cmd === "stats") return interaction.editReply(`📊 Ping: ${interaction.client.ws.ping}ms\n🖥️ Servidores: ${interaction.client.guilds.cache.size}`);
    if (cmd === "time") return interaction.editReply(`🕐 <t:${Math.floor(Date.now()/1000)}:T>`);
    if (cmd === "date") return interaction.editReply(`📅 <t:${Math.floor(Date.now()/1000)}:D>`);

    return interaction.editReply("⚠️ Este comando todavía no tiene función.");

  } catch (error) {
    console.error(error);
    if (!interaction.replied) await interaction.editReply("❌ Ocurrió un error ejecutando el comando.");
  }
};
