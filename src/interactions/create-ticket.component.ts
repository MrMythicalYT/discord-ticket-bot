import {
  APIEmbed,
  ButtonInteraction,
  ButtonStyle,
  ChannelType,
  Colors,
  ComponentType,
  roleMention,
} from "discord.js";

export const customId = "create-ticket";

export async function execute(
  interaction: ButtonInteraction<"cached">
): Promise<void> {
  if (interaction.channel?.type !== ChannelType.GuildText) return;
  const currentChannels = await interaction.channel.threads.fetchActive();
  if (
    currentChannels.threads.find((thread) =>
      thread.name.includes(interaction.user.id)
    )
  ) {
    return void interaction.reply({
      content:
        "You already have an open thread! You must close it before opening another thread.",
      ephemeral: true,
    });
  }
  const thread = await interaction.channel.threads.create({
    name: `Support for ${
      interaction.user.discriminator !== "0"
        ? interaction.user.tag
        : `@${interaction.user.username} (${interaction.user.id})`
    }`,
    type: ChannelType.PrivateThread,
    invitable: false,
  });
  await thread.send({
    embeds: [
      {
        color: Colors.DarkBlue,
        title: `Support for ${
          interaction.user.discriminator !== "0"
            ? interaction.user.tag
            : `@${interaction.user.username}`
        }`,
        description: "Please click the 🔒 button to close your thread.",
      },
    ],
    components: [
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            emoji: "🔒",
            style: ButtonStyle.Danger,
            customId: "close-ticket",
          },
        ],
      },
    ],
  });
  await thread.members.add(interaction.user.id, "Creator of ticket");
  await thread.send(`${"<modping>"} will soon be in contact with you.`);
  await interaction.reply({
    content: `Your ticket has been created! ${thread}`,
    ephemeral: true,
  });
  const channel = interaction.client.channels.cache.get(
    process.env.LOG_CHANNEL!
  );
  if (!channel || channel.type !== ChannelType.GuildText) return;
  const embeds: APIEmbed[] = [
    {
      color: Colors.Red,
      title: `Ticket created by ${
        interaction.user.discriminator !== "0"
          ? interaction.user.tag
          : `@${interaction.user.username} (${interaction.user.id})`
      }`,
      description: `${thread} (${thread.id})`,
    },
  ];
  channel.send({
    embeds,
  });
}
