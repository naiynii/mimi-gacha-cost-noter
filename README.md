# "Mimi" Gacha Cost Noter Bot

<p align="center">
  <img src="./readme images/mem.png" alt="Mimi Bot (real)" width="200">
</p>


A Discord bot (literally Mem fr) designed to help you track and summarize your gaming and gacha expenditures directly from your Discord server. All logged data is seamlessly saved into a Google Spreadsheets document for easy viewing and management.

## Features

- **`/topup <game>`**: Log a new top-up or gacha expense.
  - Features an autocomplete system that suggests previously logged games.
  - Automatically pops up a user-friendly form (Modal) to input the amount, date, and items received.
- **`/summary [game]`**: View a summary of your expenditures.
  - Providing the game name will show the total for that specific game.
  - Leaving it blank will display the total expenditure across all games.
- **`/help`**: Display an instructional guide on how to use the bot commands.
- **Google Sheets Integration**: Automatically appends new transactions to a connected Google Sheet in real-time.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en) (v16.9.0 or newer is recommended)
- A Discord Bot Token and Client ID (from [Discord Developer Portal](https://discord.com/developers/applications))
- Google Service Account Credentials (for Google Sheets integration)
- A Google Sheet ID

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/naiynii/mimi-gacha-cost-noter.git
   cd mimi-gacha-cost-noter
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and configure the necessary credentials:
   ```env
   DISCORD_TOKEN=your_discord_bot_token
   DISCORD_CLIENT_ID=your_discord_client_id
   GUILD_ID=your_discord_server_id # (Optional) strictly for registering commands quickly
   GOOGLE_SHEET_ID=your_google_sheet_id
   ```

4. Ensure your Google Service Credentials are set up properly. Place your `google-credentials.json` file in the root directory, or handle it via environment variables if deploying to a cloud service.

### Deployment & Usage

1. Pre-register the Slash Commands to Discord:
   ```bash
   node src/deploy-commands.js
   ```

2. Start the bot:
   ```bash
   npm start
   ```

## Built With

- [Discord.js (v14)](https://discord.js.org/) - Discord API wrapper
- [Google Sheets API](https://developers.google.com/sheets/api) - Cloud database storage
- Node.js
