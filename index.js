///INDEX.JS

const { Client, GatewayIntentBits } = require('discord.js');
const { loadCommands } = require('./handler');
const CFonts = require('cfonts');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const token = 'YOUR_TOKEN_DISCORD';
const prefix = '!';

client.once('ready', () => {
    CFonts.say('Cya-Dev', {
        font: 'block',        // define the font face
        align: 'center',      // define text alignment
        colors: ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'], // define all colors
        background: 'black',  // define the background color
        letterSpacing: 1,     // define letter spacing
        lineHeight: 1,        // define the line height
        space: true,          // define if the output text should have empty lines on top and on the bottom
        maxLength: '0',       // define how many character can be on one line
    });
    console.log(`Logged in as ${client.user.tag}!`);
    loadCommands(client, prefix);
});

client.login(token);
