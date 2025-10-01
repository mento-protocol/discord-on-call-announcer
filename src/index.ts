import { CloudEvent } from '@google-cloud/functions-framework'
import { Client, GatewayIntentBits, Guild, PermissionsBitField, Role, TextChannel } from 'discord.js'
import { config } from './config'
import { DiscordError, VictorOpsError } from './errors'
import { VictorOpsResponse } from './types'

const discordClient = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
})

export const handleOncallRotation = async (cloudEvent: CloudEvent<unknown>): Promise<void> => {
  try {
    // 1. Fetch current on-call engineer from VictorOps
    const discordUserId = await getCurrentOncallEngineer()

    // 2. Connect to Discord
    await discordClient.login(config.discord.botToken)

    // 3. Get the channel to send the announcement to
    const channel = await getChannel(discordClient)

    // 4. Check if the bot has permission to send messages to this channel
    await checkBotPermissions(channel, discordClient)

    // 5. Send announcement message
    await sendAnnouncementMessage(channel, discordUserId)

    // 6. Get the guild
    const guild = getGuild(channel)

    // 7. Get the support role
    const supportRole = await getSupportRole(guild)

    // 8. Remove support role from all current engineers
    await removeRoleFromCurrentMembers(guild, supportRole)

    // 9. Add role to new on-call engineer
    await assignRoleToMember(guild, supportRole, discordUserId)

    // 10. Log success
    console.log('Successfully handled on-call rotation to ', discordUserId)
  } catch (error) {
    console.error('Error in handleOncallRotation:', error)
    throw error // Re-throw to let Cloud Functions handle the error
  } finally {
    // 11. Cleanup
    discordClient.destroy()
  }
}

async function getCurrentOncallEngineer(): Promise<string> {
  const response = await fetch('https://api.victorops.com/api-public/v1/oncall/current', {
    headers: {
      'X-VO-Api-Id': config.victorops.apiId,
      'X-VO-Api-Key': config.victorops.apiKey,
    },
  })

  if (!response.ok) {
    throw new VictorOpsError(`API error: ${response.statusText}`, response.status)
  }

  const data = (await response.json()) as VictorOpsResponse

  // Add null checks
  const team = data.teamsOnCall[0]
  if (!team) throw new VictorOpsError('No on-call team found')

  const oncall = team.oncallNow[0]
  if (!oncall) throw new VictorOpsError('No on-call schedule found')

  const user = oncall.users[0]?.onCalluser
  if (!user) throw new VictorOpsError('No on-call user found')

  const discordUserId = config.victoropsToDiscordUsernames[user.username]
  if (!discordUserId) {
    throw new VictorOpsError(`No Discord mapping for VictorOps user: ${user.username}`)
  }

  return discordUserId
}

async function getChannel(discordClient: Client): Promise<TextChannel> {
  const channel = await discordClient.channels.fetch(config.discord.channelId)
  if (!channel?.isTextBased()) {
    throw new DiscordError(`Invalid channel: ${config.discord.channelId}`)
  }
  return channel as TextChannel
}

async function checkBotPermissions(channel: TextChannel, discordClient: Client): Promise<void> {
  if (!discordClient.user) {
    throw new Error('Discord client user is null')
  }

  const permissions = channel.permissionsFor(discordClient.user)
  if (!permissions?.has(PermissionsBitField.Flags.SendMessages)) {
    throw new DiscordError(`Bot lacks SendMessages permission in channel ${channel.id}`)
  }
}

async function sendAnnouncementMessage(channel: TextChannel, discordUserId: string): Promise<void> {
  // Get the member to access their display name
  const member = await channel.guild.members.fetch(discordUserId)
  if (!member) {
    throw new DiscordError(`Could not find Discord member with ID ${discordUserId}`)
  }

  const message = `🔄 **New Support Engineer: <@${discordUserId}> is on duty for this week!**
  Please monitor all alert channels and work through as many [support issues](https://linear.app/mento-labs/team/SUP/all?layout=board&ordering=priority&grouping=workflowState&subGrouping=none&showCompletedIssues=all&showSubIssues=true&showTriageIssues=false) as you can.`

  const sanitizedMessage = message.replace(/(?<!\]\()https?:\/\/[^\s)]+/g, '<$&>')
  await channel.send({
    content: sanitizedMessage,
    allowedMentions: { parse: ['users'] },
  })
}

function getGuild(channel: TextChannel): Guild {
  const guild = channel.guild
  if (!guild) {
    throw new Error(`Invalid guild: ${config.discord.channelId}`)
  }
  return guild
}

async function getSupportRole(guild: Guild): Promise<Role> {
  const supportRole = await guild.roles.fetch(config.discord.supportRoleId)
  if (!supportRole) {
    throw new Error('Support role not found')
  }
  return supportRole
}

async function removeRoleFromCurrentMembers(guild: Guild, role: Role): Promise<void> {
  // The members collection in the role isn't automatically populated - we need to fetch the guild members first.
  // This is because Discord.js requires explicit member fetching for performance reasons.
  await guild.members.fetch()
  const membersWithRole = role.members
  await Promise.all(membersWithRole.map((member) => member.roles.remove(role)))
}

async function assignRoleToMember(guild: Guild, role: Role, memberId: string): Promise<void> {
  const member = await guild.members.fetch(memberId)
  if (!member) {
    throw new Error(`Could not find Discord user with ID ${memberId}`)
  }
  await member.roles.add(role)
}
