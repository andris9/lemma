/* HELPER FUNCTIONS */

module.exports.genFName = genFName;
module.exports.convertToWin1257 = convertToWin1257;
module.exports.convertFromWin1257 = convertFromWin1257;

function genFName(){
    return genFName.seed+"-"+(genFName.counter++);
}
genFName.seed = "T"+Date.now();
genFName.counter = 0;

function convertToWin1257(str){
    var c = [], ch, buf, lastCh;
    for(var i=0, len=str.length;i<len; i++){
        ch = str.charCodeAt(i);
        switch(ch){
            case 382: // ž
                ch = 254;
                break;
            case 381: // Ž
                ch = 222;
                break;
            case 353: // š
                ch = 240;
                break;
            case 352: // š
                ch = 208;
                break;
            case 0X0A: // insert \r before \n
                if(lastCh != 0x0D){
                    c[c.length] = 0x0D;
                }
        }
        c[c.length] = ch;
        lastCh = ch;
    }
    buf = new Buffer(c);

    return buf;
}

function convertFromWin1257(buf){
    var c = [], ch;
    for(var i=0, len = buf.length; i<len; i++){
        ch = buf[i];
        switch(ch){
            case 254:
                ch = 382;
                break;
            case 222:
                ch = 381;
                break;
            case 240:
                ch = 353;
                break;
            case 208:
                ch = 352;
                break;
            case 0X0D: // remove \r
                if(buf.length>i+1 && buf[i+1] == 0x0A){
                    continue;
                }else{
                    ch = 0x0A;
                }
                break;
        }
        c[c.length] = String.fromCharCode(ch);
    }
    return c.join("");
}