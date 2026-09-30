const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI("TU_API_KEY_AQUI");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

module.exports = {
    data: new SlashCommandBuilder()
       .setName('nexora')
       .setDescription('🧠 Habla con Nexora IA')
       .addStringOption(o => o.setName('pregunta').setDescription('Pregúntame lo que quieras').setRequired(true)),

    async execute(i) {
        const pregunta = i.options.getString('pregunta');
        await i.deferReply();

        try {
            const prompt = `Tu nombre es Nexora IA. Eres una IA inteligente, amable y directa. No digas que eres Google. Responde esto: ${pregunta}`;
            const result = await model.generateContent(prompt);
            const respuesta = result.response.text();

            const embed = new EmbedBuilder()
               .setAuthor({ name: 'Nexora IA', iconURL: 'https://cdn-icons-png.flaticon.com/512/4712/4712109.png' }) // ícono de IA
               .setTitle('✨ Respuesta Generada')
               .setDescription(`> ${respuesta}`) // > para que se vea como cita
               .setColor(0x00FFFF) // celeste como DARK FF
               .addFields(
                    { name: '💬 Pregunta', value: `\`\`${pregunta}\`\``, inline: false },
                    { name: '⚡ Modelo', value: '`Gemini 1.5 Flash`', inline: true },
                    { name: '⏱️ Tiempo', value: '`<3s`', inline: true }
                )
               .setThumbnail('https://cdn-icons-png.flaticon.com/512/4712/4712109.png') // logo de Nexora
               .setFooter({ text: `Desarrollador: DARK FF V1 • Solicitado por ${i.user.tag}`, iconURL: i.user.displayAvatarURL() })
               .setTimestamp();

            await i.editReply({ embeds: [embed] });

        } catch (e) {
            const errorEmbed = new EmbedBuilder()
               .setTitle('❌ Error en Nexora IA')
               .setDescription(`No pude procesar tu pregunta.\n\`\`\`${e.message}\`\`\``)
               .setColor(0xFF0000)
               .setFooter({ text: `Desarrollador: DARK FF V1` });
            await i.editReply({ embeds: [errorEmbed] });
        }
    }
}
