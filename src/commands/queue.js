import { SlashCommandBuilder } from "@discordjs/builders";
import { EmbedBuilder } from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName("queue")
		.setDescription("lista as 10 primeiras músicas da fila"),
	/**
	 *
	 * @param {{ interaction: import('discord.js').Interaction<import('discord.js').CacheType>; player: import('discord-player').Player }} param
	 */
	execute: async ({ client, interaction, player }) => {
		const queue = player.nodes.get(interaction.guildId);

		const realSize = queue.size + (queue.isPlaying() ? 1 : 0);

		if (!queue || realSize === 0) {
			await interaction.reply("A fila está vazia");
			return;
		}

		const queueString = queue.tracks
			.toArray()
			.slice(0, 10)
			.map((song, i) => {
				return `${i}) [${song.duration}]\` ${song.title} - <@${song.requestedBy.id}>`;
			})
			.join("\n");

		const currentSong = queue.currentTrack;

		await interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setDescription(
						`**Tocando agora**\n
            ${
							currentSong
								? `\`[${currentSong.duration}]\` ${currentSong.title} - <@${currentSong.requestedBy.id}>`
								: "Nenhuma música tocando agora"
						}
            \n\n**Na Fila**\n${queueString}`,
					)
					.setThumbnail(currentSong.thumbnail),
			],
		});
	},
};
