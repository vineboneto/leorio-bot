import { SlashCommandBuilder } from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName("exit")
		.setDescription("Leorio sai do canal."),
	/**
	 *
	 * @param {{ interaction: import('discord.js').Interaction<import('discord.js').CacheType>; player: import('discord-player').Player }} param
	 */
	execute: async ({ client, interaction, player }) => {
		// Get the current queue
		const queue = player.nodes.get(interaction.guildId);

		if (!queue) {
			await interaction.reply("Eu já sai e fui proteger o Gon!");
			return;
		}

		queue.delete();

		await interaction.reply(
			"Escuta aqui, você é como um irmão pra mim, então fique tranquilo. Vou atrás daquele desgraçado do Ging, ele precisa de umas verdades na cara e uns bons socos pra lembrar o que é responsabilidade! Você merece alguém que se importe de verdade, não um fantasma que só aparece quando bem entende",
		);
	},
};
