/**
 * Api/AnneeScolaireController.js
 *
 * @description :: Server-side logic for managing annee_scolaire endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const RecordNotFoundErr = require("../../utils/errors/recordNotFound");
const SqlError = require("../../utils/errors/sqlErrors");
const ValidationError = require("../../utils/errors/validationErrors");
const { DataHandlor, ErrorHandlor } = require("../../utils/translateResponseMessage");
const schemaValidation = require("../../utils/validations");
const {AnneeScolaireShema, updateAnneeScolaire} = require("../../utils/validations/AnneeScolaireSchema");


module.exports = {
  async create(req, res) {
    try {
      const anneeScolaireValidation = schemaValidation(AnneeScolaireShema)(req.body)
      if(anneeScolaireValidation.isValid){
        const data = await AnneeScolaire.create(req.body);
        return DataHandlor(req,data,res);
  
      }
      else{
        return ErrorHandlor(req,new ValidationError({message:anneeScolaireValidation.message},res))
      }
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async find(req, res) {
    try {
      const page = parseInt(req.query.page)+1 || 1;
      const limit = req.query.limit || 10;
      const search = req.query.search;
      const sortBy = req.query.sortBy || 'createdAt'; // Set the default sortBy attribute
      const sortOrder = req.query.sortOrder || 'DESC'; // Set the default sortOrder
      const attributes = Object.keys(AnneeScolaire.sequelize.models.AnneeScolaire.rawAttributes);


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
      const { count, rows } = await AnneeScolaire.findAndCountAll({
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
      const data = await AnneeScolaire.findByPk(req.params.id);
      if (!data) {
        return res.status(404).json({ error: 'AnneeScolaire not found' });
      }
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
        const updateValidation = schemaValidation(updateAnneeScolaire)(req.body)
        if(updateValidation.isValid){
          const data = await AnneeScolaire.findByPk(req.params.id);
          if (!data) {
            throw new RecordNotFoundErr();
          }
          const updatedAnneeScolaire = await data.update(req.body);
          return res.json(updatedAnneeScolaire);
        }
        else{
          throw new ValidationError({message:updateValidation.message})
        }
    } catch (err) {
      return (err instanceof ValidationError || err instanceof RecordNotFoundErr)? ErrorHandlor(req,err,res) :ErrorHandlor(req,new SqlError(err),res) 
    }
  },

  async destroy(req, res) {
    try {
      const data = await AnneeScolaire.findByPk(req.params.id);
      if (!data) {
        return res.status(404).json({ error: 'AnneeScolaire not found' });
      }
      await data.destroy();
      return res.status(204).send();
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
};
