const generateCode = ()=>{
    
    const generateMagicNumber = (n)=>{
        return (Math.floor(n/10)<5)?(n*(10**(5-(Math.floor(n/10))))):n
    }
    return generateMagicNumber(Math.floor(Math.random()*(10**6)))
}
module.exports = generateCode