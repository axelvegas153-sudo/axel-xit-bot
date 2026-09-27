const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = [
    { data: new SlashCommandBuilder().setName('userinfo').setDescription('Info de usuario').addUserOption(o=>o.setName('usuario')),
    execute: async i => {
        const u = i.options.getUser('usuario') || i.user;
        const m = i.guild.members.cache.get(u.id);
        await i.reply(`👤 **${u.tag}**\nID: ${u.id}\nSe unió: ${m.joinedAt.toDateString()}`);
    }},
    { data: new SlashCommandBuilder().setName('avatar').setDescription('Ver avatar').addUserOption(o=>o.setName('usuario')),
    execute: async i => {
        const u = i.options.getUser('usuario') || i.user;
        await i.reply({files: [u.displayAvatarURL({size: 4096})]});
    }},
    { data: new SlashCommandBuilder().setName('roleinfo').setDescription('Info de rol').addRoleOption(o=>o.setName('rol').setRequired(true)),
    execute: async i => await i.reply(`🎭 **${i.options.getRole('rol').name}**\nMiembros: ${i.options.getRole('rol').members.size}`)},
    { data: new SlashCommandBuilder().setName('channelinfo').setDescription('Info del canal'),
    execute: async i => await i.reply(`📺 **${i.channel.name}**\nID: ${i.channel.id}`)},
    { data: new SlashCommandBuilder().setName('server').setDescription('Info del server'),
    execute: async i => await i.reply(`🏰 ${i.guild.name}\nDueño: ${i.guild.ownerId}\nBoosts: ${i.guild.premiumSubscriptionCount}`)},
    { data: new SlashCommandBuilder().setName('banner').setDescription('Ver banner').addUserOption(o=>o.setName('usuario')),
    execute: async i => await i.reply('🖼️ Los banners se ven con Nitro')},
    { data: new SlashCommandBuilder().setName('roles').setDescription('Lista de roles'),
    execute: async i => await i.reply(`🎭 Roles: ${i.guild.roles.cache.size}`)},
    { data: new SlashCommandBuilder().setName('emojis').setDescription('Lista de emojis'),
    execute: async i => await i.reply(`😀 Emojis: ${i.guild.emojis.cache.size}`)},
    { data: new SlashCommandBuilder().setName('boosters').setDescription('Ver boosters'),
    execute: async i => await i.reply(`🚀 Boosters: ${i.guild.premiumSubscriptionCount}`)},
    { data: new SlashCommandBuilder().setName('membercount').setDescription('Contar miembros'),
    execute: async i => await i.reply(`👥 Miembros: ${i.guild.memberCount}`)},
    { data: new SlashCommandBuilder().setName('icon').setDescription('Icono del server'),
    execute: async i => await i.reply({files: [i.guild.iconURL({size: 4096})]})},
    { data: new SlashCommandBuilder().setName('date').setDescription('Fecha actual'),
    execute: async i => await i.reply(`📅 ${new Date().toLocaleDateString()}`)},
    { data: new SlashCommandBuilder().setName('time').setDescription('Hora actual'),
    execute: async i => await i.reply(`⏰ ${new Date().toLocaleTimeString()}`)},
    { data: new SlashCommandBuilder().setName('weather').setDescription('Clima').addStringOption(o=>o.setName('ciudad').setRequired(true)),
    execute: async i => await i.reply(`🌤️ Clima en ${i.options.getString('ciudad')}: 25°C`)},
    { data: new SlashCommandBuilder().setName('translate').setDescription('Traducir').addStringOption(o=>o.setName('texto').setRequired(true)),
    execute: async i => await i.reply(`🌐 Traducción: ${i.options.getString('texto')}`)},
    { data: new SlashCommandBuilder().setName('wiki').setDescription('Buscar wiki').addStringOption(o=>o.setName('busqueda').setRequired(true)),
    execute: async i => await i.reply(`📚 Buscando: ${i.options.getString('busqueda')}`)},
    { data: new SlashCommandBuilder().setName('covid').setDescription('Casos covid'),
    execute: async i => await i.reply('🦠 Datos no disponibles')},
    { data: new SlashCommandBuilder().setName('youtube').setDescription('Buscar youtube').addStringOption(o=>o.setName('video').setRequired(true)),
    execute: async i => await i.reply(`▶️ Buscando: ${i.options.getString('video')}`)},
    { data: new SlashCommandBuilder().setName('github').setDescription('Buscar github').addStringOption(o=>o.setName('user').setRequired(true)),
    execute: async i => await i.reply(`💻 github.com/${i.options.getString('user')}`)},
    { data: new SlashCommandBuilder().setName('instagram').setDescription('Buscar ig').addStringOption(o=>o.setName('user').setRequired(true)),
    execute: async i => await i.reply(`📷 instagram.com/${i.options.getString('user')}`)}
];
