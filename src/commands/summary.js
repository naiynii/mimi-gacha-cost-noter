const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');
const sheets = require('../utils/googleSheets');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('summary')
    .setDescription('View top-up summary (ให้เมมสรุปยอดความทรงจำให้มิว!)')
    .addStringOption(option => 
      option.setName('game')
        .setDescription('Optional: Filter by specific game (ระบุชื่อเกมที่อยากดูมิว!)')
        .setAutocomplete(true)
        .setRequired(false)
    ),

  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    const userId = interaction.user.id;
    const userGames = await sheets.getUserGames(userId);
    const filtered = userGames.filter(choice => choice.toLowerCase().includes(focusedValue.toLowerCase()));
    await interaction.respond(
      filtered.slice(0, 25).map(choice => ({ name: choice, value: choice }))
    );
  },

  async execute(interaction) {
    const gameFilter = interaction.options.getString('game');
    
    // Google Sheets might be slow
    await interaction.deferReply();

    try {
        const data = await sheets.getSummary(interaction.user.id, gameFilter);
        
        // Build Embed
        let title = gameFilter ? `📊 สรุปความทรงจำสำหรับเกม ${gameFilter} มิว!` : `📊 สรุปความทรงจำทั้งหมดที่เมมดูแลอยู่มิว!`;
        const embed = new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle(title)
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            .addFields({ name: '✨ ยอดรวมความทรงจำ (Total Spent)', value: `**${data.total.toLocaleString()} THB**`, inline: false });
            
        // Show up to 5 recent transactions
        if (data.items.length > 0) {
            // Get last 5 items
            const recent = data.items.slice(-5);
            let historyText = '';
            for (const item of recent) {
                const gameLabel = gameFilter ? '' : `[${item.game}] `;
                historyText += `• ${item.date} - ${gameLabel}**${item.amount} THB**\n  └ *${item.detail}*\n`;
            }
            embed.addFields({ name: '📝 ความทรงจำล่าสุดที่เมมจดไว้', value: historyText });
        } else {
            embed.setDescription('อ๊ะ... เมมหาความทรงจำไม่เจอมิว! ผู้บุกเบิกยังไม่ได้ให้เมมบันทึกอะไรไว้เลย~');
        }

        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error(error);
        await interaction.editReply('❌ แงง... เมมค้นหาความทรงจำไม่เจอมิว! ระบบขัดข้องนิดหน่อย (Database Error)');
    }
  }
};
