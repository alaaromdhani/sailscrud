const generateCardCode = (length)=>{
    const cardCode =(len)=>{
        let today = new Date()
       return generateMagicNumber(Math.floor(Math.random()*(10**len)),len)+''+generateMagicNumber(Math.floor(Math.random()*(10**len)),len)+""+generateMagicNumber(today.getDay(),len)+''+generateMagicNumber(today.getMonth(),len)
    } 
    const generateMagicNumber = (n,length)=>{
        return (""+n+"").length==length?n:n*(10**(length-(""+n+"").length))
    }
    return cardCode(length)
}

module.exports = generateCardCode