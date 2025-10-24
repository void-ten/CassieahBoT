import { GDBrowserAPI } from "@cass-modules/GDBrowserAPI";
import { SpectralCMDHome } from "@cassidy/spectral-home";
import { abbreviateNumber, UNISpectra } from "@cassidy/unispectra";

const gdcmd = defineCommand({
  meta: {
    name: "gd",
    otherNames: ["dash", "geometrydash", "gdbrowser"],
    category: "Utilities",
    description: "Anything related to GDBrowser.",
    version: "1.0.1",
    icon: "🛠️",
  },
  style: {
    title: "🛠️ GDBrowser",
    titleFont: "bold",
    contentFont: "none",
  },
  async entry(ctx) {
    return gdoptions.runInContext(ctx);
  },
});
const gdoptions = new SpectralCMDHome({ isHypen: false }, [
  {
    key: "search",
    description: "Search Top 5 GD Level, same algo as GD.",
    aliases: ["s"],
    args: ["<level_name>"],
    async handler({ output }, { spectralArgs }) {
      const name = spectralArgs.join(" ");
      if (!name) {
        return output.reply(
          `🔎 Please enter a level name or level ID as next arguments. (Same algo as original search bar in GD), Only shows TOP 5 results.`
        );
      }
      await output.reaction("⏳");
      const levels = await GDBrowserAPI.search(name);
      const top5 = levels.slice(0, 5);
      const getLikeEmo = (likes: number) => (likes < 0 ? `👎` : `👍`);
      const mapped = [
        "🔎 **Top 5 Results**",
        ...top5.map(
          (level) =>
            `**${level.name}** (#${level.id})\n${UNISpectra.arrow} By ${
              level.author
            }\n[${level.difficulty?.toUpperCase()}${
              level.featured ? ` ✨ **${level.stars || 1}**` : ""
            }]\n🕒 ${level.length} | 📥 ${abbreviateNumber(
              level.downloads || 0
            )} | ${getLikeEmo(level.likes || 0)} ${abbreviateNumber(
              level.likes || 0
            )}\n🎵 ***${level.songName}***\n${UNISpectra.arrowFromT} ***By ${
              level.songAuthor
            }***`
        ),
      ].join(`\n${UNISpectra.standardLine}\n`);
      await output.reply(mapped.length === 1 ? "No Results." : mapped);
      await output.reaction("✅");
    },
  },
  {
    key: "view",
    description: "View all info about a GD Level using a Level ID",
    aliases: ["v"],
    args: ["<level_ID>"],
    async handler({ output }, { spectralArgs }) {
      try {
        const ID = spectralArgs[0];
        if (!ID) {
          return output.reply(`🔎 Please enter a level ID.`);
        }
        await output.reaction("⏳");
        const level = await GDBrowserAPI.level(ID);
        const getLikeEmo = (likes: number) =>
          likes < 0 ? `👎 **Dislikes**:` : `👍 **Likes**:`;
        const mapped = `**${level.name}** (#${level.id})\n${
          UNISpectra.arrow
        } By ${level.author}\n\n${
          level.description || "(No Description Provided)"
        }\n\n🕒 **Length**: ${
          level.length
        }\n📥 **Downloads**: (${abbreviateNumber(level.downloads || 0)}) ${
          level.downloads || 0
        }\n${getLikeEmo(level.likes || 0)} (${abbreviateNumber(
          level.likes || 0
        )}) ${level.likes || 0}\n✅ **Coins**: ${"🪙".repeat(
          level.coins || 0
        )}\n😸 **Difficulty**: ${level.difficulty?.toUpperCase()} ${
          level.featured ? `✨ **${level.stars || 1}**` : ""
        }\n${UNISpectra.standardLine}\n🎵 **Song**: ***${level.songName}*** (#${
          level.songID
        })\n${UNISpectra.arrowFromT} ***By ${level.songAuthor}***`;

        await output.reply(mapped);
        await output.reaction("✅");
      } catch (error) {
        return output.reply("No Results.");
      }
    },
  },
]);

export default gdcmd;
