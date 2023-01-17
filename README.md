<h1 style="display:flex;align-items:center">
	<img src="https://xio.zuma.eu.org/new.svg" style="height:1em"/>&nbsp;XIO Server
</h1>

<div style="display:flex">

![GitHub](https://img.shields.io/github/license/zuma206/xio-server?style=flat-square)&nbsp;![GitHub commit activity](https://img.shields.io/github/commit-activity/m/zuma206/xio-server?style=flat-square)&nbsp;![GitHub last commit](https://img.shields.io/github/last-commit/zuma206/xio-server?style=flat-square)

</div>

XIO's Express server
<b>
The frontend client can be found [here](https://github.com/Zuma206/XIO),
A production instance can be found [here](https://api.xio.zuma.eu.org/).
</b>

#### Prerequisites

- Deta is used for hosting in production, so some scripts/configs are designed around it
- Firebase must be used for authentication
- Deta Base must be used for data storage

#### Getting up and running:

1. Create a `src/database/deta.ts` file, and export a `Deta` instance as default, which is initialized with your Deta project key.
2. Download a Firebase service account JSON file, and place it in `src/`, naming it `serviceAccount.json`
3. Create a `src/pusher.ts` file, and export a `Pusher` instance as default, which is initialized with your Pusher app details.
4. Follow the guide on the client's repo, configuring it with the URL of this server
5. Execute some scripts from the table below!

#### Scripts `npm run [script]`:

| Script | Function                                                    |
| ------ | ----------------------------------------------------------- |
| dev    | Spin up a development server to use and make changes to     |
| build  | Build a production build of the server to the "dist" folder |
| start  | Create a production build and boot it with "index.js"       |
