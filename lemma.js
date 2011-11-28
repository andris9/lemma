var util = require('util'),
    exec = require('child_process').exec,
    fs = require("fs"),
    pathlib = require("path");

module.exports = findLemmas;

module.exports.morfdir = pathlib.join("C:","morf");
module.exports.morfpath = pathlib.join(module.exports.morfdir, "ESTMORF.EXE");
module.exports.tempdir = "E:";

function findLemmas(words, callback){
    var word, fname, fpath, output;

    if(typeof words == "string"){
        words = [words];
    }

    if(!Array.isArray(words) || !words.length){
        return callback();
    }

    for(i=words.length-1; i>=0; i--){
        word = (words[i] || "").toString("utf-8").trim();
        if(!word.length){
            words.splice(i,1);
        }else{
            words[i] = word;
        }
    }

    if(!words.length){
        return callback();
    }

    fname = genFName();
    fpath = pathlib.join(module.exports.tempdir, fname);

    output = convertToWin1257(words.join("\n"));

    fs.writeFile(fpath+".txt", output, function(err){
        if(err){
            return callback(err);
        }
        makeLemma(fpath, callback);
    });
}

function makeLemma(fpath, callback){
    exec(module.exports.morfpath + ' -B "' + fpath+'.txt"',{
            cwd: module.exports.morfdir
        },
        function (err, stdout, stderr) {
            if(err){
                fs.unlink(fpath+".txt");
                return callback(err);
            }
            fs.readFile(fpath+".mrf", function(err, data){
                fs.unlink(fpath+".txt");
                fs.unlink(fpath+".mrf");

                var lemmatxt = (convertFromWin1257(data) || "").toString("utf-8").trim();
                
                parseLemma(lemmatxt, callback);
            });
        });

}

function parseLemma(lemmatxt, callback){
    var lines = lemmatxt.split("\n"),
        words = {}, curword, lemma;

    for(var i=0, len=lines.length; i<len; i++){
        if(lines[i].match(/^\S/)){
            curword = lines[i].trim();
        }else{
            if(curword){
                if(!words[curword]){
                    words[curword] = [];
                }
                if((lemma = lines[i].trim()) && !lemma.match(/#/)){
                    words[curword].push(lemma);
                }
            }
        }
    }

    callback(null, words);
}

/* HELPER FUNCTIONS */

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