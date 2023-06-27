import { APIEmbed, ButtonInteraction, ChannelType, Colors } from "discord.js";

export const customId = "close-ticket";

export async function execute(
  interaction: ButtonInteraction<"cached">
): Promise<void> {
  if (
    !interaction.memberPermissions.has("ManageThreads") &&
    !interaction.channel?.name.includes(interaction.user.id)
  ) {
    return void interaction.reply({
      content: "You do not have the permissions to do that!",
      ephemeral: true,
    });
  }
  await interaction.channel?.edit({ archived: true, locked: true }).catch(() =>
    interaction.reply({
      content:
        "An error occurred! Please contact @mrmythical if you need help.",
      ephemeral: true,
    })
  );
  const channel = interaction.client.channels.cache.get(
    process.env.LOG_CHANNEL!
  );
  if (!channel || channel.type !== ChannelType.GuildText) return;
  const embeds: APIEmbed[] = [
    {
      color: Colors.Red,
      title: `Ticket closed by ${
        interaction.user.discriminator !== "0"
          ? interaction.user.tag
          : `@${interaction.user.username} (${interaction.user.id})`
      }`,
      description: `${interaction.channel} (${interaction.channelId} - ${
        interaction.channel!.url
      })`,
    },
  ];
  channel.send({
    embeds,
  });
}
