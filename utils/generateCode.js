const generateCode = ()=>{
    
    const generateMagicNumber = (n)=>{
        return (""+n+"").length==6?n:n*(10**(6-(""+n+"").length))
    }
    return generateMagicNumber(Math.floor(Math.random()*(10**6)))
}
module.exports = generateCode