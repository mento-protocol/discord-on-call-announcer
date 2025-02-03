import { JSONSchemaType, envSchema } from "env-schema";

export interface Env {
  DISCORD_BOT_TOKEN: string;
  DISCORD_CHANNEL_ID: string;
  DISCORD_SUPPORT_ROLE_ID: string;
  VICTOROPS_API_ID: string;
  VICTOROPS_API_KEY: string;
}

const schema: JSONSchemaType<Env> = {
  type: "object",
  required: ["DISCORD_BOT_TOKEN", "DISCORD_CHANNEL_ID", "DISCORD_SUPPORT_ROLE_ID", "VICTOROPS_API_ID", "VICTOROPS_API_KEY"],
  properties: {
    DISCORD_BOT_TOKEN: { type: "string" },
    DISCORD_CHANNEL_ID: { type: "string" },
    DISCORD_SUPPORT_ROLE_ID: { type: "string" },
    VICTOROPS_API_ID: { type: "string" },
    VICTOROPS_API_KEY: { type: "string" },
  },
};

const env = envSchema({
  schema,
  dotenv: true, // load .env if it is there
});

interface Config {
  discord: {
    botToken: string;
    channelId: string;
    supportRoleId: string;
  };
  victoropsToDiscordUsernames: Record<string, string>;
  victorops: {
    apiId: string;
    apiKey: string;
  };
}

export const config: Config = {
  discord: {
    botToken: env.DISCORD_BOT_TOKEN,
    channelId: env.DISCORD_CHANNEL_ID,
    supportRoleId: env.DISCORD_SUPPORT_ROLE_ID,
  },
  victoropsToDiscordUsernames: {
    // VictorOps username -> Discord ID
    baran: "141140845410648064",              // baran
    bayosodimu: "770640121908559894",         // bayo    
    "bogdan.dumitru": "111071282824552448",   // bogdan
    xyznelson: "507724676374593566",          // nelson
    philbow61: "290529861204836352",          // philip I
    chapati: "241484115000426496",            // philip II
    "ryan.noble.mento": "487208939084185601", // ryan
  },
  victorops: {
    apiId: env.VICTOROPS_API_ID,
    apiKey: env.VICTOROPS_API_KEY,
  },
};
