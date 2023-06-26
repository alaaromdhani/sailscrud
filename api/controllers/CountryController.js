/**
 * Api/CountryController.js
 *
 * @description :: Server-side logic for managing country endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const RecordNotFoundErr = require("../../utils/errors/recordNotFound");
const SqlError = require("../../utils/errors/sqlErrors");
const ValidationError = require("../../utils/errors/validationErrors");
const { ErrorHandlor, DataHandlor } = require("../../utils/translateResponseMessage");
const schemaValidation = require("../../utils/validations");
const { CountryShema, UpdateCountrySchema } = require("../../utils/validations/CountrySchema");

module.exports = {
  async create(req, res) {
    const addCountryValidation = schemaValidation(CountryShema)(req.body)

    if(addCountryValidation.isValid){
      try {
        const data = await Country.create(req.body);
        return DataHandlor(req,data,res)
      } catch (err) {
        return ErrorHandlor(req,new SqlError(err),res)
      }
    }
    else{
      return  ErrorHandlor(req,new ValidationError({message:addCountryValidation.message}))
    }
    },

  async find(req, res) {
    try {
      const page = parseInt(req.query.page)+1|| 1;
      const limit = req.query.limit || 10;
      const isActive = (req.query.active!=undefined && req.query.active=='true' )?true:undefined
      const search = req.query.search;
      const sortBy = req.query.sortBy || 'createdAt'; // Set the default sortBy attribute
      const sortOrder = req.query.sortOrder || 'DESC'; // Set the default sortOrder
      const attributes = Object.keys(Country.sequelize.models.Country.rawAttributes);


      // Create the filter conditions based on the search query
      let  where = search
        ? {
          [Sequelize.Op.or]: attributes.map((attribute) => ({
            [attribute]: {
              [Sequelize.Op.like]: '%'+search+'%',
            },
          })),
        }
        : {};

        if(isActive){
          where.active=true
        }
      // Create the sorting order based on the sortBy and sortOrder parameters
      const order = [[sortBy, sortOrder]];

      // Perform the database query with pagination, filtering, sorting, and ordering
      const { count, rows } = await Country.findAndCountAll({
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
      const data = await Country.findByPk(req.params.id,{
          include:{
            model:State,
            foreignKey:'country_id',

          }

      });
      if (!data) {
        return ErrorHandlor(req,new RecordNotFoundErr(),res)
      }
      return DataHandlor(req,data,res)
    } catch (err) {
      return ErrorHandlor(req,new SqlError(err),res)
    }
  },

  async update(req, res) {
    const schema = schemaValidation(UpdateCountrySchema)
    const bodyVlidation = schema(req.body)
    if(bodyVlidation.isValid){
      try {
        const data = await Country.findByPk(req.params.id);
        if (!data) {
          return ErrorHandlor(req,new RecordNotFoundErr(),res);
        }

        const updatedCountry = await data.update(req.body);

        if(req.body.active!=undefined){
          console.log('active is here')
            await State.update({active:req.body.active},{where:{country_id:updatedCountry.id}})

        }
        return DataHandlor(req,updatedCountry,res)
      } catch (err) {
        return ErrorHandlor(res,new SqlError(err),res);
      }

    }
    else{
      ErrorHandlor(req,new ValidationError({message:bodyVlidation.message}),res)
    }

  },

  async destroy(req, res) {
    try {
      const data = await Country.findByPk(req.params.id);
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
