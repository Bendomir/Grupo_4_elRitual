module.exports = (sequelize, DataTypes) => {

    let alias = 'Carts';
    
    let cols = {
        cart_id:{
            type: DataTypes.INTEGER,
            primaryKey:true,
            allowNull: false,
            autoIncrement:true,
            unsigned: true
        },
        quantity:{
            type: DataTypes.TINYINT,
            allowNull: false
        },
        createdAt:{
            type: DataTypes.DATE
        },
        updatedAt:{
            type: DataTypes.DATE
        }
    };
    
    let config = {
    
        tableName: 'carts',
        timestamp: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
    
    const Cart = sequelize.define(alias, cols, config)

    Cart.associate = function (models) {
        Cart.belongsTo (models.Products, {
            as: "productCart",
            foreignKey: "product_id"
        })
    }

    Cart.associate = function (models) {
        Cart.belongsTo(models.Users, {
            as: "usersCart",
            foreignKey: "user_id"
        })
    }

    
    return Cart
    }
    