import { HttpFunction, Request, Response } from '@google-cloud/functions-framework';
import axios from 'axios';
import { Client, GatewayIntentBits, PermissionsBitField, TextChannel } from 'discord.js';
import { config } from "./config";


interface VictorOpsResponse {
  teamsOnCall: Array<{
      "team": {
        "name": string
        "slug": string
      },
      "oncallNow": Array<{
          "escalationPolicy": {
            "name": string
            "slug": string
          },
          "users": Array<
            {
              "onCalluser": {
                "username": string
              }
            }
          >
        }
      >
    }
  >
}

const discordClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ]
});


export const handleOncallRotation: HttpFunction = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Fetch current on-call engineer from VictorOps
    const victorOpsResponse = await axios.get<VictorOpsResponse>(
      'https://api.victorops.com/api-public/v1/oncall/current',
      {
        headers: {
          'X-VO-Api-Id': config.victorops.apiId,
          'X-VO-Api-Key': config.victorops.apiKey
        }
      }
    );

    const newOncallEngineer = victorOpsResponse.data.teamsOnCall[0].oncallNow[0].users[0].onCalluser.username;
    const discordUserId = config.victoropsToDiscordUsernames[newOncallEngineer];
    if (!discordUserId) {
      throw new Error(`No Discord ID mapping found for VictorOps user: ${newOncallEngineer}`);
    }

    // 2. Connect to Discord
    await discordClient.login(config.discord.botToken);
if (!discordClient.user) {
  throw new Error("Discord client user is null");
}

const user = discordClient.user;


    // 3. Get the channel
    const channel = await discordClient.channels.fetch(config.discord.channelId);

    if (!channel?.isTextBased()) {
      throw new Error(`Invalid channel: ${config.discord.channelId}`);
    }

    const textChannel = channel as TextChannel;

        // 4. Check if the bot has permission to send messages in this channel

        const permissions = textChannel.permissionsFor(user);
        if (!permissions?.has(PermissionsBitField.Flags.SendMessages)) {
          console.error(
            `Bot doesn't have permission to send messages in channel ${config.discord.channelId}`,
          );
          return;
        }

    // 5. Send announcement message
        const message = `🔄 On-call rotation update: ${newOncallEngineer} is now on support duty!`
        const sanitizedMessage = message.replace(/(https?:\/\/[^\s]+)/g, "<$1>");
        await textChannel.send({
          content: sanitizedMessage,
          allowedMentions: { parse: ["users"] },
        });
        console.log("Message sent successfully");


    // 6. Update Discord role
    const guild = textChannel.guild;
    if (!guild) { throw new Error(`Invalid guild: ${config.discord.channelId}`); }
    const supportRole = await guild.roles.fetch(config.discord.supportRoleId);
    if (!supportRole) {
      throw new Error('Support role not found');
    }

    // 7. Remove role from all members
    const membersWithRole = supportRole.members;
    await Promise.all(
      membersWithRole.map(member => member.roles.remove(supportRole))
    );

    // 8. Add role to new on-call engineer
    const newOncallMember = await guild.members.fetch(discordUserId);
    if (!newOncallMember) {
      throw new Error(`Could not find Discord user with ID ${discordUserId}`);
    }

    await newOncallMember.roles.add(supportRole);

    // 9. Cleanup
    discordClient.destroy();

  } catch (error) {
    console.error('Error in handleOncallRotation:', error);
    throw error;
  }
}; 