/**
 * Api/OtherInteractiveController.js
 *
 * @description :: Server-side logic for managing other_interactive endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const SqlError = require("../../utils/errors/sqlErrors");7
const fs = require('fs')
const { DataHandlor, ErrorHandlor } = require("../../utils/translateResponseMessage");


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

  async destroy(req, res) {
    try {
      const data = await OtherInteractive.findByPk(req.params.id);
      if (!data) {
        return res.status(404).json({ error: 'OtherInteractive not found' });
      }
      await data.destroy();
      return res.status(204).send();
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
};
