const { Events } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
    // ======== SLASH COMMANDS ========
		if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`Error executing ${interaction.commandName}`);
        console.error(error);
        const errObj = { content: 'There was an error while executing this command!', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(errObj);
        } else {
          await interaction.reply(errObj);
        }
      }
    } 
    
    // ======== AUTOCOMPLETE ========
    else if (interaction.isAutocomplete()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;
      
      try {
        if (command.autocomplete) {
          await command.autocomplete(interaction);
        }
      } catch (error) {
        console.error(error);
      }
    }

    // ======== MODALS ========
    else if (interaction.isModalSubmit()) {
      // In this architecture, we route modal submits back to the originating command file
      // if it exports a executeModal method. We match via customId prefixes.
      try {
        if (interaction.customId.startsWith('topup_modal_')) {
            const command = interaction.client.commands.get('topup');
            if (command && command.executeModal) {
              await command.executeModal(interaction);
            }
        }
      } catch (error) {
        console.error(`Error executing modal ${interaction.customId}`);
        console.error(error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: 'An error occurred while processing the modal.', ephemeral: true });
        }
      }
    }
	},
};
