module.exports = {
    fileUploader:(req,callback)=>{
        callback(null,{upstreamKeys:Object.keys(req._fileparser.upstreams[0]._files[0])})


    }




}