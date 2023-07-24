/**
 * Api/ModuleController.js
 *
 * @description :: Server-side logic for managing module endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const RecordNotFoundErr = require('../../utils/errors/recordNotFound');
const SqlError = require('../../utils/errors/sqlErrors');
const {ErrorHandlor, DataHandlor} = require('../../utils/translateResponseMessage')
module.exports = {
  async create(req, res) {
    sails.services.configservice.addModule(req,(err,data)=>{
        if(err){
            return ErrorHandlor(req,err,res)
        }
        else{
          return DataHandlor(req,data,res)
        }
    })
  },

  async find(req, res) {
    try {
      const {MatiereId,NiveauScolaireId} = req.query
      const page = parseInt(req.query.page)+1 || 1;
      const limit = req.query.limit || 10;
      const search = req.query.search;

      const sortBy = req.query.sortBy || 'createdAt'; // Set the default sortBy attribute
      const sortOrder = req.query.sortOrder || 'DESC'; // Set the default sortOrder
      const attributes = Object.keys(Module.sequelize.models.Module.rawAttributes);
      let matiere_niveau_id
      let chapterName 
      if(MatiereId&&NiveauScolaireId){

        const matiereNiveau = await MatiereNiveau.findOne({
          where:{
            MatiereId,
            NiveauScolaireId
          }
        })
        if(matiereNiveau){
          matiere_niveau_id = matiereNiveau.id
          chapterName = matiereNiveau.name
        }
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
          console.log(matiere_niveau_id)
      // Create the sorting order based on the sortBy and sortOrder parameters
      if(matiere_niveau_id){
        where.matiere_niveau_id = matiere_niveau_id 
      }
      if(!matiere_niveau_id && (MatiereId && NiveauScolaireId)) {
        return DataHandlor(req,{success:true,data:{chapterName:"",rows:[]}},res)
      }

      const order = sortBy && sortOrder ? [[sortBy, sortOrder]] : [];

      // Perform the database query with pagination, filtering, sorting, and ordering
      let findOptions = {
        include:{
          model:Trimestre,
          through:'trimestres_modules',
          attributes:['name_fr','name_ar']
          
        }, 
        where,
        order,
      }
    

      if(typeof(limit)==="number"){
        findOptions.limit= parseInt(limit, 10),
        findOptions.offset= (parseInt(page, 10) - 1) * parseInt(limit, 10)
       }
      const { count, rows } = await Module.findAndCountAll(findOptions);
      let givenData = {rows}
      if(chapterName){
        givenData.chapterName = chapterName
      }
      let dataOptions = {
        success: true,
        data: givenData,
      } 
      if(typeof(limit)==='number'){
        dataOptions.page= parseInt(page, 10)
        dataOptions.limit= parseInt(limit, 10)
        dataOptions.totalCount= count
        dataOptions.totalPages= Math.ceil(count / parseInt(limit, 10))
       }
      return DataHandlor(req,dataOptions,res);
    } catch (error) {
      console.log(error)
      return ErrorHandlor(req,error,res);
    }
  },

  async findOne(req, res) {
    try {
      const data = await Module.findByPk(req.params.id);
      if (!data) {
        return ErrorHandlor(req,new RecordNotFoundErr(),res)
      }
      return DataHandlor(req,data,res)
    } catch (err) {
      return ErrorHandlor(req,new SqlError(err),res)
    }
  },

  async update(req, res) {
    //functions to update update matiere,addcourse,add-matiere,probably comment-course
    sails.services.configservice.updateModule(req,(err,data)=>{
        if(err){
          return ErrorHandlor(req,err,res)
        }
        else{
          return DataHandlor(req,data,res)
        }
      })
  },

  async destroy(req, res) {
    sails.services.configservice.deleteModule(req,(err,data)=>{
      if(err){
        return ErrorHandlor(req,err,res)
      }
      else{
        return DataHandlor(req,data,res)
      }
    }) 
   },
};
