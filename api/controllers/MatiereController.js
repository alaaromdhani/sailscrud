/**
 * Api/MatiereController.js
 *
 * @description :: Server-side logic for managing matiere endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


const schemaValidation = require('../../utils/validations');
const {MatiereShema, UpdateMatiereShema} = require('../../utils/validations/MatiereSchema');
const RecordNotFoundErr = require('../../utils/errors/recordNotFound')
const {DataHandlor, ErrorHandlor} = require('../../utils/translateResponseMessage');
const SqlError = require('../../utils/errors/sqlErrors');
const ValidationError = require('../../utils/errors/validationErrors');
module.exports = {
  async create(req, res) {
    const createMatiereSchema =schemaValidation(MatiereShema)(req.body)
    if(createMatiereSchema.isValid){
      try {
        const data = await Matiere.create(req.body);
        return DataHandlor(req,data,res);
      } catch (err) {
        return ErrorHandlor(req,new SqlError(err),res);
      }
    }
    else{
      return ErrorHandlor(req,new ValidationError({message:createThemeSchema.message}),res)
    }
  },
  async find(req, res) {
    try {
      const page = parseInt(req.query.page)+1+1 || 1;
      const limit = req.query.limit || 10;
      const search = req.query.search;
      const sortBy = req.query.sortBy || 'createdAt'; // Set the default sortBy attribute
      const sortOrder = req.query.sortOrder || 'DESC'; // Set the default sortOrder
      const attributes = Object.keys(Matiere.sequelize.models.Matiere.rawAttributes);


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
      const { count, rows } = await Matiere.findAndCountAll({
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
      const data = await Matiere.findByPk(req.params.id);
      if (!data) {
        return ErrorHandlor(req,new RecordNotFoundErr(),res)
      }
      return DataHandlor(req,data,res)
    } catch (err) {
      return ErrorHandlor(req,new SqlError(err),res);
    }
  },

  async update(req, res) {
    const updateMatiereValidation = schemaValidation(UpdateMatiereShema)(req.body)
    if(updateMatiereValidation.isValid){
      try {
        const data = await Matiere.findByPk(req.params.id);
        if (!data) {
          return ErrorHandlor(req,new RecordNotFoundErr(),res)
        }
        const updatedMatiere = await data.update(req.body);
         return DataHandlor(req,updatedMatiere,res)
      } catch (err) {
        return ErrorHandlor(req,new SqlError(err),res);
      }
    }
    else{
      return ErrorHandlor(req,new ValidationError({message:updateMatiereValidation.message}),res)
    }

  },

  /*async destroy(req, res) {
    try {
      const data = await Matiere.findByPk(req.params.id);
      if (!data) {
        return res.status(404).json({ error: 'Matiere not found' });
      }
      await data.destroy();
      return res.status(204).send();
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },*/
};
