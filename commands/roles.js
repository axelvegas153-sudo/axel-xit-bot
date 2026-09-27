const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits
} = require("discord.js");

const commands = [];

/* =========================================================
   /roleinfo
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("roleinfo")
    .setDescription("Muestra información de un rol.")
    .addRoleOption(option =>
      option
        .setName("rol")
        .setDescription("Rol que quieres consultar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const rol = interaction.options.getRole("rol");

    const embed = new EmbedBuilder()
      .setTitle(`🎭 Información del rol`)
      .setColor(rol.color || null)
      .addFields(
        {
          name: "📛 Nombre",
          value: rol.name,
          inline: true
        },
        {
          name: "🆔 ID",
          value: rol.id,
          inline: true
        },
        {
          name: "👥 Miembros",
          value: `${rol.members.size}`,
          inline: true
        },
        {
          name: "📊 Posición",
          value: `${rol.position}`,
          inline: true
        },
        {
          name: "🔗 Mencionable",
          value: rol.mentionable ? "Sí" : "No",
          inline: true
        },
        {
          name: "⚙️ Gestionado",
          value: rol.managed ? "Sí" : "No",
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
   /addroleuser
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("addroleuser")
    .setDescription("Añade un rol a un usuario.")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageRoles
    )
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .addRoleOption(option =>
      option
        .setName("rol")
        .setDescription("Rol que quieres añadir")
        .setRequired(true)
    ),

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");
    const rol = interaction.options.getRole("rol");

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

    if (rol.managed) {
      return interaction.reply({
        content: "❌ No puedes administrar un rol gestionado por una integración.",
        ephemeral: true
      });
    }

    if (
      rol.position >= interaction.guild.members.me.roles.highest.position
    ) {
      return interaction.reply({
        content: "❌ Ese rol está por encima o al mismo nivel que mi rol.",
        ephemeral: true
      });
    }

    if (
      miembro.roles.highest.position >=
      interaction.guild.members.me.roles.highest.position
    ) {
      return interaction.reply({
        content: "❌ No puedo modificar los roles de ese usuario.",
        ephemeral: true
      });
    }

    if (miembro.roles.cache.has(rol.id)) {
      return interaction.reply({
        content: "⚠️ Ese usuario ya tiene ese rol.",
        ephemeral: true
      });
    }

    await miembro.roles.add(
      rol,
      `Añadido por ${interaction.user.tag}`
    );

    return interaction.reply(
      `✅ Se añadió ${rol} a **${usuario.tag}**.`
    );
  }
});


/* =========================================================
   /removerroleuser
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("removerroleuser")
    .setDescription("Quita un rol de un usuario.")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageRoles
    )
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .addRoleOption(option =>
      option
        .setName("rol")
        .setDescription("Rol que quieres quitar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");
    const rol = interaction.options.getRole("rol");

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

    if (rol.managed) {
      return interaction.reply({
        content: "❌ No puedes administrar un rol gestionado.",
        ephemeral: true
      });
    }

    if (
      rol.position >= interaction.guild.members.me.roles.highest.position
    ) {
      return interaction.reply({
        content: "❌ Ese rol está por encima o al mismo nivel que mi rol.",
        ephemeral: true
      });
    }

    if (!miembro.roles.cache.has(rol.id)) {
      return interaction.reply({
        content: "⚠️ Ese usuario no tiene ese rol.",
        ephemeral: true
      });
    }

    await miembro.roles.remove(
      rol,
      `Quitado por ${interaction.user.tag}`
    );

    return interaction.reply(
      `✅ Se quitó ${rol} de **${usuario.tag}**.`
    );
  }
});


/* =========================================================
   /createrole
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("createrole")
    .setDescription("Crea un nuevo rol.")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageRoles
    )
    .addStringOption(option =>
      option
        .setName("nombre")
        .setDescription("Nombre del rol")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("color")
        .setDescription("Color hexadecimal, ejemplo: #ff0000")
        .setRequired(false)
    )
    .addBooleanOption(option =>
      option
        .setName("mencionable")
        .setDescription("¿Se podrá mencionar el rol?")
        .setRequired(false)
    ),

  async execute(interaction) {
    const nombre =
      interaction.options.getString("nombre");

    const color =
      interaction.options.getString("color");

    const mencionable =
      interaction.options.getBoolean("mencionable") ?? false;

    if (nombre.length > 100) {
      return interaction.reply({
        content: "❌ El nombre no puede superar los 100 caracteres.",
        ephemeral: true
      });
    }

    const opciones = {
      name: nombre,
      mentionable: mencionable,
      reason: `Creado por ${interaction.user.tag}`
    };

    if (color) {
      if (!/^#?[0-9A-Fa-f]{6}$/.test(color)) {
        return interaction.reply({
          content: "❌ El color debe ser hexadecimal, ejemplo: `#ff0000`.",
          ephemeral: true
        });
      }

      opciones.color = color;
    }

    const rol =
      await interaction.guild.roles.create(opciones);

    return interaction.reply(
      `✅ Rol creado correctamente: ${rol}`
    );
  }
});


/* =========================================================
   /deleterole
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("deleterole")
    .setDescription("Elimina un rol.")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageRoles
    )
    .addRoleOption(option =>
      option
        .setName("rol")
        .setDescription("Rol que quieres eliminar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const rol = interaction.options.getRole("rol");

    if (rol.managed) {
      return interaction.reply({
        content: "❌ No puedes eliminar un rol gestionado.",
        ephemeral: true
      });
    }

    if (
      rol.position >=
      interaction.guild.members.me.roles.highest.position
    ) {
      return interaction.reply({
        content: "❌ No puedo eliminar ese rol porque está por encima de mi rol.",
        ephemeral: true
      });
    }

    await rol.delete(
      `Eliminado por ${interaction.user.tag}`
    );

    return interaction.reply(
      `🗑️ El rol **${rol.name}** fue eliminado.`
    );
  }
});


/* =========================================================
   /rolename
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("rolename")
    .setDescription("Cambia el nombre de un rol.")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageRoles
    )
    .addRoleOption(option =>
      option
        .setName("rol")
        .setDescription("Rol")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("nombre")
        .setDescription("Nuevo nombre")
        .setRequired(true)
    ),

  async execute(interaction) {
    const rol = interaction.options.getRole("rol");
    const nombre = interaction.options.getString("nombre");

    if (rol.managed) {
      return interaction.reply({
        content: "❌ No puedes modificar un rol gestionado.",
        ephemeral: true
      });
    }

    if (
      rol.position >=
      interaction.guild.members.me.roles.highest.position
    ) {
      return interaction.reply({
        content: "❌ Ese rol está fuera de mi alcance.",
        ephemeral: true
      });
    }

    await rol.setName(
      nombre,
      `Nombre cambiado por ${interaction.user.tag}`
    );

    return interaction.reply(
      `✅ El rol ahora se llama **${nombre}**.`
    );
  }
});


/* =========================================================
   /rolecolor
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("rolecolor")
    .setDescription("Cambia el color de un rol.")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageRoles
    )
    .addRoleOption(option =>
      option
        .setName("rol")
        .setDescription("Rol")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("color")
        .setDescription("Color hexadecimal, ejemplo: #00ff00")
        .setRequired(true)
    ),

  async execute(interaction) {
    const rol = interaction.options.getRole("rol");
    const color = interaction.options.getString("color");

    if (rol.managed) {
      return interaction.reply({
        content: "❌ No puedes modificar un rol gestionado.",
        ephemeral: true
      });
    }

    if (
      rol.position >=
      interaction.guild.members.me.roles.highest.position
    ) {
      return interaction.reply({
        content: "❌ Ese rol está fuera de mi alcance.",
        ephemeral: true
      });
    }

    if (!/^#?[0-9A-Fa-f]{6}$/.test(color)) {
      return interaction.reply({
        content: "❌ Usa un color hexadecimal válido. Ejemplo: `#00ff00`.",
        ephemeral: true
      });
    }

    await rol.setColor(
      color,
      `Color cambiado por ${interaction.user.tag}`
    );

    return interaction.reply(
      `🎨 Color del rol **${rol.name}** actualizado a **${color}**.`
    );
  }
});


/* =========================================================
   /rolemention
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("rolemention")
    .setDescription("Muestra la mención de un rol.")
    .addRoleOption(option =>
      option
        .setName("rol")
        .setDescription("Rol")
        .setRequired(true)
    ),

  async execute(interaction) {
    const rol = interaction.options.getRole("rol");

    return interaction.reply(
      `🏷️ Mención del rol: ${rol}\n\`${rol}\``
    );
  }
});


/* =========================================================
   /rolemembers
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("rolemembers")
    .setDescription("Muestra los miembros que tienen un rol.")
    .addRoleOption(option =>
      option
        .setName("rol")
        .setDescription("Rol")
        .setRequired(true)
    ),

  async execute(interaction) {
    const rol = interaction.options.getRole("rol");

    const miembros =
      await interaction.guild.members.fetch();

    const usuarios = miembros
      .filter(member => member.roles.cache.has(rol.id))
      .map(member => `${member.user}`)
      .slice(0, 50);

    const embed = new EmbedBuilder()
      .setTitle(`👥 Miembros con ${rol.name}`)
      .setDescription(
        usuarios.length
          ? usuarios.join("\n")
          : "Nadie tiene este rol."
      )
      .setFooter({
        text: `Total: ${usuarios.length}`
      })
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
});


/* =========================================================
   /rolelist
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("rolelist")
    .setDescription("Muestra todos los roles del servidor."),

  async execute(interaction) {
    const roles =
      interaction.guild.roles.cache
        .sort((a, b) => b.position - a.position)
        .map(role => `${role} — \`${role.name}\``);

    const texto =
      roles.join("\n").slice(0, 4000);

    const embed = new EmbedBuilder()
      .setTitle("🎭 Roles del servidor")
      .setDescription(texto || "No hay roles.")
      .setFooter({
        text: `Total: ${interaction.guild.roles.cache.size}`
      })
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
});


/* =========================================================
   /rolecheck
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("rolecheck")
    .setDescription("Comprueba si un usuario tiene un rol.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .addRoleOption(option =>
      option
        .setName("rol")
        .setDescription("Rol")
        .setRequired(true)
    ),

  async execute(interaction) {
    const usuario =
      interaction.options.getUser("usuario");

    const rol =
      interaction.options.getRole("rol");

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

    const tiene =
      miembro.roles.cache.has(rol.id);

    return interaction.reply(
      tiene
        ? `✅ **${usuario.tag}** tiene el rol ${rol}.`
        : `❌ **${usuario.tag}** no tiene el rol ${rol}.`
    );
  }
});


/* =========================================================
   /roleposition
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("roleposition")
    .setDescription("Muestra la posición de un rol.")
    .addRoleOption(option =>
      option
        .setName("rol")
        .setDescription("Rol")
        .setRequired(true)
    ),

  async execute(interaction) {
    const rol = interaction.options.getRole("rol");

    return interaction.reply(
      `📊 El rol ${rol} está en la posición **${rol.position}**.`
    );
  }
});


/* =========================================================
   /rolehelp
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("rolehelp")
    .setDescription("Muestra los comandos de roles."),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("🎭 DARK FF V1 — ROLES")
      .setDescription(
        "Comandos para consultar y administrar roles."
      )
      .addFields(
        {
          name: "🔎 Información",
          value:
            "`/roleinfo`\n`/rolelist`\n`/rolemembers`\n`/roleposition`\n`/rolemention`"
        },
        {
          name: "👥 Usuarios",
          value:
            "`/addroleuser`\n`/removerroleuser`\n`/rolecheck`"
        },
        {
          name: "⚙️ Administración",
          value:
            "`/createrole`\n`/deleterole`\n`/rolename`\n`/rolecolor`"
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
   EXPORTAR
========================================================= */

module.exports = commands;
