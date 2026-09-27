const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

// ======================================================
// DARK FF V1 - SISTEMA DE AYUDA
// ======================================================

const categorias = {

    moderacion: {
        nombre: "🛡️ Moderación",
        descripcion: "Comandos para moderar miembros y canales.",
        comandos: [
            "/ban",
            "/unban",
            "/kick",
            "/timeout",
            "/untimeout",
            "/warn",
            "/unwarn",
            "/warns",
            "/clear",
            "/purge",
            "/slowmode",
            "/lock",
            "/unlock",
            "/lockchannel",
            "/unlockchannel",
            "/mute",
            "/unmute",
            "/deafen",
            "/undeafen",
            "/nickname",
            "/resetnickname",
            "/massban",
            "/history",
            "/modlog"
        ]
    },

    staff: {
        nombre: "👮 Staff",
        descripcion: "Herramientas para el equipo de moderación.",
        comandos: [
            "/addrole",
            "/removerole",
            "/createrole",
            "/deleterole",
            "/roleinfo",
            "/setnick",
            "/announce",
            "/say",
            "/embed",
            "/serverlock",
            "/serverunlock",
            "/dm",
            "/move",
            "/disconnect",
            "/voicekick"
        ]
    },

    servidor: {
        nombre: "⚙️ Servidor",
        descripcion: "Información y configuración del servidor.",
        comandos: [
            "/serverinfo",
            "/servericon",
            "/serverbanner",
            "/roles",
            "/channels",
            "/members",
            "/emojis",
            "/servercreated",
            "/owner",
            "/setname",
            "/setverification",
            "/systeminfo",
            "/serverstats",
            "/seticon",
            "/setbanner",
            "/community"
        ]
    },

    miembros: {
        nombre: "👤 Miembros",
        descripcion: "Información de usuarios y miembros.",
        comandos: [
            "/userinfo",
            "/avatar",
            "/banner",
            "/rolesuser",
            "/joined",
            "/account",
            "/membercount",
            "/bots",
            "/humans",
            "/member",
            "/membersearch",
            "/online",
            "/memberroles",
            "/memberpermissions",
            "/memberstatus",
            "/joinedposition",
            "/memberhelp"
        ]
    },

    roles: {
        nombre: "🎭 Roles",
        descripcion: "Crear y administrar roles.",
        comandos: [
            "/roleinfo",
            "/addroleuser",
            "/removerroleuser",
            "/createrole",
            "/deleterole",
            "/rolename",
            "/rolecolor",
            "/rolemention",
            "/rolemembers",
            "/rolelist",
            "/rolecheck",
            "/roleposition",
            "/rolehelp"
        ]
    },

    seguridad: {
        nombre: "🚨 Seguridad",
        descripcion: "Protección y seguridad del servidor.",
        comandos: [
            "/security",
            "/setverification",
            "/lockdown",
            "/unlockdown",
            "/antiraid",
            "/securitycheck",
            "/permissions",
            "/admincheck",
            "/botpermissions",
            "/securityhelp"
        ]
    },

    automod: {
        nombre: "🤖 AutoMod",
        descripcion: "Automoderación automática del servidor.",
        comandos: [
            "/automod",
            "/automodconfig",
            "/antilinks",
            "/antiinvite",
            "/antispam",
            "/anticaps",
            "/antimentions",
            "/antibadwords",
            "/antiemoji",
            "/antiflood",
            "/antiduplicates",
            "/antiraid",
            "/antibot",
            "/antialt",
            "/automodstatus",
            "/automodreset",
            "/automodlogs",
            "/automodhelp"
        ]
    },

    logs: {
        nombre: "📝 Logs",
        descripcion: "Registros y seguimiento de actividad.",
        comandos: [
            "/setlog",
            "/logs",
            "/logstatus",
            "/logchannel",
            "/messagelogs",
            "/memberlogs",
            "/rolelogs",
            "/channellogs",
            "/voicelogs",
            "/banlogs",
            "/logclear",
            "/loghelp"
        ]
    },

    tickets: {
        nombre: "🎫 Tickets",
        descripcion: "Sistema de soporte mediante tickets.",
        comandos: [
            "/ticket",
            "/ticketcreate",
            "/ticketclose",
            "/ticketdelete",
            "/ticketadd",
            "/ticketremove",
            "/ticketrename",
            "/ticketclaim",
            "/ticketunclaim",
            "/tickettranscript",
            "/ticketpanel",
            "/ticketsetup",
            "/ticketconfig",
            "/tickethelp"
        ]
    },

    economia: {
        nombre: "💰 Economía",
        descripcion: "Sistema económico del servidor.",
        comandos: [
            "/balance",
            "/daily",
            "/weekly",
            "/work",
            "/beg",
            "/deposit",
            "/withdraw",
            "/pay",
            "/give",
            "/rob",
            "/coinflip",
            "/slots",
            "/economy",
            "/leaderboard",
            "/economyreset",
            "/economyhelp"
        ]
    },

    tienda: {
        nombre: "🛒 Tienda",
        descripcion: "Compra, venta e inventario de objetos.",
        comandos: [
            "/shop",
            "/buy",
            "/sell",
            "/item",
            "/inventory",
            "/use",
            "/gift",
            "/additem",
            "/removeitem",
            "/edititem",
            "/shopconfig",
            "/shopreset",
            "/shophelp"
        ]
    },

    niveles: {
        nombre: "📈 Niveles",
        descripcion: "Sistema de experiencia y niveles.",
        comandos: [
            "/rank",
            "/level",
            "/xp",
            "/givexp",
            "/removexp",
            "/setxp",
            "/setlevel",
            "/xpleaderboard",
            "/levelroles",
            "/levelconfig",
            "/levelreset",
            "/levelhelp"
        ]
    },

    logros: {
        nombre: "🏆 Logros",
        descripcion: "Logros y objetivos del servidor.",
        comandos: [
            "/achievements",
            "/achievement",
            "/unlock",
            "/giveachievement",
            "/removeachievement",
            "/achievementlist",
            "/achievementcreate",
            "/achievementdelete",
            "/achievementedit",
            "/achievementhelp"
        ]
    },

    recompensas: {
        nombre: "🎁 Recompensas",
        descripcion: "Premios y recompensas.",
        comandos: [
            "/reward",
            "/rewards",
            "/claimreward",
            "/giverreward",
            "/dailyreward",
            "/weeklyreward",
            "/monthlyreward",
            "/rewardlist",
            "/rewardcreate",
            "/rewarddelete",
            "/rewardconfig",
            "/rewardhelp"
        ]
    },

    diversion: {
        nombre: "😂 Diversión",
        descripcion: "Comandos para pasarla bien.",
        comandos: [
            "/8ball",
            "/coin",
            "/dice",
            "/randomsay",
            "/ship",
            "/rate",
            "/choose",
            "/hug",
            "/pat",
            "/slap",
            "/punch",
            "/highfive",
            "/dance",
            "/joke",
            "/fact",
            "/roast",
            "/gif",
            "/poke",
            "/love",
            "/luck",
            "/random",
            "/funny",
            "/diversionhelp"
        ]
    },

    minijuegos: {
        nombre: "🎮 Minijuegos",
        descripcion: "Juegos interactivos dentro de Discord.",
        comandos: [
            "/trivia",
            "/rps",
            "/guess",
            "/mathgame",
            "/memory",
            "/quiz",
            "/wordgame",
            "/reaction",
            "/speed",
            "/higherlower",
            "/blackjack",
            "/minigame",
            "/minigames",
            "/minigamehelp"
        ]
    },

    ia: {
        nombre: "🤖 Inteligencia Artificial",
        descripcion: "Funciones de inteligencia artificial.",
        comandos: [
            "/ask",
            "/ai",
            "/chat",
            "/translateai",
            "/summarize",
            "/explain",
            "/codeai",
            "/imageprompt",
            "/aifunctions",
            "/aiconfig",
            "/aihelp"
        ]
    },

    informacion: {
        nombre: "📚 Información",
        descripcion: "Información general del bot.",
        comandos: [
            "/help",
            "/botinfo",
            "/ping",
            "/uptime",
            "/version",
            "/invite",
            "/support",
            "/commands",
            "/about",
            "/status",
            "/informationhelp"
        ]
    },

    programacion: {
        nombre: "💻 Programación",
        descripcion: "Herramientas para programación y código.",
        comandos: [
            "/code",
            "/javascript",
            "/python",
            "/html",
            "/css",
            "/json",
            "/regex",
            "/debug",
            "/explaincode",
            "/snippet",
            "/programminghelp"
        ]
    },

    utilidades: {
        nombre: "🧰 Utilidades",
        descripcion: "Herramientas útiles para todos.",
        comandos: [
            "/calculator",
            "/translate",
            "/qr",
            "/shorturl",
            "/color",
            "/timestamp",
            "/reminder",
            "/poll",
            "/timer",
            "/makeembed",
            "/utilidadeshelp"
        ]
    },

    privacidad: {
        nombre: "🔐 Privacidad",
        descripcion: "Controla tus datos y privacidad.",
        comandos: [
            "/privacy",
            "/mydata",
            "/deleteaccount",
            "/deletedata",
            "/exportdata",
            "/privacysettings",
            "/datastatus",
            "/privacyhelp"
        ]
    },

    premium: {
        nombre: "💎 Premium",
        descripcion: "Funciones exclusivas de DARK FF V1.",
        comandos: [
            "/premium",
            "/premiuminfo",
            "/premiumstatus",
            "/premiumfeatures",
            "/premiumactivate",
            "/premiumremove",
            "/premiumusers",
            "/premiumconfig",
            "/premiumhelp"
        ]
    },

    estadisticas: {
        nombre: "📊 Estadísticas",
        descripcion: "Estadísticas del bot y del servidor.",
        comandos: [
            "/stats",
            "/serverstatistics",
            "/memberstats",
            "/messagestats",
            "/voicestats",
            "/commandstats",
            "/topcommands",
            "/activity",
            "/statistics",
            "/statsreset",
            "/statshelp"
        ]
    },

    archivos: {
        nombre: "📁 Archivos",
        descripcion: "Tu espacio personal para guardar archivos.",
        comandos: [
            "/archivos",
            "/fileupload",
            "/files",
            "/fileget",
            "/filedelete",
            "/filelist",
            "/fileinfo",
            "/filedownload",
            "/fileclear",
            "/fileowner",
            "/filehelp"
        ]
    },

    musica: {
        nombre: "🎵 Música",
        descripcion: "Reproduce audio en canales de voz.",
        comandos: [
            "/play",
            "/pause",
            "/resume",
            "/skip",
            "/stop",
            "/queue",
            "/nowplaying",
            "/volume",
            "/loop",
            "/shuffle",
            "/remove",
            "/clearqueue",
            "/join",
            "/leave",
            "/musichelp"
        ]
    }
};

// ======================================================
// EMBED PRINCIPAL
// ======================================================

function crearInicio() {
    const totalComandos = Object.values(categorias)
        .reduce((total, categoria) => {
            return total + categoria.comandos.length;
        }, 0);

    return new EmbedBuilder()
        .setTitle("🤖 DARK FF V1")
        .setDescription(
            "## 📚 Centro de comandos\n\n" +
            "Selecciona una categoría en el menú para consultar sus comandos.\n\n" +
            `📦 **Categorías:** ${Object.keys(categorias).length}\n` +
            `⚡ **Comandos:** ${totalComandos}\n` +
            "🤖 **IA:** Disponible\n" +
            "📁 **Archivos privados:** Disponible\n" +
            "🎵 **Música:** Disponible\n\n" +
            "Usa el menú de abajo para navegar."
        )
        .setColor("Blue")
        .setFooter({
            text: "DARK FF V1 • Sistema de ayuda"
        });
}

// ======================================================
// EMBED DE CATEGORÍA
// ======================================================

function crearCategoria(id) {
    const categoria = categorias[id];

    if (!categoria) {
        return crearInicio();
    }

    return new EmbedBuilder()
        .setTitle(categoria.nombre)
        .setDescription(
            `${categoria.descripcion}\n\n` +
            categoria.comandos
                .map((cmd, i) => `**${i + 1}.** \`${cmd}\``)
                .join("\n")
        )
        .setColor("Blue")
        .setFooter({
            text: `DARK FF V1 • ${categoria.comandos.length} comandos`
        });
}

// ======================================================
// SELECT MENU
// ======================================================

function crearMenu() {
    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId("help_category")
            .setPlaceholder("📚 Selecciona una categoría")
            .addOptions(
                Object.entries(categorias).map(([id, categoria]) => ({
                    label: categoria.nombre.substring(2),
                    description: categoria.descripcion.substring(0, 100),
                    value: id,
                    emoji: categoria.nombre.substring(0, 2).trim()
                }))
            )
    );
}

// ======================================================
// BOTÓN INICIO
// ======================================================

function crearBotones() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("help_home")
            .setLabel("Inicio")
            .setEmoji("🏠")
            .setStyle(ButtonStyle.Primary)
    );
}

// ======================================================
// /HELP
// ======================================================

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Muestra el centro de comandos de DARK FF V1"),

    async execute(interaction) {
        await interaction.reply({
            embeds: [crearInicio()],
            components: [
                crearMenu(),
                crearBotones()
            ]
        });
    },

    categorias,
    crearInicio,
    crearCategoria,
    crearMenu,
    crearBotones
};
