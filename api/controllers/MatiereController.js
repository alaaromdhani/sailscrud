/**
 * Api/MatiereController.js
 *
 * @description :: Server-side logic for managing matiere endpoints
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const _ = require('lodash')
const RecordNotFoundErr = require('../../utils/errors/recordNotFound')
const {DataHandlor, ErrorHandlor} = require('../../utils/translateResponseMessage');
const SqlError = require('../../utils/errors/sqlErrors');
module.exports = {
  async create(req, res) {
    if(req.operation){
        if(req.operation.error){
          return ErrorHandlor(req,req.operation.error,res)
        }
        else{
          try{
            const m = req.operation.model
            m.image = (await Upload.create(req.upload)).id
            return DataHandlor(req,await m.save(),res)

          }
          catch(e){
            return ErrorHandlor(req,new SqlError(e),res)
          }
        }
    }
    else{
      let bodyData= {}
      Object.keys(req.body).forEach(k=>{
          bodyData[k] = req.body[k]

      })
      if(bodyData.image){
        bodyData.image = parseInt(bodyData.image)
      }
      if(bodyData.domaine_id){
        bodyData.domaine_id = parseInt(bodyData.domaine_id)
      }
      if(bodyData.ns){
        bodyData.ns= JSON.parse(bodyData.ns)
      }
      

      sails.services.matiereservice.createMatiere(req,bodyData,(err,data)=>{
        if(err){
          return ErrorHandlor(req,err,res)
        }
        else{
            return DataHandlor(req,data,res)
        }
      })
    }
  },
  async find(req, res) {
    try {
      const page = parseInt(req.query.page)+1 || 1;
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
      const order = [[sortBy, sortOrder]];

      // Perform the database query with pagination, filtering, sorting, and ordering
      const { count, rows } = await Matiere.findAndCountAll({
        where,
        include:[{

            model:NiveauScolaire,
            through:'matieres_niveau_scolaires',
            attributes:['id','name_ar','name_fr']
        },{
          model:Upload,
          foreignKey:'image',
          attributes:['link']
        } ],
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
      const data = await MatiereNiveau.findAll({
        where:{
          MatiereId:req.params.id
        },
        include:[{
          model:Matiere,
          foreignKey:'MatiereId',
          include:{
            model:Upload,
            foreignKey:'image',
            attributes:['link']
          }  
        },
        {
          model:NiveauScolaire,
          foreignKey:'NiveauScolaireId'  
        },
        {
          model:User,
          foreignKey:'intern_teacher',
          as:'Teacher',
          attributes:['username','firstName','lastName','id'] 
        },
        {
          model:User,
          foreignKey:'inspector',
          as:'Inspector',
          attributes:['username','firstName','lastName','id'] 
        }
      
      ]

      });
    
      if (!data || !data.length) {
        try{
          const matiere = await Matiere.findByPk(req.params.id)
          if(!matiere){
            return ErrorHandlor(req,new RecordNotFoundErr(),res)
          }
          return DataHandlor(req,matiere,res) 
        }catch(e){
          return ErrorHandlor(req,new SqlError(e),res)
        }
      }
      else{
            let matiere = {}
            Object.keys(data[0].Matiere.dataValues).forEach(k=>{
              matiere[k] = data[0].Matiere[k]
            })
            console.log(matiere.id)
          matiere.ns = []  
            const grouped = _.groupBy(data,'MatiereId')
        grouped[matiere.id].forEach(element => {
            let d = {}  
            if(element.NiveauScolaire){
              d.NiveauScolaire = element.NiveauScolaire
            }
            if(element.name){
                d.name = element.name
            }
            if(element.Teacher){
              d.Teacher = element.Teacher
            }
            if(element.Inspector){
              d.Inspector = element.Inspector
            }
            matiere.ns.push(d)  
          });
          
      return DataHandlor(req,matiere,res)

      }
        
    } catch (err) {
      console.log(err)
      return ErrorHandlor(req,new SqlError(err),res);
    }
  },

  async update(req, res) {
    if(req.operation){
      if(req.operation.error){
        return ErrorHandlor(req,req.operation.error,res)
      }
      else{
        try{
          const m = req.operation.model
          m.image = (await Upload.create(req.upload)).id
          return DataHandlor(req,await m.save(),res)

        }
        catch(e){
          return ErrorHandlor(req,new SqlError(e),res)
        }
      }
    }
    else{
      let bodyData= {}
      Object.keys(req.body).forEach(k=>{
          bodyData[k] = req.body[k]

      })
      if(bodyData.image){
        bodyData.image = parseInt(bodyData.image)
      }
      if(bodyData.domaine_id){
        bodyData.domaine_id = parseInt(bodyData.domaine_id)
      }
      if(bodyData.ns){
        bodyData.ns= JSON.parse(bodyData.ns)
      }
      
      sails.services.matiereservice.updateMatiere(req,bodyData,(err,data)=>{
        if(err){
          return ErrorHandlor(req,err,res)
        }
        else{
          return DataHandlor(req,data,res)
        }
      })
    }
    
  },

  async destroy(req, res) {
    sails.services.matiereservice.deleteMatiere(req,(err,data)=>{
      if(err){
        return ErrorHandlor(req,err,res)
      }
      else{
        return DataHandlor(req,data,res)
      }
    })
  },
};
