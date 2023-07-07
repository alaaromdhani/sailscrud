const _ = require('@sailshq/lodash')
const {Op, fn} = require('sequelize')

let grants = { //defining the grants for permissions
    superadmin:{
        models:['*'],
        actions:['*'],
        features:['*'],
    },
    MadarTeacher:{
        models:['coursinteractive','coursvideo','coursdocument','courscomment'],
        actions:['*'],
        features:['*'],
        restrictions:[
            {model:'coursinteractive',actions:['read']},
            {model:'coursvideo',actions:['read']},
            {model:'coursdocument',actions:['read']},
            
        ],
        
    },
    MadarInspector:{
        models:['coursinteractive','coursvideo','coursdocument','courscomment'],
        actions:['*'],
        features:['*'],
        restrictions:[
            {model:'coursinteractive',actions:['read']},
            {model:'coursvideo',actions:['read']},
            {model:'coursdocument',actions:['read']},
            
        ],
        
    },
    registred:{
        models:['user','role'],
        actions:['create','read'],
        features:['*'],
        restrictions:[
            {model:'role',actions:['*']}
        ],
        
    },
    public :{
        models:[],
        actions:[],
        features:[]
       
    }
}

module.exports = async ()=>{
    
    let allActions = ['read','create','delete','update']
        
    let allModels = await Model.findAll()
    let allPermissions = await Permission.findAll()
    let appModels = _.map(allModels,(model)=>model.name)
    let allFeatures = await Feature.findAll()
    let appFeatures = _.map(allFeatures,(f)=>f.name)
    let allRoles = await Role.findAll({include:[{
        model:Permission,
        through:'roles_permissions'
    },{
        model:Feature,
        through:'roles_features'
    }]})
    const createPermissions = async ()=>{
    
        return await Permission.bulkCreate(   allModels.filter(model=>allPermissions.filter(permission=>permission.model_id==model.id).length==0).reduce((prec,model)=>{
            allActions.forEach(a=>{
                prec.push({
                    model_id:model.id,
                    action:a
                })

            }) 
            return prec
        },[]))
            
    }

const getGranted = (granted)=>{
    let requiredKeys = ['models','actions','features']
    requiredKeys.forEach(k=>{
        if(!granted[k]){
            throw new Error({message:' the key '+k+' is required'})
        }
    })
    Object.keys(granted).forEach(k=>{
        let validateFunction = GrantedobjectValidators[k]
        if(!validateFunction(granted[k])){
            if(requiredKeys.includes(k)){
                console.log('problem with Key :'+k)
                throw new Error({message:'problem with Key :'+k});
            }
            else{
                console.log('problem with Key :'+k+' any way this will be ignored during execution')
                delete granted[k]
            }
        } 
    })
    return granted
}
const repairKeys = (object)=>{
    Object.keys(object).forEach(k=>{
        if(Array.isArray(object[k]) && object[k].length>0 && object[k][0]=='*'){
            if(k=='actions'){
                object[k] = allActions
            }
            if(k=='models'){
                object[k] = appModels
            }
            if(k=='features'){
                object[k] = appFeatures
            }
        }
        else if(Array.isArray(object[k])){
                for(let i= 0;i<object[k].length;i++){
                    object[k][i] =repairKeys(object[k][i]) 
                }
        }
        else if(typeof(object[k])=='object'){
                object[k] = repairKeys(object[k])
        } 
    })
    return object
}
const isValidRestriction = (restrictions)=>{
    let invalidTest = _.any(restrictions,(r)=>{
        if(r.model && r.actions){
            if(typeof(r.model)=='string' && Array.isArray(r.actions) && r.actions.length>0&& !_.any(r.actions,(a)=>typeof(a)!='string') && (!_.any(r.actions,(a)=>!allActions.includes(a)))){
                return false
            }
            else{
                return true
            }
        }
        else{
            return true
        }
    })
    return !invalidTest
}
const isValidDisallow = (disallow)=>{
if(disallow.features && Array.isArray(disallow.features) && disallow.models &&Array.isArray(disallow.models)){
    return (!_.any(disallow.features,(f)=>typeof(f)!='string') &&  !_.any(disallow.models,(f)=>typeof(f)!='string'))
}
else{
    if(disallow.features && Array.isArray(disallow.features)){
        return !_.any(disallow.features,(f)=>typeof(f)!='string')
    }
    else if(disallow.models && Array.isArray(disallow.models)) {
        return !_.any(disallow.models,(f)=>typeof(f)!='string')
    }
    else{
        return false
    }
}
}
const GrantedobjectValidators = {
weight:(weight)=>{return weight && typeof(weight)=='number'},    
models:(models)=>{return models && Array.isArray(models) && !_.any(models,(m)=>typeof(m)!='string')},
actions:(actions)=>{return actions && Array.isArray(actions) && !_.any(actions,(a)=>typeof(a)!='string') && !_.any(actions,(a)=>!allActions.includes(a)) },
features:(features)=>{return features && Array.isArray(features) && !_.any(features,(f)=>typeof(f)!='string')},
disallow:(disallow)=>isValidDisallow(disallow),
restrictions:(restrictions)=>Array.isArray(restrictions) &&isValidRestriction(restrictions)
}

let grantsToPermissionsConverter =  (granted)=>{
    
    
    let permissions = []
    if(granted){
        try{
            granted = getGranted(granted)//verify the declaration and destroys any not valid and not required key (throws an error in case of required key)
            
            if(granted.disallow){ // we have to eliminate the disallowed models and the disallowed features
                if(granted.disallow.models){
                    granted.models = granted.models.filter(m=>!granted.disallow.models.includes(m)) //eliminates a  model if it is present in disallow
                }
                if(granted.disallow.features){
                   granted.features = granted.features.filter(f=>!granted.disallow.features.includes(f))//eliminates a  feature if it is present in disallow
                }
            }
            //converts expression to permission e.p have its own model and action
            
            granted.models.forEach((m)=>{
                const model_id = allModels.filter(model=>model.name==m).map(model=>model.id).at(0)
                if(model_id){
                    let allowedActions = granted.actions
                    if(granted.restrictions){
                        let modelRestrictions = granted.restrictions.filter(r=>r.model==m)
                        if(modelRestrictions.length>0){
                            allowedActions =modelRestrictions[0].actions
                        }
                    }
                    allowedActions.forEach(a=>{
                            permissions.push({
                                  model_id,
                                  action:a  
                            })
                    })

                }


            })
            



 
        
        }catch(e){
            throw e
        }
    }
    return {permissions,features:granted.features.filter(fName=>allFeatures.filter(f=>f.name==fName).length>0).map(fName=>allFeatures.filter(f=>f.name==fName).at(0))}
}


let appPermissions = await createPermissions()
allPermissions = allPermissions.concat(appPermissions)
grants = repairKeys(grants)
console.log(Object.keys(grants))
for(let i=0;i<Object.keys(grants).length;i++){
    let roleName = Object.keys(grants)[i]

    let role = allRoles.filter(r=>r.name==roleName).at(0)
    if(role){
        
        let permissions = (grantsToPermissionsConverter(grants[roleName])).permissions.filter(p=>allPermissions.filter(permission=>permission.model_id==p.model_id&&p.action==permission.action).length>0).map(p=>{
            return allPermissions.filter(permission=>permission.model_id==p.model_id&&p.action==permission.action).at(0)
        })
        
        let result = await role.setPermissions(permissions)
        role.setFeatures((grantsToPermissionsConverter(grants[roleName])).features)
        
    }
    else{
        console.log("can't find the role "+roleName+" statement will be ignored ")
    }

}

}
