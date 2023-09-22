const resolveError = require("../../utils/errors/resolveError")
const SqlError = require("../../utils/errors/sqlErrors")
const ValidationError = require("../../utils/errors/validationErrors")
const { DataHandlor, ErrorHandlor } = require("../../utils/translateResponseMessage")

module.exports = {
    //classrooms routes
    createClassroom:async (req,res)=>{
        try{
            await sails.services.teacherhomeservice.classroom.createClassroom(req)
            return DataHandlor(req,{message:'تم إنشاء الفصل الدراسي بنجاح'},res) 
            
        }catch(e){

            return ErrorHandlor(req,resolveError(e),res)
        }
    },
    getAvailableSchoolLevels:async (req,res)=>{
        try{
            return DataHandlor(req,await sails.services.teacherhomeservice.classroom.getAvailableSchoolLevels(req),res)
        }catch(e){
            return ErrorHandlor(req,resolveError(e),res)
        }

    },
    getTrimestres:async (req,res)=>{
        try{
            return DataHandlor(req,await sails.services.teacherhomeservice.classroom.getTrimestres(req),res)
        }catch(e){
            return ErrorHandlor(req,resolveError(e),res)
        }

    },
    getAllClassRooms:async (req,res)=>{
        try{
            return DataHandlor(req,await sails.services.teacherhomeservice.classroom.getAllClassRooms(req),res)
        }catch(e){
            return ErrorHandlor(req,resolveError(e),res)
        }

    },
    getPayableTrimestre:async(req,res)=>{
        try{
            return DataHandlor(req,await sails.services.teacherhomeservice.cart.getPayableTrimestres(req),res)
        }catch(e){
            console.log(e)
            return ErrorHandlor(req,resolveError(e),res)
        }
    },
    canAddFourthTrimestre:async (req,res)=>{
        try{
            return DataHandlor(req,await sails.services.teacherhomeservice.cart.canAddFourthTrimestre(req),res)
        }
        catch(e){
            console.log(e)
            return ErrorHandlor(req,resolveError(e),res)
        }
    },
    addToCart:async (req,res)=>{
        try{
            await sails.services.teacherhomeservice.cart.addToCart(req)
            return DataHandlor(req,{message:'تمت الإضافة إلى سلة التسوق بنجاح'},res)
        }catch(e){
            return ErrorHandlor(req,resolveError(e),res)
        }

    },
    readCart:async (req,res)=>{
        try{
            return DataHandlor(req,await sails.services.teacherhomeservice.cart.readCart(req),res)
        }catch(e){
            return ErrorHandlor(req,resolveError(e),res)
        }
    },
    removeFromCart:async (req,res)=>{
        try{
            await sails.services.teacherhomeservice.cart.removeFromCart(req)
            return DataHandlor(req,{message:'تم الحذف من سلة التسوق بنجاح'},res)
        }catch(e){
       
            return ErrorHandlor(req,resolveError(e),res)
        }
    },
    createOrder:async(req,res)=>{
        try{
            return DataHandlor(req,await sails.services.teacherhomeservice.order.createOrder(req),res)
        }catch(e){
            return ErrorHandlor(req,resolveError(e),res)
        }


    },
    getOrder:async (req,res)=>{
        try{
            return DataHandlor(req,await sails.services.teacherhomeservice.order.getOrder(req),res)
        }
        catch(e){
            console.log(e)
            return ErrorHandlor(req,resolveError(e),res)
        }
    },
    findAllOrders:async (req,res)=>{
        try{
            return DataHandlor(req,await sails.services.teacherhomeservice.order.findAllOrders(req),res)
        }catch(e){
            return ErrorHandlor(req,resolveError(e),res)

        }
    },
    applicateCoupon:async (req,res)=>{
        try{
            return DataHandlor(req,await sails.services.teacherhomeservice.order.applicateCoupon(req),res)
        }catch(e){
            return ErrorHandlor(req,resolveError(e),res)
        }
     },
     createAdresse:async (req,res)=>{
        try{
            return DataHandlor(req,await sails.services.teacherhomeservice.order.createAdresse(req),res)
        }catch(e){
            return ErrorHandlor(req,resolveError(e),res)
        }
     },
     getAdresses:async (req,res)=>{
        try{
            let data =await  Adresse.findAll({
                where:{
                  addedBy:req.user.id
                },
                attributes:['adresse','postal_code','phonenumber','state_id'],
                include:{
                    model:State,
                    foreignKey:'state_id',
                    attributes:['name']
                }
            })
            return DataHandlor(req,data,res)
        }catch(e){
            return ErrorHandlor(req,new SqlError(e),res)
        }
    },
     deleteAdresse:async (req,res)=>{
        try{
            return DataHandlor(req,await sails.services.teacherhomeservice.cart.deleteAdresse(req),res)
        }catch(e){
            return ErrorHandlor(req,resolveError(e),res)
        }
     },
     createLivraison:async (req,res)=>{
        try{
            return DataHandlor(req,await sails.services.teacherhomeservice.order.createLivraison(req),res)
        }catch(e){
            return ErrorHandlor(req,resolveError(e),res)
        }
     },
     payOrder:async (req,res)=>{
        const {type} = req.params
       if(type==='prepaidCard'){
                try{
                    return DataHandlor(req,await sails.services.teacherhomeservice.order.payUsingPrepaidCart(req),res)
                }catch(e){
                    return ErrorHandlor(req,resolveError(e),res)
        
                }
        }
        else if(type==='virement'){
            try{
                return DataHandlor(req,await sails.services.teacherhomeservice.order.payUsingVirement(req),res)
            }catch(e){
                return ErrorHandlor(req,resolveError(e),res)
            }
        }
        else if(type==='livraison'){
            try{
                return DataHandlor(req,await sails.services.teacherhomeservice.order.payLivraison(req),res)
            }catch(e){
                return ErrorHandlor(req,resolveError(e),res)
            }
        }
        else{
            return ErrorHandlor(req,new ValidationError({message:'الرجاء إدخال نوع دفع صالح'}),res)
        }

    },
    getMatieres:async (req,res)=>{
        try{
            return DataHandlor(req,await sails.services.teacherhomeservice.courses.getMatieres(req),res)
        }catch(e){
            console.log(e)
            return ErrorHandlor(req,resolveError(e),res)
        }
    },
    getCourses:async (req,res)=>{
        try{
            return DataHandlor(req,await sails.services.teacherhomeservice.courses.getCourses(req),res)
        }catch(e){
            console.log(e)
            return ErrorHandlor(req,resolveError(e),res)
        }
    },
    getCoursesChildren:async (req,res)=>{
        try{    
            return DataHandlor(req,await sails.services.teacherhomeservice.courses.getCoursesChildren(req),res)
        }catch(e){
            
            return ErrorHandlor(req,resolveError(e),res)           
        }

    },
    accessCourse:async (req,res)=>{
        try{
            let ci = await sails.services.teacherhomeservice.courses.accessCourse(req)
            sails.services.lrsservice.generateAgent(req.user,(err,agent)=>{
                    if(err){
                        return ErrorHandlor(req,new SqlError(err),res)
                    }
                    else{
                    const tincanActor = JSON.stringify({
                        name: agent.account_name,
                        account:[{accountName:agent.mbox,accountServiceHomePage:agent.account_name}],
                        objectType:'Agent'
                    })
                    let endpoint = sails.config.custom.lrsEndPoint
                    
                    let fullUrl =  sails.config.custom.baseUrl+'courses/'+ci.url+"/"+'index_lms.html?actor='+tincanActor+"&endpoint="+endpoint
                    return res.view("pages/player.ejs",{
                        ci:ci,
                        url:fullUrl,
                        username:req.user.firstName+' '+req.user.lastName,
                        sex:req.user.sex.toLowerCase()
                        })
                    }


                })
        }catch(e){
          
            return ErrorHandlor(req,resolveError(e),res)
        }
    },
    getResults : async (req,res)=>{
        const {courseId} = req.params
          
        sails.services.lrsservice.generateAgent(req.user,(err,data)=>{
            if(!err){
                CustomObject.findAll({where:{
                    agent_id:data.id,
                    c_interactive_id:courseId
                }
                }).then(objs=>{
                    return new Promise((resolve,reject)=>{
                        if(objs.length==0){
                            return reject({data:{status:false,message:'user did not open the course because there are no statemnets'}})
                        }
                        else{
                            return resolve(objs)
                        }
                    })
                }).then(objects=>{
                    
                   return new Promise((resolve,reject)=>{
                        let results ={}  
                       let grouped = objects.reduce((pv,cv)=>{
                                  const test = parseInt(cv.description)
                                pv[cv.name]=test?test:cv.description
                                return pv
                        },{})
                        
                        if(grouped['QST']){
                           //   console.log(grouped)                        
                            //console.log(Object.keys(grouped))
                                if(grouped['QST']!==NaN && typeof(grouped['QST'])=='number'){
                                    results.numberOfQuestion =grouped['QST']
                                    results.score =grouped['TOTAL_SCORE']
                                    results.result_slide =(grouped['Results/RESULTS']==="true")?true:false
                                
                                    results.questions = []
                                    for(let i=0;i<grouped['QST'];i++){
                                        if(grouped[(i+1)+'QS/TA'] &&grouped[(i+1)+'QS/NA']){
                                            results.questions.push({
                                                name:(i+1)+'QS',
                                                experienced:grouped[(i+1)+'QS/QS']=='true'?true:false,
                                                results: {
                                                  TA:  grouped[(i+1)+'QS/TA'],
                                                  NA:grouped[(i+1)+'QS/NA']
                                                }
  
                                            })
  
                                        }
                                        else{
                                            results.questions.push({
                                                name:(i+1)+'QS',
                                                experienced:grouped[(i+1)+'QS/TA']=='true'?true:false,
                                            })
                                        }     
                                    }       
                                    return resolve(results)
                                }   
                                else{
                                    return reject({data:{status:false,message:'input error'}})
                                } 
                        }
                        else{
                            return reject({data:{status:false,message:'still not opened the course because the total questions is still null'}})
  
                        }
                     
                        
                 
                   })
  
  
                }).then(d=>{
                    res.status(200).send({data:d})
                   }).catch(e=>{
                    res.status(200).send({data:e})
  
                   })
  
            }
            else{
  
              return ErrorHandlor(req,err,res)
            }
            
  
  
        })
  
  
  
    },
    clearHistory:(req,res)=>{
        sails.services.lrsservice.generateAgent(req.user,async (err,data)=>{
            if(err){
              return ErrorHandlor(req,err,res)
            }
            else{
                const agent_id = data.id
                const c_interactive_id = req.params.id
                try{
                  await Statement.destroy({
                    where:{
                      agent_id,
                      c_interactive_id
                    }
                  })
                  await ActivityState.update({deprecated:true},{
                    where:{
                      agent_id,
                      c_interactive_id
                    }
                  })
                  await CustomObject.destroy({
                    where:{
                      agent_id,
                      c_interactive_id
                    }
                  })
                  return DataHandlor(req,{},res)
                 
                }catch(e){
               //   console.log(e)
                  return ErrorHandlor(req,new SqlError(e),res)
                }
              }
            })
    
    
    
    
      },
      getExams:async (req,res)=>{
        try{
            return DataHandlor(req,await sails.services.teacherhomeservice.exams.getExams(req),res)
        }catch(e){
            console.log(e)
            return ErrorHandlor(req,resolveError(e),res)
        } 
      },
      getExamsChildren:async (req,res)=>{
        try{
            return DataHandlor(req,await sails.services.teacherhomeservice.exams.getExamsChildren(req),res)
        }catch(e){
            console.log(e)
            return ErrorHandlor(req,resolveError(e),res)
        } 
      },
      accessExams:async (req,res)=>{
        try{
            
       
                let ci = await sails.services.teacherhomeservice.exams.accessExams(req)
                sails.services.lrsservice.generateAgent(req.user,(err,agent)=>{
                        if(err){
                            return ErrorHandlor(req,new SqlError(err),res)
                        }
                        else{
                        const tincanActor = JSON.stringify({
                            name: agent.account_name,
                            account:[{accountName:agent.mbox,accountServiceHomePage:agent.account_name}],
                            objectType:'Agent'
                        })
                        let endpoint = sails.config.custom.lrsEndPoint
                        
                        let fullUrl =  sails.config.custom.baseUrl+'courses/'+ci.url+"/"+'index_lms.html?actor='+tincanActor+"&endpoint="+endpoint
                        return res.view("pages/player.ejs",{
                            ci:ci,
                            url:fullUrl,
                            username:req.user.firstName+' '+req.user.lastName,
                            sex:req.user.sex.toLowerCase()
                            })
                        }
    
    
                    })
            }catch(e){
              
                return ErrorHandlor(req,resolveError(e),res)
            }
       


      }
    

    





}