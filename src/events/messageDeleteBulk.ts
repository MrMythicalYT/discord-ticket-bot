import {
  APIEmbed,
  AttachmentBuilder,
  ChannelType,
  Collection,
  Colors,
  Events,
  Message,
  Snowflake,
} from "discord.js";

export const event = Events.MessageBulkDelete;
export function execute(messages: Collection<Snowflake, Message>) {
  if (!messages.first()) return;
  const infoMessages: string[] = [];
  for (const message of messages.values()) {
    if (message.content)
      infoMessages.push(
        `${message.author.username} (${message.author.id}) - ${message.content}`
      );
  }
  const channel = messages
    .first()
    ?.client.channels.cache.get(process.env.LOG_CHANNEL!);
  if (!channel || channel.type !== ChannelType.GuildText) return;
  const files = [
    new AttachmentBuilder(Buffer.from(infoMessages.join("\n")), {
      name: "deleted_messages.txt",
    }),
  ];
  const embeds: APIEmbed[] = [
    {
      color: Colors.Red,
      title: `Message bulk delete in ${messages.first()!.channel}`,
      description: `Deleted messages may be shown above`,
    },
  ];
  channel.send({
    embeds,
    files,
  });
}
