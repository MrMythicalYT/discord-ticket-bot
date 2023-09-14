import {
  APIEmbed,
  Attachment,
  AttachmentBuilder,
  ChannelType,
  Colors,
  Events,
  Message,
  escapeMarkdown,
} from "discord.js";

export const event = Events.MessageDelete;

export async function execute(message: Message): Promise<void> {
  if (
    message.author.bot ||
    (!message.content &&
      !message.embeds &&
      !message.attachments &&
      !message.stickers) || message.channel.id == '1148057687565811795'
  )
    return;
  const channel = message.client.channels.cache.get(process.env.LOG_CHANNEL!);
  if (!channel || channel.type !== ChannelType.GuildText) return;
  const content = escapeMarkdown(message.content) || "**No content.**";
  const embeds: APIEmbed[] = [
    {
      color: Colors.Red,
      title: `Deleted message by ${
        message.author.discriminator !== "0"
          ? message.author.tag
          : `@${message.author.username} (${message.author.id})`
      }`,
      description: content,
    },
  ];
  const files: (Attachment | AttachmentBuilder)[] = [
    ...message.attachments.values(),
  ];
  if (message.embeds.length) {
    let count = 1;
    for (const embed of message.embeds) {
      files.push(
        new AttachmentBuilder(Buffer.from(JSON.stringify(embed)), {
          name: `updated_embed_${count++}.json`,
        })
      );
    }
  }
  channel.send({
    embeds,
    files,
    content: `Context: ${message.url}`,
  });
}
