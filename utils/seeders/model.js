module.exports = async ()=>{
    const dbModels = await Model.findAll()
    let unexiting = _.map(sails.models,(model,name)=>{
      //console.log(Object.keys(model))
       return {name:name,identity:name,attributes:_.omit(model.rawAttributes,_.functions(model.rawAttributes))}   
    }).filter(m=>dbModels.filter(md=>md.name==m.name).length==0)
    await Model.bulkCreate(unexiting)


}