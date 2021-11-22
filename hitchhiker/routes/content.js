var express = require('express');
var glob = require('glob');
var fs = require('fs');
var router = express.Router();

//컨텐츠 조회
router.get('/:page', async (req, res) => {
	const contentId = req.params.page;
	try {
		fs.readFile('./public/content/python_problem/' + contentId + '.md', 'utf8', (err, data) => {
			if (err) {
				return res.status(500).send({ error: 'not vaild content' });
			} else {
				let content = {};
				content.title = contentId;
				content.content = data;
				res.send(content);
			}
		});
	} catch {
		res.status(500).send('Internal Server Error');
	}
});

module.exports = router;
