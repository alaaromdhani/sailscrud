const { updateNormalUserProfile } = require("../../utils/validations/UserSchema")
const {DataHandlor, ErrorHandlor} = require('../../utils/translateResponseMessage');
const SqlError = require("../../utils/errors/sqlErrors");
const UnkownError = require("../../utils/errors/UnknownError");
const ValidationError = require("../../utils/errors/validationErrors");
const RecordNotFoundErr = require("../../utils/errors/recordNotFound");
const resolveError = require("../../utils/errors/resolveError");
const { Op } = require("sequelize");
const { Json } = require("sequelize/lib/utils");
module.exports={
  profileCallback:(req,res)=>{
    DataHandlor(req,req.user,res);
  },
    updateProfile:async (req,res)=>{
      //console.log(req.body)
        if(req.operation){
            if(req.operation.data){
                  return DataHandlor(req,req.operation.data,res)
            }
            else{
              return ErrorHandlor(req,req.operation.error,res)
            }
          }
          else{
              if(req.files && req.files.length){
                return ErrorHandlor(req,new UnkownError(),res)
              }
              else{
                sails.services.userservice.profileUpdater(req,async (err,data)=>{
                    if(err){
                      return ErrorHandlor(req,err,res)
                    }
                    else{
                        try{
                          return DataHandlor(req,await data.save(),res)
                        }
                        catch(e){
                          if( e instanceof ValidationError){
                            return ErrorHandlor(req,e,res)
                          }
                          return ErrorHandlor(req,new SqlError(e),res)
                        }
                    }
                },updateNormalUserProfile)
              }
          }
      
        
    },
    getMatiereByNiveau:async (req,res)=>{
      try{
        let data  = await NiveauScolaire.findByPk(req.params.NiveauScolaireId,{
          include:{
            model:Matiere,
            through:MatiereNiveau,
            include:{
              model:Upload,
              foreignKey:'image',
              attributes:['link']

            }
          }
        })
        if(!data){
          return ErrorHandlor(req,new RecordNotFoundErr(),res)
        }
        else{
          return DataHandlor(req,data.Matieres,res)
        }
      }catch(e){
        console.log(e)
        return ErrorHandlor(req,new SqlError(e),res)
      }
      
    },
    getSlugs:async (req,res)=>{
     try{
      return DataHandlor(req,await Blog.findAll({
        attributes:['slug']
      }),res)
     }catch(e){
      return ErrorHandlor(req,new SqlError(e),res)
     }

    },
    
    updatePhoneNumber:(req,res)=>{
        sails.services.userservice.updatePhoneNumber(req,(err,data)=>{

                    if(err){
                        return ErrorHandlor(req,err,res)
                    }
                    else{
                        return DataHandlor(req,data,res)
                    }

        })


    },
    
    getTrimestres:async (req,res)=>{
      try{
        return DataHandlor(req,await Trimestre.findAll({where:{
          active:true
        }}),res)
      }catch(e){
        return ErrorHandlor(req,new SqlError(e),res)
      }
    },
    getTopStudent:async (req,res)=>{
      try{
        return DataHandlor(req,await sails.services.studentservice.getStudentStatisticsFront(req)
        ,res)
      }catch(e){
        console.log(e)
        return ErrorHandlor(req,new SqlError(e),res)

      }

    },
    getPacks:async (req,res)=>{
      try{
        return DataHandlor(req,await Pack.findAll({
          attributes:['name','price','initialPrice','nbTrimestres','reduction'],
          include:{
            model:Upload,
            foreignKey:'photo',
            attributes:['link']
          }
        })
        ,res)
      }catch(e){
        console.log(e)
        return ErrorHandlor(req,new SqlError(e),res)

      }

    },
    getBlogsCategories:async (req,res)=>{
      try{
        
       
        return DataHandlor(req,await BlogCategory.findAll({
          attributes:['category_name','slug']
        }),res)
      }catch(e){
       return  ErrorHandlor(req,new SqlError(e),res)  
      }
    },
    getBlogsByCategory:async (req,res)=>{
      try{
        const {slug} = req.query
        const page = parseInt(req.query.page) || 1;
        const limit = 4;
        const search = req.query.search;
        let where= {status:true}
        if(search){
          where.title = {
            [Op.like]:'%'+search+'%'
          }
        }
        let include = [
         {
          model:Upload,
          foreignKey:'banner',
          as:'Banner',
          attributes:['link']
        },
        {
          model:Upload,
          foreignKey:'meta_img',
          as:'MetaImage',
          attributes:['link']
        }
        ]
        
        if(slug){
          include.push({
            model:BlogCategory,
            foreignKey:'category_id',
            where:{
              slug
            },
            attributes:['id','category_name'],
           
           })
        }
        else{
          include.push({
            model:BlogCategory,
            foreignKey:'category_id',
            
            attributes:['id','category_name'],
           
           })
        }
        
       
         const {count,rows} = await Blog.findAndCountAll({
          attributes:['title','slug','createdAt','short_description'],
          where,
          include,
          order:[['createdAt','desc']],
          limit,
          offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
        });
        
        let recentBlogs=await Blog.findAll({
          attributes:['title','slug','createdAt','short_description'],
          where:{status:true},
          include,
          order:[['createdAt','desc']],
          limit: 3,
        });  
        


        return DataHandlor(req,{
          success: true,
          recentBlogs,
          data: rows,
          
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          totalCount: count,
          totalPages: Math.ceil(count / parseInt(limit, 10)),
        },res)
      }catch(e){
        console.log(e)
       return  ErrorHandlor(req,new SqlError(e),res)  
      }
    },
    getBlogsBySlug:async (req,res)=>{
      try{
        return DataHandlor(req,await Blog.findOne({
         attributes:['title','slug','short_description','description','meta_title','meta_keywords','meta_description','createdAt'],
         where: {status:true,slug:req.params.slug},
         include:[{
          model:Upload,
          foreignKey:'banner',
          as:'Banner',
          attributes:['link']
       
        },
        {
          model:Upload,
          foreignKey:'meta_img',
          as:'MetaImage',
          attributes:['link']
       
        }]
        }),res)
      }catch(e){
       return  ErrorHandlor(req,new SqlError(e),res)  
      }
    },
    accessPublicCourse:async (req,res)=>{
      try{
        return DataHandlor(req,await sails.services.subcourseservice.accessPublicCourse(req),res)
      }catch(e){
        return ErrorHandlor(req,resolveError(e),res)
      }
    }


   
    


}