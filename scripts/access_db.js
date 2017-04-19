#!/usr/bin/env node

const IPFS = require('ipfs-api');
const isIPFS = require('is-ipfs');
const OrbitDB = require('orbit-db');
const inquirer = require('inquirer');
const argv = require('yargs').argv;

const settings = require('../app/settings');

const storeName = argv.d || argv.D ? settings.docstoreNameDevelopment : settings.docstoreNameProduction;

const ipfs = IPFS();

var store;

const categorySet = new Set(settings.categories);

function promptCycle() {
	var choices = [
		'search',
		'add',
		'quit'
	];
	if (argv.p || argv.P) {
		choices.push('prune');
	}
	return inquirer.prompt([
		{
			type: 'list',
			choices: choices,
			name: 'action',
			message: 'What action would you like to perform?'
		},
		{
			type: 'text',
			when: hash => hash.action === 'search',
			name: 'searchTerm',
			message: 'Search Term:'
		},
		{
			type: 'text',
			when: hash => hash.action === 'add',
			validate: text => text !== '',
			name: 'name',
			message: 'File Name:'
		},
		{
			type: 'text',
			when: hash => hash.action === 'add',
			validate: str => {
				if (isIPFS.multihash(str)) {
					return true;
				}
				return 'Not a valid multihash!';
			},
			name: 'hash',
			message: 'IPFS Hash:'
		},
		{
			type: 'list',
			when: hash => hash.action === 'add',
			choices: settings.categories,
			name: 'category',
			message: 'Category:'
		},
		{
			type: 'editor',
			when: hash => hash.action === 'add',
			validate: text => text !== '',
			name: 'description',
			message: 'Description:'
		}
	])
	.then(hash => {
		if (hash.action === 'search') {
			var string = hash.searchTerm.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
			var regex = new RegExp('.*' + string + '.*', 'i');
			var results = store.query(doc => regex.test(doc.name) || regex.test(doc.description));
			var resultChoices = results.map(result => Object.assign({}, result, {value: result._id, short: result.name}));
			const backValue = 0;
			resultChoices.push({name: 'Back', value: backValue, short: 'Back'});
			return inquirer.prompt([
				{
					type: 'list',
					choices: resultChoices,
					name: 'choice',
					message: 'Results:'
				}
			])
			.then(hash => {
				if (hash.choice !== backValue) {
					var choice = results.find(result => result._id === hash.choice);
					var comments = choice.comments.reduce(((acc, val) => acc + '        *' + val + '\n'), 'Comments:\n');
					console.log(`Name: ${choice.name}\nCategory: ${choice.category}\nDescription: ${choice.description}\nLink: http://localhost:8080/ipfs/${choice._id}\n${comments}`);
				}
				promptCycle();
			});
		} else if (hash.action === 'add') {
			var file = {
				_id: hash.hash,
				name: hash.name,
				description: hash.description,
				category: hash.category,
				comments: []
			};
			store.put(file);
			promptCycle();
		} else if (hash.action === 'prune') {
			store.query(doc => !isValid(doc)).map(doc => store.del(doc._id));
			store.query(doc => needsFix(doc)).map(doc => store.put(fix(doc)));
			promptCycle();
		} else {
			// quit
			process.exit();
		}
	});
}

function isValid(doc) {
	return isIPFS.multihash(doc._id) && doc.name !== '' && doc.description !== '' && categorySet.has(doc.category);
}

function needsFix(doc) {
	return !(doc.comments instanceof Array);
}

function fix(doc) {
	if (!(doc.comments instanceof Array)) {
		doc.comments = [];
	}
	return doc;
}

new Promise((resolve, reject) => {
	const orbitdb = new OrbitDB(ipfs);
	const docstore = orbitdb.docstore(storeName);
	store = docstore;
	docstore.events.on('ready', () => {
		resolve(docstore);
	});
	docstore.events.on('error', err => {
		reject(err);
	});
	docstore.load();
})
.then(function () {
	return promptCycle();
})
.catch(function (err) {
	console.log(err);
});
