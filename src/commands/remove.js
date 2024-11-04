import {
	SlashCommandBuilder,
	ActionRowBuilder,
	StringSelectMenuBuilder,
} from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName("remove")
		.setDescription("Remove uma música da fila"),
	/**
	 *
	 * @param {{ interaction: import('discord.js').Interaction<import('discord.js').CacheType>; player: import('discord-player').Player }} param
	 */
	execute: async ({ interaction, player }) => {
		const queue = player.nodes.get(interaction.guildId);

		if (!queue || queue.tracks.size === 0) {
			await interaction.reply("A fila está vazia.");
			return;
		}

		// Cria uma lista de opções de músicas para o menu suspenso
		const trackOptions = queue.tracks.map((track) => ({
			label: track.title, // Nome da música exibido para o usuário
			description: `Duração: ${track.duration}`, // Opção adicional (opcional)
			value: track.id, // ID da música para identificação
		}));

		// Configura o menu suspenso para a seleção de músicas
		const selectMenu = new StringSelectMenuBuilder()
			.setCustomId("select-track")
			.setPlaceholder("Selecione uma música para remover")
			.addOptions(trackOptions);

		// Adiciona o menu suspenso em uma Action Row para enviar como componente
		const row = new ActionRowBuilder().addComponents(selectMenu);

		// Envia o menu suspenso para o usuário
		await interaction.reply({
			content: "Escolha a música que deseja remover da fila:",
			components: [row],
		});

		// Cria um coletor para lidar com a seleção do usuário
		const filter = (i) =>
			i.customId === "select-track" && i.user.id === interaction.user.id;
		const collector = interaction.channel.createMessageComponentCollector({
			filter,
			time: 60000,
		});

		collector.on("collect", async (i) => {
			const trackId = i.values[0];
			const trackToRemove = queue.tracks.find((track) => track.id === trackId);

			if (trackToRemove) {
				queue.removeTrack(trackToRemove);

				await i.update({
					content: `Música **${trackToRemove.title}** removida com sucesso!`,
					components: [],
				});
			} else {
				await i.update({
					content: "A música não foi encontrada na fila.",
					components: [],
				});
			}
		});

		collector.on("end", (collected) => {
			if (collected.size === 0) {
				interaction.editReply({
					content: "Você não selecionou nenhuma música.",
					components: [],
				});
			}
		});
	},
};
