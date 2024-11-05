import { QueryType } from "discord-player";
import { SlashCommandBuilder } from "discord.js";
import path from "node:path";

export default {
	data: new SlashCommandBuilder().setName("luser").setDescription("Hola Luser"),
	/**
	 *
	 * @param {{ interaction: import('discord.js').Interaction<import('discord.js').CacheType>; player: import('discord-player').Player; sharedPlayer: import('discord-player').AudioPlayer }} param
	 */
	execute: async ({ client, interaction, player, sharedPlayer }) => {
		const voiceChannel = interaction.member.voice.channel;

		if (!voiceChannel) {
			return interaction.reply("Você precisa estar em um canal de voz");
		}

		const queue = player.nodes.get(interaction.guildId);

		if (queue?.isPlaying()) {
			const audioPath = path.join(process.cwd(), "audio", "luser.mp3");

			await player.play(interaction.member.voice.channel, audioPath, {
				searchEngine: QueryType.FILE,
				connectionOptions: {
					audioPlayer: sharedPlayer,
				},
			});
			queue.addTrack(queue.currentTrack);

			queue.node.skip();

			await interaction.reply(
				`Hola Luser ${interaction.member.nickname || interaction.member.user.username}`,
			);

			return;
		}

		const audioPath = path.join(process.cwd(), "audio", "luser.mp3");

		await player.play(interaction.member.voice.channel, audioPath, {
			searchEngine: QueryType.FILE,
			connectionOptions: {
				audioPlayer: sharedPlayer,
			},
		});

		await interaction.reply(
			`Hola Luser ${interaction.member.nickname || interaction.member.user.username}`,
		);
	},
};
