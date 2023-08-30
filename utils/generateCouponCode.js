module.exports = (pattern)=>{
    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    function randomElem(arr) {
        return arr[randomInt(0, arr.length - 1)];
    }
    let charset= "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

    function generate(pattern) {
       
        return pattern.split('').map(function(char) {
            if(char==='#'){
                return randomElem(charset);
            }
            else{
                return char
            }
        }).join('');
        
    }
    return generate(pattern)

}