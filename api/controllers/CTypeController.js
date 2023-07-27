/**
 * Api/CTypeController.js
 *
 * @description :: Server-side logic for managing c_type endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const SqlError = require("../../utils/errors/sqlErrors");
const { ErrorHandlor, DataHandlor } = require("../../utils/translateResponseMessage");
module.exports = {
  async create(req, res) {
    if(req.operation){
      if(req.operation.error){
        return ErrorHandlor(req,req.operation.error,res)
      }
      else{
          try{
            const model = req.operation.data
            model.thumbnail  = (await Upload.create(req.upload)).id
            return DataHandlor(req,await model.save(),res)
          } 
          catch(e){
              return ErrorHandlor(req,new SqlError(e),res)
          }
        /**/
      }
    }
    else{
      sails.services.configservice.createCType(req,(err,data)=>{
        if(err){
         return ErrorHandlor(req,err,res)
        } 
        else{
         return DataHandlor(req,data,res)
        }
     })
    }
  },

  async find(req, res) {
    try {
      const page = parseInt(req.query.page)+1 || 1;
      const limit = req.query.limit || 10;
      const search = req.query.search;
      const sortBy = req.query.sortBy || 'createdAt'; // Set the default sortBy attribute
      const sortOrder = req.query.sortOrder || 'DESC'; // Set the default sortOrder
      const attributes = Object.keys(CType.sequelize.models.CType.rawAttributes);


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
      const { count, rows } = await CType.findAndCountAll({
        where,
        include:[{
          model:Upload,
          foreignKey:'thumbnail',
          attributes:['link']
        },{
          model:NiveauScolaire,
          through:'types_ns',
          attributes:['id','name_ar','name_fr']
        }],

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
      const data = await CType.findByPk(req.params.id,{include:[{
        model:Upload,
        foreignKey:'thumbnail',
        attributes:['link']
      },{
        model:NiveauScolaire,
        through:'types_ns',
        attributes:['id','name_ar','name_fr']
      }]});
      if (!data) {
        return res.status(404).json({ error: 'CType not found' });
      }
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async update(req, res) {
    if(req.operation){
      if(req.operation.error){
        return ErrorHandlor(req,req.operation.error,res)
      }
      else{
          try{
            const model = req.operation.data
            model.thumbnail  = (await Upload.create(req.upload)).id
            return DataHandlor(req,await model.save(),res)
          } 
          catch(e){
              return ErrorHandlor(req,new SqlError(e),res)
          }
        /**/
      }
    }
    else{
      sails.services.configservice.updateCType(req,(err,data)=>{
        if(err){
         return ErrorHandlor(req,err,res)
        } 
        else{
         return DataHandlor(req,data,res)
        }
     })
    }
    
  },

  async destroy(req, res) {
    sails.services.configservice.deleteCType(req,(err,data)=>{
      if(err){
        return ErrorHandlor(req,err,res)
       } 
       else{
        return DataHandlor(req,data,res)
       }  

    })
  },
};
