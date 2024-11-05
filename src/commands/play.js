import { SlashCommandBuilder } from "@discordjs/builders";
import ytdl from "@distube/ytdl-core";
import { QueryType } from "discord-player";
import { EmbedBuilder } from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName("play")
		.setDescription("Tocar uma música do youtube")
		.addStringOption((option) =>
			option.setName("url").setDescription("url").setRequired(true),
		),

	/**
	 *
	 * @param {{ interaction: import('discord.js').Interaction<import('discord.js').CacheType>; player: import('discord-player').Player, sharedPlayer: import('discord-player').AudioPlayer }} param
	 */
	execute: async ({ client, interaction, player, sharedPlayer }) => {
		if (!interaction.member.voice.channel)
			return interaction.reply("Você precisa estar em um canal de voz");

		const queue = player.nodes.create(interaction.guild);

		if (!queue.connection)
			await queue.connect(interaction.member.voice.channel, {
				audioPlayer: sharedPlayer,
			});

		const embed = new EmbedBuilder();

		const url = interaction.options.getString("url");

		const result = await player.search(url, {
			requestedBy: interaction.user,
			searchEngine: ytdl.validateURL(url)
				? QueryType.YOUTUBE_VIDEO
				: QueryType.YOUTUBE_SEARCH,
		});

		if (!result.hasTracks()) return interaction.reply("Música não encontrada");

		const song = result.tracks[0];

		queue.addTrack(song);

		embed
			.setDescription(`**[${song.title}](${song.url})** foi adicionado na fila`)
			.setThumbnail(song.thumbnail)
			.setFooter({ text: `Duração: ${song.duration}` });

		if (!queue.isPlaying()) {
			await queue.node.play();
		}

		await interaction.reply({
			embeds: [embed],
		});
	},
};
