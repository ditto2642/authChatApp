# authChatApp
## What you need
* MySql installed and running (DB called `users`, but can be changed)
  * Table called `login` with these columns:
    * id (auto-counting int)
    * username (varchar(255))
    * passHash (varchar(255))
    * hashSalt (varhcar(255))
    * admin (boolean)
  * Table called `accountKeys` with these columns:
    * id (auto-counting int)
    * auth (varchar(255))
    * uses (int)
  * Table called `news` with these columns:
    * id (auto-counting int)
    * title (varchar(255))
    * ptext (text)
    * ptime (bigint)
  * node.js with the packages described in `package.json` installed
## Get started
Before anything will work, make sure you have both tables created, and you will probably want to have one row with -1 uses (which lets it be used unlimited times).

Start the server with node with a single argument being the password for the account being used on your DB (default `root`) (`node server.js dbPass`)

Go to `localhost` in your browser to access.
