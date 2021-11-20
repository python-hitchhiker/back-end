var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

var sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(
	'./db/my.db',
	sqlite3.OPEN_READWRITE,
	(err) => {
		if (err) {
			console.error(err.message);
		} else {
			console.log('sqlite3 connection successful');
		}
	}
);

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
db.run(
	'CREATE TABLE IF NOT EXISTS users(email, username, password, level default 0, id integer primary key autoincrement)'
);
//회원가입
//email - unique(중복유무), required, trim, lowercase, validatae(ex. 길이, @포함 ect)
//password - required, minlength, trim, validate(ex. 특수문자+대문자+숫자+소문자)
//password - bcrypt
//authorization - session? (session 컬럼)  쌩으로? passport? 복잡성?
//authorization - token? (refreshtoken 컬럼) 쌩으로 ? passport ? 복잡성?
//python 코드 예제 테이블과 m:n 구현?
app.post('/user', async (req, res) => {
	const { email, username, password } = req.body;

	try {
		let sql = 'INSERT INTO users (email, username, password) VALUES(?,?,?)';
		await db.run(sql, [email, username, password], (err) => {
			if (err) return console.error(err.message);
			console.log('A new row has been created');
		});
		console.log(email, username, password);
		res.send('new user data created!');
	} catch (e) {
		res.status(400).send(e);
	}
});

//로그인
//email - 존재유무
//password - 비교 후 처리
//authorization - session? 세션발급 및 쿠키로 응답
//authorization - token? (refreshtoken 컬럼) accesstoken 발급 및 응답 및 미들웨어
app.post('/user/login', async (req, res) => {
	const { email, password } = req.body;

	try {
		let sql = 'SELECT * FROM users where email=? and password=?';
		await db.each(sql, [email, password], (err, data) => {
			if (err) return console.error(err.message);
			console.log('data1=>', data);
			res.send(data);
		});
	} catch (e) {
		res.status(400).send(e);
	}
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
