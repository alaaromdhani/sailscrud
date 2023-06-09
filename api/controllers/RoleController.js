/**
 * Api/RoleController.js
 *
 * @description :: Server-side logic for managing role endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const RecordNotFoundErr = require("../../utils/errors/recordNotFound");
const SqlError = require("../../utils/errors/sqlErrors");
const ValidationError = require("../../utils/errors/validationErrors");
const { ErrorHandlor, DataHandlor } = require("../../utils/translateResponseMessage");
const schemaValidation = require("../../utils/validations");
const {RoleShema, updateRoleShema} = require("../../utils/validations/RoleSchema");


module.exports = {
  async create(req, res) {
    const bodyValidation = schemaValidation(RoleShema)(req.body)
      if(bodyValidation.isValid){

        sails.services.roleservice.create(req,req.body,(err,role)=>{
          
          if(err){
            console.log(err)
            ErrorHandlor(req,err,res)
          }
          else{
            DataHandlor(req,role,res,"role created succussfully")
          }


      })
      }
      else{
        ErrorHandlor(req,new ValidationError(bodyValidation),res)      
      
      }

  },

  async find(req, res) {
    try {
      const page = parseInt(req.query.page)+1 || 1;
      const limit = req.query.limit || 10;
      const search = req.query.search;
      const sortBy = req.query.sortBy || 'createdAt'; // Set the default sortBy attribute
      const sortOrder = req.query.sortOrder || 'DESC'; // Set the default sortOrder
      const attributes = Object.keys(Role.sequelize.models.User.rawAttributes);


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
      const { count, rows } = await Role.findAndCountAll({
        where,
        include:[{
          model:Permission,
          through:'roles_permissions',
          include:{
            model:Model,
            attributes: ['name']
          }
        },{
          model:Feature,
          through:'roles_features',
        },{
            model:User,
            foreignKey:'role_id',
            

        }],
        order,
        limit: parseInt(limit, 10),
        offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
      });

      DataHandlor(req,{
        success: true,
        data: rows,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalCount: count,
        totalPages: Math.ceil(count / parseInt(limit, 10)),
      }
      ,res)
    } catch (error) {
      ErrorHandlor(req,new SqlError(error),res)
    }
  },

  async findOne(req, res) {
    try {
      const data = await Role.findByPk(req.params.id,{
        include:{
          model:Permission,
          through:'roles_permissions',
          include:{
            model:Model,
            attributes: ['name']
          }
        }

    });
      if (!data) {
        return ErrorHandlor(req,new RecordNotFoundErr({message:'role not found'}))
      }
      return DataHandlor(req,data,res);
    } catch (err) {
      return ErrorHandlor(req,new SqlError(err),res);
    }
  },

  async update(req, res) {
    const bodyValidation = schemaValidation(updateRoleShema)(req.body)
    if(bodyValidation.isValid){

      sails.services.roleservice.update(req,req.body,(err,user)=>{
        
        if(err){
          ErrorHandlor(req,err,res)
          
        }
        else{
          DataHandlor(req,user,res)
        }


    })
    }
    else{
      ErrorHandlor(req,new ValidationError(bodyValidation),res)      
    }
  },

  async destroy(req, res) {
    try {
      const data = await Role.findByPk(req.params.id);
      if (!data) {
        return res.status(404).json({ error: 'Role not found' });
      }
      await data.destroy();
      return res.status(204).send();
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
};
