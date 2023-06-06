
  
const features = [{
    name:'course Access',
    description:' this feature gives authorised access to courses',
    identity:'course access'




}]
module.exports = async ()=>{
    let allFeatures = await Feature.findAll()
    let featuresToAdd = features.filter(f=>allFeatures.filter(feature=>feature.name==f.name&&feature.identity==f.identity).length==0)
    await Feature.bulkCreate(featuresToAdd)
    


}