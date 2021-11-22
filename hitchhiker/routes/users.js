var express = require('express');
var router = express.Router();

const User = require('../model/User');
const bcrypt = require('bcryptjs');

//회원가입
router.post('/', async (req, res, next) => {
	let { password, email } = req.body;
	try {
		const userExistence = await User.findOne({ where: { email } });
		if (userExistence)
			return res.status(204).send({ error: 'not vaild email' });
		const salt = await bcrypt.genSalt(10);
		req.body.password = await bcrypt.hash(password, salt);
		let userCreate = await User.create(req.body);
		if (userCreate) return res.status(200).send('user is inserted');
		else return res.status(204).send({ error: 'fail to create user' });
	} catch (e) {
		res.status(400).send(e)
	}
});

//로그인
router.post('/login', async (req, res, next) => {
	let { password, email } = req.body;
	try {
		const userExistence = await User.findOne({ where: { email } });
		if (!userExistence) return res.status(204).send({ error: 'fail to login' });
		const check = await bcrypt.compare(password, userExistence.password);
		if (check) {

			req.session.isLoggedIn = true;
			req.session.email = email; //126번줄 테스트용
			req.session.save(() => {
				let data = {};
				data.id = userExistence.id;
				data.username = userExistence.username;
				data.email = userExistence.email;
				data.progress = userExistence.progress;
				res.status(200).send(data);
			 });
		} else {
			res.status(204).send({ error: 'fail to login' });
		}
	} catch (e) {
		res.status(400).send(e)
	}
});
//유저들조회
router.get('/', async (req, res, next) => {
	try {
		const users = await User.findAll();
		let data = users.map((user) => {
			let editUser = {};
			editUser.id = user.id;
			editUser.username = user.username;
			editUser.email = user.email;
			editUser.progress = user.progress;
			return editUser;
		});
		res.status(200).send(data);
	} catch (e) {
		res.status(400).send(e)
	}
});
//유저조회
router.get('/:id', async (req, res, next) => {
	const paramId = req.params.id;
	try {
		const userFind = await User.findOne({ where: { id: paramId } });
		if (!userFind) return res.status(500).send({ error: 'not vaild user' });
		let data = {};
		data.id = userFind.id;
		data.username = userFind.username;
		data.email = userFind.email;
		data.progress = userFind.progress;
		res.status(200).send(data);
	} catch (e){
		res.status(400).send(e)
	}
});

//유저 progress 플러스 수정
router.put('/:id', async (req, res, next) => {
	try {
		if (req.session.isLoggedIn == true) {
			const paramId = req.params.id;
			const user = await User.findOne({ where: { id: paramId } });
			user.progress = user.progress + 1;
			await user.save();
			res.status(200).send('updated user progress');
		} else {
			res.status(204).send('not valid session');
		}
	} catch (e) {
		res.status(400).send(e)
	}
});

//유저 progress 마이너스 수정
router.put('/:id', async (req, res, next) => {
	try {
	if (req.session.isLoggedIn == true) {
		const paramId = req.params.id;
		const user = await User.findOne({ where: { id: paramId } });
		if (user.progess > 0) {
			user.progress = user.progress - 1;
			await user.save();
			res.status(200).send('updated user progress');
		} else {
			res.status(204).send('user progress is less than 0');
		}
	} else {
		res.status(204).send('not valid session');
	}
	} catch (e) {
		res.status(400).send(e)
	}
});


router.delete('/logout', async (req, res, next) => {
	try {
	if (req.session.isLoggedIn == true) {
		// console.log('로그아웃하는 이메일=>', req.session.email); [테스트]특정 계정 로그인 후 로그아웃 하시면 그 계정 확인가능합니다. 
		req.session.destroy();
		res.status(200).send('logout user');
	} else {
		res.status(204).send('not valid session');
	}
	} catch (e) {
		res.status(400).send(e)
	}
})

//유저삭제(참고API)
router.delete('/:id', async (req, res, next) => {
	const paramId = req.params.id;
	await User.destroy({ where: { id: paramId } });
	res.status(200).send('removed user');
});

module.exports = router;
