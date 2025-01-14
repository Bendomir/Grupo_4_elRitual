// 1. Guardar al usuario en la BD RODO

// 2. Buscar al usuario que se quiere logear por su email NICO

// 3. Busccar usuario por ID NICO findByPk hecho

// 4. Editar la informacion del usuario

// 5. Eliminar usuario de la BD.
const fs = require("fs")
const bcrypt = require ('bcryptjs')
const User = {


    fileName: "./data/users.json",
    getData: function () {
        return JSON.parse(fs.readFileSync(this.fileName, "utf-8"))
    },

    generateId: function (params) {
        let allUsers = this.findAll();
        let lastUser = allUsers.pop();
        if (lastUser) {
            return lastUser.id + 1
        }
        return 1
    },

    findAll: function () {
        return this.getData()
    },
    findByPk: function (id) {
        let allUsers = this.findAll();
        let userFound = allUsers.find(oneUser => oneUser.id === id);
        return userFound;
    },
    findByField: function (field, text) {
        let allUsers = this.findAll();
        let userFound = allUsers.find(oneUser => oneUser[field] === text);
        return userFound;
    },
    delete: function (id) {
        let allUsers = this.findAll();
        let finalUsers = allUsers.filter(oneUser => oneUser.id !== id)
        fs.writeFileSync(this.fileName, JSON.stringify(finalUsers, null, " "));
        return true;
    },
    create: 
    function (userData) {
        let allUsers = this.findAll();
        let password = bcrypt.hashSync(userData.password, 10)
        let newUser = {
            id: this.generateId(),
            ...userData,
            "password": password
        }
        allUsers.push(newUser);
        fs.writeFileSync(this.fileName, JSON.stringify(allUsers, null, ' '))
        return newUser
    }
}


module.exports = User;

