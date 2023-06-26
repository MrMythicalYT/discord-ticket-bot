import { ButtonInteraction } from "discord.js";

export const customId = "close-ticket";

export async function execute(
  interaction: ButtonInteraction<"cached">
): Promise<void> {
  await interaction.channel?.edit({ archived: true, locked: true }).catch(() =>
    interaction.reply({
      content:
        "An error occurred! Please contact @mrmythical if you need help.",
      ephemeral: true,
    })
  );
}
