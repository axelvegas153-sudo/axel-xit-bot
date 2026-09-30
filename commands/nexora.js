const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// LA API SE LEE DE RAILWAY VARIABLES
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

module.exports = {
    data: [
        // COMANDO 1: CHAT NORMAL
        new SlashCommandBuilder()
           .setName('nexora')
           .setDescription('🧠 Habla con Nexora IA - Tu profe de programación')
           .addStringOption(o => o.setName('pregunta').setDescription('Pregúntame lo que quieras').setRequired(true)),

        // COMANDO 2: LECCION DIARIA PYTHON
        new SlashCommandBuilder()
           .setName('nexora-leccion')
           .setDescription('📚 Te da una lección diaria de Python explicada línea por línea'),

        // COMANDO 3: LECCION DE CUALQUIER LENGUAJE
        new SlashCommandBuilder()
           .setName('nexora-lenguaje')
           .setDescription('💻 Aprende cualquier lenguaje de programación')
           .addStringOption(o => o
               .setName('lenguaje')
               .setDescription('Elige el lenguaje')
               .setRequired(true)
               .addChoices(
                    { name: 'Python 🐍', value: 'Python' },
                    { name: 'JavaScript 💛', value: 'JavaScript' },
                    { name: 'HTML/CSS 🌐', value: 'HTML' },
                    { name: 'Lua 🎮', value: 'Lua' },
                    { name: 'C# ⚙️', value: 'C#' },
                    { name: 'Java ☕', value: 'Java' },
                    { name: 'C++ 🔧', value: 'C++' },
                    { name: 'SQL 🗄️', value: 'SQL' },
                ))
    ],

    async execute(i) {
        await i.deferReply();

        try {
            // Verificar que la API existe
            if (!process.env.GOOGLE_API_KEY) {
                return i.editReply({ content: '❌ Error: No se encontró la GOOGLE_API_KEY en Railway Variables' });
            }

            let prompt = "";
            let titulo = "";

            if(i.commandName === 'nexora') {
                const pregunta = i.options.getString('pregunta');
                prompt = `Tu nombre es Nexora IA de DARK FF V1. Eres una profesora de programación experta, amable y paciente.
                Reglas: 1. Explica fácil. 2. Si das código, ponlo en \`\` y explícalo línea por línea.
                Pregunta del usuario: ${pregunta}`;
                titulo = '💬 Nexora IA Responde';
            }

            if(i.commandName === 'nexora-leccion') {
                const fecha = new Date().toLocaleDateString('es-CO');
                prompt = `Eres Nexora IA, profesora de Python. Hoy es ${fecha}. Dame la lección del día para principiantes.
                ESTRUCTURA: 1. **Tema del día** 2. **¿Para qué sirve?** 3. **Código** en \`\`python 4. **Explicación línea por línea** 5. **🎯 Reto**`;
                titulo = '📚 Lección de Python del Día';
            }

            if(i.commandName === 'nexora-lenguaje') {
                const lenguaje = i.options.getString('lenguaje');
                prompt = `Eres Nexora IA, profesora de ${lenguaje}. Dame lección #1 de ${lenguaje} para principiantes.
                ESTRUCTURA: 1. **Tema del día** 2. **¿Para qué sirve?** 3. **Código** en \`\`\`${lenguaje.toLowerCase()} 4. **Explicación línea por línea** 5. **🎯 Reto**`;
                titulo = `💻 Clase de ${lenguaje}`;
            }

            const result = await model.generateContent(prompt);
            const respuesta = result.response.text();

            const embed = new EmbedBuilder()
               .setAuthor({ name: 'Nexora IA - Academia DARK FF V1', iconURL: 'https://cdn-icons-png.flaticon.com/512/4712/4712109.png' })
               .setTitle(titulo)
               .setDescription(respuesta)
               .setColor(0x00FFFF)
               .setFooter({ text: `Desarrollador: DARK FF V1 • Solicitado por ${i.user.tag}` })
               .setTimestamp();

            await i.editReply({ embeds: [embed] });

        } catch (e) {
            console.error(e);
            await i.editReply({ embeds: [new EmbedBuilder().setDescription(`❌ Error: ${e.message}\nRevisa tu GOOGLE_API_KEY en Railway`).setColor(0xFF0000)] });
        }
    }
}
