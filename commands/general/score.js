const bbgmDiscord = require("../../assets/json/bbgm");
const stringSimilarity = require("string-similarity");
const { rnd } = require("../../util/Utils.js");
const fs = require("fs");

const lotteryCooldown = new Set();
const raidCooldown = new Set();

module.exports = {
	name: "score",
	aliases: ["leaderboard", "manage", "buyin", "lottery", "raid", "give"],
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
					"0.05 PTs per char typed outside #bot-spam\nResets on Feb 28th\nBet points with `m-flip <coin> #/all`\nTry to win points with `m-lottery`"
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
							? "\nCheck your score with `m-score` in #bot-spam\nBet points in #bot-spam with `m-flip <coin> #/all`\nTry to win points with `m-lottery`"
							: "\nBet points with `m-flip <coin> #/all`\nTry to win points with `m-lottery`"
					}`
				);

			message.channel.send(embed);
		}

		if (cmd === "buyin" && message.channel.name === "bot-spam") {
			const user = message.author.username;
			if (bbgm[user] >= 5) {
				return message.reply("You already have enough points.");
			}

			bbgm[user] = 5;
			message.reply("Your points have been set back to 5");

			fs.writeFile(
				"../MugiBot/assets/json/bbgm.json",
				JSON.stringify(bbgmDiscord),
				(error) => {
					if (error) console.log(error);
				}
			);
		}

		if (cmd === "lottery" && message.channel.name === "bot-spam") {
			const user = message.author.username;

			if (lotteryCooldown.has(message.author.id)) {
				message.reply(
					"Wait a minute before trying to play the lottery"
				);
				return;
			}

			if (bbgm[user] < 5) {
				return message.reply(
					"You need 5 points to play the lottery, use `m-buyin` to get 5 points"
				);
			}

			if (Math.random() <= bbgmDiscord["chance"]) {
				bbgm[user] += +bbgmDiscord["lottery"];
				message.reply(
					`**WINNER**: **${
						bbgmDiscord["lottery"]
					}** points have been awarded! New score: **${rnd(
						bbgm[user]
					)}**`
				);
				message.channel.send(
					"Lottery pool has been reset to 300 - 1% chance to win"
				);
				bbgmDiscord["lottery"] = 300;
				bbgmDiscord["chance"] = 0.01;
			} else {
				bbgm[user] -= 5;
				bbgmDiscord["lottery"] += 25;
				bbgmDiscord["chance"] += 0.001;
				message.reply(
					"you didn't win! You lose **5** points. Try again in a minute."
				);
				message.channel.send(
					`Lottery pool is now: **${bbgmDiscord["lottery"]}** - ${rnd(
						bbgmDiscord["chance"] * 100
					)}% chance to win`
				);
			}

			lotteryCooldown.add(message.author.id);
			setTimeout(() => {
				lotteryCooldown.delete(message.author.id);
			}, 60000);

			fs.writeFile(
				"../MugiBot/assets/json/bbgm.json",
				JSON.stringify(bbgmDiscord),
				(error) => {
					if (error) console.log(error);
				}
			);
		}

		if (cmd === "raid" && message.channel.name === "bot-spam") {
			if (raidCooldown.has(message.author.id)) {
				message.reply(
					"wait 30 minutes before trying to raid someone again"
				);
				return;
			}
			if (!args.length) return message.reply("you need to raid someone.");
			const join = args.join(" ");
			const keys = Object.keys(bbgm);
			const search = stringSimilarity.findBestMatch(join, keys);
			const user = search.bestMatch["target"];
			const raider = message.author.username;

			if (raider === user)
				return message.reply("you can't raid yourself");
			if (bbgm[raider] < 50)
				return message.reply("you need 50 points to raid");
			if (bbgm[user] < 1)
				return message.reply("that user doesn't have enough points");

			// stolen is the raided user, lost is raider
			const stolenPoints = bbgm[user] * 0.1;
			const lostPoints = bbgm[raider] * 0.25;

			if (Math.random() > 0.749) {
				bbgm[raider] += +stolenPoints;
				bbgm[user] -= stolenPoints;
				message.reply(
					`success! You stole 10% (**${rnd(
						stolenPoints
					)}**) from ${user}. New total: **${rnd(bbgm[raider])}**`
				);
			} else {
				bbgm[raider] -= lostPoints;
				bbgm[user] += +lostPoints;
				message.reply(
					`failed! You lost 25% (**${rnd(
						lostPoints
					)}**) of your points to ${user}. New total: **${rnd(
						bbgm[raider]
					)}**`
				);
			}

			raidCooldown.add(message.author.id);
			setTimeout(() => {
				raidCooldown.delete(message.author.id);
			}, 1800000);

			fs.writeFile(
				"../MugiBot/assets/json/bbgm.json",
				JSON.stringify(bbgmDiscord),
				(error) => {
					if (error) console.log(error);
				}
			);
		}

		/* if (cmd === "give") {
			if (!args.length)
				return message.reply(
					"You need to give points. `m-give doobie mugi 500`"
				);

			const join = args.join(" ");
			const keys = Object.keys(bbgm);
			const search = stringSimilarity.findBestMatch(join, keys);
			const user = search.bestMatch["target"];
			const sender = message.author.username;
			const num = args[args.length - 1];

			if (sender === user)
				return message.reply("you can't give yourself");
			if (isNaN(num)) return message.reply("send a valid number.");
			if (num < 20)
				return message.reply("you can't send less than 20 points");
			if (num > bbgm[sender])
				return message.reply("you can't give more points than you own");

			if (bbgm[user] >= 0) {
				bbgm[user] += +num;
			} else {
				bbgm[user] -= num;
			}
			bbgm[sender] -= num;

			message.channel.send(
				`You've given **${rnd(
					num
				)}** points to ${user}, they now have **${rnd(
					bbgm[user]
				)}** points.`
			);

			fs.writeFile(
				"../MugiBot/assets/json/bbgm.json",
				JSON.stringify(bbgmDiscord),
				(error) => {
					if (error) console.log(error);
				}
			);
		} */

		if (cmd === "manage" && message.author.id === "188530356394131456") {
			if (!args.length) return;

			const join = args.join(" ");
			const query = join.slice(args[0].length + 1, Infinity);

			const num = args[args.length - 1];
			if (isNaN(num)) return;

			const keys = Object.keys(bbgm);
			const search = stringSimilarity.findBestMatch(query, keys);
			const user = search.bestMatch["target"];

			if (args[0] === "set") {
				bbgm[user] = +num;
				message.channel.send(
					`${user}'s points have been set to **${rnd(bbgm[user])}**`
				);
			}

			if (args[0] === "take") {
				bbgm[user] -= num;
				message.channel.send(
					`${user}'s points have been decreased to **${rnd(
						bbgm[user]
					)}**`
				);
			}

			if (args[0] === "give") {
				bbgm[user] += +num;
				message.channel.send(
					`${user}'s points have been increased to **${rnd(
						bbgm[user]
					)}**`
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
