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

client.on("guildMemberAdd", m => {
    let re = /.*(plum).*/gmi
    if (m.user.username.match(re)) {
        ch = await client.channels.fetch(config.pipis)
        ch.send(`User <@${m.user.id}> joined your guild.`)
    }
})