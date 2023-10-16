const Sequelize  = require("sequelize")

module.exports= ()=>{
    return  Pack.update({
        initialPrice:Sequelize.col('price')
    },{
        where:{
            initialPrice:0
        }
    })

}