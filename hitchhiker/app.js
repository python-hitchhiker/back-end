var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const sequelize = require('./database');
const User = require('./model/User');
const crypto = require('crypto');

var app = express();

sequelize.sync({}).then(() => console.log('db is ready'));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
//회원가입
app.post('/users', async (req, res) => {
	let { password, email } = req.body;
	try {
		const userExistence = await User.findOne({ where: { email } });
		if (userExistence)
			return res.status(500).send({ error: 'not vaild email' });
		let salt = Math.round(new Date().valueOf() * Math.random()) + '';
		req.body.password = crypto
			.createHash('sha256')
			.update(password + salt)
			.digest('hex');
		let userCreate = await User.create(req.body);
		if (userCreate) return res.send('user is inserted');
		else return res.status(500).send({ error: 'fail to create user' });
	} catch { }
});
//로그인
app.post('/users/login', async (req, res) => {
	let { password, email } = req.body;
	try {
		const userExistence = await User.findOne({ where: { email } });
		if (!userExistence) return res.status(500).send({ error: 'fail to login' });
		let salt = Math.round(new Date().valueOf() * Math.random()) + '';
		req.body.password = crypto
			.createHash('sha256')
			.update(password + salt)
			.digest('hex');
		let userFind = await User.findOne(req.body);
		if (!userFind) return res.status(500).send({ error: 'fail to login' });
		let data = {};
		data.id = userFind.id;
		data.username = userFind.username;
		data.email = userFind.email;
		data.progress = userFind.progress;
		res.send(data);
	} catch { }
});
//유저들조회
app.get('/users', async (req, res) => {
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
		res.send(data);
	} catch { }
});
//유저조회
app.get('/users/:id', async (req, res) => {
	const paramId = req.params.id;
	try {
		const userFind = await User.findOne({ where: { id: paramId } });
		if (!userFind) return res.status(500).send({ error: 'not vaild user' });
		let data = {};
		data.id = userFind.id;
		data.username = userFind.username;
		data.email = userFind.email;
		data.progress = userFind.progress;
		res.send(data);
	} catch { }
});
//유저 progress 수정
app.put('/users/:id', async (req, res) => {
	const paramId = req.params.id;
	const user = await User.findOne({ where: { id: paramId } });
	user.progress = user.progress + 1;
	await user.save();
	res.send('updated user progress');
});
//유저삭제(참고API)
app.delete('/users/:id', async (req, res) => {
	const paramId = req.params.id;
	await User.destroy({ where: { id: paramId } });
	res.send('removed user');
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
