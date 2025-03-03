const fetch = require("node-fetch");

const { prefix, token, roles, MongoDB, serverId, colors } = require('../../config.json');

const URL = "https://api.apify.com/v2/key-value-stores/tVaYRsPHLjNdNBu7S/records/LATEST?disableRedirect=true";

function fetchStats() {
	return fetch(URL).then((res) => res.json());
}

function countryList(data) {
	return data.map(obj => obj.country);
}

function countryStats(country, data) {
	return data.filter(stats => stats.country === country)[0];
}

let blocked = false;

module.exports = {
	name: "covid-stats",
	guildOnly: false,
	description: "Display basic COVID stats of a country",
	category: "COVID",
    
	execute({ message, args, Discord, roles }) {
		// To prevent user spamming the same command
		if (blocked) {
			message.channel.send(
				"Please stop spamming the command."
			);
			return;
		}
		blocked = true;
		fetchStats()
			.then((data) => {
				if (!data) {
					message.channel.send(
						"Please wait a few seconds and try again."
					);
					return;
				}
				return new Promise(function (resolve, reject) {
					// display a list of countries available
					if (args[0] === "list") {
						message.channel.send(countryList(data));
						resolve();
						return;
					}
					// display covid stats for one country
					const filterTerm = args.join(' ');
					const stats = countryStats(filterTerm, data);

					if (!stats) {
						const noargembed = new Discord.MessageEmbed()
						.setTitle(":octagonal_sign:  No Argument Given  :octagonal_sign:")
						.setColor(colors.heptagram)
						//const { prefix, token, roles, MongoDB, serverId, colors } = require('../../config.json');
						.setDescription(`Oh no! You didn’t specify a country. Type \`${prefix}covid-stats list\` for the list of available countries`)
					message.channel.send(noargembed);
						resolve();
						return;
					}

					const { infected, tested, recovered, deceased, country } = stats;
					let info = `
						Covid Stats for ${country}\n
						Infected: ${infected}\n
						Tested: ${tested}\n
						Recovered: ${recovered}\n
						Deceased: ${deceased}\n
					`;
				message.channel.send(info);
					resolve();
				})
			})
			.then(() => {
				blocked = false;
			})
			.catch((err) => console.warn(err));
	},
};
