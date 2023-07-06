/**
 * Api/CoursInteractiveController.js
 *
 * @description :: Server-side logic for managing cours_interactive endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const path = require("path");
const RecordNotFoundErr = require("../../utils/errors/recordNotFound");
const SqlError = require("../../utils/errors/sqlErrors");
const { ErrorHandlor, DataHandlor } = require("../../utils/translateResponseMessage");
const fs = require('fs');
const UnkownError = require("../../utils/errors/UnknownError");
const schemaValidation = require("../../utils/validations");
const RateShema = require("../../utils/validations/RateSchema");


module.exports = {
  async create(req, res) {
    sails.services.uploadservice.zipFileUploader(req,async (err,data)=>{
      if(err){
        if(req.cours){
          try{
            await req.cours.destroy()
          }
          catch(e){
            return ErrorHandlor(req,new SqlError(e),res)
          }
        }
        else if(req.upload){
          try{
            await new Promise((resolve,reject)=>{
              fs.rmdir(path.join(__dirname,'../../static/courses/'+req.upload.path),{recursive:true},e=>{
                  if(!e){
                      return resolve()
                  }
                  else{
                    console.log(e)
                    return reject(new UnkownError())
                  }

              })
            })
          }
          catch(e){
              return ErrorHandlor(req,e,res)
          }
       }
        
        console.log(err)
        return ErrorHandlor(req,err,res) 
        
         
      }
      else{

          fs.unlink(path.join(__dirname,'../../static/courses/'+req.upload.path+'/'+req.upload.file_name+'.'+req.upload.extension),(err)=>{
              if(err){
                  console.log(err)
              }
                return DataHandlor(req,data,res)

          })
        }
      })
  },

  async find(req, res) {
    try {
      const page = parseInt(req.query.page)+1 || 1;
      const limit = req.query.limit || 10;
      const search = req.query.search;
      const sortBy = req.query.sortBy || 'createdAt'; // Set the default sortBy attribute
      const sortOrder = req.query.sortOrder || 'DESC'; // Set the default sortOrder
      const attributes = Object.keys(CoursInteractive.sequelize.models.CoursInteractive.rawAttributes);


      // Create the filter conditions based on the search query
      const where = search
        ? {
          [Sequelize.Op.or]: attributes.map((attribute) => ({
            [attribute]: {
              [Sequelize.Op.like]: '%'+search+'%',
            },
          })),
        }
        : {};

      // Create the sorting order based on the sortBy and sortOrder parameters
      const order = [[sortBy, sortOrder]];

      // Perform the database query with pagination, filtering, sorting, and ordering
      const { count, rows } = await CoursInteractive.findAndCountAll({
        where,
        include:{
          model:CoursComment,
          foreignKey:'c_interactive_id',
          include:{
             model:User,
             foreignKey:'addedBy',
             attributes:['username','lastName','firstName','email','profilePicture'] 
          }
        },
        order,
        limit: parseInt(limit, 10),
        offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
      });

      return DataHandlor(req,{
        success: true,
        data: rows,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalCount: count,
        totalPages: Math.ceil(count / parseInt(limit, 10)),
      },res)
    } catch (error) {
      return ErrorHandlor(req,new SqlError(error),res)
    }
  },

  async findOne(req, res) {
    try {
      const data = await CoursInteractive.findByPk(req.params.id);
      if (!data) {
        return ErrorHandlor(req,new RecordNotFoundErr(),res)
      }
        return DataHandlor(req,data,res)
    } catch (err) {
        return ErrorHandlor(req,new SqlError(err),res)
    }
  },

  async update(req, res) {
    sails.services.subcourseservice.updateInteractiveCourse(req,(err,data)=>{
      if(err){
          return ErrorHandlor(req,err,res)
      }
      else{
          return DataHandlor(req,data,res)
      }
    })
  },

  async destroy(req, res) {
    sails.services.subcourseservice.deleteInteractiveCourse(req,(err,data)=>{
      if(err){
          return ErrorHandlor(req,err,res)
      }
      else{
          return DataHandlor(req,data,res)
      }
    })
  },
  async accessCourse(req,res){
      let where={id:req.params.id,validity:true} 
      console.log('private courses',req.courses.private)
      if(!req.courses.private){
        where.status = "public"
      }
      CoursInteractive.findOne({where}).then(ci=>{
        if(!ci){
            return ErrorHandlor(req,new RecordNotFoundErr(),res)
        }
        else{
            sails.services.lrsservice.generateAgent(req.user,(err,agent)=>{
                      if(err){
                            return ErrorHandlor(req,err,res)
                      }
                      else{
                        const tincanActor = JSON.stringify({
                          name: agent.account_name,
                          account:[{accountName:agent.mbox,accountServiceHomePage:agent.account_name}],
                          objectType:'Agent'
                        })
                        let endpoint = sails.config.custom.lrsEndPoint
                        console.log(ci.url)
                        let fullUrl =  sails.config.custom.baseUrl+'courses/'+ci.url+"/"+'index_lms.html?actor='+tincanActor+"&endpoint="+endpoint
                        return res.view("pages/player.ejs",{
                              url:fullUrl,
                              username:req.user.username,
                              sex:req.user.sex.toLowerCase()
                        })
                      }


            })
        }
      }).catch(e=>{

          return ErrorHandlor(req,new RecordNotFoundErr(),res)
      })      

  },
  async rateCourse(req,res){
    try {
      const course = await CoursInteractive.findByPk(req.params.id,{
        include:{
          model:Course,
          foreignKey:'parent'
        }
      })
      if (course) {

        const rateCourseSchema = schemaValidation(RateShema)(req.body)
              if (rateCourseSchema.isValid) {
                  try{
                    let [rate, created] = await Rate.findOrCreate({
                      where: {
                        ratedBy: req.user.id,
                        c_interactive_id: req.params.id,
                        course_id:course.parent
                      }, defaults: {
                        ratedBy: req.user.id,
                        c_interactive_id: req.params.id,
                        course_id:course.parent,
                        rating: req.body.rating
                      }
                    })
                    if (!created) {
                      rate.rating = req.body.rating
                      await rate.save()
                    }
                    const subCourseratesCount = await Rate.findAll({
                      where: {
                        c_interactive_id: req.params.id
                      },
                      attributes: [
                        [Sequelize.fn('AVG', Sequelize.col('rating')), 'avgRating'],
                      ]
                    })
                    const parentCourseratesCount = await Rate.findAll({
                      where: {
                        course_id: course.parent
                      },
                      attributes: [
                        [Sequelize.fn('AVG', Sequelize.col('rating')), 'avgRating'],
                      ]
                    })
                    const parentCourse =course.Course 
                   
                      parentCourse.rating = parentCourseratesCount[0].dataValues.avgRating
                      course.rating = subCourseratesCount[0].dataValues.avgRating
                      await parentCourse.save()
                      return DataHandlor(req, await course.save(), res)
                  }catch(e){
                    return ErrorHandlor(req,new SqlError(e),res)
                  }
                
                } else {
                  return ErrorHandlor(req, new ValidationError({message: rateCourseSchema.message}), res)
                }
      } else {
        return ErrorHandlor(req, new RecordNotFoundErr(), res)
      }
    }
    catch(e){
      console.log(e)
      return ErrorHandlor(req,new SqlError(e),res)
    }
    


    },
    getResults : async (req,res)=>{
      console.log('here it is')
      let result = {}
      sails.services.lrsservice.generateAgent(req.user,(err,data)=>{
          if(!err){
              CustomObject.findAll({where:{
                  agent_id:data.id,
                  c_interactive_id:req.params.id
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
                            console.log(grouped)                        
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
  commentCourse:(req,res)=>{
    sails.services.subcourseservice.commentSubCourse(req,"interactive",(err,data)=>{
      if(err){
          return ErrorHandlor(req,err,res)
      }
      else{
        return DataHandlor(req,data,res)
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
              console.log(e)
              return ErrorHandlor(req,new SqlError(e),res)
            }
          }
        })




  }



  
};
