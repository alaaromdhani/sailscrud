/**
 * Api/OtherInteractiveController.js
 *
 * @description :: Server-side logic for managing other_interactive endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const SqlError = require("../../utils/errors/sqlErrors");7
const fs = require('fs')
const { DataHandlor, ErrorHandlor } = require("../../utils/translateResponseMessage");
const RecordNotFoundErr = require("../../utils/errors/recordNotFound");
const path = require("path");


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
              fs.rmdir(path.join(__dirname,'../../static/other/'+req.upload.path),{recursive:true},e=>{
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

          fs.unlink(path.join(__dirname,'../../static/other/'+req.upload.path+'/'+req.upload.file_name+'.'+req.upload.extension),(err)=>{
              if(err){
                  console.log(err)
              }
                return DataHandlor(req,data,res)

          })
        }
      },'../../static/other/',type="other")
  },

  async find(req, res) {
    try {
      const page = parseInt(req.query.page)+1 || 1;
      const limit = req.query.limit || 10;
      const search = req.query.search;
      const sortBy = req.query.sortBy || 'createdAt'; // Set the default sortBy attribute
      const sortOrder = req.query.sortOrder || 'DESC'; // Set the default sortOrder
      const attributes = Object.keys(OtherInteractive.sequelize.models.OtherInteractive.rawAttributes);


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
      const order = sortBy && sortOrder ? [[sortBy, sortOrder]] : [];

      // Perform the database query with pagination, filtering, sorting, and ordering
      const { count, rows } = await OtherInteractive.findAndCountAll({
        where,
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
      },res);
    } catch (error) {
        return ErrorHandlor(req,new SqlError(error),res)
    }
  },

  async findOne(req, res) {
    try {
      const data = await OtherInteractive.findByPk(req.params.id);
      if (!data) {
        return res.status(404).json({ error: 'OtherInteractive not found' });
      }
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const data = await OtherInteractive.findByPk(req.params.id);
      if (!data) {
        return res.status(404).json({ error: 'OtherInteractive not found' });
      }
      const updatedOtherInteractive = await data.update(req.body);
      return res.json(updatedOtherInteractive);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  async accessCourse(req,res){
    let where={id:req.params.id} 
  
    OtherInteractive.findOne({where}).then(ci=>{
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
                      let endpoint = sails.config.custom.lrsOtherPoint
                      
                      let fullUrl =  sails.config.custom.baseUrl+'other/'+ci.url+"/"+'index_lms.html?actor='+tincanActor+"&endpoint="+endpoint
                      return res.view("pages/player.ejs",{
                            ci:ci,
                            url:fullUrl,
                            username:req.user.firstName+' '+req.user.lastName,
                            sex:req.user.sex.toLowerCase()
                      })
                    }


          })
      }
    }).catch(e=>{

        return ErrorHandlor(req,new RecordNotFoundErr(),res)
    })      

  },
   rateCourse:(req,res)=>{
    sails.services.otherservice.rateCourse(req,(err,data)=>{
      if(err){
        return ErrorHandlor(req,err,res)
      }
      else{
        return DataHandlor(req,data,res)
      }
    },type="interactive")
  },

  async destroy(req, res) {
    try {
      const data = await OtherInteractive.findByPk(req.params.id);
      if (!data) {
        return ErrorHandlor(req,new RecordNotFoundErr(),res);
       }
      await data.destroy();
      return DataHandlor(req,{},res);
   
    } catch (err) {
      return ErrorHandlor(req,new SqlError(err),res);
    }
  },
    getResults : async (req,res)=>{
      let result = {}
      sails.services.lrsservice.generateAgent(req.user,(err,data)=>{
          
          if(!err){
              CustomObject.findAll({where:{
                  agent_id:data.id,
                  other_interactive_id:req.params.id
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
};
