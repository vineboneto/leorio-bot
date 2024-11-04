import { SlashCommandBuilder } from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName("resume")
		.setDescription("Continua tocando a música pausada"),
	/**
	 *
	 * @param {{ interaction: import('discord.js').Interaction<import('discord.js').CacheType>; player: import('discord-player').Player }} param
	 */
	execute: async ({ client, interaction, player }) => {
		const queue = player.nodes.get(interaction.guildId);

		if (!queue) {
			await interaction.reply("A fila não foi encontrada");
			return;
		}

		queue.node.setPaused(false);

		await interaction.reply("Musíca iniciada novamente.");
	},
};
