// vote.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('投票を開始します')
        .addStringOption(option =>
            option.setName('topic')
                .setDescription('投票テーマ')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('投票対象のロール')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // 管理者のみ実行可

    async execute(interaction) {
        const topic = interaction.options.getString('topic');
        const role = interaction.options.getRole('role');

        await interaction.reply({
            content: `🗳️ 投票を開始しました！テーマ: **${topic}**\n対象ロール: ${role}`,
            ephemeral: true
        });

        // サーバー内のメンバーを取得
        const members = await interaction.guild.members.fetch();

        let success = 0;
        let failed = 0;

        for (const member of members.values()) {
            if (member.roles.cache.has(role.id) && !member.user.bot) {
                try {
                    await member.send(`🗳️ 「${topic}」に関する投票をしてください！`);
                    success++;
                } catch (err) {
                    console.error(`DM送信失敗: ${member.user.tag}`, err);
                    failed++;
                }
            }
        }

        await interaction.followUp({
            content: `✅ DM送信完了: ${success}人\n⚠️ 送信失敗: ${failed}人（DMを受け取れない設定の可能性あり）`,
            ephemeral: true
        });
    },
};
