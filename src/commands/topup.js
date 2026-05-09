const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { v4: uuidv4 } = require('uuid'); // Need to install uuid
const sheets = require('../utils/googleSheets');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('topup')
    .setDescription('Record top-up (ให้เมมบันทึกความทรงจำใหม่มิว!)')
    .addStringOption(option => 
      option.setName('game')
        .setDescription('Select game (พิมพ์ชื่อเกมใหม่ หรือเลือกจากความทรงจำมิว!)')
        .setAutocomplete(true)
        .setRequired(true)
    ),
    
  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    const userId = interaction.user.id;
    
    // Get unique games user has played
    const userGames = await sheets.getUserGames(userId);
    
    // Filter based on what they are typing
    const filtered = userGames.filter(choice => choice.toLowerCase().includes(focusedValue.toLowerCase()));
    
    // Return max 25 choices as per Discord limits
    await interaction.respond(
      filtered.slice(0, 25).map(choice => ({ name: choice, value: choice }))
    );
  },

  async execute(interaction) {
    const gameName = interaction.options.getString('game');
    
    // Safely truncate game name to fit Discord's 100 char limit for customId (topup_modal_ is 12 chars)
    // Convert to array to handle emojis (surrogate pairs) properly without cutting them in half
    let chars = Array.from(gameName);
    while (encodeURIComponent(chars.join('')).length > 85) {
      chars.pop();
    }
    const encodedGameName = encodeURIComponent(chars.join(''));

    const modal = new ModalBuilder()
      .setCustomId(`topup_modal_${encodedGameName}`)
      .setTitle('ฟอร์มบันทึกความทรงจำของเมม 📝');

    // 1. Total Amount
    const amountInput = new TextInputBuilder()
      .setCustomId('input_amount')
      .setLabel('จำนวนเงินที่เปย์ไป (THB)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('เช่น 3700')
      .setRequired(true);

    // 2. Date
    const dateInput = new TextInputBuilder()
      .setCustomId('input_date')
      .setLabel('วันที่ (DD/MM/YYYY)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('เว้นว่างไว้สำหรับวันนี้มิว! (เช่น 12/04/2026)')
      .setRequired(false);

    // 3. Items Detail
    const itemsInput = new TextInputBuilder()
      .setCustomId('input_items')
      .setLabel('รายละเอียดของที่ได้มา')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('เช่น พรแห่งดวงจันทร์ 150, แพ็กใหญ่ 3550')
      .setRequired(true);

    // 4. Remark
    const remarkInput = new TextInputBuilder()
      .setCustomId('input_remark')
      .setLabel('หมายเหตุเพิ่มเติม (ถ้ามี)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('บันทึกความรู้สึกเพิ่มเติมให้เมมจดได้นะมิว!')
      .setRequired(false);

    modal.addComponents(
      new ActionRowBuilder().addComponents(amountInput),
      new ActionRowBuilder().addComponents(dateInput),
      new ActionRowBuilder().addComponents(itemsInput),
      new ActionRowBuilder().addComponents(remarkInput)
    );

    // Show modal
    await interaction.showModal(modal);
  },

  async executeModal(interaction) {
    // 1. Extract inputs
    const amountStr = interaction.fields.getTextInputValue('input_amount');
    const dateStr = interaction.fields.getTextInputValue('input_date');
    const itemsStr = interaction.fields.getTextInputValue('input_items');
    const remarkStr = interaction.fields.getTextInputValue('input_remark');
    
    // Extract game name from the custom ID
    const customIdParts = interaction.customId.split('topup_modal_');
    const gameName = decodeURIComponent(customIdParts[1]);

    // 2. Validation
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount < 0) {
      return interaction.reply({ content: '❌ มิว! จำนวนเงินไม่ถูกต้องนะ ผู้บุกเบิกช่วยกรอกเป็นตัวเลขให้เมมหน่อยนะมิว!', ephemeral: true });
    }

    let finalDate = dateStr.trim();
    if (!finalDate) {
      // Default to today DD/MM/YYYY
      const today = new Date();
      finalDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    } else {
      const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/\d{4}$/;
      if (!dateRegex.test(finalDate)) {
        return interaction.reply({ content: '❌ รูปแบบวันที่ไม่ถูกต้องมิว! รบกวนใช้รูปแบบ DD/MM/YYYY นะ (เช่น 12/04/2026)', ephemeral: true });
      }
    }

    // 3. Defer reply while writing to database (Discord requirement)
    await interaction.deferReply({ ephemeral: true });

    // 4. Write to Google Sheets
    try {
        const record = {
            ID: uuidv4(),
            Timestamp: new Date().toISOString(),
            Topup_Date: finalDate,
            User_ID: interaction.user.id,
            Username: interaction.user.username,
            Game_Name: gameName,
            Total_Amount: amount,
            Items_Detail: itemsStr,
            Remark: remarkStr || ''
        };

        await sheets.addRecord(record);
        
        await interaction.editReply(`✅ เมมบันทึกความทรงจำให้เรียบร้อยแล้วมิว! ✨\nผู้บุกเบิกเปย์เกม **${gameName}** ไป **${amount} THB** (วันที่ ${finalDate})\n📝 ของที่ได้มา: ${itemsStr}`);
    } catch (error) {
        console.error(error);
        await interaction.editReply('❌ แงง... เมมทำความทรงจำหล่นหายมิว! บันทึกข้อมูลไม่ได้ (Database Error)');
    }
  }
};
