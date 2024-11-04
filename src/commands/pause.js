import { SlashCommandBuilder } from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName("pause")
		.setDescription("Pausa a música atual"),
	/**
	 *
	 * @param {{ interaction: import('discord.js').Interaction<import('discord.js').CacheType>; player: import('discord-player').Player }} param
	 */
	execute: async ({ client, interaction, player }) => {
		const queue = player.nodes.get(interaction.guildId);

		if (!queue) {
			await interaction.reply("fila não encontrada");
			return;
		}

		queue.node.setPaused(true);

		await interaction.reply("Música pausada.");
	},
};
