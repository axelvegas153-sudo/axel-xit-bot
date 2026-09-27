const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = [
    {
        data: new SlashCommandBuilder().setName('ban').setDescription('Banea a un usuario').addUserOption(o=>o.setName('usuario').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
        async execute(i){ await i.guild.members.ban(i.options.getUser('usuario')); await i.reply('Baneado') }
    },
    {
        data: new SlashCommandBuilder().setName('kick').setDescription('Expulsa').addUserOption(o=>o.setName('usuario').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
        async execute(i){ await i.guild.members.kick(i.options.getUser('usuario')); await i.reply('Expulsado') }
    },
    {
        data: new SlashCommandBuilder().setName('clear').setDescription('Borra mensajes').addIntegerOption(o=>o.setName('cantidad').setMinValue(1).setMaxValue(100).setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
        async execute(i){ await i.channel.bulkDelete(i.options.getInteger('cantidad')); await i.reply('Borrado') }
    }
];
