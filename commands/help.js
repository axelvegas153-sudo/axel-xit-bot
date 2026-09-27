const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require("discord.js");

const categorias = {
  general: {
    nombre: "📚 Información",
    descripcion: "Comandos generales e información.",
    comandos: [
      "`/help` — Muestra este menú de ayuda.",
      "`/botinfo` — Información del bot.",
      "`/serverinfo` — Información del servidor.",
      "`/userinfo` — Información de un usuario.",
      "`/avatar` — Muestra un avatar."
    ]
  },

  moderacion: {
    nombre: "🛡️ Moderación",
    descripcion: "Herramientas para administrar el servidor.",
    comandos: [
      "`/ban` — Banea a un usuario.",
      "`/kick` — Expulsa a un usuario.",
      "`/timeout` — Silencia temporalmente.",
      "`/warn` — Advierte a un usuario.",
      "`/clear` — Elimina mensajes."
    ]
  },

  automod: {
    nombre: "🤖 AutoMod",
    descripcion: "Protección automática del servidor.",
    comandos: [
      "`/automod estado` — Consulta el estado.",
      "`/automod activar` — Activa AutoMod.",
      "`/automod desactivar` — Desactiva AutoMod.",
      "`/automod configurar` — Configura AutoMod."
    ]
  },

  bienvenida: {
    nombre: "👋 Bienvenida",
    descripcion: "Configura mensajes de entrada y salida.",
    comandos: [
      "`/bienvenida estado` — Consulta la configuración.",
      "`/bienvenida activar` — Activa bienvenida.",
      "`/bienvenida desactivar` — Desactiva bienvenida.",
      "`/bienvenida canal` — Configura el canal."
    ]
  },

  tickets: {
    nombre: "🎫 Tickets",
    descripcion: "Sistema de soporte mediante tickets.",
    comandos: [
      "`/tickets crear` — Crea un ticket.",
      "`/tickets cerrar` — Cierra un ticket.",
      "`/tickets añadir` — Añade un usuario.",
      "`/tickets quitar` — Quita un usuario.",
      "`/tickets reclamar` — Reclama un ticket.",
      "`/tickets info` — Muestra información."
    ]
  },

  economia: {
    nombre: "💰 Economía",
    descripcion: "Sistema de dinero y economía.",
    comandos: [
      "`/economia balance` — Consulta tu dinero.",
      "`/economia daily` — Reclama tu recompensa.",
      "`/economia trabajar` — Trabaja para ganar dinero.",
      "`/economia pagar` — Paga a otro usuario.",
      "`/economia leaderboard` — Ranking de dinero."
    ]
  },

  niveles: {
    nombre: "⭐ Niveles",
    descripcion: "Sistema de experiencia y niveles.",
    comandos: [
      "`/niveles perfil` — Consulta tu nivel.",
      "`/niveles ranking` — Ranking de niveles.",
      "`/niveles xp` — Consulta tu XP.",
      "`/niveles nivel` — Consulta un nivel."
    ]
  },

  juegos: {
    nombre: "🎮 Juegos",
    descripcion: "Minijuegos para el servidor.",
    comandos: [
      "`/juegos ppt` — Piedra, papel o tijera.",
      "`/juegos dado` — Lanza un dado.",
      "`/juegos moneda` — Lanza una moneda.",
      "`/juegos numero` — Adivina el número.",
      "`/juegos duelo` — Duelo entre usuarios."
    ]
  },

  diversion: {
    nombre: "😂 Diversión",
    descripcion: "Comandos divertidos.",
    comandos: [
      "`/diversion 8ball` — Pregunta a la bola 8.",
      "`/diversion meme` — Genera una respuesta divertida.",
      "`/diversion decidir` — Deja que el bot decida.",
      "`/diversion random` — Resultado aleatorio."
    ]
  },

  musica: {
    nombre: "🎵 Música",
    descripcion: "Sistema de música.",
    comandos: [
      "`/musica reproducir` — Reproduce música.",
      "`/musica pausa` — Pausa la reproducción.",
      "`/musica reanudar` — Reanuda la música.",
      "`/musica saltar` — Salta la canción.",
      "`/musica detener` — Detiene la música.",
      "`/musica cola` — Muestra la cola."
    ]
  },

  ia: {
    nombre: "🧠 IA",
    descripcion: "Funciones de inteligencia artificial.",
    comandos: [
      "`/ia preguntar` — Pregunta a la IA.",
      "`/ia explicar` — Explica un tema.",
      "`/ia resumir` — Resume un texto.",
      "`/ia mejorar` — Mejora un texto.",
      "`/ia traducir` — Traduce un texto.",
      "`/ia codigo` — Ayuda con código."
    ]
  },

  imagenes: {
    nombre: "🎨 IA de imágenes",
    descripcion: "Generación y edición de imágenes.",
    comandos: [
      "`/imagenes generar` — Genera una imagen.",
      "`/imagenes editar` — Edita una imagen.",
      "`/imagenes mejorar` — Mejora una imagen.",
      "`/imagenes fondo` — Trabaja con fondos."
    ]
  },

  giveaways: {
    nombre: "🎁 Giveaways",
    descripcion: "Sistema de sorteos.",
    comandos: [
      "`/giveaways crear` — Crea un sorteo.",
      "`/giveaways terminar` — Termina un sorteo.",
      "`/giveaways cancelar` — Cancela un sorteo.",
      "`/giveaways reroll` — Elige otro ganador.",
      "`/giveaways lista` — Lista los sorteos."
    ]
  },

  seguridad: {
    nombre: "🔐 Seguridad",
    descripcion: "Protección y seguridad del servidor.",
    comandos: [
      "`/seguridad estado` — Consulta seguridad.",
      "`/seguridad activar` — Activa protección.",
      "`/seguridad desactivar` — Desactiva protección.",
      "`/seguridad antibot` — Configura AntiBot.",
      "`/seguridad antiraid` — Configura AntiRaid."
    ]
  },

  configuracion: {
    nombre: "⚙️ Configuración",
    descripcion: "Configuración general de Axel XIT.",
    comandos: [
      "`/configuracion ver` — Ver configuración.",
      "`/configuracion logs` — Configurar logs.",
      "`/configuracion general` — Configuración general.",
      "`/configuracion idioma` — Cambiar idioma.",
      "`/configuracion color` — Cambiar color."
    ]
  }
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Muestra todas las categorías y comandos de Axel XIT"),

  async execute(interaction) {
    const menu = new StringSelectMenuBuilder()
      .setCustomId("axel_help_categoria")
      .setPlaceholder("📂 Selecciona una categoría")
      .addOptions(
        Object.entries(categorias).map(([id, categoria]) => ({
          label: categoria.nombre.replace(/^[^\s]+\s/, ""),
          description: categoria.descripcion.slice(0, 100),
          value: id,
          emoji: categoria.nombre.split(" ")[0]
        }))
      );

    const fila = new ActionRowBuilder().addComponents(menu);

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle("🤖 Axel XIT — Centro de ayuda")
      .setDescription(
        "Selecciona una categoría en el menú de abajo para ver los comandos disponibles."
      )
      .addFields(
        {
          name: "📦 Sistemas",
          value: `${Object.keys(categorias).length} categorías disponibles.`,
          inline: true
        },
        {
          name: "⚡ Comandos",
          value: "Organizados por categoría.",
          inline: true
        }
      )
      .setFooter({
        text: "Axel XIT • Sistema de ayuda"
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      components: [fila]
    });
  },

  categorias
};
