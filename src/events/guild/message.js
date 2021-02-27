const fs = require("fs");
const trk = require("../../../assets/json/bbgm");
const colors = require("colors/safe");

const cooldowns = new Set();

// MESSY file, rework needed
module.exports = (Discord, client, message) => {
	const dm = message.channel instanceof Discord.DMChannel;

	// Tracks messages sent by users in a specific server
	if (!dm) {
		const otherBots = ["Dyno", "Poni"];
		if (
			message.guild.id === "290013534023057409" &&
			message.channel.name != "bot-spam" &&
			!otherBots.includes(message.author.username)
		) {
			let player = message.author.username;
			let bbgm = trk["bbgmDiscord"];

			if (!bbgm[player]) bbgm[player] = 0;

			// each character typed is 0.05 points
			let charCount = message.content.length / 20;

			bbgm[player] += Math.min(charCount, 3);

			fs.writeFile(
				"../MugiBot/assets/json/bbgm.json",
				JSON.stringify(trk),
				(error) => {
					if (error) console.log(error);
				}
			);
		}
	}

	const blackList = [];

	const responseBlackList = [
		"773612970767941654",
		"771834997618376719",
		"725151960449417246",
		"731192685293207552",
	];

	if (
		blackList.includes(message.author.id) ||
		message.content.toLowerCase().includes("@everyone") ||
		message.content.toLowerCase().includes("@here") ||
		message.author.bot
	)
		return;

	if (!responseBlackList.includes(message.author.id)) {
		if (message.content.toLowerCase() === "good bot") {
			client.commands.get("gBot").execute(client, message);
			// message.react("😇");
		} else if (message.content.toLowerCase() === "bad bot") {
			client.commands.get("bBot").execute(client, message);
			// } else if (rps.reactObject[message.content.toLowerCase()]) {
			// 	message
			// 		.react(rps.reactObject[message.content.toLowerCase()])
			// 		.catch(console.log(message.guild.name));
			// } else if (message.mentions.has(client.user.id)) {
			// 	message.react("👋").catch(console.log(message.guild.name));
		} else if (
			message.channel.id === "739632130275016704" &&
			Math.random() < 0.03
		) {
			message.react("👎").catch(console.log(message.guild.name));
		}
	}

	if (!responseBlackList.includes(message.author.id)) {
		// this crap is for a specific discord server
		if (
			(message.channel.name === "football-gm-discussion" &&
				message.content.toLowerCase().includes("nfl roster")) ||
			(message.channel.name === "football-gm-discussion" &&
				message.content.toLowerCase().includes("nfl file"))
		) {
			message.channel.send(
				"<https://dl.dropbox.com/s/e31zctcm4bj3fpx/FBGM2020preseason.json?dl=0>"
			);
		}
	}

	const prefix = ";";

	if (!message.content.toLowerCase().startsWith(prefix)) return;

	const args = message.content.slice(prefix.length).split(/ +/);

	const cmd = args.shift().toLowerCase();

	const secs = new Date(message.createdTimestamp);

	const commandLogger = `${secs.getUTCSeconds()} | ${
		message.author.username
	},${message.author.id}, | ${message.channel.id} | ${cmd} ${args}`;

	const command =
		client.commands.get(cmd) ||
		client.commands.find((a) => a.aliases && a.aliases.includes(cmd));

	if (command) {
		try {
			// ignore commands in a specific channel
			if (message.channel.name === "feature-requests") return;
			if (cooldowns.has(message.author.id)) {
				message.author.send(
					"Cooldowns enabled in that server, wait 50 seconds. (#bot-spam excluded)"
				);
				console.log(colors.green(commandLogger));
				return;
			}

			command.execute(client, message, args, Discord, cmd);
			console.log(colors.green(commandLogger));

			if (
				message.author.id === "188530356394131456" ||
				message.guild === null
			)
				return;

			if (
				message.channel.name != "bot-spam" &&
				message.guild.id === "290013534023057409"
			) {
				cooldowns.add(message.author.id);
				setTimeout(() => {
					cooldowns.delete(message.author.id);
				}, 50000);
			}
		} catch (error) {
			console.log("Error: " + colors.green(commandLogger));
			console.error(error);
			message.reply("There was an error trying to execute that command!");
		}
	} else {
		message.reply("That commmand does not exist.");
	}
};
