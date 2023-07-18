/**
 * Api/PackController.js
 *
 * @description :: Server-side logic for managing pack endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const RecordNotFoundErr = require("../../utils/errors/recordNotFound");
const SqlError = require("../../utils/errors/sqlErrors");
const ValidationError = require("../../utils/errors/validationErrors");
const { ErrorHandlor, DataHandlor } = require("../../utils/translateResponseMessage");
const schemaValidation = require("../../utils/validations");
const { PackShemaWithoutFile } = require("../../utils/validations/PackSchema");


module.exports = {
  async create(req, res) {
      if(req.operation){
          if(req.operation.error){
              return ErrorHandlor(req,req.operation.error,res)
          }
          else{
              try{
                const photo =  await Upload.create(req.upload)
                const data = req.operation.data
                data.addedBy = req.user.id
                data.photo = photo.id
                return DataHandlor(req,await data.save(),res)
              }catch(e){
                return ErrorHandlor(req,new SqlError(e),res)
              }

          }

      }
      else{
        try{
          if(req.body.price){
            req.body.price = parseInt(req.body.price)
            }
            if(req.body.duration){
                req.body.duration = parseInt(req.body.duration)
            }
            const PackValidation = schemaValidation(PackShemaWithoutFile)(req.body)
              let pack = req.body 
              pack.addedBy = req.user.id 
            if(PackValidation.isValid){
                   return DataHandlor(req,await Pack.create(pack),res) 
              }
              else{
                return ErrorHandlor(req,new ValidationError({message:PackValidation.message}),res)
              }

        }
        catch(e){
          return ErrorHandlor(req,new SqlError(e),res)
           
        }
      }
  },

  async find(req, res) {
    try {
      const page = parseInt(req.query.page)+1 || 1;
      const limit = req.query.limit || 10;
      const search = req.query.search;
      const sortBy = req.query.sortBy || 'createdAt'; // Set the default sortBy attribute
      const sortOrder = req.query.sortOrder || 'DESC'; // Set the default sortOrder
      const attributes = Object.keys(Pack.sequelize.models.Pack.rawAttributes);


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
      const { count, rows } = await Pack.findAndCountAll({
        where,
        include:{
          model:Upload,
          foreignKey:'photo'
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
      },res);
    } catch (error) {
      return ErrorHandlor(req,error,res);
    }
  },

  async findOne(req, res) {
    try {
      const data = await Pack.findByPk(req.params.id,{
        include:{
          model:Upload,
          foreignKey:'photo'
        }
      });
      if (!data) {
        return ErrorHandlor(req,new RecordNotFoundErr(),res)
      }
      return DataHandlor(req,data,res);
    } catch (err) {
      return ErrorHandlor(req,new SqlError(e),res);
    }
  },

  async update(req, res) {
      sails.services.payementservice.updatemodel(req,(err,data)=>{
        if(err){
            return ErrorHandlor(req,err,res)
        }
        else{
            return DataHandlor(req,data,res)
        }
      })
  },

  async destroy(req, res) {
    sails.services.payementservice.deleteModel(req,(err,data)=>{
      if(err){
          return ErrorHandlor(req,err,res)
      }
      else{
          return DataHandlor(req,data,res)
      }
     })
  
  },
};
