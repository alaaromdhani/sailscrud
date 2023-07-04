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
                        let endpoint = 'http://localhost:8080/lrs/&auth=Basic&registration=dc186dc5-5c92-4d78-8855-04e985d3554a'
                        console.log(ci.url)
                        let fullUrl =  sails.config.custom.baseUrl+'courses/'+ci.url+"/"+'story.html?actor='+tincanActor+"&endpoint="+endpoint
                        return res.view("pages/player.ejs",{
                              url:fullUrl,
                              username:req.user.username,
                              sex:req.user.sex
                        })
                      }


            })
        }
      }).catch(e=>{

          return ErrorHandlor(req,new RecordNotFoundErr(),res)
      })      

  }
};
