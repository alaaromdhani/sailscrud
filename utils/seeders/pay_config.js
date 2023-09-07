const { resolve } = require("path")

module.exports = async ()=>{
    const pay_configs = [{id:1,name:'PAIEMENT PAR CARTE BANCAIRE / E-DINAR'},
    {id:2,name:'PAIEMENT PAR VIREMENT POSTALE'},
    {id:3,name:'CARTE PRÉPAYÉ'},
    {id:4,name:'PAIEMENT À LIVRAISON'}
    ]
    let databaseTypesRecords = await PayConfig.findAll()
    let recordsToUpdate=[]
    let recordsToDelete=[]
    let recordsToCreate=[]
    pay_configs.forEach(p=>{
        let d = databaseTypesRecords.filter(pd=>pd.id==p.id).at(0)
        if(!d){
            recordsToCreate.push(p)   
        }
        else{
            let test = Object.assign(d,p)
            if(JSON.stringify(d)!==JSON.stringify(test)){
                recordsToUpdate(test)
            }
        }
    })
    if(recordsToCreate.length){
        await PayConfig.bulkCreate(recordsToCreate)
    }
    if(recordsToUpdate.length){
        return await Promise.all(recordsToUpdate.map(p=>p.save()))
    }
    return 

}