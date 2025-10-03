const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('wadaserver help')
		.setDescription('このbotのヘルプを表示します。'),

	async execute(client, interaction) {
		await interaction.reply({ content: `こんにちは!`, ephemeral: true });
	},
};
