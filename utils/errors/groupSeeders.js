const sequelize = require('sequelize')
module.exports = async ()=>{
    //step 1
    let modules = await Module.findAll(
        {
        include:[{
            model:Trimestre,
            through:'trimestres_modules'
        },{
            model:MatiereNiveau,
            foreignKey:'matiere_niveau_id',
         }
        ]
        
        })
    //step=1
        //let courses = []
    /*modules.forEach(m => {
        let combinationTrimestre = m.Trimestres.map(t=>t.name_ar).reduce((p,c)=>{
            return p+c
        },"")
        for(let i =0;i<10;i++){
            courses.push({
                name:'course of '+combinationTrimestre+' number '+i,
                description:' combination of '+combinationTrimestre+' number '+i+' module '+m.name,
                type:'cours',
                order:i+1,
                niveau_scolaire_id:m.MatiereNiveau.NiveauScolaireId,
                module_id:m.id,
                matiere_id:m.MatiereNiveau.MatiereId,
                matiere_niveau_id:m.MatiereNiveau.id,
                rating:0
            })
        }
        
    });
    return await Course.bulkCreate(courses)*/
    //step2
   /* let documentCourses = []
    let courses= await Course.findAll()
    courses.forEach((element,index) => {
        for(let i=0;i<5;i++){
            documentCourses.push({
                name:element.name+index+"number "+i,
                description:index+""+element.description,
                rating:0,
                parent:element.id,
                active:true,
                validity:true,
                order:i+index
            })
        }
    });
    return await CoursDocument.bulkCreate(documentCourses)*/
    //done
    // step number of question 
    //toBE EXECUTED ONCE
    let interactiveCourses = await CoursInteractive.findAll({where:{
        nbQuestion:0
    }})
    let questionObjects = await Obj.findAll({
        where:{
            name:{
                [sequelize.Op.like]:'%QS'
            },
            
            
            
        },
        attributes:[
            [sequelize.fn('count',sequelize.col('name')),'nbQuestions'],
            'c_interactive_id'],
        group:'c_interactive_id'
    
    })
    let groupedCourses = {}
    let groupedNbQuestions = {}
    questionObjects.forEach(q=>{
        groupedNbQuestions[q.dataValues.c_interactive_id] = q.dataValues.nbQuestions
    })
   // console.log(groupedNbQuestions)
    interactiveCourses.forEach(i=>{
            i.nbQuestion = groupedNbQuestions[i.id] || i.nbQuestion 
    })
    
    return await Promise.all(interactiveCourses.filter(i=>i.changed('nbQuestion')).map(i=>i.save()))



}
