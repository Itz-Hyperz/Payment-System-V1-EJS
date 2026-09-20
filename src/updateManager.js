const chalk = require('chalk');
const config = require('../config.json');
const fs = require('node:fs');
module.exports = async function(con) {

    // SQL Structure
    let data = [
        {
            tablename: "sitesettings",
            columns: [
                {
                    name: "sitename",
                    type: "TEXT",
                },
                {
                    name: "sitedesc",
                    type: "TEXT",
                },
                {
                    name: "sitecolor",
                    type: "TEXT",
                },
                {
                    name: "notification",
                    type: "TEXT",
                },
                {
                    name: "homeabout",
                    type: "TEXT",
                },
                {
                    name: "termsofservice",
                    type: "TEXT",
                },
                {
                    name: "privacypolicy",
                    type: "TEXT",
                },
                {
                    name: "cookiepolicy",
                    type: "TEXT",
                },
                {
                    name: "guildid",
                    type: "TEXT",
                },
                {
                    name: "globalcustomer",
                    type: "TEXT",
                },
                {
                    name: "totalincome",
                    type: "TEXT",
                },
                {
                    name: "loggingchannelid",
                    type: "TEXT"
                },
                {
                    name: "firewallgg",
                    type: "BOOLEAN"
                },
                {
                    name: "maintenance",
                    type: "BOOLEAN"
                },
                {
                    name: "demotext",
                    type: "TEXT"
                },
                {
                    name: "email",
                    type: "TEXT"
                },
                {
                    name: "twitter",
                    type: "TEXT"
                },
                {
                    name: "discord",
                    type: "TEXT"
                },
                {
                    name: "youtube",
                    type: "TEXT"
                },
                {
                    name: "instagram",
                    type: "TEXT"
                },
                {
                    name: "facebook",
                    type: "TEXT"
                },
                {
                    name: "tiktok",
                    type: "TEXT"
                }
            ]
        },
        {
            tablename: "navbar",
            columns: [
                {
                    name: "name",
                    type: "text"
                },
                {
                    name: "link",
                    type: "text"
                },
                {
                    name: "uniqueid",
                    type: "text"
                }
            ]
        },
        {
            tablename: "sitestyles",
            columns: [
                {
                    name: "productlist",
                    type: "INT"
                },
                {
                    name: "homepage",
                    type: "INT"
                },
                {
                    name: "homepagefeatprod",
                    type: "TEXT"
                },
                {
                    name: "homepagereviews",
                    type: "INT"
                },
                {
                    name: "teampage",
                    type: "INT"
                },
                {
                    name: "partnerspage",
                    type: "INT"
                },
                {
                    name: "reviewspage",
                    type: "INT"
                },
                {
                    name: "navbarlogo",
                    type: "INT"
                },
                {
                    name: "headerstyle",
                    type: "INT"
                },
                {
                    name: "headerchoice",
                    type: "INT"
                },
                {
                    name: "footerstyle",
                    type: "INT"
                },
                {
                    name: "footerchoice",
                    type: "INT"
                },
                {
                    name: "productgallery",
                    type: "INT"
                },
                {
                    name: "productreviews",
                    type: "INT"
                },
                {
                    name: "productcredits",
                    type: "INT"
                },
                {
                    name: "productsearch",
                    type: "INT"
                },
                {
                    name: "giftcards",
                    type: "INT"
                }
            ]
        },
        {
            tablename: "faq",
            columns: [
                {
                    name: "question",
                    type: "text"
                },
                {
                    name: "answer",
                    type: "text"
                },
                {
                    name: "uniqueid",
                    type: "text"
                },
            ]
        },
        {
            tablename: "changelogs",
            columns: [
                {
                    name: "uniqueid",
                    type: "text"
                },
                {
                    name: "title",
                    type: "text"
                },
                {
                    name: "vers",
                    type: "text"
                },
                {
                    name: "content",
                    type: "text"
                },
                {
                    name: "datetime",
                    type: "text"
                },
                {
                    name: "productid",
                    type: "TEXT"
                }
            ]
        },
        {
            tablename: "users",
            columns: [
                {
                    name: "userid",
                    type: "text"
                },
                {
                    name: "email",
                    type: "text"
                },
                {
                    name: "username",
                    type: "text"
                },
                {
                    name: "latestip",
                    type: "text"
                },
                {
                    name: "cart",
                    type: "text"
                },
                {
                    name: "discount",
                    type: "INT"
                },
                {
                    name: "giftcard",
                    type: "TEXT"
                },
                {
                    name: "note",
                    type: "text"
                },
                {
                    name: "client",
                    type: "boolean"
                },
                {
                    name: "mailinglist",
                    type: "boolean"
                },
                {
                    name: "mailendpoints",
                    type: "TEXT"
                }
            ]
        },
        {
            tablename: "products",
            columns: [
                {
                    name: "uniqueid",
                    type: "text"
                },
                {
                    name: "name",
                    type: "text"
                },
                {
                    name: "link",
                    type: "text"
                },
                {
                    name: "description",
                    type: "text"
                },
                {
                    name: "credits",
                    type: "text"
                },
                {
                    name: "price",
                    type: "text"
                },
                {
                    name: "gallery",
                    type: "text"
                },
                {
                    name: "pos",
                    type: "INT"
                },
                {
                    name: "zipfilename",
                    type: "text"
                },
                {
                    name: "givenrole",
                    type: "TEXT",
                },
                {
                    name: "hidden",
                    type: "boolean"
                },
                {
                    name: "paused",
                    type: "boolean"
                },
                {
                    name: "overallprofit",
                    type: "TEXT"
                },
                {
                    name: "overallviews",
                    type: "INT"
                },
                {
                    name: "demolink",
                    type: "TEXT"
                },
                {
                    name: "linkeditems",
                    type: "TEXT"
                },
                {
                    name: "storetags",
                    type: "TEXT"
                }
            ]
        },
        {
            tablename: "owneditems",
            columns: [
                {
                    name: "uniqueid",
                    type: "text"
                },
                {
                    name: "productid",
                    type: "text"
                },
                {
                    name: "userid",
                    type: "text"
                },
                {
                    name: "productname",
                    type: "text"
                },
                {
                    name: "datebought",
                    type: "text"
                },
                {
                    name: "price",
                    type: "text"
                },
                {
                    name: "receipt",
                    type: "text"
                },
                {
                    name: "licensekey",
                    type: "text"
                },
                {
                    name: "authorizedip",
                    type: "text"
                },
                {
                    name: "disabled",
                    type: "boolean"
                },
                {
                    name: "admindisabled",
                    type: "boolean"
                },
                {
                    name: "downloads",
                    type: "INT"
                }
            ]
        },
        {
            tablename: "owneduploads",
            columns: [
                {
                    name: "uniqueid",
                    type: "text"
                },
                {
                    name: "name",
                    type: "text"
                },
                {
                    name: "price",
                    type: "text"
                },
                {
                    name: "filename",
                    type: "text"
                },
                {
                    name: "userid",
                    type: "text"
                },
                {
                    name: "datetime",
                    type: "text"
                },
                {
                    name: "downloads",
                    type: "INT"
                }
            ]
        },
        {
            tablename: "giftcards",
            columns: [
                {
                    name: "uniqueid",
                    type: "text"
                },
                {
                    name: "name",
                    type: "text"
                },
                {
                    name: "amount",
                    type: "text"
                },
                {
                    name: "pos",
                    type: "INT"
                }
            ]
        },
        {
            tablename: "ownedgiftcards",
            columns: [
                {
                    name: "uniqueid",
                    type: "text"
                },
                {
                    name: "giftcardid",
                    type: "text"
                },
                {
                    name: "code",
                    type: "text"
                },
                {
                    name: "amount",
                    type: "text"
                },
                {
                    name: "purchaserid",
                    type: "text"
                }
            ]
        },
        {
            tablename: "storecategories",
            columns: [
                {
                    name: "name",
                    type: "text"
                },
                {
                    name: "link",
                    type: "text"
                },
                {
                    name: "uniqueid",
                    type: "text"
                },
                {
                    name: "pos",
                    type: "INT"
                },
                {
                    name: "hidden",
                    type: "boolean"
                },
                {
                    name: "description",
                    type: "text"
                },
                {
                    name: "items",
                    type: "text"
                }
            ]
        },
        {
            tablename: "storetags",
            columns: [
                {
                    name: "name",
                    type: "text"
                },
                {
                    name: "uniqueid",
                    type: "text"
                },
            ]
        },
        {
            tablename: "docscategories",
            columns: [
                {
                    name: "name",
                    type: "text"
                },
                {
                    name: "link",
                    type: "text"
                },
                {
                    name: "uniqueid",
                    type: "text"
                },
                {
                    name: "description",
                    type: "text"
                },
                {
                    name: "pos",
                    type: "INT"
                }
            ]
        },
        {
            tablename: "docsarticles",
            columns: [
                {
                    name: "title",
                    type: "text"
                },
                {
                    name: "catid",
                    type: "text"
                },
                {
                    name: "link",
                    type: "text"
                },
                {
                    name: "uniqueid",
                    type: "text"
                },
                {
                    name: "content",
                    type: "text"
                },
                {
                    name: "discordroleid",
                    type: "text"
                },
                {
                    name: "pos",
                    type: "INT"
                }
            ]
        },
        {
            tablename: "licenselogs",
            columns: [
                {
                    name: "uniqueid",
                    type: "text"
                },
                {
                    name: "owneditemuid",
                    type: "text"
                },
                {
                    name: "ipaddress",
                    type: "text"
                },
                {
                    name: "status",
                    type: "text"
                },
                {
                    name: "datetime",
                    type: "text"
                }
            ]
        },
        {
            tablename: "team",
            columns: [
                {
                    name: "uniqueid",
                    type: "TEXT"
                },
                {
                    name: "name",
                    type: "TEXT"
                },
                {
                    name: "pos",
                    type: "INT"
                },
                {
                    name: "title",
                    type: "TEXT"
                },
                {
                    name: "content",
                    type: "TEXT"
                }
            ]
        },
        {
            tablename: "partners",
            columns: [
                {
                    name: "uniqueid",
                    type: "TEXT"
                },
                {
                    name: "pos",
                    type: "INT"
                },
                {
                    name: "title",
                    type: "TEXT"
                },
                {
                    name: "content",
                    type: "TEXT"
                },
                {
                    name: "link",
                    type: "TEXT"
                }
            ]
        },
        {
            tablename: "galleryimages",
            columns: [
                {
                    name: "uniqueid",
                    type: "TEXT"
                },
                {
                    name: "imagename",
                    type: "TEXT"
                }
            ]
        },
        {
            tablename: "discounts",
            columns: [
                {
                    name: "code",
                    type: "text"
                },
                {
                    name: "percent",
                    type: "INT"
                },
                {
                    name: "roleids",
                    type: "TEXT"
                },
                {
                    name: "uniqueid",
                    type: "text"
                }
            ]
        },
        {
            tablename: "pendingpurchases",
            columns: [
                {
                    name: "uniqueid",
                    type: "text"
                },
                {
                    name: "userid",
                    type: "text"
                },
                {
                    name: "sessionid",
                    type: "text"
                },
                {
                    name: "paymenttype",
                    type: "text"
                },
                {
                    name: "leftover",
                    type: "text"
                }
            ]
        },
        {
            tablename: "receipts",
            columns: [
                {
                    name: "uniqueid",
                    type: "text"
                },
                {
                    name: "buyerid",
                    type: "text"
                },
                {
                    name: "items",
                    type: "text"
                },
                {
                    name: "payment",
                    type: "text"
                },
                {
                    name: "datetime",
                    type: "text"
                }
            ]
        },
        {
            tablename: "reviews",
            columns: [
                {
                    name: "uniqueid",
                    type: "text"
                },
                {
                    name: "userid",
                    type: "text"
                },
                {
                    name: "username",
                    type: "text"
                },
                {
                    name: "rating",
                    type: "INT"
                },
                {
                    name: "itemname",
                    type: "text"
                },
                {
                    name: "itemuniqueid",
                    type: "text"
                },
                {
                    name: "content",
                    type: "text"
                }
            ]
        },
        {
            tablename: "custompages",
            columns: [
                {
                    name: "uniqueid",
                    type: "text"
                },
                {
                    name: "title",
                    type: "text"
                },
                {
                    name: "link",
                    type: "varchar(255)"
                },
                {
                    name: "content",
                    type: "text"
                }
            ]
        },
        {
            tablename: "advertisements",
            columns: [
                {
                    name: "uniqueid",
                    type: "text"
                },
                {
                    name: "name",
                    type: "text"
                },
                {
                    name: "link",
                    type: "text"
                },
                {
                    name: "filetype",
                    type: "text"
                }
            ]
        },
        {
            tablename: "invoices",
            columns: [
                {
                    name: "uniqueid",
                    type: "text"
                },
                {
                    name: "userid",
                    type: "text"
                },
                {
                    name: "paid",
                    type: "boolean"
                },
                {
                    name: "title",
                    type: "text"
                },
                {
                    name: "description",
                    type: "text"
                },
                {
                    name: "datetime",
                    type: "text"
                },
                {
                    name: "price",
                    type: "text"
                }
            ]
        },
        {
            tablename: "auditlogs",
            columns: [
                {
                    name: "datetime",
                    type: "text"
                },
                {
                    name: "title",
                    type: "text"
                },
                {
                    name: "description",
                    type: "text"
                },
                {
                    name: "uniqueid",
                    type: "text"
                }
            ]
        },
        {
            tablename: "notifications",
            columns: [
                {
                    name: "uniqueid",
                    type: "text"
                },
                {
                    name: "userid",
                    type: "text"
                },
                {
                    name: "content",
                    type: "text"
                },
                {
                    name: "datetime",
                    type: "text"
                },
                {
                    name: "hasbeenread",
                    type: "boolean"
                }
            ]
        },
        {
            tablename: "apikeys",
            columns: [
                {
                    name: "apikey",
                    type: "text"
                },
                {
                    name: "limited",
                    type: "boolean"
                },
                {
                    name: "maxuses",
                    type: "INT"
                },
                {
                    name: "uses",
                    type: "INT"
                },
                {
                    name: "lastusedip",
                    type: "text"
                },
                {
                    name: "lastuseddate",
                    type: "text"
                },
                {
                    name: "userid",
                    type: "text"
                },
                {
                    name: "permissions",
                    type: "TEXT"
                }
            ]
        },
        {
            tablename: "bannedusers",
            columns: [
                {
                    name: "userid",
                    type: "text"
                }
            ]
        },
        {
            tablename: "staff",
            columns: [
                {
                    name: "userid",
                    type: "text"
                }
            ]
        },
    ];

    // Looping and checking if the tables are complete
    await data.forEach(async function(d) {
        let query = `CREATE TABLE ${d.tablename} (`;
        await d.columns.forEach(async function(pass) {
            if(query.endsWith('(')) {
                query = query + ` ${pass.name} ${pass.type}`;
            } else {
                query = query + `, ${pass.name} ${pass.type}`;
            };
        });
        await con.query(`SELECT * FROM ${d.tablename}`, async function(err, row) {
            if(err) {
                console.log(`${chalk.redBright('[Update Manager]')} ${d.tablename} table not found, creating...`);
                await con.query(`${query} );`, async function(err, row) {
                    if(err) throw err;
                });
            } else {
                await con.query(`SHOW COLUMNS FROM ${d.tablename}`, async function(err, row2) {
                    if(err) throw err;
                    let tbl = [];
                    await row2.forEach(async function(arow) {
                        await tbl.push(arow.Field.toLowerCase());
                    });
                    await d.columns.forEach(async function(pass) {
                        if(!tbl.includes(pass.name.toLowerCase())) {
                            console.log(`${chalk.redBright('[Update Manager]')} ${pass.name} column not found in ${d.tablename} table, creating...`);
                            await con.query(`ALTER TABLE ${d.tablename} ADD ${pass.name} ${pass.type}`, async function(err, row) {
                                if(err) throw err;
                            });
                        };
                    });
                });
            };
        });
    });

    // Extra queries needed to fix new data types
    setTimeout(async function() {
        await con.query(`SELECT * FROM products WHERE hidden IS NULL`, async (err, row) => {
            for(let item of row) {
                con.query(`UPDATE products SET hidden=false, paused=false WHERE uniqueid="${item.uniqueid}"`, async (err, row) => {
                    if(err) throw err;
                });
            };
        });
        await con.query(`SELECT * FROM products WHERE overallprofit IS NULL`, async (err, row) => {
            for(let item of row) {
                con.query(`UPDATE products SET overallprofit="0.00", overallviews=0 WHERE uniqueid="${item.uniqueid}"`, async (err, row) => {
                    if(err) throw err;
                });
            };
        });
        await con.query(`UPDATE users SET mailinglist=true, mailendpoints='["NOTIFICATIONS", "LOGIN_SESSION"]' WHERE mailinglist IS NULL`, async (err, row) => {
            if(err) throw err;
        });
        await con.query(`UPDATE sitesettings SET maintenance=false, demotext="Demo", email="none", twitter="none", discord="none", youtube="none", instagram="none", facebook="none", tiktok="none" WHERE email IS NULL`, async (err, row) => {
            if(err) throw err;
        });
        await con.query(`UPDATE sitestyles SET reviewspage=1, productcredits=1, productsearch=1 WHERE reviewspage IS NULL`, async (err, row) => {
            if(err) throw err;
        });
        await con.query(`UPDATE products SET demolink="none", linkeditems="none" WHERE demolink IS NULL`, async (err, row) => {
            if(err) throw err;
        });
        await con.query(`UPDATE discounts SET roleids="none" WHERE roleids IS NULL`, async (err, row) => {
            if(err) throw err;
        });
        await con.query(`UPDATE sitestyles SET giftcards=1 WHERE giftcards IS NULL`, async (err, row) => {
            if(err) throw err;
        });
        await con.query(`UPDATE products SET storetags="[]" WHERE storetags IS NULL`, async (err, row) => {
            if(err) throw err;
        });
        await con.query(`UPDATE users SET giftcard='none' WHERE giftcard IS NULL`, async (err, row) => {
            if(err) throw err;
        });
    }, 5000);

    let madeAChange = false;
    let newConfig = config;
    // Main Settings
    if(typeof newConfig.domain == 'undefined') { newConfig.domain = "http://localhost:3000"; console.log(`${chalk.redBright('[Update Manager]')} Config domain Created...`); madeAChange = true; };
    if(typeof newConfig.port == 'undefined') { newConfig.port = 3000; console.log(`${chalk.redBright('[Update Manager]')} Config port Created...`); madeAChange = true; };
    if(typeof newConfig.licenseKey == 'undefined') { newConfig.licenseKey = "YOUR_LICENSE_KEY"; console.log(`${chalk.redBright('[Update Manager]')} Config licenseKey Created...`); madeAChange = true; };
    if(typeof newConfig.debugMode == 'undefined') { newConfig.debugMode = false; console.log(`${chalk.redBright('[Update Manager]')} Config debugMode Created...`); madeAChange = true; };
    if(typeof newConfig.ownerIds == 'undefined') { newConfig.ownerIds = ["704094587836301392", "YOUR_USER_ID"]; console.log(`${chalk.redBright('[Update Manager]')} Config ownerIds Created...`); madeAChange = true; };
    if(typeof newConfig.importHyperzBans == 'undefined') { newConfig.importHyperzBans = true; console.log(`${chalk.redBright('[Update Manager]')} Config importHyperzBans Created...`); madeAChange = true; };
    // SQL Settings
    if(typeof newConfig.sql == 'undefined') { newConfig.sql = {}; console.log(`${chalk.redBright('[Update Manager]')} Config SQL Created...`); madeAChange = true; };
    if(typeof newConfig.sql.host == 'undefined') { newConfig.sql.host = "localhost"; console.log(`${chalk.redBright('[Update Manager]')} Config SQL host Created...`); madeAChange = true; };
    if(typeof newConfig.sql.user == 'undefined') { newConfig.sql.user = "root"; console.log(`${chalk.redBright('[Update Manager]')} Config SQL user Created...`); madeAChange = true; };
    if(typeof newConfig.sql.password == 'undefined') { newConfig.sql.password = ""; console.log(`${chalk.redBright('[Update Manager]')} Config SQL password Created...`); madeAChange = true; };
    if(typeof newConfig.sql.database == 'undefined') { newConfig.sql.database = "hyperzstore"; console.log(`${chalk.redBright('[Update Manager]')} Config SQL database Created...`); madeAChange = true; };
    // Discord Settings
    if(typeof newConfig.discord == 'undefined') { newConfig.discord = {}; console.log(`${chalk.redBright('[Update Manager]')} Config discord Created...`); madeAChange = true; };
    if(typeof newConfig.discord.oauthId == 'undefined') { newConfig.discord.oauthId = "YOUR_CLIENT_ID"; console.log(`${chalk.redBright('[Update Manager]')} Config discord oauthId Created...`); madeAChange = true; };
    if(typeof newConfig.discord.oauthToken == 'undefined') { newConfig.discord.oauthToken = "YOUR_CLIENT_SECRET"; console.log(`${chalk.redBright('[Update Manager]')} Config discord oauthToken Created...`); madeAChange = true; };
    if(typeof newConfig.discord.botToken == 'undefined') { newConfig.discord.botToken = ""; console.log(`${chalk.redBright('[Update Manager]')} Config discord botToken Created...`); madeAChange = true; };
    // Payment Settings
    if(typeof newConfig.paymentSettings == 'undefined') { newConfig.paymentSettings = {}; console.log(`${chalk.redBright('[Update Manager]')} Config paymentSettings Created...`); madeAChange = true; };
    if(typeof newConfig.paymentSettings.useStripe == 'undefined') { newConfig.paymentSettings.useStripe = false; console.log(`${chalk.redBright('[Update Manager]')} Config paymentSettings useStripe Created...`); madeAChange = true; };
    if(typeof newConfig.paymentSettings.stripePublicKey == 'undefined') { newConfig.paymentSettings.stripePublicKey = "YOUR_STRIPE_PUBLIC_KEY"; console.log(`${chalk.redBright('[Update Manager]')} Config paymentSettings stripePublicKey Created...`); madeAChange = true; };
    if(typeof newConfig.paymentSettings.stripeSecretKey == 'undefined') { newConfig.paymentSettings.stripeSecretKey = "YOUR_STRIPE_SECRET_KEY"; console.log(`${chalk.redBright('[Update Manager]')} Config paymentSettings stripeSecretKey Created...`); madeAChange = true; };
    if(typeof newConfig.paymentSettings.usePaypal == 'undefined') { newConfig.paymentSettings.usePaypal = false; console.log(`${chalk.redBright('[Update Manager]')} Config paymentSettings usePaypal Created...`); madeAChange = true; };
    if(typeof newConfig.paymentSettings.paypalClientId == 'undefined') { newConfig.paymentSettings.paypalClientId = "YOUR_PAYPAL_CLIENT_ID"; console.log(`${chalk.redBright('[Update Manager]')} Config paymentSettings paypalClientId Created...`); madeAChange = true; };
    if(typeof newConfig.paymentSettings.paypalClientSecret == 'undefined') { newConfig.paymentSettings.paypalClientSecret = "YOUR_PAYPAL_CLIENT_SECRET"; console.log(`${chalk.redBright('[Update Manager]')} Config paymentSettings paypalClientSecret Created...`); madeAChange = true; };
    if(typeof newConfig.paymentSettings.currency == 'undefined') { newConfig.paymentSettings.currency = "usd"; console.log(`${chalk.redBright('[Update Manager]')} Config paymentSettings currency Created...`); madeAChange = true; };
    if(typeof newConfig.paymentSettings.currencySymbol == 'undefined') { newConfig.paymentSettings.currencySymbol = "$"; console.log(`${chalk.redBright('[Update Manager]')} Config paymentSettings currencySymbol Created...`); madeAChange = true; };
    // Email Settings
    let replaceHTML = "<div style='padding: 1em; word-break: break-word; word-wrap: break-word;'><img src='REPLACE_DOMAIN/assets/logo.png' width='125px' height='125px' style='text-align: center; margin-left: auto; margin-right: auto;'><h2 stype='padding-bottom: 8px; width: 70%; margin-left: auto; margin-right: auto; border-bottom: solid 2px black'>REPLACE_SITENAME</h2><hr><p style='text-align: start; font-weight: 600; padding-bottom: 10px; font-size: 1.1em;'>REPLACE_SUBJECT</p> <p style='text-align: start; padding-bottom: 1em;'>REPLACE_CONTENT</p><hr><a href='REPLACE_DOMAIN/account' style='padding: 1em;' target='_blank'>Change Communication Preferences</a></div>";
    if(typeof newConfig.emails == 'undefined') { newConfig.emails = {}; console.log(`${chalk.redBright('[Update Manager]')} Config emails Created...`); madeAChange = true; };
    if(typeof newConfig.emails.enabled == 'undefined') { 
        newConfig.emails.enabled = false; console.log(`${chalk.redBright('[Update Manager]')} Config emails enabled Created...`);
        madeAChange = true;
        if(typeof newConfig.emails.transporter == 'undefined') { newConfig.emails.transporter = {}; console.log(`${chalk.redBright('[Update Manager]')} Config emails transporter Created...`); };
        if(typeof newConfig.emails.transporter.service == 'undefined') { newConfig.emails.transporter.service = 'gmail'; console.log(`${chalk.redBright('[Update Manager]')} Config emails transporter service Created...`); };
        if(typeof newConfig.emails.transporter.auth == 'undefined') { newConfig.emails.transporter.auth = {}; console.log(`${chalk.redBright('[Update Manager]')} Config emails transporter auth Created...`); };
        if(typeof newConfig.emails.transporter.auth.user == 'undefined') { newConfig.emails.transporter.auth.user = 'example@gmail.com'; console.log(`${chalk.redBright('[Update Manager]')} Config emails transporter auth user Created...`); };
        if(typeof newConfig.emails.transporter.auth.pass == 'undefined') { newConfig.emails.transporter.auth.pass = '1234'; console.log(`${chalk.redBright('[Update Manager]')} Config emails transporter auth pass Created...`); };
        if(typeof newConfig.emails.options == 'undefined') { newConfig.emails.options = {}; console.log(`${chalk.redBright('[Update Manager]')} Config emails options Created...`); };
        if(typeof newConfig.emails.options.html == 'undefined') { newConfig.emails.options.html = replaceHTML; console.log(`${chalk.redBright('[Update Manager]')} Config emails options html Created...`); };
    };
    // Timezone Settings
    if(typeof newConfig.timeZone == 'undefined') { newConfig.timeZone = {}; console.log(`${chalk.redBright('[Update Manager]')} Config timeZone Created...`); madeAChange = true; };
    if(typeof newConfig.timeZone.tz == 'undefined') { newConfig.timeZone.tz = "EST"; console.log(`${chalk.redBright('[Update Manager]')} Config timeZone tz Created...`); madeAChange = true; };
    if(typeof newConfig.timeZone.format == 'undefined') { newConfig.timeZone.format = "MM-DD-YYYY hh:mm A"; console.log(`${chalk.redBright('[Update Manager]')} Config timeZone format Created...`); madeAChange = true; };
    // Redirect Settings
    if(typeof newConfig.redirects == 'undefined') { newConfig.redirects = []; console.log(`${chalk.redBright('[Update Manager]')} Config redirects Created...`); madeAChange = true; };
    // PUSH UPDATES TO CONFIG FILE
    if(madeAChange) {
        let updatedConfig = JSON.stringify(newConfig, null, 4) + '\n';
        fs.writeFileSync('./config.json', updatedConfig);
        console.log(chalk.yellowBright('Changes were made to your config file, please restart this product again.'))
        process.exit(1);
    } else {
        setTimeout(function() {
            console.log(`${chalk.redBright('[Update Manager]')} Configuration file is up to date!`)
        }, 2000);
    };

};

// Rejection Handler
process.on('unhandledRejection', (err) => { 
    if(err.toString().replaceAll(' ', '').includes('cachedDataRejected')) {
        console.log('-----------------------------------');
        console.log('License system was messed with or invalid NodeJS version...');
        console.log(chalk.red('Please read the ToS before continuing...'));
        console.log('-----------------------------------');
        process.exit(1);
    }
});