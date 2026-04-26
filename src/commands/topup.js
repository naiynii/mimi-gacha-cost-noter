const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { v4: uuidv4 } = require('uuid'); // Need to install uuid
const sheets = require('../utils/googleSheets');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('topup')
    .setDescription('Record a new game top-up transaction')
    .addStringOption(option => 
      option.setName('game')
        .setDescription('Select an existing game or type a new one')
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
    
    // Passing game name in customId. Be careful of 100 character limit in customId!
    // Safe custom ID: topup_modal_xxx
    const safeGameName = encodeURIComponent(gameName).slice(0, 80);
    const modal = new ModalBuilder()
      .setCustomId(`topup_modal_${safeGameName}`)
      .setTitle('Game Top-up Form');

    // 1. Total Amount
    const amountInput = new TextInputBuilder()
      .setCustomId('input_amount')
      .setLabel('Total Amount (THB)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('e.g. 3700')
      .setRequired(true);

    // 2. Date
    const dateInput = new TextInputBuilder()
      .setCustomId('input_date')
      .setLabel('Date (DD/MM/YYYY)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Leave blank for today (e.g. 12/04/2026)')
      .setRequired(false);

    // 3. Items Detail
    const itemsInput = new TextInputBuilder()
      .setCustomId('input_items')
      .setLabel('Items Detail')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('e.g. Monthly Pass 150, Big Gem Pack 3550')
      .setRequired(true);

    // 4. Remark
    const remarkInput = new TextInputBuilder()
      .setCustomId('input_remark')
      .setLabel('Remark')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Notes/Memo (Optional)')
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
      return interaction.reply({ content: '❌ **Invalid Amount**: Please enter a valid positive number for the amount.', ephemeral: true });
    }

    let finalDate = dateStr.trim();
    if (!finalDate) {
      // Default to today DD/MM/YYYY
      const today = new Date();
      finalDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    } else {
      const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/\d{4}$/;
      if (!dateRegex.test(finalDate)) {
        return interaction.reply({ content: '❌ **Invalid Date Format**: Please use DD/MM/YYYY (e.g., 12/04/2026).', ephemeral: true });
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
        
        await interaction.editReply(`✅ **Success!** Recorded **${amount} THB** for **${gameName}** on ${finalDate}.\nItems: ${itemsStr}`);
    } catch (error) {
        console.error(error);
        await interaction.editReply('❌ **Database Error**: Failed to save to Google Sheets. Please contact admin.');
    }
  }
};
