import { QueueRepeatMode } from "discord-player";
import { SlashCommandBuilder } from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName("loop")
		.setDescription("Coloca/remove a fila do loop")
		.addStringOption((input) => {
			return input
				.setName("loop")
				.setDescription("Opções de loop")
				.setRequired(true)
				.addChoices(
					{ name: "Fila", value: QueueRepeatMode.QUEUE.toString() },
					{ name: "Música Atual", value: QueueRepeatMode.TRACK.toString() },
					{ name: "Autoplay", value: QueueRepeatMode.AUTOPLAY.toString() },
					{ name: "Desligar", value: QueueRepeatMode.OFF.toString() },
				);
		}),
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

		const option = interaction.options.getString("loop");

		queue.setRepeatMode(Number(option));

		await interaction.reply("Alteração aplicada com sucesso");
	},
};
