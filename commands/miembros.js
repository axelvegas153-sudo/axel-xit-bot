const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

const commands = [];


/* =========================================================
   /userinfo
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Muestra información de un miembro.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario que quieres consultar")
        .setRequired(false)
    ),

  async execute(interaction) {
    const usuario =
      interaction.options.getUser("usuario") ||
      interaction.user;

    const miembro =
      await interaction.guild.members
        .fetch(usuario.id)
        .catch(() => null);

    const embed = new EmbedBuilder()
      .setTitle("👤 Información del usuario")
      .setThumbnail(
        usuario.displayAvatarURL({ dynamic: true })
      )
      .addFields(
        {
          name: "📛 Usuario",
          value: `${usuario}`,
          inline: true
        },
        {
          name: "🆔 ID",
          value: usuario.id,
          inline: true
        },
        {
          name: "🤖 Bot",
          value: usuario.bot ? "Sí" : "No",
          inline: true
        },
        {
          name: "📅 Cuenta creada",
          value: `<t:${Math.floor(
            usuario.createdTimestamp / 1000
          )}:F>`,
          inline: false
        }
      )
      .setTimestamp();

    if (miembro) {
      embed.addFields(
        {
          name: "📥 Entró al servidor",
          value: `<t:${Math.floor(
            miembro.joinedTimestamp / 1000
          )}:F>`,
          inline: false
        },
        {
          name: "🎭 Roles",
          value:
            miembro.roles.cache
              .filter(role => role.id !== interaction.guild.id)
              .map(role => `${role}`)
              .slice(0, 20)
              .join(", ") || "Sin roles",
          inline: false
        }
      );
    }

    return interaction.reply({
      embeds: [embed]
    });
  }
});


/* =========================================================
   /avatar
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Muestra el avatar de un usuario.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(false)
    ),

  async execute(interaction) {
    const usuario =
      interaction.options.getUser("usuario") ||
      interaction.user;

    const avatar =
      usuario.displayAvatarURL({
        extension: "png",
        size: 1024
      });

    const embed = new EmbedBuilder()
      .setTitle(`🖼️ Avatar de ${usuario.tag}`)
      .setImage(avatar)
      .setURL(avatar);

    return interaction.reply({
      embeds: [embed]
    });
  }
});


/* =========================================================
   /banner
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("banner")
    .setDescription("Muestra el banner de un usuario.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(false)
    ),

  async execute(interaction) {
    const usuario =
      interaction.options.getUser("usuario") ||
      interaction.user;

    const banner =
      usuario.bannerURL({
        extension: "png",
        size: 1024
      });

    if (!banner) {
      return interaction.reply({
        content:
          "❌ Ese usuario no tiene un banner configurado.",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(`🎨 Banner de ${usuario.tag}`)
      .setImage(banner)
      .setURL(banner);

    return interaction.reply({
      embeds: [embed]
    });
  }
});


/* =========================================================
   /rolesuser
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("rolesuser")
    .setDescription("Muestra los roles de un usuario.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(false)
    ),

  async execute(interaction) {
    const usuario =
      interaction.options.getUser("usuario") ||
      interaction.user;

    const miembro =
      await interaction.guild.members
        .fetch(usuario.id)
        .catch(() => null);

    if (!miembro) {
      return interaction.reply({
        content: "❌ Ese usuario no está en el servidor.",
        ephemeral: true
      });
    }

    const roles = miembro.roles.cache
      .filter(role => role.id !== interaction.guild.id)
      .sort((a, b) => b.position - a.position);

    const lista =
      roles.map(role => `${role}`).join(", ") ||
      "Sin roles";

    const embed = new EmbedBuilder()
      .setTitle(`🎭 Roles de ${usuario.tag}`)
      .setDescription(lista.slice(0, 4000))
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
});


/* =========================================================
   /joined
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("joined")
    .setDescription("Muestra cuándo entró un usuario.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(false)
    ),

  async execute(interaction) {
    const usuario =
      interaction.options.getUser("usuario") ||
      interaction.user;

    const miembro =
      await interaction.guild.members
        .fetch(usuario.id)
        .catch(() => null);

    if (!miembro) {
      return interaction.reply({
        content: "❌ Ese usuario no está en el servidor.",
        ephemeral: true
      });
    }

    return interaction.reply(
      `📥 **${usuario.tag}** entró al servidor <t:${Math.floor(
        miembro.joinedTimestamp / 1000
      )}:F>.`
    );
  }
});


/* =========================================================
   /account
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("account")
    .setDescription("Muestra información básica de una cuenta.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(false)
    ),

  async execute(interaction) {
    const usuario =
      interaction.options.getUser("usuario") ||
      interaction.user;

    const embed = new EmbedBuilder()
      .setTitle("📋 Información de cuenta")
      .setThumbnail(
        usuario.displayAvatarURL({ dynamic: true })
      )
      .addFields(
        {
          name: "👤 Usuario",
          value: usuario.tag,
          inline: true
        },
        {
          name: "🆔 ID",
          value: usuario.id,
          inline: true
        },
        {
          name: "🤖 Tipo",
          value: usuario.bot ? "Bot" : "Usuario",
          inline: true
        },
        {
          name: "📅 Creación",
          value: `<t:${Math.floor(
            usuario.createdTimestamp / 1000
          )}:F>`,
          inline: false
        }
      )
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
});


/* =========================================================
   /membercount
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("membercount")
    .setDescription("Muestra la cantidad de miembros."),

  async execute(interaction) {
    const guild = interaction.guild;

    return interaction.reply(
      `👥 **${guild.name}** tiene actualmente **${guild.memberCount} miembros**.`
    );
  }
});


/* =========================================================
   /bots
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("bots")
    .setDescription("Muestra los bots del servidor."),

  async execute(interaction) {
    const bots = interaction.guild.members.cache
      .filter(member => member.user.bot);

    if (!bots.size) {
      return interaction.reply(
        "🤖 No hay bots visibles en el servidor."
      );
    }

    const lista = bots
      .map(member => `${member.user} — \`${member.user.tag}\``)
      .slice(0, 50)
      .join("\n");

    const embed = new EmbedBuilder()
      .setTitle("🤖 Bots del servidor")
      .setDescription(lista)
      .setFooter({
        text: `Total: ${bots.size}`
      })
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
});


/* =========================================================
   /humans
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("humans")
    .setDescription("Muestra la cantidad de usuarios humanos."),

  async execute(interaction) {
    const miembros =
      await interaction.guild.members.fetch();

    const humanos = miembros.filter(
      member => !member.user.bot
    ).size;

    return interaction.reply(
      `👤 Hay **${humanos} usuarios humanos** en el servidor.`
    );
  }
});


/* =========================================================
   /member
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("member")
    .setDescription("Busca información de un miembro.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Miembro que quieres buscar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const usuario =
      interaction.options.getUser("usuario");

    const miembro =
      await interaction.guild.members
        .fetch(usuario.id)
        .catch(() => null);

    if (!miembro) {
      return interaction.reply({
        content:
          "❌ Ese usuario no pertenece al servidor.",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(`👤 Miembro: ${usuario.tag}`)
      .setThumbnail(
        usuario.displayAvatarURL({ dynamic: true })
      )
      .addFields(
        {
          name: "🆔 ID",
          value: miembro.id,
          inline: true
        },
        {
          name: "🎭 Roles",
          value: `${miembro.roles.cache.size - 1}`,
          inline: true
        },
        {
          name: "🔊 Voz",
          value: miembro.voice.channel
            ? miembro.voice.channel.name
            : "No está en voz",
          inline: true
        },
        {
          name: "📥 Entrada",
          value: `<t:${Math.floor(
            miembro.joinedTimestamp / 1000
          )}:R>`,
          inline: true
        },
        {
          name: "🤖 Bot",
          value: usuario.bot ? "Sí" : "No",
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
   /membersearch
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("membersearch")
    .setDescription("Busca miembros por nombre.")
    .addStringOption(option =>
      option
        .setName("nombre")
        .setDescription("Nombre que quieres buscar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const texto =
      interaction.options.getString("nombre")
        .toLowerCase();

    const miembros =
      await interaction.guild.members.fetch();

    const encontrados = miembros
      .filter(member =>
        member.user.username
          .toLowerCase()
          .includes(texto) ||
        member.displayName
          .toLowerCase()
          .includes(texto)
      )
      .first(20);

    if (!encontrados.length) {
      return interaction.reply({
        content: "❌ No encontré miembros con ese nombre.",
        ephemeral: true
      });
    }

    const lista = encontrados
      .map(member =>
        `${member.user} — \`${member.user.username}\``
      )
      .join("\n");

    const embed = new EmbedBuilder()
      .setTitle("🔎 Resultados")
      .setDescription(lista)
      .setFooter({
        text: `Resultados mostrados: ${encontrados.length}`
      })
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
});


/* =========================================================
   /online
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("online")
    .setDescription("Muestra miembros actualmente visibles como conectados."),

  async execute(interaction) {
    const miembros =
      await interaction.guild.members.fetch();

    const online = miembros.filter(member => {
      const estado = member.presence?.status;
      return estado && estado !== "offline";
    }).size;

    return interaction.reply(
      `🟢 Hay aproximadamente **${online} miembros conectados**.`
    );
  }
});


/* =========================================================
   /memberroles
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("memberroles")
    .setDescription("Muestra los roles de un miembro en un embed.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    ),

  async execute(interaction) {
    const usuario =
      interaction.options.getUser("usuario");

    const miembro =
      await interaction.guild.members
        .fetch(usuario.id)
        .catch(() => null);

    if (!miembro) {
      return interaction.reply({
        content: "❌ Usuario no encontrado.",
        ephemeral: true
      });
    }

    const roles = miembro.roles.cache
      .filter(role => role.id !== interaction.guild.id)
      .sort((a, b) => b.position - a.position);

    const embed = new EmbedBuilder()
      .setTitle(`🎭 Roles — ${usuario.tag}`)
      .setDescription(
        roles.map(role => `${role}`).join("\n") ||
        "Este usuario no tiene roles."
      )
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
});


/* =========================================================
   /memberpermissions
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("memberpermissions")
    .setDescription("Muestra los permisos de un miembro.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(false)
    ),

  async execute(interaction) {
    const usuario =
      interaction.options.getUser("usuario") ||
      interaction.user;

    const miembro =
      await interaction.guild.members
        .fetch(usuario.id)
        .catch(() => null);

    if (!miembro) {
      return interaction.reply({
        content: "❌ Usuario no encontrado.",
        ephemeral: true
      });
    }

    const permisos = miembro.permissions.toArray();

    const lista =
      permisos.length
        ? permisos.map(p => `\`${p}\``).join(", ")
        : "Sin permisos especiales";

    const embed = new EmbedBuilder()
      .setTitle(`🔐 Permisos de ${usuario.tag}`)
      .setDescription(lista.slice(0, 4000))
      .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
});


/* =========================================================
   /memberstatus
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("memberstatus")
    .setDescription("Muestra el estado de un usuario.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(false)
    ),

  async execute(interaction) {
    const usuario =
      interaction.options.getUser("usuario") ||
      interaction.user;

    const miembro =
      await interaction.guild.members
        .fetch(usuario.id)
        .catch(() => null);

    if (!miembro) {
      return interaction.reply({
        content: "❌ Usuario no encontrado.",
        ephemeral: true
      });
    }

    const estado =
      miembro.presence?.status || "offline";

    const actividad =
      miembro.presence?.activities?.[0];

    const embed = new EmbedBuilder()
      .setTitle(`📡 Estado de ${usuario.tag}`)
      .setThumbnail(
        usuario.displayAvatarURL({ dynamic: true })
      )
      .addFields(
        {
          name: "📶 Estado",
          value: `\`${estado}\``,
          inline: true
        },
        {
          name: "🎮 Actividad",
          value: actividad
            ? actividad.name
            : "Ninguna",
          inline: true
        },
        {
          name: "🔊 Voz",
          value: miembro.voice.channel
            ? miembro.voice.channel.name
            : "No conectado",
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
   /joinedposition
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("joinedposition")
    .setDescription("Muestra aproximadamente cuándo entró un miembro comparado con otros.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    ),

  async execute(interaction) {
    const usuario =
      interaction.options.getUser("usuario");

    const miembro =
      await interaction.guild.members
        .fetch(usuario.id)
        .catch(() => null);

    if (!miembro) {
      return interaction.reply({
        content: "❌ Usuario no encontrado.",
        ephemeral: true
      });
    }

    const miembros =
      await interaction.guild.members.fetch();

    const ordenados = miembros
      .filter(member => member.joinedTimestamp)
      .sort(
        (a, b) =>
          a.joinedTimestamp - b.joinedTimestamp
      );

    const posicion =
      ordenados.findIndex(
        member => member.id === miembro.id
      ) + 1;

    return interaction.reply(
      `📥 **${usuario.tag}** ocupa aproximadamente la posición **#${posicion}** según su fecha de entrada.`
    );
  }
});


/* =========================================================
   /memberhelp
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("memberhelp")
    .setDescription("Muestra los comandos de la categoría Miembros."),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("👥 DARK FF V1 — MIEMBROS")
      .setDescription(
        "Comandos disponibles para consultar información de miembros."
      )
      .addFields(
        {
          name: "👤 Información",
          value:
            "`/userinfo`\n`/member`\n`/account`\n`/memberstatus`"
        },
        {
          name: "🖼️ Perfiles",
          value:
            "`/avatar`\n`/banner`\n`/rolesuser`\n`/memberroles`"
        },
        {
          name: "📊 Estadísticas",
          value:
            "`/membercount`\n`/bots`\n`/humans`\n`/online`"
        },
        {
          name: "🔎 Búsqueda",
          value:
            "`/membersearch`\n`/joined`\n`/joinedposition`"
        },
        {
          name: "🔐 Permisos",
          value:
            "`/memberpermissions`"
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
