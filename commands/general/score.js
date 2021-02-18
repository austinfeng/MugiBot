const bbgmDiscord = require("../../assets/json/bbgm");
const stringSimilarity = require("string-similarity");
const { rnd } = require("../../util/Utils.js");
const fs = require("fs");

module.exports = {
	name: "score",
	aliases: ["leaderboard", "manage"],
	cooldown: 20,
	execute(client, message, args, Discord, cmd) {
		const bbgm = bbgmDiscord["bbgmDiscord"];

		if (cmd === "score") {
			if (
				message.channel.name != "bot-spam" &&
				message.author.id != "188530356394131456"
			)
				return;

			// sorts an unsorted JSON descending from top score to least
			const sortable = Object.fromEntries(
				Object.entries(bbgm).sort(([, a], [, b]) => b - a)
			);

			// Save keys into a variable
			const keys = Object.keys(sortable);

			let user = message.author.username;

			if (args.length) user = args.join(" ");

			const search = stringSimilarity.findBestMatch(user, keys);

			const embed = new Discord.MessageEmbed()
				.setColor("RANDOM")
				.setTitle(search.bestMatch["target"])
				.setDescription(
					`Score: ${rnd(
						bbgm[search.bestMatch["target"]],
						2
					)}\nRank: ${search.bestMatchIndex + 1} / ${keys.length}`
				)
				.setFooter(
					"0.05 PTs per char typed outside #bot-spam\nResets on Feb 28th\nBet points with `m-flip <coin> #/all`"
				);

			message.channel.send(embed);
		}

		if (cmd === "leaderboard") {
			const best = Object.fromEntries(
				Object.entries(bbgm).sort(([, a], [, b]) => b - a)
			);

			const worst = Object.fromEntries(
				Object.entries(bbgm).sort(([, a], [, b]) => a - b)
			);

			const bestNames = Object.keys(best);
			const bestScores = Object.values(best);

			const worstNames = Object.keys(worst);
			const worstScores = Object.values(worst);

			const botSpam = message.channel.name;

			const embed = new Discord.MessageEmbed()
				.setColor("RANDOM")
				.setTitle("Users in BBGM")
				.addFields(
					{
						name: "Best Scores",
						value: `${bestNames[0]}: ${rnd(bestScores[0], 2)}\n${
							bestNames[1]
						}: ${rnd(bestScores[1])}\n${bestNames[2]}: ${rnd(
							bestScores[2],
							2
						)}\n${bestNames[3]}: ${rnd(bestScores[3], 2)}\n${
							bestNames[4]
						}: ${rnd(bestScores[4], 2)}\n`,
						inline: true,
					},
					{
						name: "Worst Scores",
						value: `${worstNames[0]}: ${rnd(worstScores[0], 2)}\n${
							worstNames[1]
						}: ${rnd(worstScores[1], 2)}\n${worstNames[2]}: ${rnd(
							worstScores[2],
							2
						)}\n${worstNames[3]}: ${rnd(worstScores[3], 2)}\n${
							worstNames[4]
						}: ${rnd(worstScores[4], 2)}\n`,
						inline: true,
					}
				)
				.setFooter(
					`Resets on Feb 28th${
						botSpam != "bot-spam"
							? "\nCheck your score with `m-score` in #bot-spam\nBet points in #bot-spam with `m-flip <coin> #/all`"
							: "\nBet points with `m-flip <coin> #/all`"
					}`
				);

			message.channel.send(embed);
		}

		if (cmd === "manage" && message.author.id === "188530356394131456") {
			if (!args.length) return;

			const join = args.join(" ");
			const query = join.slice(args[0].length + 1, Infinity);

			let num = args[args.length - 1];
			if (isNaN(num)) return;

			const keys = Object.keys(bbgm);
			const search = stringSimilarity.findBestMatch(query, keys);
			const user = search.bestMatch["target"];

			if (args[0] === "set") {
				bbgm[user] = num;
				message.channel.send(
					`${user}'s points have been set to **${rnd(bbgm[user])}**`
				);
			}

			if (args[0] === "take") {
				bbgm[user] -= num;
				message.channel.send(
					`${user}'s points have been decreased to **${rnd(bbgm[user])}**`
				);
			}

			if (args[0] === "give") {
				bbgm[user] += +num;
				message.channel.send(
					`${user}'s points have been increased to **${rnd(bbgm[user])}**`
				);
			}

			fs.writeFile(
				"../MugiBot/assets/json/bbgm.json",
				JSON.stringify(bbgmDiscord),
				(error) => {
					if (error) console.log(error);
				}
			);
		}
	},
};