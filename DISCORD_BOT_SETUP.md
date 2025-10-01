# Discord Bot Setup Guide

This guide walks you through creating and configuring a Discord bot for the On-Call Announcer.

## Prerequisites

- Discord server with admin permissions
- Access to Discord Developer Portal

## 1. Create a Discord Application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Enter a name for your bot (e.g., "On-Call Announcer")
4. Click "Create"

## 2. Create a Bot User

1. In your application, go to the "Bot" section in the left sidebar
2. Click "Add Bot"
3. Click "Yes, do it!" to confirm
4. Copy the **Bot Token** (you'll need this for `DISCORD_BOT_TOKEN`)
5. Under "Privileged Gateway Intents", enable:
   - ✅ **Server Members Intent** (required to fetch guild members)
   - ✅ **Message Content Intent** (if you plan to read message content)

## 3. Create the Support Role

1. Go to your Discord server
2. Right-click on your server name → "Server Settings"
3. Go to "Roles" in the left sidebar
4. Click "Create Role"
5. Name it "SupportEngineer" (or your preferred name)
6. Set a color if desired
7. Click "Save Changes"
8. Right-click on the role → "Copy ID" (you'll need this for `DISCORD_SUPPORT_ROLE_ID`)

## 4. Invite the Bot to Your Server

1. In the Discord Developer Portal, go to the "OAuth2" → "URL Generator" section
2. Under "Scopes", select:
   - ✅ **bot**
3. Under "Bot Permissions", select:
   - ✅ **Send Messages** (for announcements)
   - ✅ **Manage Roles** (for role assignment/removal)
   - ✅ **View Channels** (to access channels)
4. Copy the generated URL and open it in your browser
5. Select your server and click "Authorize"
6. Complete any CAPTCHA if prompted

## 5. Configure Bot Role Hierarchy

**IMPORTANT**: The bot can only manage roles that are **below** its own role in the server hierarchy.

1. In your Discord server, go to "Server Settings" → "Roles"
2. Find your bot's role (it should be named after your application)
3. Drag the bot's role **above** the @SupportEngineer role
4. The hierarchy should look like:

   ```
   text
   @everyone
   @YourBotName  ← Should be above SupportEngineer
   @SupportEngineer
   ```

## 6. Get Required IDs

You'll need these IDs for the environment variables:

**Channel ID:**

1. Enable Developer Mode in Discord (User Settings → Advanced → Developer Mode)
2. Right-click on the channel where you want announcements → "Copy ID"

**Support Role ID:**

1. Right-click on the @SupportEngineer role → "Copy ID"

**Bot Token:**

1. From the Discord Developer Portal → Bot section → "Copy" under Token

## 7. Environment Variables

Create a `.env` file with these variables:

```env
# VictorOps API credentials
VICTOROPS_API_ID=your_victorops_api_id
VICTOROPS_API_KEY=your_victorops_api_key

# Discord configuration
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CHANNEL_ID=your_channel_id_here
DISCORD_SUPPORT_ROLE_ID=your_support_role_id_here
```

## Troubleshooting

### Common Discord Bot Issues

#### "Missing Permissions" Error (50013)

- Ensure the bot has the "Manage Roles" permission
- Check that the bot's role is positioned **above** the @SupportEngineer role in the server hierarchy
- Verify the bot was invited with the correct permissions

#### "Invalid Channel" Error

- Verify the `DISCORD_CHANNEL_ID` is correct
- Ensure the bot has access to the channel
- Check that the channel ID is a valid text channel

#### "Support Role Not Found" Error

- Verify the `DISCORD_SUPPORT_ROLE_ID` is correct
- Ensure the role still exists in the server
- Check that the bot can see the role (it should be below the bot's role in hierarchy)

#### "Could Not Find Discord Member" Error

- Verify the Discord user ID in the `victoropsToDiscordUsernames` mapping
- Ensure the user is still a member of the Discord server
- Check that the bot has the "Server Members Intent" enabled

#### "Missing Access" Error (50001)

- Verify the `DISCORD_CHANNEL_ID` is correct and the channel still exists
- Ensure the bot is still a member of the Discord server
- Check that the bot has permission to view and send messages to the specific channel
- **For Private Channels**: The bot must be explicitly granted access to private channels. Go to channel settings → "Who can access this channel?" → Add the bot's role or the bot directly with "View Channel" and "Send Messages" permissions
- Verify the channel hasn't been deleted or the bot hasn't been kicked from the server

### Testing Bot Permissions

You can test if your bot has the correct permissions by running:

```sh
pnpm test:prod
```

Check the logs for any permission-related errors and follow the troubleshooting steps above.
