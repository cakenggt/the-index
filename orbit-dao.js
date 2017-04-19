const {docstoreNameDevelopment, docstoreNameProduction} = require('./app/settings');

const IPFS = require('ipfs-api');
const OrbitDB = require('orbit-db');

const userId = Math.floor(Math.random() * 1000);

const docstoreName = docstoreNameProduction;

// Cannot get pubsub until this is resolved: https://github.com/ipfs/js-ipfs-api/issues/518
const ipfs = IPFS();

module.exports = new Promise(resolve => {
	const orbitdb = new OrbitDB(ipfs, userId);
	const docstore = orbitdb.docstore(docstoreName);
	docstore.events.on('ready', () => {
		resolve(docstore);
	});
	docstore.load();
});
