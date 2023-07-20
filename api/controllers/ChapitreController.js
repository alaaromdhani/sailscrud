/**
 * Api/ChapitreController.js
 *
 * @description :: Server-side logic for managing chapitre endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


const ValidationError = require('../../utils/errors/validationErrors');
const {DataHandlor, ErrorHandlor} = require('../../utils/translateResponseMessage');
const SqlError = require("../../utils/errors/sqlErrors")
module.exports = {
  async find(req, res) {
    const {MatiereId,NiveauScolaireId} = req.query
    let name
    if(MatiereId && NiveauScolaireId){
      let matiere_niveau = await MatiereNiveau.findOne({
        where:{
          MatiereId,
          NiveauScolaireId
        }
      })
      if(matiere_niveau){
        name=matiere_niveau.name
      }
    }
    
    try {
      
      const limit = req.query.limit || 10;
      const page = parseInt(req.query.page)+1 || 1;
      const search = req.query.search;
      const sortBy = req.query.sortBy || 'createdAt'; // Set the default sortBy attribute
      const sortOrder = req.query.sortOrder || 'DESC'; // Set the default sortOrder
      const attributes = Object.keys(Chapitre.sequelize.models.Chapitre.rawAttributes);


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
      const order =[[sortBy, sortOrder]]
      // Create the sorting order based on the sortBy and sortOrder parameters

      // Perform the database query with pagination, filtering, sorting, and ordering
      let queryOptions = {
        where,
        order,
      }

      if(typeof limit=='number' || parseInt(limit)){
          queryOptions.limit = parseInt(limit, 10)
          queryOptions.offset = (parseInt(page, 10) - 1) * parseInt(limit, 10)
      }
      const { count, rows } = await Chapitre.findAndCountAll(queryOptions);
      if(name){
        rows.forEach(element => {
            element.name = element.name.replace("chapter",name)
        }); 
      }
      let dataOptions= {
        success: true,
        data: rows,
        totalCount: count,
      }
      if(typeof limit=='number' || parseInt(limit)){
        dataOptions.page= parseInt(page, 10)
        dataOptions.limit= parseInt(limit, 10)
        dataOptions.totalPages= Math.ceil(count / parseInt(limit, 10))
      }
      
      return DataHandlor(req,dataOptions,res);
    } catch (error) {
      console.log(error)
      return ErrorHandlor(req,new SqlError(error),res)
    }
  },
  async destroy(req, res) {
    sails.services.configservice.deleteChapitre(req,(err,data)=>{
        if(err){
            return ErrorHandlor(req,err,res)
        }
        else{
          return DataHandlor(req,data,res)
        }
    })
  },



};
