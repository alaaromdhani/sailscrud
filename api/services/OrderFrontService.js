const { Op } = require("sequelize")
const ValidationError = require("../../utils/errors/validationErrors")

module.exports={
    addOrder:(req)=>{
        let ordered
        let cd
        let createdOrder
     
        return CartDetail.findAll({
            where:{
                addedBy:req.user.id
            },
            
            include:[{
                model:AnneeNiveauUser,
                foreignKey:'cart_detail_id'
            },{
                model:Pack,
                foreignKey:'pack_id'
             }]
        }).then(cartDetails=>{
            if(cartDetails.length){
                cd=cartDetails
                ordered =cartDetails.reduce((prev,curr)=>{
                  prev.ans = prev.ans.concat(curr.AnneeNiveauUsers)  
                  prev.price+=curr.price
                  prev.priceAfterReduction+=curr.priceAfterReduction
                  if(!prev.packs.map(p=>p.id).includes(curr.Pack.id)){
                    prev.packs.push(curr.Pack)
                  }
                  return prev 
                },{ans:[],price:0,priceAfterReduction:0,packs:[]}) 
                
                let today  = new Date()
                return Order.create({
                    code:today.getFullYear()+''+today.getMonth()+""+today.getDay()+""+today.getMinutes()+"-"+today.getSeconds()+Math.floor(Math.random()*100),
                    price:ordered.price,
                    priceAfterReduction:ordered.priceAfterReduction,
                    addedBy:req.user.id,
                    isCombined:(cartDetails.length>1)
                })
            }
            else{
                return Promise.reject(new ValidationError({message:'عربة التسوق فارغة'}))
            }


        }).then(order=>{
            createdOrder = order 
            return Promise.all([ordered.ans.map(a=>a.update({order_id:order.id})),CartDetail.destroy({where:{
                id:{
                    [Op.in]:cd.map(c=>c.id)
                }
            }})])
        }).then(sd=>{
           return createdOrder.addPacks(ordered.packs)
        })
    }




}