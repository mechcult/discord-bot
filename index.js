require('dotenv').config()
var dateFormat = require('dateformat');
const Discord = require("discord.js")
const client = new Discord.Client();
const config = {
    token: process.env.TOKEN,
    channel: process.env.CHANNEL,
    role: process.env.ROLE,
    emoji: process.env.EMOJI,
    count: parseInt(process.env.COUNT)
};
var d = new Date();
const time = (d) => dateFormat(d, "yyyy.mm.dd, hh:MM:ss TT")


client.login(config.token);

client.on('ready', async () => {
    console.log(time(d) + `\tLogged in as ${client.user.tag}`);

    const channel = await client.channels.fetch(config.channel);
    const messages = await channel.messages.fetch();

    messages.forEach(async (message) => {
        message.reactions.cache.forEach(async reaction => {
            if (reaction.emoji.name !== config.emoji) { return; }
            else {
                const users = await reaction.users.fetch();
                users.forEach(async (user) => {
                    let member = await reaction.message.guild.members.fetch(user.id)
                    if ((user.id === client.user.id) ||
                        (member.roles.cache.has(config.role))) { return; }
                    reaction.users.remove(user);
                    console.log(time(d) + `\tUser ${user.tag} has no required role`)
                });
                if (reaction.count >= config.count + 1) {
                    console.log(time(d) + `\tUser ${reaction.message.author.tag} was promoted`)
                    reaction.message.member.roles.add(config.role)
                }
            }
        });
    });

})

client.on('message', message => {
    if (message.channel.id !== config.channel) { return; }
    else {
        message.react(config.emoji)
        console.log(time(d) + '\tGot message in channel and reacted')
    }
})

client.on("messageReactionAdd", async (react, user) => {
    let member = react.message.guild.members.fetch(user.id)


    if ((react.message.channel.id !== config.channel) ||
        (react.emoji.name !== config.emoji) ||
        (user.id === client.user.id)) {
        return;
    } else { console.log(time(d) + `\tGot vote from ${user.tag}`); }

    if (await member.then(m => m.roles.cache.has(config.role))) {
        console.log(time(d) + `\tUser has required role and reacted`)
        if (react.count >= config.count + 1) {
            console.log(time(d) + `\tUser ${react.message.author.tag} was promoted`)
            react.message.member.roles.add(config.role)
        }
        return;
    } else {
        console.log(time(d) + `\tUser ${user.tag} has no required role`)
        react.users.remove(user);
    }
})