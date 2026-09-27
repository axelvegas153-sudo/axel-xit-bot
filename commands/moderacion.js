const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, time } = require('discord.js');

const ms = require('ms'); // npm i ms

function logMod(guild, embed) {
    const db = JSON.parse(require('fs').readFileSync('./database.json'));
    if (!db.logs[guild.id]) db.logs[guild.id] = [];
    db.logs[guild.id].push({ date: Date.now(), embed: embed.toJSON() });
    require('fs').writeFileSync('./database.json', JSON.stringify(db, null, 2));
}

module.exports = [
    // 1. BAN
    {
        data: new SlashCommandBuilder()
           .setName('ban')
           .setDescription('Banea a un usuario del servidor')
           .addUserOption(o => o.setName('usuario').setDescription('Usuario a banear').setRequired(true))
           .addStringOption(o => o.setName('razon').setDescription('Razón').setRequired(false))
           .addIntegerOption(o => o.setName('dias').setDescription('Borrar mensajes de los últimos X días').setMaxValue(7).setRequired(false))
           .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
        async execute(interaction) {
            const user = interaction.options.getUser('usuario');
            const razon = interaction.options.getString('razon') || 'No especificada';
            const dias = interaction.options.getInteger('dias') || 0;
            const member = await interaction.guild.members.fetch(user.id).catch(() => null);

            if (member && member.roles.highest.position >= interaction.member.roles.highest.position)
                return interaction.reply({ content: '❌ No puedes banear a alguien con rol igual o superior', ephemeral: true });

            await interaction.guild.members.ban(user, { reason: razon, deleteMessageDays: dias });

            const embed = new EmbedBuilder().setTitle('🔨 Baneo').setDescription(`${user} fue baneado\n**Razón:** ${razon}`).setColor(0xFF0000);
            logMod(interaction.guild, embed);
            await interaction.reply({ embeds: [embed] });
        }
    },

    // 2. UNBAN
    {
        data: new SlashCommandBuilder()
           .setName('unban')
           .setDescription('Desbanea a un usuario')
           .addStringOption(o => o.setName('id').setDescription('ID del usuario').setRequired(true))
           .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
        async execute(interaction) {
            const id = interaction.options.getString('id');
            await interaction.guild.members.unban(id);
            await interaction.reply(`✅ Usuario \`${id}\` desbaneado`);
        }
    },

    // 3. KICK
    {
        data: new SlashCommandBuilder()
           .setName('kick')
           .setDescription('Expulsa a un usuario')
           .addUserOption(o => o.setName('usuario').setDescription('Usuario a expulsar').setRequired(true))
           .addStringOption(o => o.setName('razon').setDescription('Razón').setRequired(false))
           .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
        async execute(interaction) {
            const member = interaction.options.getMember('usuario');
            const razon = interaction.options.getString('razon') || 'No especificada';
            if (member.roles.highest.position >= interaction.member.roles.highest.position)
                return interaction.reply({ content: '❌ No puedes expulsar a alguien con rol igual o superior', ephemeral: true });

            await member.kick(razon);
            await interaction.reply(`✅ ${member.user.tag} expulsado. **Razón:** ${razon}`);
        }
    },

    // 4. TIMEOUT
    {
        data: new SlashCommandBuilder()
           .setName('timeout')
           .setDescription('Silencia temporalmente a un usuario')
           .addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true))
           .addStringOption(o => o.setName('tiempo').setDescription('Ej: 10m, 1h, 1d').setRequired(true))
           .addStringOption(o => o.setName('razon').setDescription('Razón').setRequired(false))
           .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
        async execute(interaction) {
            const member = interaction.options.getMember('usuario');
            const tiempo = interaction.options.getString('tiempo');
            const razon = interaction.options.getString('razon') || 'No especificada';
            const duration = ms(tiempo);

            if (!duration) return interaction.reply({ content: '❌ Tiempo inválido. Ej: 10m 1h 1d', ephemeral: true });
            await member.timeout(duration, razon);
            await interaction.reply(`✅ ${member} en timeout por \`${tiempo}\`. **Razón:** ${razon}`);
        }
    },

    // 5. UNTIMEOUT
    {
        data: new SlashCommandBuilder()
           .setName('untimeout')
           .setDescription('Quita el timeout a un usuario')
           .addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true))
           .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
        async execute(interaction) {
            const member = interaction.options.getMember('usuario');
            await member.timeout(null);
            await interaction.reply(`✅ Timeout removido a ${member}`);
        }
    },

    // 6. WARN
    {
        data: new SlashCommandBuilder()
           .setName('warn')
           .setDescription('Advierte a un usuario')
           .addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true))
           .addStringOption(o => o.setName('razon').setDescription('Razón').setRequired(true))
           .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
        async execute(interaction) {
            const user = interaction.options.getUser('usuario');
            const razon = interaction.options.getString('razon');
            const db = JSON.parse(require('fs').readFileSync('./database.json'));
            if (!db.economia[user.id]) db.economia[user.id] = { warns: [] };
            db.economia[user.id].warns.push({ razon, mod: interaction.user.id, date: Date.now() });
            require('fs').writeFileSync('./database.json', JSON.stringify(db, null, 2));
            await interaction.reply(`⚠️ ${user} ha recibido una advertencia. **Razón:** ${razon}`);
        }
    },

    // 7. UNWARN
    {
        data: new SlashCommandBuilder()
           .setName('unwarn')
           .setDescription('Elimina una advertencia')
           .addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true))
           .addIntegerOption(o => o.setName('numero').setDescription('Nº de advertencia').setRequired(true))
           .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
        async execute(interaction) {
            const user = interaction.options.getUser('usuario');
            const num = interaction.options.getInteger('numero') - 1;
            const db = JSON.parse(require('fs').readFileSync('./database.json'));
            if (!db.economia[user.id]?.warns[num]) return interaction.reply({ content: '❌ Esa advertencia no existe', ephemeral: true });
            db.economia[user.id].warns.splice(num, 1);
            require('fs').writeFileSync('./database.json', JSON.stringify(db, null, 2));
            await interaction.reply(`✅ Advertencia #${num+1} eliminada de ${user}`);
        }
    },

    // 8. WARNS
    {
        data: new SlashCommandBuilder()
           .setName('warns')
           .setDescription('Ver advertencias de un usuario')
           .addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)),
        async execute(interaction) {
            const user = interaction.options.getUser('usuario');
            const db = JSON.parse(require('fs').readFileSync('./database.json'));
            const warns = db.economia[user.id]?.warns || [];
            if (warns.length === 0) return interaction.reply(`${user} no tiene advertencias`);

            const embed = new EmbedBuilder().setTitle(`⚠️ Advertencias de ${user.tag}`).setColor(0xFFFF00);
            warns.forEach((w, i) => embed.addFields({ name: `#${i+1}`, value: `**Razón:** ${w.razon}\n**Mod:** <@${w.mod}>\n**Fecha:** ${time(new Date(w.date), 'R')}` }));
            await interaction.reply({ embeds: [embed] });
        }
    },

    // 9. CLEAR
    {
        data: new SlashCommandBuilder()
           .setName('clear')
           .setDescription('Borra mensajes')
           .addIntegerOption(o => o.setName('cantidad').setDescription('1-100').setRequired(true).setMinValue(1).setMaxValue(100))
           .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
        async execute(interaction) {
            const amount = interaction.options.getInteger('cantidad');
            await interaction.channel.bulkDelete(amount, true);
            await interaction.reply({ content: `✅ ${amount} mensajes eliminados`, ephemeral: true });
        }
    },

    // 10. PURGE USER
    {
        data: new SlashCommandBuilder()
           .setName('purge')
           .setDescription('Borra mensajes de un usuario')
           .addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true))
           .addIntegerOption(o => o.setName('cantidad').setDescription('1-100').setRequired(true).setMinValue(1).setMaxValue(100))
           .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
        async execute(interaction) {
            const user = interaction.options.getUser('usuario');
            const amount = interaction.options.getInteger('cantidad');
            const messages = await interaction.channel.messages.fetch({ limit: amount });
            const toDelete = messages.filter(m => m.author.id === user.id);
            await interaction.channel.bulkDelete(toDelete);
            await interaction.reply({ content: `✅ ${toDelete.size} mensajes de ${user} eliminados`, ephemeral: true });
        }
    },

    // 11. SLOWMODE
    {
        data: new SlashCommandBuilder()
           .setName('slowmode')
           .setDescription('Activa modo lento en el canal')
           .addIntegerOption(o => o.setName('segundos').setDescription('0-21600').setRequired(true).setMinValue(0).setMaxValue(21600))
           .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
        async execute(interaction) {
            const seconds = interaction.options.getInteger('segundos');
            await interaction.channel.setRateLimitPerUser(seconds);
            await interaction.reply(`✅ Slowmode puesto a ${seconds}s`);
        }
    },

    // 12. LOCK
    {
        data: new SlashCommandBuilder()
           .setName('lock')
           .setDescription('Bloquea el canal')
           .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
        async execute(interaction) {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false });
            await interaction.reply('🔒 Canal bloqueado');
        }
    },

    // 13. UNLOCK
    {
        data: new SlashCommandBuilder()
           .setName('unlock')
           .setDescription('Desbloquea el canal')
           .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
        async execute(interaction) {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: true });
            await interaction.reply('🔓 Canal desbloqueado');
        }
    },

    // 14. MUTE ROL
    {
        data: new SlashCommandBuilder()
           .setName('mute')
           .setDescription('Mutea a un usuario con rol')
           .addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true))
           .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
        async execute(interaction) {
            const member = interaction.options.getMember('usuario');
            let muteRole = interaction.guild.roles.cache.find(r => r.name === 'Muted');
            if (!muteRole) muteRole = await interaction.guild.roles.create({ name: 'Muted', permissions: [] });
            await member.roles.add(muteRole);
            await interaction.reply(`🔇 ${member} muteado`);
        }
    },

    // 15. UNMUTE ROL
    {
        data: new SlashCommandBuilder()
           .setName('unmute')
           .setDescription('Quita el mute a un usuario')
           .addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true))
           .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
        async execute(interaction) {
            const member = interaction.options.getMember('usuario');
            const muteRole = interaction.guild.roles.cache.find(r => r.name === 'Muted');
            if (muteRole) await member.roles.remove(muteRole);
            await interaction.reply(`🔊 ${member} desmuteado`);
        }
    },

    // 16. NICKNAME
    {
        data: new SlashCommandBuilder()
           .setName('nickname')
           .setDescription('Cambia el nick de un usuario')
           .addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true))
           .addStringOption(o => o.setName('nick').setDescription('Nuevo nick').setRequired(true))
           .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),
        async execute(interaction) {
            const member = interaction.options.getMember('usuario');
            const nick = interaction.options.getString('nick');
            await member.setNickname(nick);
            await interaction.reply(`✅ Nick de ${member.user.tag} cambiado a \`${nick}\``);
        }
    },

    // 17. RESETNICKNAME
    {
        data: new SlashCommandBuilder()
           .setName('resetnickname')
           .setDescription('Resetea el nick de un usuario')
           .addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true))
           .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),
        async execute(interaction) {
            const member = interaction.options.getMember('usuario');
            await member.setNickname(null);
            await interaction.reply(`✅ Nick de ${member.user.tag} reseteado`);
        }
    },

    // 18. HISTORY
    {
        data: new SlashCommandBuilder()
           .setName('history')
           .setDescription('Ver historial de moderación de un usuario')
           .addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)),
        async execute(interaction) {
            const user = interaction.options.getUser('usuario');
            const db = JSON.parse(require('fs').readFileSync('./database.json'));
            const logs = db.logs[interaction.guild.id]?.filter(l => l.embed.description.includes(user.id)) || [];
            await interaction.reply(`📜 ${logs.length} acciones encontradas para ${user}`);
        }
    },

    // 19. MODLOG
    {
        data: new SlashCommandBuilder()
           .setName('modlog')
           .setDescription('Ver los últimos 10 logs de moderación')
           .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
        async execute(interaction) {
            const db = JSON.parse(require('fs').readFileSync('./database.json'));
            const logs = db.logs[interaction.guild.id]?.slice(-10) || [];
            const embed = new EmbedBuilder().setTitle('📋 ModLog').setDescription(logs.length? 'Últimas 10 acciones' : 'Sin registros').setColor(0x2B2D31);
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },

    // 20. VOICEKICK
    {
        data: new SlashCommandBuilder()
           .setName('voicekick')
           .setDescription('Saca a un usuario de un canal de voz')
           .addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true))
           .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers),
        async execute(interaction) {
            const member = interaction.options.getMember('usuario');
            if (!member.voice.channel) return interaction.reply({ content: '❌ Ese usuario no está en voz', ephemeral: true });
            await member.voice.disconnect();
            await interaction.reply(`✅ ${member} sacado de voz`);
        }
    }
];
