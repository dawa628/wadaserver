const { SlashCommandBuilder, PermissionFlagsBits, Flags } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("v")
    .setDescription("指定したロールのメンバー全員に投票DMを送ります")
    .addStringOption(option =>
      option.setName("topic")
        .setDescription("投票のテーマ")
        .setRequired(true)
    )
    .addRoleOption(option =>
      option.setName("role")
        .setDescription("DMを送る対象のロール")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    try {
      const topic = interaction.options.getString("topic");
      const role = interaction.options.getRole("role");

      // ロールが存在するか確認
      if (!role) {
        return interaction.reply({
          content: "❌ 指定されたロールが見つかりませんでした。",
          ephemeral: true
        });
      }

      // メンバーの取得
      // 投票DMを送信するメンバーはキャッシュからではなく、最新の情報を取得
      const members = await interaction.guild.members.fetch();
      const roleMembers = members.filter(member => member.roles.cache.has(role.id));
      
      if (roleMembers.size === 0) {
        return interaction.reply({
          content: `❌ ${role.name} のメンバーが見つかりませんでした。`,
          ephemeral: true
        });
      }

      // DM送信開始のメッセージ
      await interaction.reply({
        content: `✅ **${role.name}** の全メンバー (${roleMembers.size}人) に「**${topic}**」の投票依頼を送信します。`,
        ephemeral: false
      });

      const failedDMs = [];

      for (const member of roleMembers.values()) {
        if (member.user.bot) {
          continue; // ボットにはDMを送らない
        }

        try {
          await member.send(`📩 「**${topic}**」に関する投票をしてください！`);
        } catch (error) {
          failedDMs.push(member.user.tag);
          console.error(`❌ ${member.user.tag} にDMを送れませんでした:`, error.message);
        }
      }

      // DM送信がすべて完了した後に、失敗したメンバーがいるか確認
      if (failedDMs.length > 0) {
        // メッセージを編集して失敗リストを追加
        await interaction.editReply({
          content: `${interaction.fetchReply().content}\n\n⚠️ 以下のメンバーにはDMを送信できませんでした: \`\`\`${failedDMs.join(', ')}\`\`\``,
          ephemeral: false
        });
      } else {
        // 全員に成功した場合のメッセージ
        await interaction.editReply({
          content: `${interaction.fetchReply().content}\n\n🎉 全員へのDM送信が完了しました！`,
          ephemeral: false
        });
      }

    } catch (error) {
      console.error("コマンド実行中にエラーが発生しました:", error);
      await interaction.reply({
        content: "コマンドの実行中に予期せぬエラーが発生しました。",
        ephemeral: true
      });
    }
  },
};