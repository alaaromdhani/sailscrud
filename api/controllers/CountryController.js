/**
 * Api/CountryController.js
 *
 * @description :: Server-side logic for managing country endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const ValidationError = require("../../utils/errors/validationErrors");
const { ErrorHandlor } = require("../../utils/translateResponseMessage");
const schemaValidation = require("../../utils/validations");
const { CountryShema, UpdateCountrySchema } = require("../../utils/validations/CountrySchema");

module.exports = {
  async create(req, res) {
    try {
      const data = await Country.create(req.body);
      return res.status(201).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async find(req, res) {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
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
        

      // Create the sorting order based on the sortBy and sortOrder parameters
      const order = sortBy && sortOrder ? [[sortBy, sortOrder]] : [];

      // Perform the database query with pagination, filtering, sorting, and ordering
      const { count, rows } = await Country.findAndCountAll({
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
      const data = await Country.findByPk(req.params.id,{
          include:{
            model:State,
            foreignKey:'country_id',
          
          }

      });
      if (!data) {
        return res.status(404).json({ error: 'Country not found' });
      }
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async update(req, res) {
    const schema = schemaValidation(UpdateCountrySchema)
    const bodyVlidation = schema(req.body)
    if(bodyVlidation.isValid){
      try {
        const data = await Country.findByPk(req.params.id);
        if (!data) {
          return res.status(404).json({ error: 'Country not found' });
        }
        
        const updatedCountry = await data.update(req.body);
        console.log(req.body)
        if(req.body.active!=undefined){
          console.log('active is here')
            await State.update({active:req.body.active},{where:{country_id:updatedCountry.id}})

        }
        return res.json(updatedCountry);
      } catch (err) {
        return res.status(500).json({ error: err.message });
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
        return res.status(404).json({ error: 'Country not found' });
      }
      await data.destroy();
      return res.status(204).send();
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
};
