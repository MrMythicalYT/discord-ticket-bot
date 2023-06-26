import {
  Client,
  GatewayIntentBits,
  Events,
  Colors,
  codeBlock,
  MessageComponentInteraction,
  InteractionType,
} from "discord.js";
import { inspect } from "util";
import "dotenv/config";
import { performance } from "perf_hooks";
import { readdirSync } from "fs";
import { createServer } from "http";

interface ComponentFile {
  readonly customId: string;
  execute: (interaction: MessageComponentInteraction) => Promise<void>;
}
interface EventFile {
  readonly event: string;
  execute: (...args: any[]) => Promise<void>;
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("ready", (client) => {
  console.log(`Logged in as ${client.user.username}`);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.id !== "731540559189245963") return;
  if (message.content.startsWith("-eval ")) {
    const code = message.content.slice(6).split(/ +/g).join(" ");
    const start = performance.now();
    try {
      const res = eval(code);
      const end = performance.now();
      let text = inspect(res, false, 3, true);
      if (text.length > 1024) text = Object.prototype.toString.call(res);
      message.reply({
        embeds: [
          {
            title: "Eval Success",
            color: Colors.Green,
            fields: [
              {
                name: "Time Taken",
                value: `${(end - start).toFixed(2)}ms`,
              },
              {
                name: "Result",
                value: codeBlock("ansi", text),
              },
            ],
          },
        ],
      });
    } catch (err) {
      const end = performance.now();
      message.reply({
        embeds: [
          {
            title: "Eval Failed",
            color: Colors.Red,
            fields: [
              {
                name: "Time Taken",
                value: `${(end - start).toFixed(2)}ms`,
              },
              {
                name: "Error",
                value: codeBlock((err ?? new Error("Empty Error")).toString()),
              },
            ],
          },
        ],
      });
    }
  }
});

const interactionFiles = readdirSync("./dist/interactions").filter((file) =>
  file.endsWith(".js")
);
const componentFiles = interactionFiles.filter((file) =>
  file.endsWith(".component.js")
);
const eventFiles = readdirSync("./dist/events").filter((file) =>
  file.endsWith(".js")
);

const components: ComponentFile[] = [];
(async () => {
  for (const component of componentFiles) {
    const file: ComponentFile = await import(`./interactions/${component}`);
    components.push(file);
  }
  for (const event of eventFiles) {
    const data: EventFile = await import(`./events/${event}`);
    console.log("REGISTERING EVENT: ", event);
    client.on(data.event, data.execute);
  }
})();

client.on(Events.InteractionCreate, (interaction) => {
  if (interaction.type === InteractionType.MessageComponent) {
    components
      .find((component) => component.customId === interaction.customId)
      ?.execute(interaction);
  }
});

// For uptime
const server = createServer();
server.on("request", (_, res) => {
  res.writeHead(200, "OK", {
    "Content-Type": "text/plain",
  });
  res.write(`Status: ${client.isReady() ? "Offline" : "Online"}`);
  res.end();
});

client.login();
