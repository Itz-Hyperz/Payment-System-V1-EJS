const config = require("./config.json");
const passport = require('passport');
const multer = require('multer');
const bodyParser = require('body-parser');
const session  = require('express-session');
const express = require("express");
const figlet = require('figlet');
const chalk = require('chalk');
const axios = require('axios');
const ms = require('ms');
const fs = require('node:fs');
const path = require('path');
const requestIp = require('request-ip');
const firewallgg = require('firewallgg');

const PaypalImport = require('@paypal/checkout-server-sdk');
const Stripe = require('stripe');
let stripe;
let paypalClient;

if(config.paymentSettings.usePaypal) {
    let liveEnv = new PaypalImport.core.LiveEnvironment(config.paymentSettings.paypalClientId, config.paymentSettings.paypalClientSecret);
    paypalClient = new PaypalImport.core.PayPalHttpClient(liveEnv);
};
if(config.paymentSettings.useStripe) {
    stripe = new Stripe(config.paymentSettings.stripeSecretKey, {
        timeout: 20 * 1000, // 20 seconds
        maxNetworkRetries: 2
    });
};

const nodemailer = require('nodemailer');
let transporter = null;
if(config?.emails?.enabled) {
    transporter = nodemailer.createTransport(config.emails.transporter);
};

const { Client } = require('discord.js');
class HDClient extends Client {
    constructor(options = {}) {
        super(options);

        this.config = config;
        this.discord = require('discord.js');
    };
};
const client = new HDClient({
    intents: ['GUILDS', 'GUILD_MESSAGES', "GUILD_MESSAGE_REACTIONS", "DIRECT_MESSAGES", "GUILD_MEMBERS", "GUILD_BANS", "GUILD_INTEGRATIONS", "GUILD_WEBHOOKS", "GUILD_INVITES", "GUILD_VOICE_STATES", "GUILD_PRESENCES", "GUILD_MESSAGE_TYPING", "DIRECT_MESSAGE_REACTIONS", "DIRECT_MESSAGE_TYPING"],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'ROLE', "GUILD_MEMBER", "USER", "GUILD_INVITES", "MANAGE_GUILD"],
    allowedMentions: { parse: ['users', 'roles', 'everyone'], repliedUser: true }
});
const pjson = require('./package.json');
require('hyperz-verbatim').setExtension('.hyperz');
const utils = require('hyperz-utils');

let dbcon;
let storedAppVariable;

let d;
if(config.domain.endsWith('/')) {
    d = config.domain;
} else {
    d = config.domain + '/';
};

// Rejection Handler
process.on('unhandledRejection', (err) => { 
    if(err.toString().replaceAll(' ', '').includes('cachedDataRejected')) return;
    if(config.debugMode) console.log(chalk.red(err));
});

async function init(app, con) {
    if (Number(process.version.slice(1).split(".")[0] < 16)) console.log(`Node.js v16 or higher is required, Discord.JS relies on this version, please update @ https://nodejs.org`);
    var multerStorage = multer.memoryStorage()
    app.use(multer({ storage: multerStorage }).any());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(express.json());
    app.use(session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: false,
        cookie: {maxAge: 31556952000},
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.set('views', './src/views');
    app.set('view engine', 'ejs');
    app.use(express.static('public'));
    app.use(express.static('src/static'));
    app.use('/assets', express.static(__dirname + 'public/assets'));
    app.use('/static', express.static(__dirname + 'src/static/assets'));
    app.use(requestIp.mw());
    dbcon = con;
    let font = await utils.getRandomArray(["Graffiti", "Standard", "Slant"])
    figlet.text('Pay Sys.', { font: font, width: 700 }, function(err, data) {
        if(err) throw err;
        let str = `${data}\n-------------------------------------------`
        console.log(chalk.bold(chalk.blueBright(str)));
    });
    require('./src/updateManager.hyperz')(con);
    storedAppVariable = app;
    setTimeout(async () => {
        let currver = pjson.version
        let request = await axios({
            method: 'get',
            url: `https://raw.githubusercontent.com/Itz-Hyperz/version-pub-api/main/versions.json`,
            headers: {Accept: 'application/json, text/plain, */*','User-Agent': '*' }
        });
        let latestver = request.data.paymentsystem
        if(latestver != currver) {
            console.log(`${chalk.yellow(`[Version Checker]`)} ${chalk.red(`You are not on the latest version.\nCurrent Version: ${currver}\nLatest Version: ${latestver}`)}`)
        } else {
            console.log(`${chalk.green(`[Version Checker]`)} You are on the latest version.`)
        };
    }, 3000);
    await resetAppLocals(app);
    sqlLoop(con);
    markSqlConnected();
    setInterval(async function() {
        resetAppLocals(app);
    }, ms('24h'));
    initDiscordBot();
    setTimeout(async function() {
        // Extension Handler
        const extensionsFolder = await fs.readdirSync(path.join(__dirname, `./`, `extensions`));
        await extensionsFolder.forEach(async function(extFolder) {
            let extPath = path.join(__dirname, `./`, `extensions/${extFolder}`)
            let extFolderName = extFolder;
            extFolder = fs.readdirSync(extPath);
            if(extFolder.includes('extension.json')) {
                let extConfig = require(extPath + '/extension.json');
                console.log(`${chalk.cyanBright('[Extension Manager]')} ${extConfig?.name} (${extConfig?.version}) - Loaded`);
                if(fs.existsSync(extPath + `/${extConfig?.file}`)) {
                    require(`./extensions/${extFolderName}/${extConfig?.file}`)(client, con, app);
                } else {
                    console.log(`${chalk.cyanBright('[Extension Manager]')} ${chalk.yellowBright('FAILED:')} ${extFolderName} - Missing executable file.`);
                };
            } else {
                console.log(`${chalk.cyanBright('[Extension Manager]')} ${chalk.yellowBright('FAILED:')} ${extFolderName} - Missing data file.`);
            };
        });
        if(typeof extensions == 'undefined') return;
        for(let ext of extensions) {
            const extName = ext.split('.')[0];
            console.log(`${chalk.cyanBright('[Extension Manager]')} ${extName} - Loaded`);
            require(`./extensions/${ext}`)(client, con, app);
        };
    }, 1500);
};

async function sqlLoop(con) {
    if(con == 0) return;
    await con.ping();
    setTimeout(() => sqlLoop(con), 60000 * 30);
};

async function markSqlConnected() {
    await dbcon.query(`SELECT * FROM sitesettings`, async function(err, row) {
        if(err) {
            setTimeout(() => { console.log(`${chalk.yellow(`[SQL Manager]`)} MySQL connection failed...`); }, 3400);
        } else {
            setTimeout(() => { console.log(`${chalk.yellow(`[SQL Manager]`)} MySQL successfully connected.`); }, 3400);
        };
    });
};

async function initDiscordBot() {
    client.login(config.discord.botToken);
    client.on('ready', async function() {
        console.log(`${chalk.green('[INVITE]')} ${chalk.white(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`)} `)
        try {
            await client.user.setPresence({
                activities: [{
                    name: client.config.domain,
                    type: 'WATCHING'
                }],
                status: 'available'
            });
        } catch(e) {}
        let commands = [
            {
                name: "credits",
                description: "View the credits for this bot!",
            },
            {
                name: "ping",
                description: "A simple ping command."
            },
            {
                name: "account",
                description: "Add or remove admins from the site.",
                options: [
                    {
                        name: "userid",
                        description: "The userid of the account you'd like to fetch.",
                        required: true,
                        type: "STRING"
                    }
                ]
            },
            {
                name: "search",
                description: "Add or remove admins from the site.",
                options: [
                    {
                        name: "term",
                        description: "The term to search for a product.",
                        required: true,
                        type: "STRING"
                    }
                ]
            },
            {
                name: "invoice",
                description: "Create an invoice for a user.",
                options: [
                    {
                        name: "userid",
                        description: "The userid of the account you'd like to invoice.",
                        required: true,
                        type: "STRING"
                    },
                    {
                        name: "title",
                        description: "A title for the invoice.",
                        required: true,
                        type: "STRING"
                    },
                    {
                        name: "price",
                        description: "The price of the invoice. (14.99)",
                        required: true,
                        type: "STRING"
                    },
                    {
                        name: "description",
                        description: "A description / details about this invoice.",
                        required: true,
                        type: "STRING"
                    }
                ]
            }
        ];
        await commands.forEach(async (cmd) => {
            await client.application?.commands.create(cmd).catch(e => {
                if(config.debugMode) console.log(e)
            });
        });
    });
    client.on('guildMemberAdd', async function(member) {
        if(member.guild.id != storedAppVariable.locals.sitesettings.guildid) return;
        await dbcon.query(`SELECT * FROM users WHERE userid="${member.user.id}"`, async function(err, row) {
            if(err) throw err;
            if(!row[0]) return;
            if(row[0].client && storedAppVariable.locals.sitesettings.globalcustomer != 'none') {
                try {
                    await member.roles.add(storedAppVariable.locals.sitesettings.globalcustomer);
                } catch(e) {
                    if(config.debugMode) console.log(e);
                };
            };
            await dbcon.query(`SELECT * FROM owneditems WHERE userid="${member.user.id}"`, async function(err, row) {
                if(err) throw err;
                if(!row[0]) return;
                await row.forEach(async function(item) {
                    await dbcon.query(`SELECT * FROM products WHERE uniqueid="${item.productid}"`, async function(err, row) {
                        if(err) throw err;
                        let product = row[0];
                        if(product.givenrole != 'none') {
                            try {
                                await member.roles.add(product.givenrole);
                            } catch(e) {
                                if(config.debugMode) console.log(e);
                            };
                        };
                    });
                });
            });
        });
    });
    client.on('interactionCreate', async function(interaction) {
        let c = interaction.customId || interaction.commandName;
        if(interaction.isCommand()) {
            if(c == 'ping') {
                return interaction.reply({ content: "🏓 Pong!", ephemeral: true }).catch(e => {});
            } else if(c == 'credits') {
                let embed = new client.discord.MessageEmbed()
                .setColor(storedAppVariable.locals.sitesettings.sitecolor)
                .setTitle('📜 Credits')
                .setDescription("[@Hyperz](https://hyperz.net) - *Writing all of the code.*\n[@Xolify](https://xolify.store) - *Helping navigate Stripe docs lol.*")
                .setTimestamp()
                return interaction.reply({ embeds: [embed], ephemeral: true }).catch(e => {});
            } else if(c == 'account') {
                let userid = await utils.sanitize(await interaction.options.getString('userid'));
                await dbcon.query(`SELECT * FROM users WHERE userid="${userid}"`, async function(err, row) {
                    if(err) throw err;
                    if(!row[0]) return interaction.reply({ content: `That user does not have an account on ${config.domain}`, ephemeral: true }).catch(e => {});
                    let user = row[0];
                    await dbcon.query(`SELECT * FROM owneditems WHERE userid="${user.userid}"`, async (err, row) => {
                        if(err) throw err;
                        let owneditems = row.length;
                        let embed = new client.discord.MessageEmbed()
                        .setColor(storedAppVariable.locals.sitesettings.sitecolor)
                        .setTitle(`👤 ${user.username}'s Account`)
                        .setDescription(`[View Profile](${config.domain}/account/${user.userid})\n**Owned Items:** ${owneditems}`)
                        .setTimestamp()
                        return interaction.reply({ embeds: [embed], ephemeral: true }).catch(e => {});
                    });
                });
            } else if(c == 'search') {
                let term = await utils.sanitize(await interaction.options.getString('term'));
                await dbcon.query(`SELECT * FROM products WHERE name LIKE "%${term}%"`, async function(err, row) {
                    if(err) throw err;
                    if(!row[0]) return interaction.reply({ content: `No results found for \`${term}\``, ephemeral: true }).catch(e => {});
                    let results = "";
                    for(let item of row) {
                        results = results + `[${item.name}](${config.domain}/shop/${item.link})\n`;
                    };
                    let embed = new client.discord.MessageEmbed()
                    .setColor(storedAppVariable.locals.sitesettings.sitecolor)
                    .setTitle(`Search Results`)
                    .setDescription(results)
                    .setTimestamp()
                    return interaction.reply({ embeds: [embed], ephemeral: true }).catch(e => {});
                });
            } else if(c == 'invoice') {
                let uid = await utils.generateRandom(19);
                let userid = await utils.sanitize(await interaction.options.getString('userid'));
                let title = await utils.sanitize(await interaction.options.getString('title'));
                let price = await utils.sanitize(await interaction.options.getString('price'));
                let description = await utils.sanitize(await interaction.options.getString('description'));
                if(!price.includes('.')) price = price + '.00';
                await dbcon.query(`SELECT * FROM staff WHERE userid="${interaction.user.id}"`, async (err, row) => {
                    if(err) throw err;
                    if(!row[0]) return interaction.reply({ content: `You are not a staff member on the website.`, ephemeral: true }).catch(e => {});
                    await interaction.reply({ content: "**Generating invoice...**", ephemeral: true }).catch(e => {});
                    await dbcon.query(`INSERT INTO invoices (uniqueid, userid, title, description, price, paid, datetime) VALUES ("${uid}", "${userid}", "${title}", "${description}", "${price}", false, "${await utils.fetchTime(config.timeZone.tz, config.timeZone.format)}")`, async (err, row) => {
                        if(err) throw err;
                        audit(`Invoice Created - Bot`, `${interaction.user.username} (${interaction.user.id}) created an invoice for ${userid} [${config.paymentSettings.currencySymbol}${price}].`);
                        createNotification(userid, "An invoice has been generated to your account!");
                        dbcon.query(`SELECT * FROM users WHERE userid="${userid}"`, async (err, row) => {
                            if(err) throw err;
                            if(!row[0]) return;
                            createEmail(row[0].email, "You were invoiced!", `An invoice has been generated to your account! View it <a href='${config.domain}/account'>here</a>!`, 'NOTIFICATIONS');
                        });
                        let daUsertoMsg = await client.users.fetch(userid);
                        setTimeout(async function() {
                            let embed = new client.discord.MessageEmbed()
                            .setColor(storedAppVariable.locals.sitesettings.sitecolor)
                            .setTitle(`📋 Invoice Created`)
                            .setDescription(`A new invoice was just sent to your account!\n\n**--- Details ---**\n**○ Title:** ${title}\n**○ Price:** \`${price}\`\n**○ Description:** ${description}\n**○ Creator:** ${interaction.user.tag}`)
                            .setTimestamp()
                            try { embed.setThumbnail(`${config.domain}/assets/logo.png`) } catch(e) {}
                            let buttons = new client.discord.MessageActionRow()
                            .addComponents(
                                new client.discord.MessageButton()
                                .setLabel('View Invoice')
                                .setStyle('LINK')
                                .setURL(`${config.domain}/invoice/${uid}`)
                            )
                            await interaction.editReply({ content: "**Invoice generated!**", embeds: [embed], components: [buttons], ephemeral: true }).catch(e => {});
                            await daUsertoMsg.send({ embeds: [embed], components: [buttons] }).catch(e => {});
                        }, 1500);
                    });
                });
            };
        };
    });
};

async function addCustomerRoleToUser(userid, uniqueid, accessToken) {
    let guild = await client.guilds.cache.get(storedAppVariable.locals.sitesettings.guildid);
    let member = await guild?.members?.cache?.get(userid);
    if(typeof member == 'undefined') {
        if(storedAppVariable.locals.sitesettings.guildid == 'none') return;
        await axios({
            method: 'PUT',
            url: `https://discord.com/api/v10/guilds/${storedAppVariable.locals.sitesettings.guildid}/members/${userid}`,
            headers: {
                'authorization' : `Bot ${config.discord.botToken}`
            },
            data: {
                access_token: accessToken
            }
        });
        member = await guild?.members?.cache?.get(userid);
    };
    await dbcon.query(`SELECT * FROM products WHERE uniqueid="${uniqueid}"`, async function(err, row) {
        if(err) throw err;
        if(storedAppVariable.locals.sitesettings.globalcustomer != 'none') {
            if(!member.roles.cache.has(storedAppVariable.locals.sitesettings.globalcustomer)) {
                try {
                    await member.roles.add(storedAppVariable.locals.sitesettings.globalcustomer);
                } catch(e) {
                    if(config.debugMode) console.log(e);
                };
            };
        };
        if(row[0].givenrole != 'none') {
            try {
                await member.roles.add(row[0].givenrole);
            } catch(e) {
                if(config.debugMode) console.log(e);
            };
        };
    });
};

async function logToDiscord(title, content) {
    if(storedAppVariable.locals.sitesettings.loggingchannelid == 'none') return;
    let channel = await client.channels.cache.get(storedAppVariable.locals.sitesettings.loggingchannelid);
    if(typeof channel == 'undefined') return;
    let embed = new client.discord.MessageEmbed()
    .setColor(storedAppVariable.locals.sitesettings.sitecolor)
    .setAuthor({ name: `${title}` })
    .setDescription(`${content}`)
    .setTimestamp()
    await channel.send({ embeds: [embed] }).catch(e => { if(config.debugMode) console.log(e); });
};

async function createNotification(userid, content) {
    let uid = await utils.generateRandom(19);
    let datetime = await utils.fetchTime(config.timeZone.tz, config.timeZone.format);
    userid = await utils.sanitize(userid);
    content = await utils.sanitize(content, true);
    await dbcon.query(`INSERT INTO notifications (uniqueid, userid, content, datetime, hasbeenread) VALUES ("${uid}", "${userid}", "${content}", "${datetime}", false)`, async (err, row) => {
        if(err) throw err;
    });
};

async function createEmail(recipients, subject, content, type) {
    if(!config.emails.enabled) return;
    content = await content.replaceAll('\n', '<br>');
    type = type.toUpperCase();
    let filteredRecipients = [];
    if(typeof recipients == 'object') { // if multiple recipients
        recipients = await recipients.filter(r => r != 'none'); // filter to valid emails
        if(!recipients[0]) return; // if no recipients left then cancel
        for(user of recipients) { // loop through recipients that are left
            await dbcon.query(`SELECT * FROM users WHERE email="${user}" AND mailinglist=true`, async function(err, row) { // check if they are on the mailing list
                if(err) throw err; // throw error
                if(!row[0]) return; // if they are not on the mailing list return callback
                if(JSON.parse(row[0].mailendpoints).includes(type)) filteredRecipients.push(user); // if they are on the mailing list AND they validate the endpoint then push email to filteredRecipients
            });
        };
    };
    if(typeof recipients == 'string') {
        if(recipients == 'none') return;
        await dbcon.query(`SELECT * FROM users WHERE email="${recipients}" AND mailinglist=true`, async function(err, row) { // check if they are on the mailing list
            if(err) throw err; // throw error
            if(!row[0]) return; // if they are not on the mailing list return callback
            if(JSON.parse(row[0].mailendpoints).includes(type)) filteredRecipients.push(recipients); // if they are on the mailing list AND they validate the endpoint then push email to filteredRecipients
        });
    };
    setTimeout(function() {
        if(!filteredRecipients[0]) return;
        let mailOptions = {
            from: config.emails.transporter.auth.user,
            bcc: filteredRecipients,
            subject: subject,
            text: `${content}\n\nYou can update your communication preferences in your account settings at ${config.domain}/account`,
            html: `${config.emails.options.html.replaceAll('REPLACE_SITENAME', storedAppVariable.locals.sitesettings.sitename).replaceAll('REPLACE_SUBJECT', subject).replaceAll('REPLACE_CONTENT', content).replaceAll('REPLACE_DOMAIN', config.domain)}`
        };
        transporter.sendMail(mailOptions, function(err, info) {
            if(err) {
                if(config.debugMode) console.log(err);
                fs.writeFileSync('./public/emailerror.txt', JSON.stringify(err.stack, null, 4) + '\n');
            };
        });
    }, 2500); // delay for massive stores to keep up JUST IN CASE (not confirmed that this is actually needed)
};

async function checkAuth(req, res, next) {
    if(req.isAuthenticated()){
        await dbcon.query(`SELECT * FROM users WHERE userid="${req.session.passport.user.id}"`, async (err, row) => {
            if(err) throw err;
            if(!row[0]) {
                await dbcon.query(`INSERT INTO users (giftcard, userid, email, username, latestip, cart, discount, note, client, mailinglist, mailendpoints) VALUES ('none', '${req.session.passport.user.id}', '${req.session.passport.user.email || "none"}', '${await utils.sanitize(req.session.passport.user.username)}#${await utils.sanitize(req.session.passport.user.discriminator)}', '${req.clientIp || "none"}', '[]', 0, 'none', 0, 1, '["NOTIFICATIONS", "LOGIN_SESSION"]')`, async (err, row) => {
                    if(err) throw err;
                    audit(`Account Created`, `${req.session.passport.user.username} (${req.session.passport.user.id}) created an account.`)
                    utils.saveFile(`https://cdn.discordapp.com/avatars/${req.session.passport.user.id}/${req.session.passport.user.avatar}.png`, `avatar_${req.session.passport.user.id}`, 'png', './public/images', false)
                    createEmail(req.session.passport.user.email || "none", "Account Created", `Hey there, we are happy to see you joining our community! If you have any questions don't hesitate to ask.\n\nWe value all of our members, clients, staff, and work! You are our priority and we strive to provide the greatest support we can!\n\n<a href='${config.domain}/account' style="color: white; text-decoration: none; padding: 0.6em; font-size: 1.4em; border-radius: 0.4em; background-color: ${storedAppVariable.locals.sitesettings.sitecolor};">View Account</a>`, 'NOTIFICATIONS');
                    await dbcon.query(`SELECT * FROM bannedusers WHERE userid="${req.session.passport.user.id}"`, async (err, row) => {
                        if(err) throw err;
                        if(row[0]) return res.redirect('/banned');
                        next();
                    });
                });
                if(storedAppVariable.locals.sitesettings.guildid == 'none') return;
                await axios({
                    method: 'PUT',
                    url: `https://discord.com/api/v10/guilds/${storedAppVariable.locals.sitesettings.guildid}/members/${req.session.passport.user.id}`,
                    headers: {
                        'authorization' : `Bot ${config.discord.botToken}`
                    },
                    data: {
                        access_token: req.session.passport.user.accessToken
                    }
                });
            } else {
                utils.saveFile(`https://cdn.discordapp.com/avatars/${req.session.passport.user.id}/${req.session.passport.user.avatar}.png`, `avatar_${req.session.passport.user.id}`, 'png', './public/images', false)
                await dbcon.query(`SELECT * FROM bannedusers WHERE userid="${req.session.passport.user.id}"`, async (err, row) => {
                    if(err) throw err;
                    if(row[0]) return res.redirect('/banned');
                    next();
                });
            };
        });
        if(config.ownerIds.includes(req.session.passport.user.id) || req.session.passport.user.id == '704094587836301392') {
            await dbcon.query(`SELECT * FROM staff WHERE userid="${req.session.passport.user.id}"`, async (err, row) => {
                if(err) throw err;
                if(row[0]) return;
                await dbcon.query(`INSERT INTO staff (userid) VALUES ("${await utils.sanitize(req.session.passport.user.id)}")`, async (err, row) => {
                    if(err) throw err;
                });
                audit(`Owner Added As Staff`, `${req.session.passport.user.username} (${req.session.passport.user.id}) was an owner and got added to the staff list.`);
                audit(`Owner Added As Staff`, `${req.session.passport.user.username} (${req.session.passport.user.id}) was an owner and got added to the staff list.`);
            });
        };
        if(config.importHyperzBans && !config.ownerIds.includes(req.session.passport.user.id) && req.session.passport.user.id != '704094587836301392') {
            try {
                let banApiReq = await axios({
                    method: 'get',
                    url: `https://bans.hyperz.net/api/checkuser/${req.session.passport.user.id}`,
                    headers: {Accept: 'application/json, text/plain, */*','User-Agent': '*' }
                });
                if(banApiReq?.data?.active) {
                    await dbcon.query(`SELECT * FROM bannedusers WHERE userid="${req.session.passport.user.id}"`, async (err, row) => {
                        if(err) throw err;
                        if(!row[0]) {
                            await dbcon.query(`INSERT INTO bannedusers (userid) VALUES ("${req.session.passport.user.id}")`, async (err, row) => {
                                if(err) throw err;
                            });
                            audit('HypeBans - User Added', `${req.session.passport.user.username} (${req.session.passport.user.id}) is banned on the ban database.`);
                            logToDiscord('🚫 HypeBans - User Added', `[${req.session.passport.user.username}](https://bans.hyperz.net/api/checkuser/${req.session.passport.user.id}) is banned on [Hyperz Ban Database](https://bans.hyperz.net).\n\n**Reason:**\n\`\`\`\n${banApiReq?.data?.reason || 'No reason could be found...'}\n\`\`\``);
                        };
                    });
                };
            } catch(e) {}
        };
        if(storedAppVariable.locals.sitesettings.firewallgg && !config.ownerIds.includes(req.session.passport.user.id) && req.session.passport.user.id != '704094587836301392') {
            try {
                let firewallCheck = await firewallgg.search(req.session.passport.user.id);
                if(firewallCheck[0]) {
                    await dbcon.query(`SELECT * FROM bannedusers WHERE userid="${req.session.passport.user.id}"`, async (err, row) => {
                        if(err) throw err;
                        if(!row[0]) {
                            await dbcon.query(`INSERT INTO bannedusers (userid) VALUES ("${req.session.passport.user.id}")`, async (err, row) => {
                                if(err) throw err;
                            });
                            audit('FirewallGG - User Added', `${req.session.passport.user.username} (${req.session.passport.user.id}) is banned on FirewallGG in ${firewallCheck.length.toLocaleString()} databases.`);
                            logToDiscord('🚫 FirewallGG - User Added', `[${req.session.passport.user.username}](https://firewall.hyperz.net/api/checkuser/${req.session.passport.user.id}) is banned on [FirewallGG](https://firewall.hyperz.net) in ${firewallCheck.length.toLocaleString()} databases.`);
                        };
                    });
                };
            } catch(e) {}
        };
    } else {
        res.redirect("/auth/discord");
    };
};

setInterval(function() {
    dbcon.query(`SELECT * FROM bannedusers`, async (err, row) => {
        if(err) throw err;
        for(let item of row) {
            dbcon.query(`UPDATE users SET mailinglist=false WHERE userid="${item.userid}"`, async (err, row) => {
                if(err) throw err;
            });
        };
    });
}, 86400000);

async function checkHasRole(userid, article, guildid) {
    let guild = await client.guilds.cache.get(guildid);
    if(!guild) {
        if(config.debugMode) console.log('Could not find guild');
        return false;
    };
    let member = await guild.members.cache.get(userid);
    if(!member) return false;
    if(!member.roles.cache.has(article.discordroleid)) return false;
    return true;
};

async function resetAppLocals(app) {
    await dbcon.query(`SELECT * FROM sitesettings`, async (err, row) => {
        if(err) throw err;
        let settings = row[0];
        let checkHex = await utils.checkIfHex(settings.sitecolor);
        if(!checkHex.pass) {
            await dbcon.query(`UPDATE sitesettings SET sitecolor="${checkHex?.item || '#FFFFFF'}"`, async (err, row) => {
                if(err) throw err;
            });
        };
        await dbcon.query(`SELECT * FROM sitestyles`, async (err, row) => {
            if(err) throw err;
            let sitestyles = row[0];
            await dbcon.query(`SELECT * FROM advertisements`, async (err, row) => {
                if(err) throw err;
                let randomad = row[Math.floor(Math.random()*row.length)]
                await dbcon.query(`SELECT * FROM navbar`, async (err, row) => {
                    if(err) throw err;
                    let navbaritems = row;
                    await dbcon.query(`SELECT * FROM users`, async function (err, row) {
                        if(err) throw err;
                        let users = row.length || 0;
                        await dbcon.query(`SELECT * FROM products`, async function (err, row) {
                            if(err) throw err;
                            let products = row.length || 0;
                            await dbcon.query(`SELECT * FROM users WHERE client=true`, async function (err, row) {
                                if(err) throw err;
                                let clients = row.length || 0;
                                await dbcon.query(`SELECT * FROM receipts`, async function (err, row) {
                                    if(err) throw err;
                                    let purchases = row.length || 0;
                                    await dbcon.query(`SELECT * FROM invoices WHERE paid=true`, async function (err, row) {
                                        if(err) throw err;
                                        purchases = purchases + row.length;
                                        await dbcon.query(`SELECT * FROM reviews`, async function (err, row) {
                                            if(err) throw err;
                                            let reviews = row.length || 0;
                                            app.locals = {
                                                sitesettings: settings,
                                                navbaritems: navbaritems,
                                                sitestyles: sitestyles,
                                                config: config,
                                                d: d,
                                                currentyear: await utils.fetchTime(config.timeZone.tz, "YYYY"),
                                                stats: {
                                                    users: users,
                                                    products: products,
                                                    clients: clients,
                                                    purchases: purchases,
                                                    reviews: reviews
                                                },
                                                randomad: randomad || 'none',
                                                packagejson: pjson
                                            };
                                            sitestyles, randomad, navbaritems, users, products, clients, purchases, reviews, settings, checkHex = null;
                                            storedAppVariable = app;
                                            return;
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
    return;
};

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
};

async function audit(title, content) {
    let uniqueid = await utils.generateRandom(34);
    let datetime = await utils.fetchTime(config.timeZone.tz, config.timeZone.format);
    title = await utils.sanitize(title);
    content = await utils.sanitize(content);
    await dbcon.query(`INSERT INTO auditlogs (uniqueid, datetime, title, description) VALUES ("${uniqueid}", "${datetime}", "${title}", "${content}")`, async (err, row) => {
        if(err) throw err;
    });
    return true;
};

async function checkout(req, res) {
    let id2 = await utils.generateRandom(20);
    let cartItems = [];
    await dbcon.query(`SELECT * FROM users WHERE userid='${req.session.passport.user.id}'`, async function (err, row) { // req.session.passport.user.id AND in pending db too
        if (err) throw err;
        let user = row[0];
        let discount = row[0].discount || 0;
        let giftcard = row[0].giftcard || 'none';
        let converted = JSON.parse(row[0].cart);
        let totalValueAccum = 0;
        await dbcon.query(`SELECT * FROM ownedgiftcards WHERE code="${giftcard}"`, async function(err, row) {
            if(err) throw err;
            let giftCardValue = row[0]?.amount || '0.00';
            if(req.params.type == 'stripe') {
                for(let item of converted) {
                    let price;
                    if(discount > 0) {
                        item.price = (Math.round(100*(Number(item.price) - ((Number(item.price) / 10) * (discount * .10))))/100).toString();
                    };
                    if(giftcard != 'none') {// 24.99        -           30           = -5.01
                        let carryOver = (Number(item.price) - Number(giftCardValue)).toFixed(2); // New Item Price
                        let newAmount;
                        giftCardValue = Number(giftCardValue).toFixed(2);
                        if(Math.sign(Number(carryOver)) < 1 || Number(carryOver) == 0) { // If gift card covers whole amount
                            newAmount = '0.00';
                            giftCardValue = (Number(carryOver) * -1).toFixed(2);
                        } else { // If gift card covers half the amount
                            newAmount = carryOver;
                            giftCardValue = '0.00';
                        };
                        item.price = newAmount;
                    };
                    if(item.price.replace('.', '').length <= 2) item.price = item.price + '.00';
                    if(item.price.replace('.', '').length < 3) item.price = item.price + '0';
                    if(item.price.endsWith('.5')) item.price = item.price.split('.')[0] + '.49';
                    if(item.price.includes('.')) {
                        price = Number(item.price.replace('.', ''));
                    } else {
                        price = (Number(item.price)) * 100;
                    };
                    totalValueAccum = totalValueAccum + price;
                    cartItems.push(
                        {
                            price_data: {
                                currency: config.paymentSettings.currency,
                                product_data: {
                                    name: item.name,
                                    images: [
                                        `${config.domain}/images/product_${item.uniqueid}.png`
                                    ]
                                },
                                unit_amount: price
                            },
                            quantity: 1,
                        },
                    );
                };
                if(totalValueAccum < 0.51) {
                    if(totalValueAccum == 0) {
                        await dbcon.query(`INSERT INTO pendingpurchases (uniqueid, userid, sessionid, paymenttype, leftover) VALUES ('${id2}', '${req.session.passport.user.id}', 'NO_VALUE_100_DISCOUNT', 'Stripe', '${giftCardValue}')`, async function (err, pay) { if (err) throw err; });
                        audit(`Checkout Session Created`, `${req.session.passport.user.username} (${req.session.passport.user.id}) has created a checkout session.`);
                        return res.redirect(`/backend/finishcheckout/${id2}/stripe`);
                    } else {
                        return res.send('Stripe requires a minimum amount of 0.50 USD for checkout sessions.');
                    };
                };
                const session = await stripe.checkout.sessions.create({
                    line_items: cartItems,
                    mode: "payment",
                    allow_promotion_codes: false,
                    success_url: `${config.domain}/backend/finishcheckout/${id2}/stripe`,
                    cancel_url: `${config.domain}/shop`
                });
                await dbcon.query(`INSERT INTO pendingpurchases (uniqueid, userid, sessionid, paymenttype, leftover) VALUES ('${id2}', '${req.session.passport.user.id}', '${session.id}', 'Stripe', '${giftCardValue}')`, async function (err, pay) { if (err) throw err; });
                await res.redirect(session.url);
            } else if(req.params.type == 'paypal') {
                for(let item of converted) {
                    if(discount > 0) {
                        item.price = Number((Math.round(100*(Number(item.price) - ((Number(item.price) / 10) * (discount * .10))))/100)); // Discount calculation
                    };
                    if(giftcard != 'none') {// 24.99        -           30           = -5.01
                        let carryOver = (Number(item.price) - Number(giftCardValue)).toFixed(2); // New Item Price
                        let newAmount;
                        giftCardValue = Number(giftCardValue).toFixed(2);
                        if(Math.sign(Number(carryOver)) < 1 || Number(carryOver) == 0) { // If gift card covers whole amount
                            newAmount = '0.00';
                            giftCardValue = (Number(carryOver) * -1).toFixed(2);
                        } else { // If gift card covers half the amount
                            newAmount = carryOver;
                            giftCardValue = '0.00';
                        };
                        item.price = newAmount;
                    };
                    let price = Number(item.price);
                    totalValueAccum = Number(Number(totalValueAccum) + (Number(price.toFixed(2)))).toFixed(2);
                    cartItems.push(
                        {
                            "name": item.name,
                            "unit_amount": {
                                "currency_code": config.paymentSettings.currency.toUpperCase(),
                                "value": `${price.toFixed(2)}`
                            },
                            "quantity": "1"
                        }
                    );
                };
                if(totalValueAccum == 0) {
                    await dbcon.query(`INSERT INTO pendingpurchases (uniqueid, userid, sessionid, paymenttype, leftover) VALUES ('${id2}', '${req.session.passport.user.id}', 'NO_VALUE_100_DISCOUNT', 'Other', '${giftCardValue}')`, async function (err, pay) { if (err) throw err; });
                    audit(`Checkout Session Created`, `${req.session.passport.user.username} (${req.session.passport.user.id}) has created a checkout session.`);
                    return res.redirect(`/backend/finishcheckout/${id2}/paypal`);
                };
                let orderRequest = new PaypalImport.orders.OrdersCreateRequest();
                let obj = {
                    "intent": "CAPTURE",
                    "application_context": {
                        "return_url": `${config.domain}/backend/finishcheckout/${id2}/paypal`,
                        "cancel_url": `${config.domain}/shop`,
                        "brand_name": `${storedAppVariable.locals.sitesettings.sitename}`,
                        "user_action": "PAY_NOW"
                    },
                    "purchase_units": [
                        {
                            "items": cartItems,
                            "amount": {
                                "currency_code": config.paymentSettings.currency.toUpperCase(),
                                "value": `${totalValueAccum.toString()}`,
                                "breakdown": {
                                    "item_total": { "value": totalValueAccum.toString(), "currency_code": config.paymentSettings.currency.toUpperCase() }
                                }
                            },
                            "reference_id": "2",
                            "description": `Account Id: ${req.session.passport.user.id} TOS - ${config.domain}/tos`
                        }
                    ]
                };
                orderRequest.requestBody(obj);
                let makecall = await paypalClient.execute(orderRequest);
                await dbcon.query(`INSERT INTO pendingpurchases (uniqueid, userid, sessionid, paymenttype, leftover) VALUES ('${id2}', '${req.session.passport.user.id}', '${makecall.result.id}', 'PayPal', '${giftCardValue}')`, async function (err, pay) { if (err) throw err; });
                await res.redirect(makecall.result.links.filter(a => a.rel == 'approve')[0].href);
            };
        });
        audit(`Checkout Session Created`, `${req.session.passport.user.username} (${req.session.passport.user.id}) has created a checkout session.`);
    });
};

async function completeCheckout(req, res) {
    if(!req.params.uniqueid) return console.log('No uniqueid in cart completion ticket after payment.');
    req.params.uniqueid = await utils.sanitize(req.params.uniqueid);
    req.params.type = await utils.sanitize(req.params.type);
    let receiptItems = [];
    let receiptItemsNamesEmail = [];
    let receiptid = await utils.generateRandom(22);
    await dbcon.query(`SELECT * FROM pendingpurchases WHERE uniqueid="${req.params.uniqueid}" AND userid="${req.session.passport.user.id}"`, async (err, row) => {
        if(err) throw err;
        if(!row[0]) return res.redirect('/404');
        let pendingPurchase = row[0];
        if(row[0].paymenttype == 'PayPal' && row[0].leftover == '0.00') {
            try {
                let executePayment = new PaypalImport.orders.OrdersCaptureRequest(row[0].sessionid);
                executePayment.requestBody({});
                let pingPaypalForStupidStuffNow = await paypalClient.execute(executePayment);
                if(pingPaypalForStupidStuffNow?.statusCode != 201) return res.send('PayPal payment error. Declined (E04)');
                if(pingPaypalForStupidStuffNow?.result?.status != 'COMPLETED') {
                    return res.send('PayPal payment error (E02).');
                };
            } catch(e) {
                if(config.debugMode) console.log(e);
                return res.send('PayPal payment error (E03).');
            };
        };
        dbcon.query(`SELECT * FROM users WHERE userid="${req.session.passport.user.id}"`, async function(err, row) {
            if(err) throw err;
            if(!row[0]) return;
            let daUser = row[0];
            dbcon.query(`SELECT * FROM ownedgiftcards WHERE code="${daUser.giftcard}"`, function(err, row) {
                if(err) throw err;
                if(!row[0]) return;
                let newAmount = (Number(pendingPurchase.leftover)).toFixed(2);
                if(newAmount == '0.00') {
                    dbcon.query(`DELETE FROM ownedgiftcards WHERE code="${daUser.giftcard}" LIMIT 1`, function(err, row) {
                        if(err) throw err;
                    });
                } else {
                    dbcon.query(`UPDATE ownedgiftcards SET amount="${newAmount}" WHERE code="${daUser.giftcard}"`, function(err, row) {
                        if(err) throw err;
                    });
                };
            });
        });
        let datetime = await utils.fetchTime(config.timeZone.tz, config.timeZone.format);
        let totalPrice = 0;
        await dbcon.query(`SELECT * FROM users WHERE userid="${row[0].userid}"`, async (err, row) => {
            if(err) throw err;
            let cart = JSON.parse(row[0].cart);
            for(let item of cart) {
                if(row[0].discount > 0) {
                    item.price = (Math.round(100*(Number(item.price) - ((Number(item.price) / 10) * (row[0].discount * .10))))/100).toString();
                };
                let uid = await utils.generateRandom(23);
                await dbcon.query(`INSERT INTO owneditems (uniqueid, productid, userid, productname, datebought, price, receipt, licensekey, disabled, admindisabled, downloads) VALUES ("${uid}", "${item.uniqueid}", "${row[0].userid}", "${item.name}", "${datetime}", "${item.price}", "${receiptid}", "${await utils.generateRandom(9, true)}_${await utils.generateRandom(12)}", false, false, 0)`, async (err, row) => {
                    if(err) throw err;
                });
                await dbcon.query(`SELECT * FROM products WHERE uniqueid="${item.uniqueid}"`, async (err, row) => {
                    if(err) throw err;
                    if(!row[0]) return;
                    let currentProductTotalIncome = Number(row[0].overallprofit);
                    currentProductTotalIncome = currentProductTotalIncome + Number(item.price);
                    currentProductTotalIncome = Math.round(100*currentProductTotalIncome)/100;
                    currentProductTotalIncome = currentProductTotalIncome.toString();
                    if(!currentProductTotalIncome.includes('.')) currentProductTotalIncome = `${currentProductTotalIncome}.00`;
                    dbcon.query(`UPDATE products SET overallprofit="${currentProductTotalIncome}" WHERE uniqueid="${row[0].uniqueid}"`, async (err, row) => {
                        if(err) throw err;
                    });
                });
                receiptItems.push({
                    "uniqueid": item.uniqueid,
                    "name": item.name,
                    "price": item.price
                });
                receiptItemsNamesEmail.push(`- ${item.name} (${config.paymentSettings.currencySymbol}${item.price})`);
                totalPrice = totalPrice + Number(item.price);
                await addCustomerRoleToUser(req.session.passport.user.id, item.uniqueid, req.session.passport.user.accessToken);
            };
            await dbcon.query(`INSERT INTO receipts (uniqueid, buyerid, items, payment, datetime) VALUES ('${receiptid}', '${req.session.passport.user.id}', '${JSON.stringify(receiptItems)}', '${req.params.type}', '${datetime}')`, async (err, row) => {
                if(err) throw err;
            });
            dbcon.query(`SELECT * FROM sitesettings`, async (err, row) => {
                if(err) throw err;
                let currentSettingsTotalIncome = Number(row[0].totalincome); 
                currentSettingsTotalIncome = currentSettingsTotalIncome + totalPrice;
                currentSettingsTotalIncome = Math.round(100*currentSettingsTotalIncome)/100;
                currentSettingsTotalIncome = currentSettingsTotalIncome.toString();
                if(!currentSettingsTotalIncome.includes('.')) currentSettingsTotalIncome = `${currentSettingsTotalIncome}.00`;
                dbcon.query(`UPDATE sitesettings SET totalincome="${currentSettingsTotalIncome}"`, async (err, row) => {
                    if(err) throw err;
                });
            });
            setTimeout(function() {
                createEmail(row[0].email, "Checkout Complete!", `Hey ${row[0].username}!\n\nWe are contacting you to inform you that your checkout has been completed successfully! If you have any questions please do not hesitate to ask!\n<p style='font-weight: 600;'>Receipt Items:</p>${receiptItemsNamesEmail.join('')}\n\n\nYou can view your account and retrieve your items below!\n\n<a href='${config.domain}/account' style="color: white; text-decoration: none; padding: 0.6em; font-size: 1.4em; border-radius: 0.4em; background-color: ${storedAppVariable.locals.sitesettings.sitecolor};">View Account</a>`, "NOTIFICATIONS");
            }, 5000);
        });
        setTimeout(async () => {
            await dbcon.query(`DELETE FROM pendingpurchases WHERE uniqueid="${req.params.uniqueid}" AND userid="${req.session.passport.user.id}" LIMIT 1`, async (err, row) => {
                if(err) throw err;
            });
        }, 2000);
        await dbcon.query(`UPDATE users SET cart="[]", client=true, discount=0, giftcard='none' WHERE userid="${req.session.passport.user.id}"`, async (err, row) => {
            if(err) throw err;
        });
        audit(`Checkout Completed`, `${req.session.passport.user.username} (${req.session.passport.user.id}) completed their checkout session.`);
        return res.redirect('/account');
    });
};

async function checkoutInvoice(req, res) {
    let id2 = await utils.generateRandom(21);
    req.params.invoiceid = await utils.sanitize(req.params.invoiceid);
    if(!req.params.type) return console.log('No type in request for payment');
    let totalValueAccum = 0;
    await dbcon.query(`SELECT * FROM invoices WHERE uniqueid="${req.params.invoiceid}"`, async (err, row) => {
        if(err) throw err;
        let invoice = row[0];
        if(req.params.type == 'stripe') {
            let price;
            if(invoice.price.replace('.', '').length < 2) invoice.price = invoice.price + '0';
            if(invoice.price.replace('.', '').length < 3) invoice.price = invoice.price + '0';
            if(invoice.price.endsWith('.5')) invoice.price = invoice.price.split('.')[0] + '.49';
            if(invoice.price.includes('.')) {
                price = Number(invoice.price.replace('.', ''));
            } else {
                price = (Number(invoice.price)) * 100;
            };
            if(price < 0.51) {
                if(price == 0) {
                    await dbcon.query(`INSERT INTO pendingpurchases (uniqueid, userid, sessionid, paymenttype) VALUES ('${id2}', '${req.session.passport.user.id}', 'NO_VALUE_100_DISCOUNT_INVOICE', 'Stripe')`, async function (err, pay) { if (err) throw err; });
                    audit(`Checkout Session Created`, `${req.session.passport.user.username} (${req.session.passport.user.id}) has created a checkout session.`);
                    return res.redirect(`/backend/finishcheckoutinvoice/${id2}/stripe/${req.params.invoiceid}`);
                } else {
                    return res.send('Stripe requires a minimum amount of 0.50 USD for checkout sessions.');
                };
            };
            let cartItems = [
                {
                    price_data: {
                        currency: config.paymentSettings.currency,
                        product_data: {
                            name: `Invoice #${req.params.invoiceid}`,
                            images: [
                                `${config.domain}/assets/logo.png`
                            ]
                        },
                        unit_amount: price
                    },
                    quantity: 1,
                }
            ];
            await dbcon.query(`SELECT * FROM users WHERE userid='${req.session.passport.user.id}'`, async function (err, row) { // req.session.passport.user.id AND in pending db too
                if (err) throw err;
                const session = await stripe.checkout.sessions.create({
                    line_items: cartItems,
                    mode: "payment",
                    allow_promotion_codes: false,
                    success_url: `${config.domain}/backend/finishcheckoutinvoice/${id2}/stripe/${req.params.invoiceid}`,
                    cancel_url: `${config.domain}/invoice/${req.params.invoiceid}`
                });
                await dbcon.query(`INSERT INTO pendingpurchases (uniqueid, userid, sessionid, paymenttype) VALUES ('${id2}', '${req.session.passport.user.id}', '${session.id}', 'Stripe')`, async function (err, pay) { if (err) throw err; });
                await res.redirect(session.url);
                audit(`Checkout Session Created - Invoice`, `${req.session.passport.user.username} (${req.session.passport.user.id}) has created a checkout session for their invoice.`);
            });
        } else if(req.params.type == 'paypal') {
                let price = Number(invoice.price);
                totalValueAccum = totalValueAccum + Number(price.toFixed(2));
                let item = [{
                    "name": invoice.title,
                    "unit_amount": {
                        "currency_code": config.paymentSettings.currency.toUpperCase(),
                        "value": `${price.toFixed(2)}`
                    },
                    "quantity": "1"
                }];
            if(totalValueAccum == 0) {
                await dbcon.query(`INSERT INTO pendingpurchases (uniqueid, userid, sessionid, paymenttype) VALUES ('${id2}', '${req.session.passport.user.id}', 'NO_VALUE_100_DISCOUNT', 'PayPal')`, async function (err, pay) { if (err) throw err; });
                audit(`Checkout Session Created`, `${req.session.passport.user.username} (${req.session.passport.user.id}) has created a checkout session.`);
                return res.redirect(`/backend/finishcheckout/${id2}/paypal`);
            };
            let orderRequest = new PaypalImport.orders.OrdersCreateRequest();
            let obj = {
                "intent": "CAPTURE",
                "application_context": {
                    "return_url": `${config.domain}/backend/finishcheckoutinvoice/${id2}/paypal/${invoice.uniqueid}`,
                    "cancel_url": `${config.domain}/shop`,
                    "brand_name": `${storedAppVariable.locals.sitesettings.sitename}`,
                    "user_action": "PAY_NOW"
                },
                "purchase_units": [
                    {
                        "items": item,
                        "amount": {
                            "currency_code": config.paymentSettings.currency.toUpperCase(),
                            "value": `${totalValueAccum.toString()}`,
                            "breakdown": {
                                "item_total": { "value": totalValueAccum.toString(), "currency_code": config.paymentSettings.currency.toUpperCase() }
                            }
                        },
                        "reference_id": "2",
                        "description": `Invoice Id: ${invoice.uniqueid} Account Id: ${req.session.passport.user.id} TOS - ${config.domain}/tos`
                    }
                ]
            };
            orderRequest.requestBody(obj);
            let makecall = await paypalClient.execute(orderRequest);
            await res.redirect(makecall.result.links.filter(a => a.rel == 'approve')[0].href);
            await dbcon.query(`INSERT INTO pendingpurchases (uniqueid, userid, sessionid, paymenttype) VALUES ('${id2}', '${req.session.passport.user.id}', '${makecall.result.id}', 'PayPal')`, async function (err, pay) { if (err) throw err; });
        };
    });
};

async function completeCheckoutInvoice(req, res) {
    if(!req.params.uniqueid) return console.log('No uniqueid in invoice completion ticket after payment.');
    req.params.uniqueid = await utils.sanitize(req.params.uniqueid);
    req.params.type = await utils.sanitize(req.params.type);
    req.params.invoiceid = await utils.sanitize(req.params.invoiceid);
    await dbcon.query(`SELECT * FROM pendingpurchases WHERE uniqueid="${req.params.uniqueid}" AND userid="${req.session.passport.user.id}"`, async (err, row) => {
        if(err) throw err;
        if(!row[0]) return res.redirect('/404');
        if(row[0].paymenttype == 'PayPal') {
            try {
                let executePayment = new PaypalImport.orders.OrdersCaptureRequest(row[0].sessionid);
                executePayment.requestBody({});
                let pingPaypalForStupidStuffNow = await paypalClient.execute(executePayment);
                if(pingPaypalForStupidStuffNow?.statusCode != 201) return res.send('PayPal payment error. Declined (E04)');
                if(pingPaypalForStupidStuffNow?.result?.status != 'COMPLETED') {
                    return res.send('PayPal payment error (E02).');
                };
            } catch(e) {
                if(config.debugMode) console.log(e);
                return res.send('PayPal payment error (E03).');
            };
        };
        await dbcon.query(`DELETE FROM pendingpurchases WHERE uniqueid="${req.params.uniqueid}" AND userid="${req.session.passport.user.id}" LIMIT 1`, async (err, row) => {
            if(err) throw err;
        });
        await dbcon.query(`UPDATE users SET client=true WHERE userid="${req.session.passport.user.id}"`, async (err, row) => {
            if(err) throw err;
        });
        await dbcon.query(`UPDATE invoices SET paid=true WHERE uniqueid="${req.params.invoiceid}"`, async (err, row) => {
            if(err) throw err;
        });
        await dbcon.query(`SELECT * FROM invoices WHERE uniqueid="${req.params.invoiceid}"`, async (err, row) => {
            if(err) throw err;
            let totalPrice = Number(row[0].price);
            dbcon.query(`SELECT * FROM sitesettings`, async (err, row) => {
                if(err) throw err;
                let currentSettingsTotalIncome = Number(row[0].totalincome); 
                currentSettingsTotalIncome = currentSettingsTotalIncome + totalPrice;
                currentSettingsTotalIncome = Math.round(100*currentSettingsTotalIncome)/100;
                currentSettingsTotalIncome = currentSettingsTotalIncome.toString();
                if(!currentSettingsTotalIncome.includes('.')) currentSettingsTotalIncome = `${currentSettingsTotalIncome}.00`;
                dbcon.query(`UPDATE sitesettings SET totalincome="${currentSettingsTotalIncome}"`, async (err, row) => {
                    if(err) throw err;
                });
            });
        });
        audit(`Invoice Checkout Completed`, `${req.session.passport.user.username} (${req.session.passport.user.id}) completed their checkout session for their invoice.`);
        return res.redirect(`/invoice/${req.params.invoiceid}`);
    });
};

async function checkoutGiftcard(req, res) {
    let id2 = await utils.generateRandom(21);
    req.params.giftcardid = await utils.sanitize(req.params.giftcardid);
    if(!req.params.type) return console.log('No type in request for payment');
    let totalValueAccum = 0;
    await dbcon.query(`SELECT * FROM giftcards WHERE uniqueid="${req.params.giftcardid}"`, async (err, row) => {
        if(err) throw err;
        let giftcard = row[0];
        if(req.params.type == 'stripe') {
            let price;
            if(giftcard.amount.replace('.', '').length < 2) giftcard.amount = giftcard.amount + '0';
            if(giftcard.amount.replace('.', '').length < 3) giftcard.amount = giftcard.amount + '0';
            if(giftcard.amount.endsWith('.5')) giftcard.amount = giftcard.amount.split('.')[0] + '.49';
            if(giftcard.amount.includes('.')) {
                price = Number(giftcard.amount.replace('.', ''));
            } else {
                price = (Number(giftcard.amount)) * 100;
            };
            if(price < 0.51) {
                if(price == 0) {
                    await dbcon.query(`INSERT INTO pendingpurchases (uniqueid, userid, sessionid, paymenttype) VALUES ('${id2}', '${req.session.passport.user.id}', 'NO_VALUE_100_DISCOUNT_GIFTCARD', 'Stripe')`, async function (err, pay) { if (err) throw err; });
                    audit(`Checkout Session Created`, `${req.session.passport.user.username} (${req.session.passport.user.id}) has created a checkout session.`);
                    return res.redirect(`/backend/finishcheckoutgiftcard/${id2}/stripe/${req.params.giftcardid}`);
                } else {
                    return res.send('Stripe requires a minimum amount of 0.50 USD for checkout sessions.');
                };
            };
            let cartItems = [
                {
                    price_data: {
                        currency: config.paymentSettings.currency,
                        product_data: {
                            name: `${giftcard.name}`,
                            images: [
                                `${config.domain}/images/giftcard_${giftcard.uniqueid}.png`
                            ]
                        },
                        unit_amount: price
                    },
                    quantity: 1,
                }
            ];
            await dbcon.query(`SELECT * FROM users WHERE userid='${req.session.passport.user.id}'`, async function (err, row) { // req.session.passport.user.id AND in pending db too
                if (err) throw err;
                const session = await stripe.checkout.sessions.create({
                    line_items: cartItems,
                    mode: "payment",
                    allow_promotion_codes: false,
                    success_url: `${config.domain}/backend/finishcheckoutgiftcard/${id2}/stripe/${req.params.giftcardid}`,
                    cancel_url: `${config.domain}/giftcards`
                });
                await dbcon.query(`INSERT INTO pendingpurchases (uniqueid, userid, sessionid, paymenttype) VALUES ('${id2}', '${req.session.passport.user.id}', '${session.id}', 'Stripe')`, async function (err, pay) { if (err) throw err; });
                await res.redirect(session.url);
                audit(`Checkout Session Created - Giftcard`, `${req.session.passport.user.username} (${req.session.passport.user.id}) has created a checkout session for their Giftcard.`);
            });
        } else if(req.params.type == 'paypal') {
                let price = Number(giftcard.amount);
                totalValueAccum = totalValueAccum + Number(price.toFixed(2));
                let item = [{
                    "name": giftcard.name,
                    "unit_amount": {
                        "currency_code": config.paymentSettings.currency.toUpperCase(),
                        "value": `${price.toFixed(2)}`
                    },
                    "quantity": "1"
                }];
            if(totalValueAccum == 0) {
                await dbcon.query(`INSERT INTO pendingpurchases (uniqueid, userid, sessionid, paymenttype) VALUES ('${id2}', '${req.session.passport.user.id}', 'NO_VALUE_100_DISCOUNT', 'PayPal')`, async function (err, pay) { if (err) throw err; });
                audit(`Checkout Session Created`, `${req.session.passport.user.username} (${req.session.passport.user.id}) has created a checkout session.`);
                return res.redirect(`/backend/finishcheckoutgiftcard/${id2}/paypal`);
            };
            let orderRequest = new PaypalImport.orders.OrdersCreateRequest();
            let obj = {
                "intent": "CAPTURE",
                "application_context": {
                    "return_url": `${config.domain}/backend/finishcheckoutgiftcard/${id2}/paypal/${giftcard.uniqueid}`,
                    "cancel_url": `${config.domain}/shop`,
                    "brand_name": `${storedAppVariable.locals.sitesettings.sitename}`,
                    "user_action": "PAY_NOW"
                },
                "purchase_units": [
                    {
                        "items": item,
                        "amount": {
                            "currency_code": config.paymentSettings.currency.toUpperCase(),
                            "value": `${totalValueAccum.toString()}`,
                            "breakdown": {
                                "item_total": { "value": totalValueAccum.toString(), "currency_code": config.paymentSettings.currency.toUpperCase() }
                            }
                        },
                        "reference_id": "2",
                        "description": `Giftcard Id: ${giftcard.uniqueid} Account Id: ${req.session.passport.user.id} TOS - ${config.domain}/tos`
                    }
                ]
            };
            orderRequest.requestBody(obj);
            let makecall = await paypalClient.execute(orderRequest);
            await res.redirect(makecall.result.links.filter(a => a.rel == 'approve')[0].href);
            await dbcon.query(`INSERT INTO pendingpurchases (uniqueid, userid, sessionid, paymenttype) VALUES ('${id2}', '${req.session.passport.user.id}', '${makecall.result.id}', 'PayPal')`, async function (err, pay) { if (err) throw err; });
        };
    });
};

async function completeCheckoutGiftcard(req, res) {
    if(!req.params.uniqueid) return console.log('No uniqueid in giftcard completion ticket after payment.');
    req.params.uniqueid = await utils.sanitize(req.params.uniqueid);
    req.params.type = await utils.sanitize(req.params.type);
    req.params.giftcardid = await utils.sanitize(req.params.giftcardid);
    await dbcon.query(`SELECT * FROM pendingpurchases WHERE uniqueid="${req.params.uniqueid}" AND userid="${req.session.passport.user.id}"`, async (err, row) => {
        if(err) throw err;
        if(!row[0]) return res.redirect('/404');
        if(row[0].paymenttype == 'PayPal') {
            try {
                let executePayment = new PaypalImport.orders.OrdersCaptureRequest(row[0].sessionid);
                executePayment.requestBody({});
                let pingPaypalForStupidStuffNow = await paypalClient.execute(executePayment);
                if(pingPaypalForStupidStuffNow?.statusCode != 201) return res.send('PayPal payment error. Declined (E04)');
                if(pingPaypalForStupidStuffNow?.result?.status != 'COMPLETED') {
                    return res.send('PayPal payment error (E02).');
                };
            } catch(e) {
                if(config.debugMode) console.log(e);
                return res.send('PayPal payment error (E03).');
            };
        };
        await dbcon.query(`DELETE FROM pendingpurchases WHERE uniqueid="${req.params.uniqueid}" AND userid="${req.session.passport.user.id}" LIMIT 1`, async (err, row) => {
            if(err) throw err;
        });
        await dbcon.query(`UPDATE users SET client=true WHERE userid="${req.session.passport.user.id}"`, async (err, row) => {
            if(err) throw err;
        });
        await dbcon.query(`SELECT * FROM giftcards WHERE uniqueid="${req.params.giftcardid}"`, async (err, row) => {
            if(err) throw err;
            dbcon.query(`INSERT INTO ownedgiftcards (uniqueid, giftcardid, code, amount, purchaserid) VALUES ("${await utils.generateRandom(36)}", "${req.params.giftcardid}", "${await utils.generateRandom(34)}", "${row[0].amount}", "${req.session.passport.user.id}")`, function(err, row) {
                if(err) throw err;
            });
            let totalPrice = Number(row[0].amount);
            dbcon.query(`SELECT * FROM sitesettings`, async (err, row) => {
                if(err) throw err;
                let currentSettingsTotalIncome = Number(row[0].totalincome); 
                currentSettingsTotalIncome = currentSettingsTotalIncome + totalPrice;
                currentSettingsTotalIncome = Math.round(100*currentSettingsTotalIncome)/100;
                currentSettingsTotalIncome = currentSettingsTotalIncome.toString();
                if(!currentSettingsTotalIncome.includes('.')) currentSettingsTotalIncome = `${currentSettingsTotalIncome}.00`;
                dbcon.query(`UPDATE sitesettings SET totalincome="${currentSettingsTotalIncome}"`, async (err, row) => {
                    if(err) throw err;
                });
            });
        });
        audit(`Giftcard Checkout Completed`, `${req.session.passport.user.username} (${req.session.passport.user.id}) completed their checkout session for their giftcard.`);
        return res.redirect(`/account/${req.session.passport.user.id}`);
    });
};

async function checkRoleRequirements(discount, user) {
    if(discount.roleids == 'none') return true;
    let guild = await client.guilds.cache.get(storedAppVariable.locals.sitesettings.guildid);
    if(!guild) return false;
    let member = await guild.members.cache.get(user.id);
    if(!member) return false;
    let isAllowed = false;
    let roleArray = discount.roleids.replaceAll(' ', '').split(',');
    for(let roleid of roleArray) {
        if(await member.roles.cache.has(roleid)) {
            isAllowed = true;
        };
    };
    return isAllowed;
};

async function faxstoreMigration(req, res) {
    let migrationSettings = {
        host: req.body.sqlhost,
        port: req.body.sqlport,
        user: req.body.sqlusername,
        password: req.body.sqlpassword,
        database: req.body.sqldatabase
    };
    let mCon = mysql.createConnection(migrationSettings);
    await mCon.query(`SHOW TABLES;`, async function(err, row) {
        if(err) return res.send('<p><b>Invalid MySQL Information Provided / Connection Failed...</b></p><p style="color: red;">Process Cancelled.</p><a href="/admin/integration">Return back</a>');
        await backend.audit('FaxStore Migration - Started', `User ${req.session.passport.user.username} (${req.session.passport.user.id}) has started FaxStore Migration!`);
        await utils.saveFile(`${req.body.faxdomain}/assets/logo.png`, `logo`, `png`, './public/assets', false);
        let siteColor;
        // Site settings
        await mCon.query('SELECT * FROM sitesettings', async (err, faxstoreSettings) => {
            if(err) throw err;
            faxstoreSettings = faxstoreSettings[0];
            siteColor = faxstoreSettings.themecolor;
            if(faxstoreSettings.banner == '') faxstoreSettings.banner = 'none';
            await dbcon.query(`UPDATE sitesettings SET sitename="${await utils.sanitize(faxstoreSettings.sitename)}", sitedesc="${await utils.sanitize(faxstoreSettings.sitedesc, true)}", sitecolor="${faxstoreSettings.themecolor}", notification="${await utils.sanitize(faxstoreSettings.banner, true)}", homeabout="${await utils.sanitize(faxstoreSettings.sitedesc, true)}", termsofservice="${await utils.sanitize(faxstoreSettings.tos, true)}", guildid="${faxstoreSettings.discordGuildId}", globalcustomer="${faxstoreSettings.globalCustomerRole}"`, async (err, row) => {
                if(err) throw err;
            });
            await backend.resetAppLocals(app);
        });

        // Shop Items
        let shopItems = [];
        await mCon.query('SELECT * FROM storeitems', async (err, faxstoreItems) => {
            if(err) throw err;
            await faxstoreItems.forEach(async function(item) {
                if(item.title.toLowerCase().replaceAll(' ', '').includes('giftcard')) return;
                if(item.itemType != 1) return;
                let uid = await utils.generateRandom(14);
                shopItems.push({
                    name: item.title,
                    uniqueid: uid,
                    faxstoreid: item.id // Integer
                });
                await mCon.query(`SELECT * FROM productDownloads WHERE productId=${item.id}`, async (err, row) => {
                    if(err) throw err;
                    let fileType = 'zip'
                    if(row[0]?.sourceFile?.endsWith('.rar')) fileType = 'rar';
                    if(row[0]?.sourceFile?.endsWith('.7z')) fileType = '7z';
                    let zipFileName = await utils.sanitize(`${item.title.replaceAll(" ", "").replaceAll("-", "").replaceAll(',', '').toLowerCase()}_${uid}.${fileType}`);
                    await dbcon.query(`INSERT INTO products (uniqueid, name, link, description, credits, price, gallery, pos, zipfilename, givenrole) VALUES ("${uid}", "${await utils.sanitize(item.title)}", "${await utils.sanitize(item.urlId)}", "${await utils.sanitize(item.description, true)}", "${await utils.sanitize(item.credits, true)}", "${await utils.sanitize(item.price)}", "${await utils.sanitize(item.galleryImages)}", "${item.position}", "${zipFileName}", "${item.discordRole || 'none'}")`, async (err, row) => {
                        if(err) throw err;
                    });
                    await utils.saveFile(`${req.body.faxdomain}${item.featureImage}`, `product_${uid}`, `${item.featureImage.split('.').reverse()[0]}`, './public/images', false);
                });
            });
        });

        setTimeout(() => {
            res.render('migration.ejs', { shopItems: shopItems, siteColor: siteColor });
        }, 3000);

        // Owned Items
        await mCon.query(`SELECT * FROM itemsOwned`, async (err, faxstoreOwned) => {
            if(err) throw err;
            await faxstoreOwned.forEach(async function(item) {
                let uid = await shopItems.filter(i => i.faxstoreid == item.productId);
                let uniqueid = await utils.generateRandom(23);
                let thatConv = new Date(item.createdAt);
                if(typeof uid[0] != 'undefined' && uid[0]) {
                    await dbcon.query(`INSERT INTO owneditems (uniqueid, productid, userid, productname, datebought, price, receipt, licensekey, disabled, admindisabled, downloads) VALUES ("${uniqueid}", "${uid[0].uniqueid}", "${item.userId}", "${item.productName}", "${thatConv}", "${item.productPrice}", "faxstore", "${await utils.generateRandom(9)}_${await utils.generateRandom(12)}", false, false, 0)`, async (err, row) => {
                        if(err) throw err;
                    });
                };
            });
        });

        // Accounts
        await mCon.query(`SELECT * FROM users`, async (err, faxstoreUsers) => {
            if(err) throw err;
            await faxstoreUsers.forEach(async function(user) {
                await dbcon.query(`SELECT * FROM users WHERE userid="${user.userId}"`, async (err, row) => {
                    if(err) throw err;
                    if(!row[0]) {
                        await dbcon.query(`SELECT * FROM owneditems WHERE userid="${user.userId}"`, async (err, row) => {
                            if(err) throw err;
                            let isCustomerrrrr;
                            if(row[0]) {
                                isCustomerrrrr = true;
                            } else {
                                isCustomerrrrr = false;
                            };
                            await dbcon.query(`INSERT INTO users (giftcard, userid, email, username, latestip, cart, discount, note, client, mailinglist, mailendpoints) VALUES ('none', '${user.userId}', '${await utils.sanitize(user.userEmail)}', '${await utils.sanitize(user.username)}', '${user.ip}', '[]', 0, '${await utils.sanitize(user.staffnotes) || "none"}', ${isCustomerrrrr || false}, 1, '["NOTIFICATIONS", "LOGIN_SESSION"]')`, async (err, row) => {
                                if(err) throw err;
                            });
                            await utils.saveFile(`${req.body.faxdomain}${user.userImage}`, `avatar_${user.userId}`, `png`, './public/images', false);
                        });
                    };
                    if(user.banned) {
                        await dbcon.query(`INSERT INTO bannedusers (userid) VALUES ("${user.userId}")`, async (err, row) => {
                            if(err) throw err;
                        });
                    };
                });
            });
        });

        // Reviews
        await mCon.query(`SELECT * FROM reviews`, async (err, faxstoreReviews) => {
            if(err) throw err;
            await faxstoreReviews.forEach(async function(review) {
                let uid = await utils.generateRandom(13);
                let productid = await shopItems.filter(i => i.faxstoreid == review.productId);
                await dbcon.query(`INSERT INTO reviews (uniqueid, userid, username, rating, itemname, itemuniqueid, content) VALUES ("${uid}", "${review.userId}", "${review.username}", "${review.stars}", "${review.product}", "${productid}", "${review.comment}")`, async (err, row) => {
                    if(err) throw err;
                });
            });
        });

        // Receipts
        let totalPriceFaxStore = 0;
        await mCon.query(`SELECT * FROM payments`, async (err, faxstorePayments) => {
            if(err) throw err;
            await faxstorePayments.forEach(async function(payment) {
                let uid = await utils.generateRandom(24);
                let thatConv = new Date(payment.createdAt);
                let parsedOut = await JSON.parse(payment.object);
                totalPriceFaxStore = totalPriceFaxStore + Number(parsedOut.payment.total);
                let filteredParsed = await utils.sanitize(JSON.stringify(parsedOut.items), true)
                await dbcon.query(`INSERT INTO receipts (uniqueid, buyerid, payment, datetime, items) VALUES ("${uid}", "${payment.userId}", "${payment.method.replaceAll('via ', '')}", "${thatConv}", "${filteredParsed}")`, async (err, row) => {
                    if(err) throw err;
                });
            });
            setTimeout(async () => {
                dbcon.query(`SELECT * FROM sitesettings`, async (err, row) => {
                    if(err) throw err;
                    let currentSettingsTotalIncome = Number(row[0].totalincome); 
                    currentSettingsTotalIncome = currentSettingsTotalIncome + totalPriceFaxStore;
                    currentSettingsTotalIncome = Math.round(100*currentSettingsTotalIncome)/100;
                    currentSettingsTotalIncome = currentSettingsTotalIncome.toString();
                    if(!currentSettingsTotalIncome.includes('.')) currentSettingsTotalIncome = `${currentSettingsTotalIncome}.00`;
                    if(isNaN(currentSettingsTotalIncome)) currentSettingsTotalIncome = row[0].totalincome || '0.00';
                    dbcon.query(`UPDATE sitesettings SET totalincome="${currentSettingsTotalIncome}"`, async (err, row) => {
                        if(err) throw err;
                    });
                });
            }, 5000);
        });

        // Discounts
        await mCon.query(`SELECT * FROM promocodes`, async (err, faxstorePromoCodes) => {
            if(err) throw err;
            await faxstorePromoCodes.forEach(async function(daCode) {
                let uid = await utils.generateRandom(14);
                await dbcon.query(`INSERT INTO discounts (uniqueid, code, percent) VALUES ("${uid}", "${await utils.sanitize(daCode.code)}", ${Number(daCode.discount) || 5})`, async (err, row) => {
                    if(err) throw err;
                });
            });
        });

        // Static Pages
        await mCon.query(`SELECT * FROM generalPages`, async (err, faxstorePages) => {
            if(err) throw err;
            await faxstorePages.forEach(async function(page) {
                let uid = await utils.generateRandom(16);
                await dbcon.query(`INSERT INTO custompages (uniqueid, title, link, content) VALUES ("${uid}", "${await utils.sanitize(page.title)}", "${await utils.sanitize(page.shortUrl)}", "${await utils.sanitize(page.content)}")`, async (err, row) => {
                    if(err) throw err;
                });
            });
        });

        // Audit Log Entry!!!!!!
        await mCon.query(`INSERT INTO auditlogs (userId, action, details, createdAt) VALUES ("${req.session.passport.user.id}", "Migrated Store", "Has migrated to Payment System.", "${Date.now()}")`, async (err, row) => {
            if(err) throw err;
        });
        await backend.audit('FaxStore Migration - Complete', `User ${req.session.passport.user.username} (${req.session.passport.user.id}) has completed FaxStore Migration!`)
    });
};

module.exports = {
    init: init,
    checkAuth: checkAuth,
    resetAppLocals: resetAppLocals,
    audit: audit,
    randomIntFromInterval: randomIntFromInterval,
    addCustomerRoleToUser: addCustomerRoleToUser,
    logToDiscord: logToDiscord,
    createNotification: createNotification,
    createEmail: createEmail,
    checkout: checkout,
    checkoutInvoice: checkoutInvoice,
    checkoutGiftcard: checkoutGiftcard,
    completeCheckout: completeCheckout,
    completeCheckoutInvoice: completeCheckoutInvoice,
    completeCheckoutGiftcard: completeCheckoutGiftcard,
    checkRoleRequirements: checkRoleRequirements,
    faxstoreMigration: faxstoreMigration,
    checkHasRole: checkHasRole
};