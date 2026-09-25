require("dotenv").config();

const fs = require("fs");
const path = require("path");
const http = require("http");

const {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes,
  Events
} = require("discord.js");

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

if (!TOKEN) {
  console.error("❌ Falta DISCORD_TOKEN.");
  process.exit(1);
}

if (!CLIENT_ID) {
  console.error("❌ Falta CLIENT_ID.");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();

const commands = [];

// ========================================
// BUSCAR COMANDOS EN TODAS LAS SUBCARPETAS
// ========================================

function buscarArchivos(dir) {
  let archivos = [];

  if (!fs.existsSync(dir)) {
    return archivos;
  }

  for (const archivo of fs.readdirSync(dir)) {
    const ruta = path.join(dir, archivo);
    const stat = fs.statSync(ruta);

    if (stat.isDirectory()) {
      archivos = archivos.concat(buscarArchivos(ruta));
    } else if (archivo.endsWith(".js")) {
      archivos.push(ruta);
    }
  }

  return archivos;
}

// ========================================
// CARGAR COMANDOS
// ========================================

const comandosPath = path.join(__dirname, "comandos");

if (!fs.existsSync(comandosPath)) {
  fs.mkdirSync(comandosPath, { recursive: true });
}

const archivos = buscarArchivos(comandosPath);

console.log("========================================");
console.log("📦 CARGANDO COMANDOS");
console.log("========================================");

for (const archivo of archivos) {
  try {
    delete require.cache[require.resolve(archivo)];

    const comando = require(archivo);

    const lista = Array.isArray(comando)
      ? comando
      : [comando];

    for (const cmd of lista) {
      if (!cmd || !cmd.data || !cmd.execute) {
        console.error(
          `❌ Comando inválido: ${archivo}`
        );
        continue;
      }

      const nombre = cmd.data.name;

      if (client.commands.has(nombre)) {
        console.error(
          `❌ Comando duplicado: /${nombre}`
        );
        continue;
      }

      client.commands.set(nombre, cmd);
      commands.push(cmd.data.toJSON());

      console.log(`✅ /${nombre}`);
    }

  } catch (error) {
    console.error(
      `❌ Error cargando ${archivo}`
    );
    console.error(error);
  }
}

console.log("========================================");
console.log(`📊 Comandos cargados: ${commands.length}`);
console.log("========================================");

// ========================================
// REGISTRO DE COMANDOS
// ========================================

const rest = new REST({
  version: "10"
}).setToken(TOKEN);

async function registrarComandos() {
  try {
    console.log("🔄 Registrando comandos...");

    if (GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(
          CLIENT_ID,
          GUILD_ID
        ),
        {
          body: commands
        }
      );

      console.log(
        `✅ ${commands.length} comandos registrados en el servidor.`
      );

    } else {
      await rest.put(
        Routes.applicationCommands(CLIENT_ID),
        {
          body: commands
        }
      );

      console.log(
        `✅ ${commands.length} comandos registrados globalmente.`
      );
    }

  } catch (error) {
    console.error("❌ Error registrando comandos:");
    console.error(error);
  }
}

// ========================================
// BOT LISTO
// ========================================

client.once(Events.ClientReady, async () => {
  console.log("========================================");
  console.log("🤖 DARK FF V1 ONLINE");
  console.log(`👤 ${client.user.tag}`);
  console.log(`🆔 ${client.user.id}`);
  console.log("========================================");

  await registrarComandos();
});

// ========================================
// EJECUTAR COMANDOS
// ========================================

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  console.log(
    `📥 /${interaction.commandName}`
  );

  const comando = client.commands.get(
    interaction.commandName
  );

  if (!comando) {
    console.error(
      `❌ No se encontró /${interaction.commandName}`
    );

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "❌ Ese comando no está cargado.",
        ephemeral: true
      }).catch(() => {});
    }

    return;
  }

  try {
    await comando.execute(interaction);

    console.log(
      `✅ /${interaction.commandName} ejecutado`
    );

  } catch (error) {
    console.error(
      `❌ Error en /${interaction.commandName}:`
    );

    console.error(error);

    const mensaje = {
      content: "❌ Ocurrió un error al ejecutar el comando.",
      ephemeral: true
    };

    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(mensaje);
      } else {
        await interaction.reply(mensaje);
      }
    } catch {}
  }
});

// ========================================
// SERVIDOR WEB PARA RAILWAY / RENDER
// ========================================

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/plain; charset=utf-8"
  });

  res.end("DARK FF V1 está funcionando.");
}).listen(PORT, () => {
  console.log(`🌐 Puerto ${PORT} activo`);
});

// ========================================
// LOGIN
// ========================================

client.login(TOKEN)
  .then(() => {
    console.log("🔐 Conectando con Discord...");
  })
  .catch(error => {
    console.error("❌ Error al iniciar sesión:");
    console.error(error);
  });
