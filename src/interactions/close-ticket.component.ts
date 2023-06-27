import { ButtonInteraction } from "discord.js";

export const customId = "close-ticket";

export async function execute(
  interaction: ButtonInteraction<"cached">
): Promise<void> {
  if (
    !interaction.memberPermissions.has("ManageThreads") &&
    !interaction.channel?.name.includes(interaction.user.id)
  ) {
    return void interaction.reply(
      "You do not have the permissions to do that!"
    );
  }
  await interaction.channel?.edit({ archived: true, locked: true }).catch(() =>
    interaction.reply({
      content:
        "An error occurred! Please contact @mrmythical if you need help.",
      ephemeral: true,
    })
  );
}
