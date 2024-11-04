import { Client, GatewayIntentBits } from "discord.js";
import {
	joinVoiceChannel,
	createAudioPlayer,
	createAudioResource,
	AudioPlayerStatus,
	VoiceConnectionStatus,
} from "@discordjs/voice";
import ytdl from "@distube/ytdl-core";
import { Worker } from "bullmq";

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds, // Permite ao bot trabalhar em guilds (servidores)
		GatewayIntentBits.GuildVoiceStates, // Necessário para se conectar a canais de voz
		GatewayIntentBits.GuildMessages, // Permite ler mensagens em canais
		GatewayIntentBits.MessageContent, // Permite acessar o conteúdo das mensagens
	],
});

let connection;
let isPlaying = false;
const player = createAudioPlayer();

const queue = async.queue(async (song, callback) => {
	try {
		const stream = ytdl(song.url, {
			filter: "audioonly",
			highWaterMark: 1 << 25,
			quality: "highestaudio",
		});
		const resource = createAudioResource(stream);

		player.play(resource);
		isPlaying = true;

		await new Promise((resolve) => {
			player.once(AudioPlayerStatus.Idle, () => {
				console.log("Musíca finalizada");
				isPlaying = false;
				resolve();
			});
			player.once("error", (error) => {
				console.error("Erro ao reproduzir música:", error);
				isPlaying = false;
				resolve();
			});
		});

		player.on("error", (error) => {
			console.error("Erro ao reproduzir música:", error);
			callback();
		});
	} finally {
		callback();
	}
}, 1);

async function connectToVoiceChannel(message) {
	if (!message.member.voice.channel) {
		message.channel.send(
			"Você precisa estar em um canal de voz para tocar música!",
		);
		return;
	}

	connection = joinVoiceChannel({
		channelId: message.member.voice.channel.id,
		guildId: message.guild.id,
		adapterCreator: message.guild.voiceAdapterCreator,
	});

	connection.on("stateChange", (oldState, newState) => {
		if (newState.status === VoiceConnectionStatus.Disconnected) {
			connection.destroy();
		}
	});

	connection.subscribe(player);
	message.channel.send(
		"Conectado ao canal de voz e pronto para tocar músicas!",
	);
}

async function resumeQueue(message) {
	const realSize = queue.length() + queue.running();

	const tasks = queue.tasks;

	if (realSize > 0) {
		const songs = queue
			.workersList()
			.map(({ data: song }, index) => {
				return `${index + 1}. ${song.title}`;
			})
			.join("\n");

		message.channel.send(`Fila de músicas:\n${songs}`);
	} else {
		message.channel.send("A fila está vazia.");
	}
}

async function getSongInfo(url) {
	const info = await ytdl.getBasicInfo(url);
	return {
		url: url,
		title: info.videoDetails.title,
	};
}

client.on("messageCreate", async (message) => {
	if (message.author.bot) return;

	const args = message.content.split(" ");
	const command = args[0];
	const url = args[1];

	if (command === "!play") {
		if (!ytdl.validateURL(url)) {
			message.channel.send("Por favor, forneça um URL válido do YouTube!");
			return;
		}

		// Conectar ao canal de voz se ainda não estiver conectado
		if (
			!connection ||
			connection.state.status === VoiceConnectionStatus.Destroyed
		) {
			await connectToVoiceChannel(message);
		}

		const songInfo = await getSongInfo(url);

		// Adicionar música à fila
		queue.push({ ...songInfo, message: message }, () => {
			if (queue.length() === 0) {
				message.channel.send("Fila de músicas finalizada.");
			}
		});

		if (!isPlaying) {
			message.channel.send(`Adicionado à fila: ${songInfo.title}`);
		}
	}

	// Comando para pausar a música
	if (command === "!pause") {
		if (player.state.status === AudioPlayerStatus.Playing) {
			player.pause();
			message.channel.send("Música pausada.");
		} else {
			message.channel.send("Não há nenhuma música tocando para pausar.");
		}
	}

	// Comando para retomar a música
	if (command === "!resume") {
		if (player.state.status === AudioPlayerStatus.Paused) {
			player.unpause();
			message.channel.send("Música retomada.");
		} else {
			message.channel.send("Não há nenhuma música pausada para retomar.");
		}
	}

	// Comando para parar a música e limpar a fila
	if (command === "!leave") {
		player.stop();
		queue.kill(); // Limpa a fila
		isPlaying = false;
		message.channel.send("Música parada e fila limpa.");
		connection.destroy();
	}

	// Comando para listar as músicas na fila
	if (command === "!queue") {
		resumeQueue(message);
	}

	if (command === "!remove") {
		const index = Number.parseInt(args[1]) - 1;

		if (Number.isNaN(index) || index < 0 || index >= queue.length()) {
			message.channel.send(
				"Índice inválido. Forneça um número válido da fila.",
			);
			return;
		}

		// Remove a música na posição especificada
		const removedSong = queue.splice(index, 1);
		message.channel.send(`Removido da fila: ${removedSong[0].url}`);
	}
});

client.once("ready", () => {
	console.log("Bot está online!");
});

client.login(process.env.DISCORD_TOKEN);
