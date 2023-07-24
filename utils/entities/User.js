class User{
    constructor(u){
      Object.keys(u).filter(k=>!u[k]||k!="password" ).filter(k=>{
        this[k] = u[k]
      })
    }
}