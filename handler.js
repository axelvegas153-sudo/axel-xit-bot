const { EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField } = require("discord.js");
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

// IDIOMAS
const lang = {
  es: {
    afk_set: "Estado ausente establecido.", afk_motivo: "Motivo:", afk_aviso: "Avisaré a quienes te mencionen. >w<", back: "Bienvenido de vuelta",
    afk_mention: "está AFK", lleva: "Lleva", min: "min ausente",
    ship_name: "El nombre del ship es", ship_comp: "La compatibilidad es", ship_oppose: "Me opongo completamente a esta relación. :x",
    birthday_happy: "¡FELIZ CUMPLEAÑOS!", birthday_text: "¡Hoy es el cumple de"
  },
  en: {
    afk_set: "Away status set.", afk_motivo: "Reason:", afk_aviso: "I will notify those who mention you. >w<", back: "Welcome back",
    afk_mention: "is AFK", lleva: "Has been", min: "min away",
    ship_name: "The ship name is", ship_comp: "The compatibility is", ship_oppose: "I completely oppose this relationship. :x",
    birthday_happy: "HAPPY BIRTHDAY!", birthday_text: "Today is"
  }
}

// XP AL HABLAR + AFK
module.exports.client = (client) => {
  client.on("messageCreate", async (message) => {
    if(message.author.bot) return;
    const data = db();
    const guildId = message.guild.id;
    const userId = message.author.id;

    data[guildId]??= { users: {} };
    data[guildId].users[userId]??= { coins: 100, xp: 0, level: 1, totalXp: 0, lang: "es" };

    const userLang = data[guildId].users[userId].lang || "es";
    const t = lang[userLang];

    // QUITAR AFK AL HABLAR
    if(data[guildId].users[userId].afk){
      const tiempo = Math.floor((Date.now() - data[guildId].users[userId].afk.time) / 1000 / 60);
      const motivoAnterior = data[guildId].users[userId].afk.motivo;
      delete data[guildId].users[userId].afk;

      const embed = new EmbedBuilder()
      .setAuthor({ name: message.author.displayName, iconURL: message.author.displayAvatarURL() })
      .setTitle("📜 ESTADO AUSENTE DESACTIVADO")
      .setDescription(`**${message.author.username}** ya volvió`)
      .addFields(
          { name: "⏰ Tiempo ausente", value: `${tiempo} minutos`, inline: true },
          { name: "📝 Motivo anterior", value: motivoAnterior, inline: true }
        )
      .setColor(0x00ff00)
      .setTimestamp();

      message.channel.send({ embeds: [embed] });
    }

    // AVISAR SI MENCIONAN A ALGUIEN AFK
    message.mentions.users.forEach(async (u) => {
      if(data[guildId].users[u.id]?.afk){
        const afkData = data[guildId].users[u.id].afk;
        const tiempo = Math.floor((Date.now() - afkData.time) / 1000 / 60);
        const uLang = data[guildId].users[u.id].lang || "es";
        const tu = lang[uLang];

        const embed = new EmbedBuilder()
        .setTitle("💤 USUARIO AUSENTE")
        .setDescription(`**${u.username}** está AFK`)
        .addFields(
            { name: "📝 Motivo", value: afkData.motivo, inline: true },
            { name: "⏰ Lleva", value: `${tiempo} min ausente`, inline: true }
          )
        .setColor(0xffaa00)
        .setThumbnail(u.displayAvatarURL());

        message.reply({ embeds: [embed] });
      }
    });

    data[guildId].users[userId].xp += 5;
    data[guildId].users[userId].totalXp += 5;

    const xpNecesaria = data[guildId].users[userId].level * 100;
    if(data[guildId].users[userId].xp >= xpNecesaria){
      data[guildId].users[userId].level += 1;
      data[guildId].users[userId].xp = 0;
      message.channel.send(`🎉 ${message.author} subió a nivel **${data[guildId].users[userId].level}**!`);
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
  data[guildId].users[userId]??= { coins: 100, xp: 0, level: 1, totalXp: 0, lang: "es" };
  const userLang = data[guildId].users[userId].lang || "es";
  const t = lang[userLang];

  try {
    await interaction.deferReply();

    // ===== BASICOS =====
    if (cmd === "ping") return interaction.editReply(`🏓 Pong! ${interaction.client.ws.ping}ms`);
    if (cmd === "help") {
      const embed = new EmbedBuilder()
      .setTitle("🤖 DARK FF V1 - LISTA DE COMANDOS")
      .setDescription("Aquí tienes todos mis comandos. Usa `/` para verlos")
      .setColor("Blurple")
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .addFields(
          { name: "📊 INFO", value: "`/help` `/ping` `/botinfo` `/serverinfo` `/userinfo` `/avatar` `/servericon` `/members` `/roles` `/channels`", inline: false },
          { name: "🛡️ MODERACIÓN", value: "`/kick` `/ban` `/clear` `/timeout` `/untimeout`", inline: false },
          { name: "⚙️ UTILS", value: "`/say` `/choose` `/8ball` `/roll` `/coinflip` `/calc` `/random`", inline: false },
          { name: "💰 NIVEL + ECONOMIA", value: "`/rank` `/xp` `/leaderboard` `/daily` `/balance` `/pay` `/work` `/gamble` `/profile`", inline: false },
          { name: "🔥 DARK FF EXCLUSIVOS", value: "`/ia` `/ask` `/crear` `/funar` `/push` `/punch` `/ship` `/afk` `/lenguaje` `/birthday-set` `/birthday-setup` `/ticket-setup` `/ticket-close`", inline: false }
        )
      .setFooter({ text: `Solicitado por ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();
      return interaction.editReply({ embeds: [embed] });
    }
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

    // ===== IDIOMA =====
    if (cmd === "lenguaje") {
      const idioma = interaction.options.getString("idioma");
      data[guildId].users[userId].lang = idioma;
      save(data);
      return interaction.editReply(idioma === "es"? "🌎 Ahora hablo Español 🇪🇸" : "🌎 Now I speak English 🇺🇸");
    }

    // ===== AFK BONITO =====
    if (cmd === "afk") {
      const motivo = interaction.options.getString("motivo") || "No especificado";
      data[guildId].users[userId].afk = { motivo: motivo, time: Date.now() };
      save(data);

      const embed = new EmbedBuilder()
      .setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
      .setTitle("📜 ESTADO AUSENTE ACTIVADO")
      .setDescription(`**${interaction.user.username}** ahora está AFK`)
      .addFields({ name: "📝 Motivo", value: motivo })
      .setColor(0xffaa00)
      .setTimestamp()
      .setFooter({ text: "Avisaré a quienes te mencionen" });

      return interaction.editReply({ embeds: [embed] });
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
    if (cmd === "8ball") return interaction.editReply(`❓ ${interaction.options.getString("pregunta")}\n🔮 ${["Sí.","No.","Probablemente.","No estoy seguro.","Definitivamente sí.","Definitivamente no."][Math.floor(Math.random() * 6)]}`);
    if (cmd === "calc") return interaction.editReply(`🧮 Resultado: **${eval(interaction.options.getString("operacion"))}**`);
    if (cmd === "random") return interaction.editReply(`🎲 Número: **${Math.floor(Math.random() * (interaction.options.getInteger("max") - interaction.options.getInteger("min") + 1)) + interaction.options.getInteger("min")}**`);

    // ===== NUEVOS COMANDOS NEKO =====
    if (cmd === "push") {
      const u = interaction.options.getUser("usuario");
      if (u.id === interaction.user.id) return interaction.editReply("🤦 No te puedes empujar a ti mismo");
      const embed = new EmbedBuilder().setTitle("👊 EMPUJÓN").setDescription(`**${interaction.user.username}** empuja a **${u.username}**`).setImage("https://media.tenor.com/ZK1JxQZQZQZ.gif").setColor(0xff0000);
      return interaction.editReply({ embeds: [embed] });
    }

    if (cmd === "punch") {
      const u = interaction.options.getUser("usuario");
      if (u.id === interaction.user.id) return interaction.editReply("🤦 No te puedes pegar a ti mismo");
      const gifs = [
        "https://media.tenor.com/8oZ0mQf8wEAAAAAd/anime-punch.gif",
        "https://media.tenor.com/5YbR5b4w0kAAAAAd/baki-punch.gif",
        "https://media.tenor.com/oQ2k3Z2k4EAAAAAd/saitama-punch.gif"
      ];
      const randomGif = gifs[Math.floor(Math.random() * gifs.length)];
      const embed = new EmbedBuilder().setTitle(`${interaction.user.username} ataca a ${u.username}`).setDescription(`💥 ${interaction.user} le metió un tremendo golpe a ${u}`).setImage(randomGif).setFooter({text: "Anime: Baki Hanma"}).setColor(0xff0000);
      return interaction.editReply({ content: `${u}`, embeds: [embed] });
    }

    if (cmd === "ship") {
      const p1 = interaction.options.getUser("persona1");
      const p2 = interaction.options.getUser("persona2");
      const shipName = (p1.username.slice(0,3) + p2.username.slice(-3)).toLowerCase();
      const porcentaje = Math.floor(Math.random() * 101);
      let frase = porcentaje > 70? "💖 ALMA GEMELAS!" : porcentaje > 50? "❤️ Hay química entre ustedes" : porcentaje > 30? "💛 Hay algo ahí..." : "💔 No hay química...";
      const embed = new EmbedBuilder().setTitle(`💘 Ship: ${p1.username} x ${p2.username}`).setThumbnail(p1.displayAvatarURL()).addFields({ name: `Pareja`, value: `${p1} ❤️ ${p2}`, inline: false }, { name: `Nombre del Ship`, value: `\`${shipName}\``, inline: true }, { name: `Compatibilidad`, value: `\`${porcentaje}%\``, inline: true }, { name: `Resultado`, value: frase, inline: false }).setImage(`https://api.popcat.xyz/ship?user1=${p1.displayAvatarURL({extension: 'png'})}&user2=${p2.displayAvatarURL({extension: 'png'})}`).setColor(porcentaje > 50? 0xff69b4 : 0xe74c3c);
      return interaction.editReply({ embeds: [embed] });
    }

    if (cmd === "funar") return interaction.editReply(`📢 **FUNADO** 📢\n${interaction.options.getUser("usuario")} ${interaction.options.getString("motivo") || "hacer cosas raras"}\nSin toxicidad ❤️`);

    // ===== IA =====
    if (cmd === "ia" || cmd === "ask") {
      try {
        const pregunta = interaction.options.getString("pregunta");
        await interaction.editReply("🤖 DARK FF IA está pensando...");
        const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(`Responde en ${userLang === "es"?"español":"english"}. ${pregunta}`)}?model=openai-fast`);
        let respuestaIA = await res.text();
        if(respuestaIA.length > 4000) respuestaIA = respuestaIA.slice(0, 3997) + "...";
        const embed = new EmbedBuilder().setAuthor({ name: "DARK FF IA" }).setTitle(`Pregunta: ${pregunta}`).setDescription(respuestaIA).setColor(0x5865F2);
        return interaction.editReply({ embeds: [embed] });
      } catch { return interaction.editReply("❌ La IA falló"); }
    }

    if (cmd === "crear") {
      const prompt = interaction.options.getString("prompt");
      await interaction.editReply("🎨 Generando imagen, espera 10s...");
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + ", 4k, anime style, detailed")}?width=1024&height=1024&model=flux`;
      const embed = new EmbedBuilder().setTitle("🎨 IMAGEN GENERADA").setDescription(`**Prompt:** ${prompt}`).setImage(imageUrl).setColor(0x9b59b6).setFooter({ text: `Solicitado por ${interaction.user.username}` });
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
      data[guildId].users[target.id]??= { coins: 100, xp: 0, level: 1, totalXp: 0, lang: "es" };
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

    // RANK + LEADERBOARD PRO
    if (cmd === "rank" || cmd === "xp" || cmd === "level") {
      const u = interaction.options.getUser("usuario") || interaction.user;
      const udata = data[guildId].users[u.id] || { coins: 100, xp: 0, level: 1, totalXp: 0 };
      const usersSorted = Object.entries(data[guildId].users).sort((a,b) => b[1].totalXp - a[1].totalXp);
      const rank = usersSorted.findIndex(([id]) => id === u.id) + 1;
      const xpNecesaria = udata.level * 100;
      const porcentaje = Math.floor((udata.xp / xpNecesaria) * 100);
      const barra = "▰".repeat(Math.floor(porcentaje/10)) + "▱".repeat(10 - Math.floor(porcentaje/10));
      const embed = new EmbedBuilder().setTitle(`Rank #${rank} Level ${udata.level}`).setDescription(`**${u.username}**\n${udata.xp} / ${xpNecesaria} (${porcentaje}%)\n${barra}`).setThumbnail(u.displayAvatarURL()).setColor(0xffd700);
      return interaction.editReply({ embeds: [embed] });
    }

    if (cmd === "leaderboard") {
      const users = Object.entries(data[guildId].users).sort((a,b) => b[1].totalXp - a[1].totalXp).slice(0, 10);
      let texto = ""; const medallas = ["🥇","🥈","🥉"];
      users.forEach(([id, u], i) => {
        const medalla = i < 3? medallas[i] : `#${i+1}`;
        const user = interaction.guild.members.cache.get(id);
        const nombre = user? user.displayName : "Usuario";
        texto += `**${medalla} @${nombre}**: Level ${u.level}\n| \`${u.totalXp.toLocaleString()} XP\`\n\n`;
      });
      return interaction.editReply({ embeds: [new EmbedBuilder().setAuthor({ name: `LEADERBOARD DE ${interaction.guild.name}`, iconURL: interaction.guild.iconURL() }).setDescription(texto).setColor(0xffd700)] });
    }

    // ===== TICKET =====
    if (cmd === "ticket-setup") {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.editReply("❌ Solo Admins");
      const canal = interaction.options.getChannel("canal");
      const embed = new EmbedBuilder().setTitle("🎫 SISTEMA DE SOPORTE").setDescription("**RECUERDA EL SOPORTE TE RESPONDERA LO ANTES POSIBLE.**\n\nDALE CLICK AQUI PARA CREAR TU TICKET📌").setColor(0xff0000);
      const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("create_ticket").setLabel("Create Ticket").setStyle(ButtonStyle.Danger).setEmoji("🎟️"));
      await canal.send({ embeds: [embed], components: [row] });
      return interaction.editReply(`✅ Panel de tickets enviado en ${canal}`);
    }
    if (cmd === "ticket-close") {
      if (!interaction.channel.name.startsWith("ticket-")) return interaction.editReply("❌ Este comando solo se usa en tickets");
      await interaction.editReply("🔒 Cerrando ticket en 5 segundos...");
      setTimeout(() => interaction.channel.delete(), 5000);
    }

    // ===== CUMPLEAÑOS =====
    if (cmd === "birthday-set") {
      const fecha = interaction.options.getString("fecha");
      if (!/^\d{2}\/\d{2}$/.test(fecha)) return interaction.editReply("❌ Formato: DD/MM. Ejemplo: 25/12");
      data[guildId].users[userId].birthday = fecha;
      save(data);
      return interaction.editReply(`🎂 Listo! Tu cumpleaños: **${fecha}**`);
    }
    if (cmd === "birthday-setup") {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.editReply("❌ Solo Admins");
      data[guildId].birthdayChannel = interaction.options.getChannel("canal").id;
      data[guildId].birthdayRole = interaction.options.getRole("rol").id;
      save(data);
      return interaction.editReply(`✅ Cumpleaños configurado`);
    }

    // ===== INFO BOT =====
    if (cmd === "profile") { const u = data[guildId].users[userId]; return interaction.editReply(`👤 Perfil de ${interaction.user.username}\n💰 ${u.coins} monedas\n⭐ Nivel ${u.level} | XP ${u.xp}/${u.level * 100}`); }

    return interaction.editReply("⚠️ Este comando todavía no tiene función.");

  } catch (error) {
    console.error(error);
    if (!interaction.replied) await interaction.editReply("❌ Ocurrió un error ejecutando el comando.");
  }
};

// BOTONES
module.exports.buttonHandler = async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === "create_ticket") {
    const guild = interaction.guild;
    const user = interaction.user;

    const ticketChannel = await guild.channels.create({
      name: `ticket-${user.username}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
      ],
    });

    await ticketChannel.send({
      content: `${user}`,
      embeds: [
        new EmbedBuilder().setTitle(`Ticket de ${user.username}`).setDescription("Un staff te atenderá pronto. Describe tu problema.").setColor("Green")
      ]
    });

    await interaction.reply({ content: `✅ Ticket creado: ${ticketChannel}`, ephemeral: true });
  }
}
