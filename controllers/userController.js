const path = require('path');
const fs = require('fs');
const userFilePath = path.join(__dirname, '../data/users.json');
// const users = JSON.parse(fs.readFileSync(userFilePath, 'utf-8'));
const { validationResult } = require('express-validator')
const User = require("../models/User")
const bcrypt = require('bcryptjs')
const db = require('../database/models');
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const { render } = require('ejs');



const userController = {

	register: (req, res) => {

		res.render("register");
	},

	procesarRegistro: (req, res) => 
	{
		const resultValidation = validationResult(req);
		if (resultValidation.errors.length > 0) {
			return res.render('register', {
				errors: resultValidation.mapped(),
				oldData: req.body
			})
		}
		
		let userToRegister = db.Users.findAll({where:{userName: req.body.userName}})
		let emailToRegister = db.Users.findAll({where:{email: req.body.email}})

		Promise.all([userToRegister, emailToRegister])
		.then(([user, email]) =>{
			 if (user !=  0 || email != 0) {
				res.render('register', {
		 			errors:{
		 				userName:{
		 					msg:'El email ya está registrado o el nombre de usuario ya esta en uso'
		 				}
					},

					
					oldData: req.body
		 		})
		 	} 
			else {
				let img
				if (req.file) {
					img = req.file.filename
				} else {
					img = "user-default-image.png"}
	
				let password = bcrypt.hashSync(req.body.password, 10)
				let newUser = {
					'firstName': req.body.firstName,
					'lastName': req.body.lastName,
					'email': req.body.email,
					'userName': req.body.userName,
					'password': password,
					'image': img,
					'newsletter': req.body.newsletter,
					'userCategory_id' : 2
				}

				db.Users.create(newUser)
			.then(() =>{
				res.redirect('/')})
			.catch((error) =>
			console.log (error))
			}}
		)
},

	login: (req, res) => {

		// console.log("prueba")
		// console.log(bcrypt.hashSync("prueba", 10))


		res.render("login");
	},
	loginProcess: (req, res) => {
	
		const errors = validationResult(req);
			if (!errors.isEmpty()) {
			  return res.render("login", {
				errors: errors.mapped(),
			  });
			}
		  
		db.Users.findAll({
			where: {
				userName: req.body.userName
			}
		})
		.then ((userToLogin) => {
			
	
		if(userToLogin.length == 1) {
			let isOkThePassword = bcrypt.compareSync(req.body.password, (userToLogin[0].dataValues.password));
			if (isOkThePassword) {
				delete userToLogin.password;
				req.session.userLogged = userToLogin;

				let userCategory = userToLogin[0].dataValues.userCategory_id
				
				if (userCategory === 1) {
					req.session.userAdmin = userToLogin
				}
	
				if(req.body.remember_user) {
					res.cookie('userName', req.body.userName, { maxAge: (1000 * 60) * 60 })
				}
	
				return res.redirect('/user/profile');
			} 
			return res.render('login', {
				errors: {
					userName: {
						msg: 'Las credenciales son inválidas'
					}
				}
			});
		}
	
		return res.render('login', {
			errors: {
				userName: {
					msg: 'No se encuentra este usuario en nuestra base de datos'
				}
			}
		})
	});
	},

	profile: (req, res) => {
		let user = req.session.userLogged[0]
		// console.log(user)

		db.Users.findByPk(user.user_id)
		.then (user => {
				return res.render('userProfile', { user
		})})
	},

	editProfile: (req, res) => {
		return res.render('userEditProfile', {
			user: req.session.userLogged[0]
		})
	},

	storeEditProfile: (req, res) => {
		
		// let password = bcrypt.hashSync(req.body.password, 10)
		// console.log(password)
		let user = req.session.userLogged[0]
		let img
				if (req.file) {
					img = req.file.filename
				} else {
					img = user.image}
		db.Users.update({
			'firstName': req.body.firstName,
			'lastName': req.body.lastName,
			'userName': req.body.userName,
			'email': req.body.email,
			// 'password': password,
			'image': img,
			'newsletter': req.body.newsletter,
        },{
            where: {
                user_id: req.session.userLogged[0].user_id
            }
        })
		.then(() =>{
			res.redirect('/user/profile')})
		},

	userList: (req, res) => {

		db.Users.findAll()
        .then(function(users){
            res.render("usersList", { users:users })
        });
	},

	userDetail: (req, res) => {

		db.Users.findByPk(req.params.id)
        .then(function(user){
            res.render("userDetail", { user })
        });
	},

    destroy: (req, res) => {
        db.Users.destroy({
            where:{
                user_id:req.params.id
            }
        })
        res.redirect('/');

    },

	changeToAdmin: (req, res) => {
		db.Users.update({
			userCategory_id: 1
        },{
            where: {
                user_id: req.params.id
            }
        })
		.then(() =>{
			res.redirect('/user/users-list')})
		

    },

	logout: (req, res) => {
		res.clearCookie('userName');
		req.session.destroy();
		return res.redirect('/');
	},

	carrito: (req, res) => {

		res.render("carrito");
	}
}

module.exports = userController




// processLogin: function (req, res) {
	// 	let errors = validationResult(req);

	// 	if (errors.isEmpty()) {
	// 		let usersJSON = fs.readFileSync("users.json", { encoding: "utf-8" })
	// 		let users;
	// 		if (usersJSON == "") {
	// 			users = [];
	// 		} else {
	// 			users = JSON.parse(usersJSON)
	// 		}


	// 		for (let i = 0; i < users.length; i++) {
	// 			if (users[i].email == req.body.email) {
	// 				if (bcrypt.compareSync(req.body.password, users[i].password)) {
	// 					let usuarioALogearse = users[i];
	// 					break;
	// 				}
	// 			}
	// 		}
	// 		if (usuarioALogearse == undefined) {
	// 			return res.render("login", {
	// 				errors: [
	// 					{ msg: "Credenciales invalidas" }
	// 				]
	// 			})
	// 		}

	// 		req.session.usuarioALogearse = usuarioALogearse;
	// 		res.render("sucess")
	// 	} else {
	// 		return res.render("login", { errors: errors.mapped(), old: req.body })
	// 	}

	//  },










	// loginProcess: function (req, res) {
	// 	let userToLogin = User.findByField('email', req.body.email);;
	// 	if (userToLogin) {
	// 		let isOkThePassword = bcrypt.compareSync(req.body.password, userToLogin.password);


			
	// 		if (isOkThePassword) {
	// 			return res.render("index")
	// 		}
	// 		return res.render("login", {
	// 			errors: {
	// 				userName: {
	// 					msg: "Credenciales incorrectas"
	// 				}
	// 			}
	// 		});
	// 	}
	// 	return res.render("login", {
	// 		errors: {
	// 			userName: {
	// 				msg: "El usuario no se encuentra registrado"
	// 			}
	// 		}
	// 	})
	// }