const {
	searchFileNameAndDescription,
	searchFileNameAndDescriptionAndCategory,
	loadFile,
	addFile,
	addComment
} = require('electron').remote.require('./file-manager');

export function postFile(file, router) {
	return function () {
		router.replace('/');
		addFile(file);
	};
}

export function postComment(comment) {
	return function (dispatch) {
		addComment(comment);
		dispatch({
			type: 'ADD_COMMENT',
			data: comment.text
		});
	};
}

export function searchFiles(string, category) {
	return function (dispatch) {
		var search;
		if (category) {
			search = searchFileNameAndDescriptionAndCategory(string, category);
		} else {
			search = searchFileNameAndDescription(string);
		}
		search
		.then(function (result) {
			dispatch({
				type: 'LOAD_FILES',
				data: result.map(elem => Object.assign({}, elem))
			});
		});
	};
}

export function loadFileById(id) {
	return function (dispatch) {
		loadFile(id)
		.then(function (result) {
			dispatch({
				type: 'LOAD_FILE',
				data: Object.assign({}, result)
			});
		});
	};
}
