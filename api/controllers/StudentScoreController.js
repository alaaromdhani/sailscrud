/**
 * Api/StudentScoreController.js
 *
 * @description :: Server-side logic for managing student_score endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const  Sequelize  = require("sequelize");
const {DataHandlor} = require('../../utils/translateResponseMessage')


module.exports = {

  async find(req, res) {
    try {
      
      const page = parseInt(req.query.page)+1 || 1;
      const limit = req.query.limit || 10;
      const search = req.query.search;
      const sortBy = req.query.sortBy || 'createdAt'; // Set the default sortBy attribute
      const sortOrder = req.query.sortOrder || 'DESC'; // Set the default sortOrder
      const attributes = Object.keys(StudentScore.sequelize.models.StudentScore.rawAttributes);


      // Create the filter conditions based on the search query
      let where={}
      let {matiere_id,niveau_scolaire_id} = req.query
      if(matiere_id){
        where.matiere_id = matiere_id
      }
      if(niveau_scolaire_id){
        where.niveau_scolaire_id = niveau_scolaire_id
        
      }

      // Create the sorting order based on the sortBy and sortOrder parameters
      const order = sortBy && sortOrder ? [[sortBy, sortOrder]] : [];
      
      // Perform the database query with pagination, filtering, sorting, and ordering
      const rows = await StudentScore.findAll(
        {
          where,
          include:[{
              model:NiveauScolaire,
              foreignKey:'niveau_scolaire_id',
              attributes:['name_ar'],
          },{
              model:User,
              foreignKey:'user_id',
              attributes:['profilePicture','firstName','lastName'],
          }],
          attributes:[[Sequelize.fn('sum',Sequelize.col('currentScore')),'userScore'],[Sequelize.fn('sum',Sequelize.col('totalScore')),'total'],'id'],
          group:'user_id',
          order:[['userScore','DESC']],
          limit:parseInt(limit),
          offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
  
          
  
      }
      );
      let count=await StudentScore.count({
        where,
        distinct:true,
        col:'user_id'
       
        
      
       

    })

      return DataHandlor(req,{
        success: true,
        data: rows,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalCount: count,
        totalPages: Math.ceil(count / parseInt(limit, 10)),
      },res);
    } catch (error) {
      return res.serverError(error);
    }
  },

 
};
