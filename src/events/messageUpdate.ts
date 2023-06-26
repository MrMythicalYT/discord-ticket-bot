import {
  APIEmbed,
  AttachmentBuilder,
  ChannelType,
  Colors,
  Events,
  Message,
} from "discord.js";

export const event = Events.MessageUpdate;

export async function execute(
  oldMessage: Message,
  newMessage: Message
): Promise<void> {
  if (
    oldMessage.author.bot ||
    (!oldMessage.content &&
      !oldMessage.embeds &&
      !oldMessage.attachments &&
      !oldMessage.stickers)
  )
    return;
  if (oldMessage.content === newMessage.content) return;
  const channel = oldMessage.client.channels.cache.get(
    process.env.LOG_CHANNEL!
  );
  if (!channel || channel.type !== ChannelType.GuildText) return;
  const embeds: APIEmbed[] = [
    {
      color: Colors.Blue,
      title: `Updated message by ${
        oldMessage.author.discriminator !== "0"
          ? oldMessage.author.tag
          : `@${oldMessage.author.username} (${oldMessage.author.id})`
      }`,
    },
  ];
  const files = [
    new AttachmentBuilder(Buffer.from(oldMessage.content), {
      name: "oldMessage.txt",
    }),
    new AttachmentBuilder(Buffer.from(newMessage.content), {
      name: "newMessage.txt",
    }),
  ];
  channel.send({
    embeds,
    files,
    content: `Context: ${oldMessage.url}`,
  });
}
