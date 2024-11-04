import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName("skip")
		.setDescription("Pula a música atual"),
	/**
	 *
	 * @param {{ interaction: import('discord.js').Interaction<import('discord.js').CacheType>; player: import('discord-player').Player }} param
	 */
	execute: async ({ client, interaction, player }) => {
		const queue = player.nodes.get(interaction.guildId);

		if (!queue) {
			await interaction.reply("Músicas não encontradas");
			return;
		}

		const currentSong = queue.currentTrack;

		queue.node.skip();

		await interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setDescription(`${currentSong.title} foi pulada!`)
					.setThumbnail(currentSong.thumbnail),
			],
		});
	},
};
