const SqlError = require("../../utils/errors/sqlErrors")
const { DataHandlor, ErrorHandlor } = require("../../utils/translateResponseMessage")

module.exports={
    create:async (req,res)=>{
        if(req.operation){
            if(req.operation.error){

                return ErrorHandlor(req,req.operation.error,res)
            }
            else{
                try{
                let user = req.operation.data
                user.profilePicture = (await Upload.create(req.upload)).link
                return DataHandlor(req,await user.save(),res)
                }catch(e){
                    
                    if(req.operation.data){
                        await user.destroy()
                    }
                    return ErrorHandlor(req,new SqlError(e),res)
                }
            }
        }else{
            if(req.body.niveau_scolaire_id){
                req.body.niveau_scolaire_id = parseInt(req.body.niveau_scolaire_id)
            }
            sails.services.studentservice.createStudent(req,(err,data)=>{
                if(err){
                    return ErrorHandlor(req,err,res)
                }
                else{
                    return DataHandlor(req,data,res)
                }
            })
        }



    },
    find:async (req,res)=>{
        try {
            const page = parseInt(req.query.page)+1 || 1;
            const limit = req.query.limit || 10;
            const search = req.query.search;
            const sortBy = req.query.sortBy || 'createdAt'; // Set the default sortBy attribute
            const sortOrder = req.query.sortOrder || 'DESC'; // Set the default sortOrder
            const attributes = Object.keys(User.sequelize.models.User.rawAttributes);
      
      
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
              where.addedBy=req.user.id
      
            // Create the sorting order based on the sortBy and sortOrder parameters
            const order = sortBy && sortOrder ? [[sortBy, sortOrder]] : [];
      
            // Perform the database query with pagination, filtering, sorting, and ordering
            const { count, rows } = await User.findAndCountAll({
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
    getschoolLevels:async (req,res)=>{
        try{
            return DataHandlor(req,await NiveauScolaire.findAll({where:{
                active:true
            },attributes:['id','name_ar']}),res)
        }catch(e){
            return ErrorHandlor(req,new SqlError(e),res)
        }

    }




}