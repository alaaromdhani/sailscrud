/**
 * Api/NiveauScolaireController.js
 *
 * @description :: Server-side logic for managing niveau_scolaire endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


const schemaValidation = require('../../utils/validations');
const {DataHandlor, ErrorHandlor} = require('../../utils/translateResponseMessage');
const SqlError = require('../../utils/errors/sqlErrors');
const ValidationError = require('../../utils/errors/validationErrors');
const {NiveauScolaireShema, UpdateNiveauScolaireShema} = require('../../utils/validations/NiveauScolaireSchema');
const RecordNotFoundErr = require('../../utils/errors/recordNotFound')
module.exports = {
  async create(req, res) {
    const createNsSchema =schemaValidation(NiveauScolaireShema)(req.body)
    if(createNsSchema.isValid){
      try {
        const data = await NiveauScolaire.create(req.body);
        return DataHandlor(req,data,res);
      } catch (err) {
        return ErrorHandlor(req,new SqlError(err),res)
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
      const attributes = Object.keys(NiveauScolaire.sequelize.models.NiveauScolaire.rawAttributes);


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
      const order = [[sortBy, sortOrder]];

      // Perform the database query with pagination, filtering, sorting, and ordering
      const { count, rows } = await NiveauScolaire.findAndCountAll({
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
      return ErrorHandlor(req,new SqlError(error),res);
    }
  },

  async findOne(req, res) {
    try {
      const data = await NiveauScolaire.findByPk(req.params.id,{
          include:{
              model:Matiere,
            foreignKey:'matiere_id',
            through:MatiereNiveau

          }
      });
      if (!data) {
        return ErrorHandlor(req,new RecordNotFoundErr(),res);
      }
      return DataHandlor(req,data,res);
    } catch (err) {
      return ErrorHandlor(req,new SqlError(err),res)
    }
  },

  async update(req, res) {
    const updateNsValidation = schemaValidation(UpdateNiveauScolaireShema)(req.body)
    if(updateNsValidation.isValid){
      try {
        const data = await NiveauScolaire.findByPk(req.params.id);
        if (!data) {
          return ErrorHandlor(req,new RecordNotFoundErr(),res);
        }
        const updatedNs = await data.update(req.body);
        return DataHandlor(req,updatedNs,res);
      } catch (err) {
        return ErrorHandlor(req,new SqlError(err),res);
      }
    }
    else{
      return ErrorHandlor(req,new ValidationError({message:updateMatiereValidation.message}),res)
    }
  },

  async destroy(req, res) {
    sails.services.configservice.deleteNiveauScolaire(req,(err,data)=>{
      if(err){
        return ErrorHandlor(req,err,res)
      }
      else{
        return DataHandlor(req,data,res)
      }
    })
  },
};
