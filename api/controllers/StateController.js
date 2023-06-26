/**
 * Api/StateController.js
 *
 * @description :: Server-side logic for managing state endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const RecordNotFoundErr = require("../../utils/errors/recordNotFound");
const SqlError = require("../../utils/errors/sqlErrors");
const { ErrorHandlor, DataHandlor } = require("../../utils/translateResponseMessage");


module.exports = {
  async create(req, res) {
    try {
      const data = await State.create(req.body);
      return DataHandlor(req,data,res)
    } catch (err) {
      return ErrorHandlor(req,new SqlError(err),res)
    }
  },

  async find(req, res) {
    try {
      const page = parseInt(req.query.page)+1 || 1;
      const isActive = (req.query.active!=undefined && req.query.active=='true' )?true:undefined
      const limit = req.query.limit || 10;
      const search = req.query.search;
      const sortBy = req.query.sortBy || 'createdAt'; // Set the default sortBy attribute
      const sortOrder = req.query.sortOrder || 'DESC'; // Set the default sortOrder
      const attributes = Object.keys(State.sequelize.models.State.rawAttributes);


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
        console.log('parameter active = '+req.query.active+' type = '+typeof(req.query.active))
        if(isActive){
          where.active=true
        }
        console.log(where.active)
      // Create the sorting order based on the sortBy and sortOrder parameters
      const order = [[sortBy, sortOrder]];

      // Perform the database query with pagination, filtering, sorting, and ordering
      const { count, rows } = await State.findAndCountAll({
        where,
        include:{
            model:Country,
            foreignKey:'country_id',
            attributes:['name']
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
      const data = await State.findByPk(req.params.id);
      if (!data) {
        return ErrorHandlor(req,new RecordNotFoundErr(),res)
      }
      return DataHandlor(req,data,res)
    } catch (err) {
      return ErrorHandlor(req,new SqlError(err),res)
    }
  },

  async update(req, res) {
    try {
      const data = await State.findByPk(req.params.id);
      if (!data) {
        return ErrorHandlor(req,new RecordNotFoundErr(),res);
      }

      const updatedState = await data.update(req.body);
      if(updatedState.active==true){
        await Country.update({active:true},{where:{id:updatedState.country_id}})

      }

      return DataHandlor(req,updatedState,res)
      } catch (err) {
        return ErrorHandlor(res,new SqlError(err),res);
      }
  },

  async destroy(req, res) {
    try {
      const data = await State.findByPk(req.params.id);
      if (!data) {
        return ErrorHandlor(req,new RecordNotFoundErr(),res)
      }
      await data.destroy();
      return DataHandlor(req,{},res)
    } catch (err) {
      return ErrorHandlor(req,new SqlError(err),res)
    }
  },
};
