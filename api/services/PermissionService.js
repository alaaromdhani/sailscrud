
module.exports = {
      /**
   * Given an action, return the CRUD method it maps to.
   */
    methodMap : {
        POST: 'create',
        GET: 'read',
        PUT: 'update',
        PATCH: 'update',
        DELETE: 'delete'
    },
    getMethod: function(method) {
        
        return this.methodMap[method];
    },
    findModelPermissions: function(options) {
        
        let action = this.getMethod(options.method)
        let user_id = options.user
        let model_name = options.model
            return Permission.findAll({where:{action},include:[{
                model:Model,
                where:{name:options.model},
                foreignKey:'model_id'
    
    
            },{
                model:User,
                where:{id:user_id},
                through:'users_permissions'

    
    
            }]});

        
        
        //console.log('findModelPermissions options', options)
        //console.log('findModelPermissions action', action)
       
        
    
        
    },
    canAssignPermissions:(user,permissions)=>{
            
        return permissions.reduce((prev,current)=>{
            current.actions.forEach(a=>{
                prev.push({model:current.model,action:a})
                
            })
            return prev

        },[]).filter(p=>user.Permissions.filter(permission=>permission.action==p.action && permission.Model.name==p.model).length==0).length==0;



    },
    convertPermissions:(user,permissions)=>{
        return permissions.reduce((prev,current)=>{
            current.actions.forEach(a=>{
                prev.push({model:current.model,action:a})
                
            })
            return prev

        },[]).map(p=>user.Permissions.filter(permission=>permission.Model.name==p.model&& p.action==permission.action).at(0))

    },
    canAssignFeatures:(user,features)=>{
            
        return features.filter(f=>user.Features.filter(feature=>feature.name==f.name).length==0).length>0;



    },
    convertFeatures:(user,features)=>{
        return features.map(f=>user.Features.filter(feature=>feature.name==f).at(0)).filter(f=>f!=undefined);



    },
    convertPermissionsForBetterReading:(permissions)=>{
       return  permissions.reduce((prev,current)=>{
            if(perv[current.Model.name]){
                prev.actions.push(current.action)

            }
            else{
                prev[current.Model.name] = [current.action]
            }



        },{})


    }
    
    






}