
  
const features = [{
    name:'validate course',
    description:'this feature enables users to validate courses',
    identity:'validate course'




}]
module.exports = async ()=>{
    let allFeatures = await Feature.findAll()
    let featuresToAdd = features.filter(f=>allFeatures.filter(feature=>feature.name==f.name&&feature.identity==f.identity).length==0)
    await Feature.bulkCreate(featuresToAdd)
    


}