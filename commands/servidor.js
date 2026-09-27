const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType
} = require("discord.js");

const commands = [];


/* =========================================================
   /serverinfo
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Muestra información del servidor."),

  async execute(interaction) {
    const guild = interaction.guild;

    const embed = new EmbedBuilder()
      .setTitle(`📊 ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        {
          name: "🆔 ID",
          value: guild.id,
          inline: true
        },
        {
          name: "👑 Dueño",
          value: `<@${guild.ownerId}>`,
          inline: true
        },
        {
          name: "👥 Miembros",
          value: `${guild.memberCount}`,
          inline: true
        },
        {
          name: "💬 Canales",
          value: `${guild.channels.cache.size}`,
          inline: true
        },
        {
          name: "🎭 Roles",
          value: `${guild.roles.cache.size}`,
          inline: true
        },
        {
          name: "😀 Emojis",
          value: `${guild.emojis.cache.size}`,
          inline: true
        },
        {
          name: "🚀 Boosts",
          value: `${guild.premiumSubscriptionCount || 0}`,
          inline: true
        },
        {
          name: "📅 Creado",
          value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`,
          inline: true
        },
        {
          name: "🔐 Verificación",
          value: `${guild.verificationLevel}`,
          inline: true
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
   /servericon
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("servericon")
    .setDescription("Muestra el icono del servidor."),

  async execute(interaction) {
    const guild = interaction.guild;

    const icon = guild.iconURL({
      extension: "png",
      size: 1024
    });

    if (!icon) {
      return interaction.reply({
        content: "❌ Este servidor no tiene icono.",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(`🖼️ Icono de ${guild.name}`)
      .setImage(icon)
      .setURL(icon);

    return interaction.reply({
      embeds: [embed]
    });
  }
});


/* =========================================================
   /serverbanner
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("serverbanner")
    .setDescription("Muestra el banner del servidor."),

  async execute(interaction) {
    const guild = interaction.guild;

    const banner = guild.bannerURL({
      extension: "png",
      size: 2048
    });

    if (!banner) {
      return interaction.reply({
        content: "❌ Este servidor no tiene banner.",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(`🎨 Banner de ${guild.name}`)
      .setImage(banner)
      .setURL(banner);

    return interaction.reply({
      embeds: [embed]
    });
  }
});


/* =========================================================
   /roles
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("roles")
    .setDescription("Muestra los roles del servidor."),

  async execute(interaction) {
    const roles = interaction.guild.roles.cache
      .sort((a, b) => b.position - a.position)
      .filter(role => role.id !== interaction.guild.id);

    if (!roles.size) {
      return interaction.reply(
        "📭 Este servidor no tiene roles personalizados."
      );
    }

    const lista = roles
      .map(role => `${role} — \`${role.id}\``)
      .slice(0, 50)
      .join("\n");

    const embed = new EmbedBuilder()
      .setTitle("🎭 Roles del servidor")
      .setDescription(lista)
      .setFooter({
        text: `Total: ${roles.size} roles`
      })
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
});


/* =========================================================
   /channels
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("channels")
    .setDescription("Muestra los canales del servidor."),

  async execute(interaction) {
    const guild = interaction.guild;

    const texto = guild.channels.cache
      .filter(channel => channel.type === ChannelType.GuildText)
      .map(channel => `💬 ${channel}`)
      .slice(0, 40)
      .join("\n") || "Ninguno";

    const voz = guild.channels.cache
      .filter(channel => channel.type === ChannelType.GuildVoice)
      .map(channel => `🔊 ${channel.name}`)
      .slice(0, 30)
      .join("\n") || "Ninguno";

    const embed = new EmbedBuilder()
      .setTitle("📚 Canales del servidor")
      .addFields(
        {
          name: "💬 Texto",
          value: texto
        },
        {
          name: "🔊 Voz",
          value: voz
        }
      )
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
});


/* =========================================================
   /members
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("members")
    .setDescription("Muestra estadísticas de miembros."),

  async execute(interaction) {
    const guild = interaction.guild;

    const bots = guild.members.cache.filter(
      member => member.user.bot
    ).size;

    const humanos = guild.memberCount - bots;

    const embed = new EmbedBuilder()
      .setTitle("👥 Miembros")
      .addFields(
        {
          name: "👤 Humanos",
          value: `${humanos}`,
          inline: true
        },
        {
          name: "🤖 Bots",
          value: `${bots}`,
          inline: true
        },
        {
          name: "📊 Total",
          value: `${guild.memberCount}`,
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
   /emojis
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("emojis")
    .setDescription("Muestra los emojis del servidor."),

  async execute(interaction) {
    const emojis = interaction.guild.emojis.cache;

    if (!emojis.size) {
      return interaction.reply(
        "😶 Este servidor no tiene emojis personalizados."
      );
    }

    const lista = emojis
      .map(emoji => `${emoji} \`${emoji.name}\``)
      .join(" ");

    const embed = new EmbedBuilder()
      .setTitle("😀 Emojis del servidor")
      .setDescription(lista.slice(0, 4000))
      .setFooter({
        text: `Total: ${emojis.size}`
      });

    return interaction.reply({
      embeds: [embed]
    });
  }
});


/* =========================================================
   /servercreated
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("servercreated")
    .setDescription("Muestra cuándo fue creado el servidor."),

  async execute(interaction) {
    const guild = interaction.guild;

    return interaction.reply(
      `📅 **${guild.name}** fue creado el <t:${Math.floor(
        guild.createdTimestamp / 1000
      )}:F>.`
    );
  }
});


/* =========================================================
   /owner
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("owner")
    .setDescription("Muestra al dueño del servidor."),

  async execute(interaction) {
    const owner = await interaction.guild.fetchOwner();

    const embed = new EmbedBuilder()
      .setTitle("👑 Dueño del servidor")
      .setThumbnail(owner.user.displayAvatarURL())
      .addFields(
        {
          name: "👤 Usuario",
          value: `${owner.user}`,
          inline: true
        },
        {
          name: "🆔 ID",
          value: owner.id,
          inline: true
        },
        {
          name: "📅 Cuenta creada",
          value: `<t:${Math.floor(
            owner.user.createdTimestamp / 1000
          )}:R>`,
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
   /setname
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("setname")
    .setDescription("Cambia el nombre del servidor.")
    .addStringOption(option =>
      option
        .setName("nombre")
        .setDescription("Nuevo nombre")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    ),

  async execute(interaction) {
    const nombre =
      interaction.options.getString("nombre");

    try {
      await interaction.guild.setName(nombre);

      return interaction.reply(
        `✅ El nombre del servidor ahora es **${nombre}**.`
      );
    } catch (error) {
      console.error("Error en /setname:", error);

      return interaction.reply({
        content: "❌ No pude cambiar el nombre del servidor.",
        ephemeral: true
      });
    }
  }
});


/* =========================================================
   /setverification
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("setverification")
    .setDescription("Cambia el nivel de verificación.")
    .addStringOption(option =>
      option
        .setName("nivel")
        .setDescription("Nivel de verificación")
        .setRequired(true)
        .addChoices(
          {
            name: "Ninguno",
            value: "0"
          },
          {
            name: "Bajo",
            value: "1"
          },
          {
            name: "Medio",
            value: "2"
          },
          {
            name: "Alto",
            value: "3"
          },
          {
            name: "Muy alto",
            value: "4"
          }
        )
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    ),

  async execute(interaction) {
    const nivel =
      Number(
        interaction.options.getString("nivel")
      );

    try {
      await interaction.guild.setVerificationLevel(
        nivel
      );

      return interaction.reply(
        `✅ Nivel de verificación cambiado a **${nivel}**.`
      );
    } catch (error) {
      console.error("Error en /setverification:", error);

      return interaction.reply({
        content:
          "❌ No pude cambiar el nivel de verificación.",
        ephemeral: true
      });
    }
  }
});


/* =========================================================
   /systeminfo
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("systeminfo")
    .setDescription("Muestra información del bot y del servidor."),

  async execute(interaction) {
    const guild = interaction.guild;

    const embed = new EmbedBuilder()
      .setTitle("⚙️ DARK FF V1 — Sistema")
      .addFields(
        {
          name: "🤖 Bot",
          value: "DARK FF V1",
          inline: true
        },
        {
          name: "🌐 Servidor",
          value: guild.name,
          inline: true
        },
        {
          name: "👥 Miembros",
          value: `${guild.memberCount}`,
          inline: true
        },
        {
          name: "🎭 Roles",
          value: `${guild.roles.cache.size}`,
          inline: true
        },
        {
          name: "💬 Canales",
          value: `${guild.channels.cache.size}`,
          inline: true
        },
        {
          name: "😀 Emojis",
          value: `${guild.emojis.cache.size}`,
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
   /serverstats
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("serverstats")
    .setDescription("Muestra estadísticas generales del servidor."),

  async execute(interaction) {
    const guild = interaction.guild;

    const texto = guild.channels.cache.filter(
      channel => channel.type === ChannelType.GuildText
    ).size;

    const voz = guild.channels.cache.filter(
      channel => channel.type === ChannelType.GuildVoice
    ).size;

    const categorias = guild.channels.cache.filter(
      channel => channel.type === ChannelType.GuildCategory
    ).size;

    const foro = guild.channels.cache.filter(
      channel => channel.type === ChannelType.GuildForum
    ).size;

    const embed = new EmbedBuilder()
      .setTitle("📈 Estadísticas del servidor")
      .setColor(0x5865f2)
      .addFields(
        {
          name: "👥 Miembros",
          value: `${guild.memberCount}`,
          inline: true
        },
        {
          name: "🎭 Roles",
          value: `${guild.roles.cache.size}`,
          inline: true
        },
        {
          name: "😀 Emojis",
          value: `${guild.emojis.cache.size}`,
          inline: true
        },
        {
          name: "💬 Texto",
          value: `${texto}`,
          inline: true
        },
        {
          name: "🔊 Voz",
          value: `${voz}`,
          inline: true
        },
        {
          name: "📁 Categorías",
          value: `${categorias}`,
          inline: true
        },
        {
          name: "📰 Foros",
          value: `${foro}`,
          inline: true
        },
        {
          name: "🚀 Boosts",
          value: `${guild.premiumSubscriptionCount || 0}`,
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
   /seticon
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("seticon")
    .setDescription("Cambia el icono del servidor usando una URL.")
    .addStringOption(option =>
      option
        .setName("url")
        .setDescription("URL directa de la imagen")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    ),

  async execute(interaction) {
    const url =
      interaction.options.getString("url");

    try {
      await interaction.guild.setIcon(url);

      return interaction.reply(
        "✅ Icono del servidor actualizado."
      );
    } catch (error) {
      console.error("Error en /seticon:", error);

      return interaction.reply({
        content:
          "❌ No pude cambiar el icono. Comprueba que la URL sea válida.",
        ephemeral: true
      });
    }
  }
});


/* =========================================================
   /setbanner
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("setbanner")
    .setDescription("Cambia el banner del servidor usando una URL.")
    .addStringOption(option =>
      option
        .setName("url")
        .setDescription("URL directa de la imagen")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    ),

  async execute(interaction) {
    const url =
      interaction.options.getString("url");

    try {
      await interaction.guild.setBanner(url);

      return interaction.reply(
        "✅ Banner del servidor actualizado."
      );
    } catch (error) {
      console.error("Error en /setbanner:", error);

      return interaction.reply({
        content:
          "❌ No pude cambiar el banner. Comprueba la URL y las características del servidor.",
        ephemeral: true
      });
    }
  }
});


/* =========================================================
   /community
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("community")
    .setDescription("Muestra información de la comunidad."),

  async execute(interaction) {
    const guild = interaction.guild;

    const embed = new EmbedBuilder()
      .setTitle("🌐 Comunidad")
      .setDescription(
        `Información de **${guild.name}**`
      )
      .addFields(
        {
          name: "👥 Miembros",
          value: `${guild.memberCount}`,
          inline: true
        },
        {
          name: "🚀 Boosts",
          value: `${guild.premiumSubscriptionCount || 0}`,
          inline: true
        },
        {
          name: "🎭 Roles",
          value: `${guild.roles.cache.size}`,
          inline: true
        },
        {
          name: "📚 Canales",
          value: `${guild.channels.cache.size}`,
          inline: true
        }
      )
      .setThumbnail(
        guild.iconURL({ dynamic: true })
      )
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
