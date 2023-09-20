const sequelize = require('sequelize')
module.exports=async ()=>{
    let interactiveCourses = await OtherInteractive.findAll({where:{
        nbQuestion:0
    }})
    let questionObjects = await Obj.findAll({
        where:{
            other_interactive_id:{
                [sequelize.Op.in]:interactiveCourses.map(i=>i.id)
            },
            name:{
                [sequelize.Op.like]:'%QS'
            },
        },
        attributes:[
            [sequelize.fn('count',sequelize.col('name')),'nbQuestions'],
            'other_interactive_id'],
        group:'other_interactive_id',
    
    })
    let groupedCourses = {}
    let groupedNbQuestions = {}
    questionObjects.forEach(q=>{
        groupedNbQuestions[q.dataValues.other_interactive_id] = q.dataValues.nbQuestions
    })
   // console.log(groupedNbQuestions)
    interactiveCourses.forEach(i=>{
            i.nbQuestion = groupedNbQuestions[i.id] || i.nbQuestion 
    })
    
    return await Promise.all(interactiveCourses.filter(i=>i.changed('nbQuestion')).map(i=>i.save()))



}