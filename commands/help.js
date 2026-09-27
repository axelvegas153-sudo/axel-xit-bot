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
            "/ban", "/unban", "/kick", "/timeout", "/untimeout",
            "/warn", "/unwarn", "/warns", "/clear", "/slowmode",
            "/lock", "/unlock", "/lockchannel", "/unlockchannel",
            "/mute", "/unmute", "/deafen", "/undeafen", "/softban",
            "/nickname", "/resetnickname", "/massban", "/history", "/modlog"
        ]
    },

    staff: {
        nombre: "👮 Staff",
        descripcion: "Herramientas exclusivas para el equipo de moderación.",
        comandos: [
            "/staff", "/stafflist", "/staffinfo", "/addstaff", "/removestaff",
            "/promote", "/demote", "/staffrole", "/staffchannel", "/stafflogs",
            "/staffnote", "/staffnotes", "/reports", "/report",
            "/acceptreport", "/denyreport", "/claimreport", "/closereport",
            "/staffstats", "/modstats", "/permissions", "/checkperms",
            "/staffhelp", "/staffpanel"
        ]
    },

    servidor: {
        nombre: "⚙️ Servidor",
        descripcion: "Configuración general del servidor.",
        comandos: [
            "/serverinfo", "/servericon", "/serverbanner", "/servername",
            "/setserver", "/serverstats", "/serverrules", "/setrules",
            "/serverdesc", "/setverification", "/setlanguage", "/setprefix",
            "/settimezone", "/setwelcome", "/setgoodbye", "/setautorole",
            "/setlogs", "/setmodlogs", "/setsuggestions", "/settickets",
            "/setlevel", "/seteconomy", "/setshop", "/setservercolor",
            "/resetserver"
        ]
    },

    miembros: {
        nombre: "👤 Miembros",
        descripcion: "Información y administración de miembros.",
        comandos: [
            "/userinfo", "/profile", "/avatar", "/banner", "/username",
            "/nickname", "/setnickname", "/resetnickname", "/roles",
            "/userroles", "/addrole", "/removerole", "/roleinfo",
            "/membercount", "/joininfo", "/joindate", "/accountage",
            "/userid", "/permissions", "/userstatus", "/activity",
            "/voiceinfo", "/sharedservers", "/firstmessage", "/memberhistory"
        ]
    },

    roles: {
        nombre: "🎭 Roles",
        descripcion: "Crear, modificar y administrar roles.",
        comandos: [
            "/addrole", "/removerole", "/createrole", "/deleterole",
            "/editrole", "/roleinfo", "/rolename", "/rolecolor",
            "/roleicon", "/hoistrole", "/mentionablerole", "/roleposition",
            "/moverole", "/autorole", "/autoroleoff", "/rolelist",
            "/roleusers", "/rolecount", "/rolepermissions", "/rolelock",
            "/roleunlock", "/reactionrole", "/removereactionrole",
            "/rolepanel", "/resetrole"
        ]
    },

    seguridad: {
        nombre: "🚨 Seguridad",
        descripcion: "Protección contra ataques y abuso.",
        comandos: [
            "/antiraid", "/antiraid-on", "/antiraid-off",
            "/antilink", "/antilink-on", "/antilink-off",
            "/antispam", "/antispam-on", "/antispam-off",
            "/antibot", "/antibot-on", "/antibot-off",
            "/antimention", "/antimention-on", "/antimention-off",
            "/antichannel", "/antichannel-on", "/verify",
            "/verification", "/lockdown", "/unlockdown",
            "/security", "/securitylog", "/securityconfig",
            "/securityreset"
        ]
    },

    automod: {
        nombre: "🤖 AutoMod",
        descripcion: "Automoderación automática del servidor.",
        comandos: [
            "/automod", "/automod-on", "/automod-off",
            "/filter", "/filter-add", "/filter-remove", "/filter-list",
            "/badwords", "/badwords-add", "/badwords-remove",
            "/capsfilter", "/spamfilter", "/linkfilter",
            "/invitefilter", "/mentionfilter", "/emoji-filter",
            "/wordfilter", "/warnfilter", "/automodlogs",
            "/automodconfig", "/automodrules", "/automodreset",
            "/ignoredchannel", "/ignoredrole", "/ignoreduser"
        ]
    },

    logs: {
        nombre: "📝 Logs",
        descripcion: "Registros y seguimiento de actividad.",
        comandos: [
            "/logs", "/logconfig", "/logchannel", "/modlogs",
            "/messagelogs", "/memberlogs", "/rolelogs", "/channellogs",
            "/voicelogs", "/banlogs", "/kicklogs", "/warnlogs",
            "/timeoutlogs", "/joinlogs", "/leavelogs", "/editlogs",
            "/deletelogs", "/commandlogs", "/securitylogs",
            "/automodlogs", "/ticketlogs", "/economylogs",
            "/viewlogs", "/clearlogs", "/resetlogs"
        ]
    },

    tickets: {
        nombre: "🎫 Tickets",
        descripcion: "Sistema de soporte mediante tickets.",
        comandos: [
            "/ticket", "/ticketpanel", "/ticketcreate", "/ticketclose",
            "/ticketdelete", "/ticketadd", "/ticketremove", "/ticketrename",
            "/ticketclaim", "/ticketunclaim", "/tickettranscript",
            "/ticketlock", "/ticketunlock", "/ticketinfo", "/ticketlist",
            "/ticketcategory", "/ticketchannel", "/ticketrole",
            "/ticketmessage", "/ticketwelcome", "/ticketlogs",
            "/ticketconfig", "/ticketsetup", "/ticketreset", "/ticketstats"
        ]
    },

    economia: {
        nombre: "💰 Economía",
        descripcion: "Sistema económico del servidor.",
        comandos: [
            "/balance", "/daily", "/weekly", "/monthly", "/work",
            "/crime", "/rob", "/deposit", "/withdraw", "/pay",
            "/give", "/transfer", "/bank", "/bankinfo", "/cash",
            "/income", "/expense", "/economy", "/economystats",
            "/richest", "/leaderboard", "/money", "/setmoney",
            "/addmoney", "/removemoney"
        ]
    },

    tienda: {
        nombre: "🛒 Tienda",
        descripcion: "Compra objetos, roles y recompensas.",
        comandos: [
            "/shop", "/shopinfo", "/buy", "/sell", "/item",
            "/items", "/inventory", "/use", "/equip", "/unequip",
            "/buyrole", "/buybadge", "/buytitle", "/buycolor",
            "/buyvip", "/price", "/prices", "/store", "/storeinfo",
            "/featured", "/stock", "/additem", "/removeitem",
            "/edititem", "/resetshop"
        ]
    },

    niveles: {
        nombre: "📈 Niveles",
        descripcion: "Sistema de experiencia y niveles.",
        comandos: [
            "/level", "/levels", "/xp", "/addxp", "/removexp",
            "/setxp", "/setlevel", "/levelup", "/levelrank",
            "/levelboard", "/xpboost", "/xpboost-on", "/xpboost-off",
            "/levelroles", "/setlevelrole", "/removelevelrole",
            "/levelconfig", "/levelsettings", "/levelstats",
            "/topxp", "/xpleaderboard", "/nextlevel",
            "/xprequired", "/resetxp", "/resetlevels"
        ]
    },

    logros: {
        nombre: "🏆 Logros",
        descripcion: "Desbloquea logros y consigue recompensas.",
        comandos: [
            "/achievements", "/achievement", "/myachievements",
            "/unlocked", "/locked", "/achievementinfo",
            "/achievementlist", "/achievementstats", "/achievementrank",
            "/achievementboard", "/claimachievement",
            "/addachievement", "/removeachievement", "/editachievement",
            "/achievementreward", "/achievementroles",
            "/achievementconfig", "/achievementprogress",
            "/achievementhistory", "/rareachievements",
            "/hiddenachievements", "/featuredachievements",
            "/achievementsearch", "/resetachievements",
            "/achievementhelp"
        ]
    },

    recompensas: {
        nombre: "🎁 Recompensas",
        descripcion: "Regalos, premios y recompensas.",
        comandos: [
            "/reward", "/rewards", "/claim", "/dailyreward",
            "/weeklyreward", "/monthlyreward", "/gift", "/giveaway",
            "/giveawaystart", "/giveawayend", "/giveawayreroll",
            "/prize", "/prizes", "/bonus", "/streak",
            "/streakreward", "/rewardinfo", "/rewardlist",
            "/rewardstats", "/claimall", "/redeem",
            "/redeemcode", "/codeinfo", "/rewardconfig", "/rewardreset"
        ]
    },

    diversion: {
        nombre: "😂 Diversión",
        descripcion: "Comandos para pasarla bien.",
        comandos: [
            "/meme", "/memes", "/dadjoke", "/joke", "/funny",
            "/gif", "/reaction", "/ship", "/8ball", "/dice",
            "/coinflip", "/rps", "/truth", "/dare", "/roast",
            "/fact", "/quote", "/pick", "/random", "/rate",
            "/compatibility", "/emojify", "/reverse", "/mock", "/hug"
        ]
    },

    minijuegos: {
        nombre: "🎮 Minijuegos",
        descripcion: "Juegos interactivos dentro de Discord.",
        comandos: [
            "/game", "/trivia", "/quiz", "/hangman", "/wordle",
            "/memory", "/tictactoe", "/connect4", "/blackjack",
            "/slots", "/duel", "/battle", "/guess", "/riddle",
            "/mathgame", "/fasttype", "/scramble", "/reactiongame",
            "/higherlower", "/numberguess", "/pokemon",
            "/adventure", "/dailygame", "/gameboard", "/gamestats"
        ]
    },

    memes: {
        nombre: "🤣 Memes",
        descripcion: "Memes y contenido divertido.",
        comandos: [
            "/meme", "/memes", "/memeuser", "/memeserver",
            "/randommeme", "/memetemplate", "/memecreate",
            "/caption", "/demotivational", "/drake", "/stonks",
            "/bonk", "/catmeme", "/dogmeme", "/gamingmeme",
            "/discordmeme", "/reactionmeme", "/gifmeme",
            "/topmeme", "/memerank", "/memestats",
            "/savememe", "/memevote", "/memehelp"
        ]
    },

    ia: {
        nombre: "🤖 Inteligencia Artificial",
        descripcion: "Pregunta, conversa y trabaja con IA.",
        comandos: [
            "/ia", "/ask", "/preguntar", "/explain", "/explicar",
            "/summarize", "/resumir", "/translate", "/traducir",
            "/correct", "/corregir", "/rewrite", "/escribir",
            "/ideas", "/brainstorm", "/define", "/compare",
            "/analizar", "/investigar", "/question", "/answer",
            "/chat", "/code", "/debug", "/vision"
        ]
    },

    informacion: {
        nombre: "📚 Información",
        descripcion: "Consultas, datos y herramientas informativas.",
        comandos: [
            "/info", "/wiki", "/search", "/define", "/dictionary",
            "/meaning", "/facts", "/history", "/science", "/geography",
            "/country", "/capital", "/currency", "/time", "/date",
            "/weather", "/news", "/translate", "/language", "/math",
            "/calculator", "/unit", "/conversion", "/randomfact",
            "/didyouknow"
        ]
    },

    programacion: {
        nombre: "💻 Programación",
        descripcion: "Ayuda para programar y trabajar con código.",
        comandos: [
            "/code", "/program", "/javascript", "/python", "/html",
            "/css", "/nodejs", "/discordjs", "/json", "/sql",
            "/regex", "/algorithm", "/debug", "/error",
            "/explaincode", "/optimize", "/convertcode",
            "/commentcode", "/documentcode", "/variable",
            "/function", "/class", "/api", "/git", "/github"
        ]
    },

    utilidades: {
        nombre: "🧰 Utilidades",
        descripcion: "Herramientas útiles para todos.",
        comandos: [
            "/ping", "/botinfo", "/invite", "/support", "/poll",
            "/survey", "/remind", "/reminders", "/timer", "/stopwatch",
            "/qr", "/encode", "/decode", "/randomnumber", "/calculator",
            "/choose", "/count", "/text", "/embed", "/announce",
            "/afk", "/setafk", "/unafk", "/serverinfo"
        ]
    },

    privacidad: {
        nombre: "🔐 Privacidad",
        descripcion: "Controla tus preferencias y datos del bot.",
        comandos: [
            "/privacy", "/privacyinfo", "/mydata", "/data",
            "/delete-data", "/export-data", "/settings",
            "/notifications", "/dmsettings", "/profileprivacy",
            "/activityprivacy", "/avatarprivacy", "/mentionprivacy",
            "/block", "/unblock", "/ignore", "/unignore",
            "/consent", "/permissions", "/resetsettings",
            "/privacypanel", "/privacyhelp", "/securitysettings",
            "/accountsettings", "/preferences"
        ]
    },

    premium: {
        nombre: "💎 Premium",
        descripcion: "Funciones exclusivas de DARK FF V1.",
        comandos: [
            "/premium", "/premiuminfo", "/premiumstatus",
            "/premiumfeatures", "/premiumhelp", "/premiumperks",
            "/premiumrole", "/premiumcolor", "/premiumbadge",
            "/premiumcommands", "/premiumstats", "/premiumprofile",
            "/premiumsettings", "/premiumshop", "/premiumitems",
            "/premiumxp", "/premiumboost", "/premiumcooldowns",
            "/premiumclaim", "/premiumgift", "/premiumcode",
            "/redeem", "/subscription", "/plans", "/premiumfaq"
        ]
    },

    estadisticas: {
        nombre: "📊 Estadísticas",
        descripcion: "Estadísticas del bot y del servidor.",
        comandos: [
            "/stats", "/botstats", "/serverstats", "/userstats",
            "/modstats", "/economystats", "/levelstats",
            "/achievementstats", "/activitystats", "/messagecount",
            "/voicecount", "/commandstats", "/topcommands",
            "/topmembers", "/topmessages", "/topvoice", "/topxp",
            "/topmoney", "/topachievements", "/servergrowth",
            "/memgrowth", "/activity", "/analytics", "/reportstats",
            "/statistics"
        ]
    },

    archivos: {
        nombre: "📁 Archivos",
        descripcion: "Tu espacio personal para guardar archivos.",
        comandos: [
            "/archivos", "/archivo-subir", "/archivo-descargar",
            "/archivo-eliminar", "/archivo-renombrar", "/archivo-mover",
            "/archivo-listar", "/archivo-buscar", "/archivo-info",
            "/carpeta", "/carpeta-crear", "/carpeta-eliminar",
            "/archivo-compartir", "/archivo-dejarcompartir",
            "/archivo-favorito", "/archivo-recientes",
            "/papelera", "/restaurar", "/espacio",
            "/limite", "/archivo-ayuda",
            "/archivo-config", "/archivo-historial",
            "/mis-archivos", "/archivo-busqueda"
        ]
    },

    musica: {
        nombre: "🎵 Música",
        descripcion: "Reproduce música en canales de voz.",
        comandos: [
            "/play", "/skip", "/stop", "/pause", "/resume",
            "/queue", "/nowplaying", "/volume", "/loop",
            "/shuffle", "/remove", "/move", "/clearqueue",
            "/join", "/leave", "/seek", "/lyrics", "/filters",
            "/bassboost", "/nightcore", "/247", "/autoplay",
            "/history", "/musicinfo", "/musichelp"
        ]
    },

    internet: {
        nombre: "🌐 Internet",
        descripcion: "Herramientas relacionadas con Internet.",
        comandos: [
            "/google", "/youtube", "/tiktok", "/instagram",
            "/twitter", "/reddit", "/github", "/website",
            "/url", "/shorturl", "/unshorturl", "/qrurl",
            "/siteinfo", "/domain", "/ip", "/dns", "/port",
            "/http", "/ssl", "/pingweb", "/searchweb",
            "/image", "/video", "/social", "/link"
        ]
    }
};

// ======================================================
// EMBED PRINCIPAL
// ======================================================

function crearInicio() {
    return new EmbedBuilder()
        .setTitle("🤖 DARK FF V1")
        .setDescription(
            "## 📚 Centro de comandos\n\n" +
            "Selecciona una categoría en el menú para consultar sus comandos.\n\n" +
            `📦 **Categorías:** ${Object.keys(categorias).length}\n` +
            `⚡ **Comandos:** ${Object.values(categorias).reduce((a, c) => a + c.comandos.length, 0)}\n` +
            "🤖 **IA:** Disponible\n" +
            "📁 **Archivos privados:** Disponible\n\n" +
            "Usa el menú de abajo para navegar."
        )
        .setFooter({
            text: "DARK FF V1 • Sistema de ayuda"
        });
}

// ======================================================
// EMBED DE CATEGORÍA
// ======================================================

function crearCategoria(id) {
    const categoria = categorias[id];

    if (!categoria) return crearInicio();

    return new EmbedBuilder()
        .setTitle(`${categoria.nombre}`)
        .setDescription(
            `${categoria.descripcion}\n\n` +
            categoria.comandos
                .map((cmd, i) => `**${i + 1}.** \`${cmd}\``)
                .join("\n")
        )
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
            .setCustomId("help_categoria")
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
// BOTONES
// ======================================================

function crearBotones() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("help_inicio")
            .setLabel("Inicio")
            .setEmoji("🏠")
            .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
            .setCustomId("help_anterior")
            .setLabel("Anterior")
            .setEmoji("⬅️")
            .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId("help_siguiente")
            .setLabel("Siguiente")
            .setEmoji("➡️")
            .setStyle(ButtonStyle.Secondary)
    );
}

// ======================================================
// COMANDO /HELP
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
