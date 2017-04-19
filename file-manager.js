const getDocstore = require('./orbit-dao');

module.exports.searchFileNameAndDescription = function (string) {
	string = string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
	var regex = new RegExp('.*' + string + '.*', 'i');

	return getDocstore.then(docstore => {
		return docstore.query(doc => regex.test(doc.name) || regex.test(doc.description));
	});
};

module.exports.searchFileNameAndDescriptionAndCategory = function (string, category) {
	string = string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
	var regex = new RegExp('.*' + string + '.*', 'i');

	return getDocstore.then(docstore => {
		return docstore.query(doc => (regex.test(doc.name) || regex.test(doc.description)) && doc.category === category);
	});
};

module.exports.searchNameOrHash = function (name, hash) {
	return getDocstore.then(docstore => {
		return docstore.query(doc => name === doc.name || hash === doc._id);
	});
};

module.exports.addFile = function (file) {
	return getDocstore.then(docstore => {
		return docstore.put(file)
		.then(hash => console.log(`New database hash: ${hash}`));
	});
};

module.exports.addComment = function (comment) {
	return getDocstore.then(docstore => {
		var file = docstore.get(comment.fileId)[0];
		file.comments.push(comment.text);
		return docstore.put(file)
		.then(hash => console.log(`New database hash: ${hash}`));
	});
};

module.exports.loadFile = function (id) {
	return getDocstore.then(docstore => {
		return docstore.get(id)[0];
	});
};
