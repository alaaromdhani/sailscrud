/**
 * Api/ChapitreController.js
 *
 * @description :: Server-side logic for managing chapitre endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


const {DataHandlor, ErrorHandlor} = require('../../utils/translateResponseMessage');
module.exports = {
  async find(req, res) {
    try {
      const page = parseInt(req.query.page)+1+1 || 1;
      const limit = req.query.limit || 10;
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
      const { count, rows } = await Chapitre.findAndCountAll({
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
      return ErrorHandlor(req,new SQLError(error),res)
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
