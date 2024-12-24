const fs = require('fs');
const path = require('path');

const maxImages = 30; // Maksimal jumlah gambar yang bisa diminta
const databasePath = path.join(__dirname, 'database.json');

// Initialize database if it doesn't exist
function initializeDatabase() {
    if (!fs.existsSync(databasePath)) {
        const initialData = { users: [] };
        fs.writeFileSync(databasePath, JSON.stringify(initialData, null, 2));
        console.log('Database initialized.');
    }
}

function loadCommands(client, prefix) {
    initializeDatabase();

    client.on('messageCreate', async message => {
        if (message.author.bot) return;
        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();
        const count = parseInt(args[0]) || 1; // Default to 1 if no argument is provided

        if (count > maxImages) {
            message.channel.send("```Kebanyakan puqi```");
            return;
        }

        if (command === 'menu' || command === 'help') {
            await showMenu(message);
        } else {
            const pluginPath = path.join(__dirname, 'plugin');
            fs.readdir(pluginPath, (err, files) => {
                if (err) {
                    console.error('Error reading plugin directory:', err);
                    return;
                }

                files.forEach(file => {
                    if (file.endsWith('.js')) {
                        const plugin = require(path.join(pluginPath, file));
                        if (plugin.command === command && typeof plugin.execute === 'function') {
                            if (checkUserLimit(message.author.id)) {
                                updateUserHits(message.author.id, message.author.username);
                                console.log(`User ${message.author.username} (${message.author.id}) used command: ${command}`);
                                plugin.execute(message, count);
                            } else {
                                message.channel.send("You have reached your usage limit for this bot.");
                            }
                        }
                    }
                });
            });
        }
    });
}

async function showMenu(message) {
    const pluginPath = path.join(__dirname, 'plugin');
    fs.readdir(pluginPath, (err, files) => {
        if (err) {
            console.error('Error reading plugin directory:', err);
            return;
        }

        const menu1Commands = [];
        const menu2Commands = [];

        files.forEach(file => {
            if (file.endsWith('.js')) {
                const plugin = require(path.join(pluginPath, file));
                if (plugin.category === 'nsfw') {
                    menu1Commands.push(`!${plugin.command}`);
                } else if (plugin.category === 'all') {
                    menu2Commands.push(`!${plugin.command}`);
                }
            }
        });

        const menuMessage = `
**🥵 NSFW 🥵** 
\`\`\`
${menu1Commands.join('\n')}

used : !type number [1-15]
     : !waifu 10
\`\`\`

**MENU2** 
\`\`\`
${menu2Commands.join('\n')}
\`\`\`
        `;

        message.channel.send(menuMessage);
    });
}

function updateUserHits(userId, username) {
    fs.readFile(databasePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading database:', err);
            return;
        }

        const database = JSON.parse(data);
        const user = database.users.find(u => u.id === userId);

        if (user) {
            user.hits += 1;
            user.limit -= 1; // Mengurangi limit setiap kali fitur digunakan
        } else {
            database.users.push({ id: userId, name: username, hits: 1, limit: 99 });
        }

        fs.writeFile(databasePath, JSON.stringify(database, null, 2), err => {
            if (err) {
                console.error('Error writing to database:', err);
            }
        });
    });
}

function checkUserLimit(userId) {
    const data = fs.readFileSync(databasePath, 'utf8');
    const database = JSON.parse(data);
    const user = database.users.find(u => u.id === userId);

    if (user) {
        return user.hits < user.limit;
    } else {
        return true;
    }
}

module.exports = { loadCommands };
