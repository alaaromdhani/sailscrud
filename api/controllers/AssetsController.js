const path = require("path")
const { ErrorHandlor, DataHandlor } = require("../../utils/translateResponseMessage")
const RecordNotFoundErr = require("../../utils/errors/recordNotFound")

module.exports={
    streamPublicFile:async (req,res)=>{
            const filename = req.params.filename
            Upload.findOne({where:{
                isPublic:true,
                file_name:filename
            }}).then(upload=>{
                return new Promise((resolve,reject)=>{
                    if(upload){
                            return resolve(upload)
                    }
                    else{
                        return reject(new RecordNotFoundErr())

                    }
                })
            }).then(upload=>{
                    let options={
                        root:path.join(__dirname,'../../assets/'+upload.path)
                    }

                    const filename = upload.file_name+'.'+upload.extension


                      res.sendFile(filename, options,err=>{
                                if(err){
                                  ErrorHandlor(req,new RecordNotFoundErr(),res)
                                }
                                else{
                                    console.log(filename)
                                }
                            })


            }).catch(e=>{

                ErrorHandlor(req,e,res)


            })
    },
    streamPrivateFile:async(req,res)=>{
        const filename = req.params.filename
        Upload.findOne({where:{
            isPublic:false,
            file_name:filename
        }}).then(upload=>{

            return new Promise((resolve,reject)=>{

                if(upload){
                        console.log(upload)
                    return resolve(upload)
                }
                else{

                    return reject(new RecordNotFoundErr())

                }
            })
        }).then(upload=>{
                let options={
                    root:path.join(__dirname,'../../assets/'+upload.path)
                }

                const filename = upload.file_name+'.'+upload.extension
                res.sendFile(filename, options,err=>{
                    if(err){
                        ErrorHandlor(req,new RecordNotFoundErr(),res)
                    }
                    else{
                        console.log(filename)
                    }
                })


        }).catch(e=>{
            ErrorHandlor(req,e,res)
        })
    },
  downloadPrivateFile:async(req,res)=>{
    const filename = req.params.filename
    Upload.findOne({where:{
        isPublic:false,
        file_name:filename
      }}).then(upload=>{

      return new Promise((resolve,reject)=>{

        if(upload){

          return resolve(upload)
        }
        else{

          return reject(new RecordNotFoundErr())

        }
      })
    }).then(upload=>{
      let options={
        root:path.join(__dirname,'../../assets/'+upload.path)
      }

      const filename = upload.file_name+'.'+upload.extension
      res.setHeader('Content-Disposition', 'attachment; filename='+filename);
      res.sendFile(filename, options,err=>{
        if(err){
          ErrorHandlor(req,new RecordNotFoundErr(),res)
        }
        else{
          console.log(filename)
        }
      })


    }).catch(e=>{
      ErrorHandlor(req,e,res)
    })
  },
  downloadPublicFile:async(req,res)=>{
    const filename = req.params.filename
    Upload.findOne({where:{
        isPublic:true,
        file_name:filename
      }}).then(upload=>{

      return new Promise((resolve,reject)=>{

        if(upload){

          return resolve(upload)
        }
        else{

          return reject(new RecordNotFoundErr())

        }
      })
    }).then(upload=>{
      let options={
        root:path.join(__dirname,'../../assets/'+upload.path)
      }

      const filename = upload.file_name+'.'+upload.extension
      res.setHeader('Content-Disposition', 'attachment; filename='+filename);
      res.sendFile(filename, options,err=>{
        if(err){
          ErrorHandlor(req,new RecordNotFoundErr(),res)
        }
        else{
          console.log(filename)
        }
      })


    }).catch(e=>{
      ErrorHandlor(req,e,res)
    })
  }




}
