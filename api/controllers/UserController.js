/**
 * Api/UserController.js
 *
 * @description :: Server-side logic for managing user endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const { Op } = require("sequelize");
const ValidationError = require("../../utils/errors/validationErrors");
const schemaValidation = require("../../utils/validations");
const {UserShema, updateUserSchema} = require("../../utils/validations/UserSchema");
const { ErrorHandlor, DataHandlor } = require("../../utils/translateResponseMessage");
const SqlError = require("../../utils/errors/sqlErrors");
const RecordNotFoundErr = require("../../utils/errors/recordNotFound");


module.exports = {
  async create(req, res) {
      const bodyValidation = schemaValidation(UserShema)(req.body)
      if(bodyValidation.isValid){

        sails.services.userservice.create(req,req.body,(err,user)=>{
          console.log(err)
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

  async find(req, res) {

    try {
      const page = parseInt(req.query.page)+1 || 1;
      const limit = req.query.limit || 10;
      const search = req.query.search;
      const sortBy = req.query.sortBy || 'createdAt'; // Set the default sortBy attribute
      const sortOrder = req.query.sortOrder || 'DESC'; // Set the default sortOrder
      const attributes = Object.keys(User.sequelize.models.User.rawAttributes);
      let role_name
      if(req.query.role){
          role_name = req.query.role
      }
      // Create the filter conditions based on the search query
      let where = search
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
        let role_options = {
          model:Role,
          where:{
            weight:{
              [Op.gte]:req.role.weight
            }
          },
          foreignKey:'role_id',
          attributes:['name','weight']

       }
       if(role_name){
          role_options.where.name = role_name
       }

      // Perform the database query with pagination, filtering, sorting, and ordering
      const { count, rows } = await User.findAndCountAll({
        where,
        include:[role_options,{
        model:User,

        foreignKey:'addedBy',
        as:'adder',
        attributes:['username']


       }],
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
      return ErrorHandlor(req,new SqlError(error),res);
    }
  },

  async findOne(req, res) {
    try {
      const data = await User.findByPk(req.params.id,{
          include:[{
            model:Permission,
            through:'users_permissions',
            include:{
              model:Model,
              attributes: ['name']
            }
          },{
            model:Role,
            foreignKey:'role_id',
            attributes:['name']
          }],


      });
      if (!data) {
        return ErrorHandlor(req,{message:'user not found'},res);
      }

      return DataHandlor(req,data,res)
    } catch (err) {
      return ErrorHandlor(req,new SqlError(err),res);
    }
  },

  async update(req, res) {
    
      if(req.operation){
        if(req.operation.error){
          return ErrorHandlor(req,req.operation.error,res)
        }
        else{
            try{
              let upload = await Upload.create(req.upload) 
            let  user = req.operation.data
            user.profilePicture  = upload.link
            return DataHandlor(req,await user.save(),res)
            } 
            catch(e){
                return ErrorHandlor(req,new SqlError(e),res)
            } 

        }

      }else{
        console.log('there is not update user')
          sails.services.userservice.update(req,(err,data)=>{
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
    return sails.services.userservice.destroyUser(req,(err,data)=>{

      if(err){
        return ErrorHandlor(req,err,res)
      }
      else{
        return DataHandlor(req,data,res)
      }
    })
  },
};
