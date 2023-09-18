/**
 * Api/SoftSkillsInteractiveController.js
 *
 * @description :: Server-side logic for managing soft_skills_interactive endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const fs = require('fs');
const path = require('path');
const { ErrorHandlor, DataHandlor } = require('../../utils/translateResponseMessage');
const UnkownError = require('../../utils/errors/UnknownError');
const RecordNotFoundErr = require('../../utils/errors/recordNotFound');
module.exports = {
  async create(req, res) {
    sails.services.softskillsservice.createInteractiveSoftSkills(req,async (err,data)=>{
      if(err){
        if(req.upload){
              const existingUpload = await SoftSkillsInteractive.findOne({
                where:{url:req.upload.path}
              })
              if(!existingUpload){
                fs.rmdir(path.join(__dirname,'../../static/softskills/'+req.upload.path),{recursive:true},(error)=>{
                  if(!error){
                    return ErrorHandlor(req,err,res)
                  }
                  else{
                    console.log(err)
                    return ErrorHandlor(req,err,res)
                  }
        
                }) 
              }
              else{
                return ErrorHandlor(req,err,res)
              }
        }
        else{
          return ErrorHandlor(req,err,res)
        }

      }
      else{
        fs.unlink(path.join(__dirname,'../../static/softskills/'+req.upload.path+'/'+req.upload.file_name+'.'+req.upload.extension),(err)=>{
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
      const attributes = Object.keys(SoftSkillsInteractive.sequelize.models.SoftSkillsInteractive.rawAttributes);


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
      const { count, rows } = await SoftSkillsInteractive.findAndCountAll({
        where,
        order,
        limit: parseInt(limit, 10),
        offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
      });

      return res.json({
        success: true,
        data: rows,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalCount: count,
        totalPages: Math.ceil(count / parseInt(limit, 10)),
      });
    } catch (error) {
      return res.serverError(error);
    }
  },

  async findOne(req, res) {
    try {
      const data = await SoftSkillsInteractive.findByPk(req.params.id);
      if (!data) {
        return res.status(404).json({ error: 'SoftSkillsInteractive not found' });
      }
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const data = await SoftSkillsInteractive.findByPk(req.params.id);
      if (!data) {
        return res.status(404).json({ error: 'SoftSkillsInteractive not found' });
      }
      const updatedSoftSkillsInteractive = await data.update(req.body);
      return res.json(updatedSoftSkillsInteractive);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async destroy(req, res) {
    try {
      const data = await SoftSkillsInteractive.findByPk(req.params.id);
      if (!data) {
        return res.status(404).json({ error: 'SoftSkillsInteractive not found' });
      }
      await data.destroy();
      return res.status(204).send();
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  accessSoftSkills:(req,res)=>{
    let where={} 
    
    SoftSkillsInteractive.findOne({where:{
      id:req.params.id,validity:true,active:true
      
    }}).then(ci=>{
      if(!ci){
          return ErrorHandlor(req,new RecordNotFoundErr(),res)
      }
      else{
          sails.services.lrsservice.generateAgent(req.user,(err,agent)=>{
                    if(err){
                          return ErrorHandlor(req,err,res)
                    }
                    else{
                    
                      //console.log(ci.url)
                      let fullUrl =  sails.config.custom.baseUrl+'softskills/'+ci.url+"/"+'index_lms.html'
                      return res.view("pages/player.ejs",{
                            url:fullUrl,
                            username:req.user.firstName +' '+req.user.firstName,
                            sex:req.user.sex.toLowerCase()
                      })
                    }


          })
      }
    }).catch(e=>{

        return ErrorHandlor(req,new RecordNotFoundErr(),res)
    })  



  },
  rateSoftSkill:(req,res)=>{
    sails.services.softskillsservice.rateSoftSkills(req,"interactive",(err,data)=>{
        if(err){
          return ErrorHandlor(req,err,res)
        }
        else{
          return DataHandlor(req,data,res)
        }
    })
  }

};
