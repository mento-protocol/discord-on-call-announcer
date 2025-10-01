# Discord On-Call Announcer

A Google Cloud Function that announces when a new support engineer is on-call and updates the @SupportEngineer role in Discord.

- [Prerequisites](#prerequisites)
- [Discord Bot Setup](#discord-bot-setup)
- [Setup](#setup)
- [Running the function locally](#running-the-function-locally)
- [Deployment](#deployment)
- [Testing the function in production](#testing-the-function-in-production)
- [Managing Team Members](#managing-team-members)
- [Checking the logs](#checking-the-logs)

## Prerequisites

- Node.js (>=22.x)
- pnpm (>=9.x)
- Discord server with admin permissions
- VictorOps account with API access

## Discord Bot Setup

If you need to set up a new Discord bot, follow the detailed guide in [DISCORD_BOT_SETUP.md](DISCORD_BOT_SETUP.md).

**Quick Reference:**

- Bot needs **Manage Roles** permission
- Bot's role must be positioned **above** @SupportEngineer role in server hierarchy
- Required environment variables: `DISCORD_BOT_TOKEN`, `DISCORD_CHANNEL_ID`, `DISCORD_SUPPORT_ROLE_ID`

## Setup

1. Clone the repository:

   ```sh
   git clone https://github.com/mento-protocol/discord-on-call-announcer.git
   cd discord-on-call-announcer
   ```

2. Install dependencies:

   ```sh
   pnpm install
   ```

3. Configure environment variables:

   - Create a `.env` file in the root directory via `cp .env.example .env`
   - Add the necessary environment variables for VictorOps and Discord services.

4. Build the project:

   ```sh
   pnpm run build
   ```

## Running the function locally

```sh
# Dev mode with hot-reloading via nodemon
pnpm dev
```

Now trigger the function by sending a request to it:

```sh
pnpm test
```

## Deployment

### First time deployment

If you are deploying the function for the first time, then please run:

```sh
pnpm deploy
```

This will first create the PubSub topic, then the Cloud Function, and lastly the Cloud Scheduler job that will trigger the function on a weekly basis.

### Deploying Updates

To deploy only the function, run:

```sh
pnpm deploy:function
```

If you want to change the schedule on which the function runs, update the `deploy:scheduler` npm task with the desired cronjob frequency and then run:

```sh
pnpm deploy:scheduler
```

## Testing the function in production

To manually trigger the deployed function in production, run:

```sh
# Will fire a PubSub event that the function will catch and trigger
pnpm test:prod
```

## Managing Team Members

### Adding New Team Members

To add a new team member to the on-call rotation:

1. **Add the mapping in the config file** ([`src/config.ts`](src/config.ts)):

   ```typescript
   victoropsToDiscordUsernames: {
     // VictorOps username -> Discord ID
     'new.member.victorops': '123456789012345678', // Discord display name
     // ... existing mappings
   }
   ```

2. **Get the Discord User ID**:

   - Enable Developer Mode in Discord (User Settings → Advanced → Developer Mode)
   - Right-click on the user's name and select "Copy User ID"

3. **Get the VictorOps username**:

   - Check the [VictorOps dashboard](https://portal.victorops.com/dash/mento-labs-gmbh#/users)

4. **Deploy the changes**:

   ```sh
   pnpm deploy:function
   ```

### Removing Team Members

To remove a team member from the on-call rotation:

1. **Remove the mapping** from [`src/config.ts`](src/config.ts):

   ```typescript
   victoropsToDiscordUsernames: {
     // Remove the line for the team member
     // 'old.member.victorops': '123456789012345678', // Remove this line
     // ... keep other mappings
   }
   ```

2. **Deploy the changes**:

   ```sh
   pnpm deploy:function
   ```

### Important Notes

- **VictorOps Configuration**: Make sure the team member is properly configured in VictorOps with the correct username that matches the mapping
- **Discord Bot Setup**: Ensure you've completed the [Discord Bot Setup](#discord-bot-setup) section, especially the role hierarchy configuration
- **Bot Permissions**: The bot needs the "Manage Roles" permission and must be positioned above the @SupportEngineer role in the server hierarchy
- **Troubleshooting**: For common Discord bot issues, see the [troubleshooting guide](DISCORD_BOT_SETUP.md#troubleshooting)
- **Testing**: After adding/removing members, test the function to ensure it works correctly:

  ```sh
  pnpm test:prod
  ```

## Checking the logs

To view the last logs in your local terminal, run:

```sh
pnpm run logs
```

To get a URL to the full logs in the Google Cloud Console, run:

```sh
pnpm run logs:url
```
