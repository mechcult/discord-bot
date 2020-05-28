const Discord = require("discord.js")
const client = new Discord.Client();
const config = require("./config.json")

client.login(config.token);

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
})

client.on('message', message => {
    if (message.channel.id !== config.channel) { return; }
    message.react(config.emoji)
})

client.on("raw", async event => {
    // Reaction set and reaction set inside guild
    if (event.t !== "MESSAGE_REACTION_ADD" ||
        !event.d.guild_id) { return; }
    // reaction wasn't set by this bot, was set inside required channel and with correct emoji
    if (event.d.member.user.id === client.user.id ||
        event.d.channel_id !== config.channel ||
        event.d.emoji.name !== config.emoji) { return; }

    let ch = await client.channels.fetch(config.channel)
    let m = await ch.messages.fetch(event.d.message_id);
    let react = new Discord.MessageReaction(client, event.d, m);
    // remove reaction of user without required role
    if (!event.d.member.roles.includes(config.role)) {
        return await react.users.remove(event.d.member.user.id)
    } else {
        let r = m.reactions.cache.find(r => r.emoji.name === config.emoji)
        if (r.count >= config.count + 1) { m.member.roles.add(config.role) }
    }
})

/*client.on("messageReactionAdd", async (react, user) => {
    let member = react.message.guild.members.fetch(user.id)


    if ((react.message.channel.id !== config.channel) ||
        (react.emoji.name !== config.emoji) ||
        (user.id === client.user.id)) {
        return;
    } else { console.log(`Got vote from ${user.tag}`); }

    if (await member.then(m => m.roles.cache.has(config.role))) {
        console.log(`User has required role and reacted`)
        if (react.count >= config.count + 1) {
            console.log(`User ${react.message.author.tag} was promoted`)
            react.message.member.roles.add(config.role)
        }
        return;
    } else {
        console.log(`User ${user.tag} has no required role`)
        react.users.remove(user);
    }
})*/