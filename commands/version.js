module.exports = {
	name: "version",
	description: "checks version",
	execute(message, args, Discord) {
		const newEmbed = new Discord.MessageEmbed()
		.addFields(
			{name: "Version", value: "0.25", inline: true},
			{name: "Last updated", value: "Jan 16th, 2021", inline: true}
		)

		message.channel.send(newEmbed);
	},
};
