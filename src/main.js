import { Client, Collection, GatewayIntentBits } from "discord.js";
import { Routes } from "discord-api-types/v9";
import { REST } from "@discordjs/rest";
import fs from "node:fs";
import path from "node:path";
import { Player } from "discord-player";
import { YoutubeiExtractor } from "discord-player-youtubei";

export const client = new Client({
	intents: [
		GatewayIntentBits.Guilds, // Permite ao bot trabalhar em guilds (servidores)
		GatewayIntentBits.GuildVoiceStates, // Necessário para se conectar a canais de voz
		GatewayIntentBits.GuildMessages, // Permite ler mensagens em canais
		GatewayIntentBits.MessageContent, // Permite acessar o conteúdo das mensagens
	],
});

const player = new Player(client, {
	ytdlOptions: {
		quality: "highestaudio",
		highWaterMark: 1 << 25,
	},
});

player.extractors.register(YoutubeiExtractor, {});

const commands = [];
client.commands = new Collection();

const commandsPath = path.join("src", "commands");

const commandsFile = (await fs.promises.readdir(commandsPath)).filter((v) =>
	v.endsWith(".js"),
);

for (const file of commandsFile) {
	const { default: command } = await import(`./commands/${file}`);

	client.commands.set(command.data.name, command);
	commands.push(command.data.toJSON());
}

client.once("ready", () => {
	const guild_ids = client.guilds.cache.map((guild) => guild.id);

	const rest = new REST({ version: "9" }).setToken(process.env.DISCORD_TOKEN);
	for (const guildId of guild_ids) {
		rest
			.put(
				Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, guildId),
				{
					body: commands,
				},
			)
			.then(() =>
				console.log(`Successfully updated commands for guild ${guildId}`),
			)
			.catch(console.error);
	}
});

client.on("interactionCreate", async (interaction) => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) {
		await interaction.reply("Esse comando não existe burro!");
		return;
	}

	try {
		await command.execute({ client, interaction, player });
	} catch (error) {
		console.error(error);
		await interaction.reply({
			content: "Ocorreu algum erro ao executar o comando",
		});
	}
});

client.login(process.env.DISCORD_TOKEN);
