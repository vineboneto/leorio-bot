import { Client, GatewayIntentBits } from "discord.js";
import {
	joinVoiceChannel,
	createAudioPlayer,
	createAudioResource,
	AudioPlayerStatus,
	VoiceConnectionStatus,
} from "@discordjs/voice";
import ytdl from "@distube/ytdl-core";

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds, // Permite ao bot trabalhar em guilds (servidores)
		GatewayIntentBits.GuildVoiceStates, // Necessário para se conectar a canais de voz
		GatewayIntentBits.GuildMessages, // Permite ler mensagens em canais
		GatewayIntentBits.MessageContent, // Permite acessar o conteúdo das mensagens
	],
});

import async from "async/queue";

client.once("ready", () => {
	console.log("Bot está online");
});

// let isPlaying = false;

function playMusic(message) {
	const connection = joinVoiceChannel({
		channelId: message.member.voice.channel.id,
		guildId: message.guild.id,
		adapterCreator: message.guild.voiceAdapterCreator,
	});

	const stream = ytdl(url, {
		filter: "audioonly",
		highWaterMark: 1 << 25, // Buffer maior para estabilidade
		quality: "highestaudio", // Melhor qualidade de áudio
	});
	const resource = createAudioResource(stream);
	const player = createAudioPlayer();

	player.play(resource);
	connection.subscribe(player);

	player.on(AudioPlayerStatus.Idle, () => {
		if (
			connection &&
			connection.state.status !== VoiceConnectionStatus.Destroyed
		) {
			connection.destroy();
			message.channel.send("Música finalizada!");
		}
	});

	connection.on("stateChange", (oldState, newState) => {
		if (
			newState.status === VoiceConnectionStatus.Disconnected &&
			connection.state.status !== VoiceConnectionStatus.Destroyed
		) {
			connection.destroy();
		}
	});

	player.on("error", (error) => {
		console.error("Erro ao reproduzir música:", error);
		connection.destroy();
		message.channel.send("Ocorreu um erro ao tocar a música!");
	});

	message.channel.send(`Tocando agora: ${url}`);
}

client.on("messageCreate", async (message) => {
	if (!message.content.startsWith("!play") || message.author.bot) return;

	const args = message.content.split(" ");
	const url = args[1];
	if (!ytdl.validateURL(url)) {
		message.channel.send("Por favor, forneça um URL válido do YouTube!");
		return;
	}

	if (message.member.voice.channel) {
		playMusic(message);
	} else {
		message.channel.send(
			"Você precisa estar em um canal de voz para tocar música!",
		);
	}
});

client.login(process.env.DISCORD_TOKEN);
