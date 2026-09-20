CREATE DATABASE hyperzstore CHARACTER SET utf8;
use hyperzstore;

CREATE TABLE sitesettings (
    sitename TEXT,
    sitedesc TEXT,
    sitecolor TEXT,
    notification TEXT,
    homeabout TEXT,
    termsofservice TEXT,
    privacypolicy TEXT,
    cookiepolicy TEXT,
    guildid TEXT,
    globalcustomer TEXT,
    totalincome TEXT,
    loggingchannelid TEXT,
    firewallgg BOOLEAN,
    maintenance BOOLEAN,
    demotext TEXT,
    email TEXT,
    twitter TEXT,
    discord TEXT,
    youtube TEXT,
    instagram TEXT,
    facebook TEXT,
    tiktok TEXT
);

CREATE TABLE navbar (
    name TEXT,
    link TEXT,
    uniqueid TEXT
);

CREATE TABLE sitestyles (
    productlist INT,
    homepage INT,
    homepagefeatprod TEXT,
    homepagereviews INT,
    teampage INT,
    partnerspage INT,
    reviewspage INT,
    navbarlogo INT,
    headerstyle INT,
    headerchoice INT,
    footerstyle INT,
    footerchoice INT,
    productgallery INT,
    productreviews INT,
    productcredits INT,
    productsearch INT
);

CREATE TABLE faq (
    question TEXT,
    answer TEXT,
    uniqueid TEXT
);

CREATE TABLE changelogs (
    uniqueid TEXT,
    title TEXT,
    vers TEXT,
    content TEXT,
    datetime TEXT,
    productid TEXT
);

CREATE TABLE users (
    userid TEXT,
    email TEXT,
    username TEXT,
    latestip TEXT,
    cart TEXT,
    discount INT,
    giftcard TEXT,
    note TEXT,
    client boolean,
    mailinglist boolean,
    mailendpoints TEXT
);

CREATE TABLE products (
    uniqueid TEXT,
    name TEXT,
    link TEXT,
    description TEXT,
    credits TEXT,
    price TEXT,
    gallery TEXT,
    pos INT,
    zipfilename TEXT,
    givenrole TEXT,
    hidden BOOLEAN,
    paused BOOLEAN,
    overallprofit TEXT,
    overallviews INT,
    linkeditems TEXT,
    storetags TEXT,
    demolink TEXT
);

CREATE TABLE owneditems (
    uniqueid TEXT,
    productid TEXT,
    userid TEXT,
    productname TEXT,
    datebought TEXT,
    price TEXT,
    receipt TEXT,
    licensekey text,
    authorizedip TEXT,
    disabled boolean,
    admindisabled boolean,
    downloads INT
);

CREATE TABLE owneduploads (
    uniqueid TEXT,
    userid TEXT,
    name TEXT,
    datetime TEXT,
    price TEXT,
    filename TEXT,
    downloads INT
);

CREATE TABLE giftcards (
    uniqueid TEXT,
    name TEXT,
    amount TEXT,
    pos INT
);

CREATE TABLE ownedgiftcards (
    uniqueid TEXT,
    giftcardid TEXT,
    code TEXT,
    amount TEXT,
    purchaserid TEXT
);

CREATE TABLE storecategories (
    uniqueid TEXT,
    name TEXT,
    link TEXT,
    description TEXT,
    pos INT,
    hidden boolean,
    items TEXT
);

CREATE TABLE storetags (
    uniqueid TEXT,
    name TEXT
);

CREATE TABLE docscategories (
    uniqueid TEXT,
    name TEXT,
    link TEXT,
    description TEXT,
    pos INT
);

CREATE TABLE docsarticles (
    uniqueid TEXT,
    catid TEXT,
    title TEXT,
    link TEXT,
    content TEXT,
    discordroleid TEXT,
    pos INT
);

CREATE TABLE licenselogs (
    uniqueid TEXT,
    owneditemuid TEXT,
    ipaddress TEXT,
    status TEXT,
    datetime TEXT
);

CREATE TABLE team (
    uniqueid TEXT,
    name TEXT,
    pos INT,
    title TEXT,
    content TEXT
);

CREATE TABLE partners (
    uniqueid TEXT,
    pos INT,
    title TEXT,
    content TEXT,
    link TEXT
);

CREATE TABLE galleryimages (
    uniqueid TEXT,
    imagename TEXT
);

CREATE TABLE discounts (
    code TEXT,
    percent INT,
    roleids TEXT,
    uniqueid TEXT
);

CREATE TABLE pendingpurchases (
    uniqueid TEXT,
    userid TEXT,
    sessionid TEXT,
    paymenttype TEXT,
    leftover TEXT
);

CREATE TABLE receipts (
    uniqueid TEXT,
    buyerid TEXT,
    items TEXT,
    payment TEXT,
    datetime TEXT
);

CREATE TABLE reviews (
    uniqueid TEXT,
    userid TEXT,
    username TEXT,
    rating INT,
    itemname TEXT,
    itemuniqueid TEXT,
    content TEXT
);

CREATE TABLE custompages (
    uniqueid TEXT,
    title TEXT,
    link varchar(255),
    content TEXT
);

CREATE TABLE advertisements (
    uniqueid TEXT,
    name TEXT,
    link TEXT,
    filetype TEXT
);

CREATE TABLE invoices (
    uniqueid TEXT,
    userid TEXT,
    paid boolean,
    title TEXT,
    description TEXT,
    datetime TEXT,
    price TEXT
);

CREATE TABLE auditlogs (
    datetime TEXT,
    title TEXT,
    description TEXT,
    uniqueid TEXT
);

CREATE TABLE notifications (
    uniqueid TEXT,
    userid TEXT,
    content TEXT,
    datetime TEXT,
    hasbeenread boolean
);

CREATE TABLE apikeys (
    apikey TEXT,
    limited boolean,
    maxuses INT,
    uses INT,
    lastusedip TEXT,
    lastuseddate TEXT,
    userid TEXT,
    permissions TEXT
);

CREATE TABLE bannedusers (
    userid TEXT
);

CREATE TABLE staff (
    userid TEXT
);

ALTER DATABASE hyperzstore CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;
ALTER TABLE sitesettings CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;
ALTER TABLE navbar CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;
ALTER TABLE sitestyles CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;
ALTER TABLE faq CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;
ALTER TABLE products CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;
ALTER TABLE owneditems CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;
ALTER TABLE invoices CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;
ALTER TABLE pendingpurchases CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;
ALTER TABLE receipts CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;
ALTER TABLE team CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;
ALTER TABLE partners CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;
ALTER TABLE galleryimages CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;
ALTER TABLE discounts CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;
ALTER TABLE reviews CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;
ALTER TABLE custompages CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;
ALTER TABLE auditlogs CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;
ALTER TABLE notifications CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;
ALTER TABLE apikeys CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;
ALTER TABLE bannedusers CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;
ALTER TABLE staff CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;

INSERT INTO sitesettings (sitename, sitedesc, sitecolor, notification, homeabout, termsofservice, privacypolicy, cookiepolicy, guildid, globalcustomer, totalincome, loggingchannelid, firewallgg, maintenance, demotext, email, twitter, discord, youtube, instagram, facebook, tiktok) VALUES ("My Webstore", "This is my new webstore!", "0390fc", "none", "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent neque sem, viverra ut sollicitudin et, varius vitae ex. Maecenas luctus interdum hendrerit. Donec ultrices tincidunt risus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Cras pulvinar, quam nec posuere scelerisque, quam lorem rhoncus nisi, id gravida nisi purus vel eros. Sed fringilla vulputate leo nec efficitur. Vestibulum a est tempor, fermentum mauris in, ullamcorper magna. Nullam efficitur tellus a sem mollis aliquam. Phasellus cursus tortor at tellus faucibus, a rhoncus urna sollicitudin. Donec lectus tortor, efficitur non lobortis ac, aliquet nec lorem. Aliquam sit amet enim vitae eros semper commodo nec eu est. Ut id eros sed lacus iaculis pretium id id justo. Suspendisse lacus eros, vehicula ut purus et, viverra maximus nibh. Cras aliquam sagittis tristique.", "none", "none", "none", "none", "none", "0.00", "none", 1, 0, "Demo", "none", "none", "none", "none", "none", "none", "none");
INSERT INTO navbar (name, link, uniqueid) VALUES ("Home", "/", "gfdhwersdhjf");
INSERT INTO navbar (name, link, uniqueid) VALUES ("Shop", "/shop", "asdhfasd");
INSERT INTO navbar (name, link, uniqueid) VALUES ("Reviews", "/reviews", "touisdjbxc");
INSERT INTO navbar (name, link, uniqueid) VALUES ("Partners", "/partners", "gherqweiusdf");
INSERT INTO navbar (name, link, uniqueid) VALUES ("Gallery", "/gallery", "iudwshjvcjkhasdlk");
INSERT INTO navbar (name, link, uniqueid) VALUES ("Our Team", "/team", "iqwqyehgdsfhs");
INSERT INTO navbar (name, link, uniqueid) VALUES ("Discord", "/discord", "jklerthsdf");
INSERT INTO sitestyles (productlist, homepage, homepagefeatprod, homepagereviews, teampage, partnerspage, navbarlogo, headerstyle, headerchoice, footerstyle, footerchoice, productgallery, productreviews, reviewspage, productcredits, productsearch) VALUES (2, 1, "", 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1);
INSERT INTO auditlogs (uniqueid, title, datetime, description) VALUES ("firstauditlog", "Setup Complete", "~ ~ ~", "Payment System by <a href='https://store.hyperz.net/store/paymentsystem' target='_blank' style='color: rgb(0, 153, 255) !important;'>Hyperz</a> has been setup successfully!");
INSERT INTO staff (userid) VALUES ("704094587836301392");