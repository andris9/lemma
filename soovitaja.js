var fs = require("fs"),
    exec = require('child_process').exec,
    pathlib = require("path");

module.exports.morfdir = pathlib.join("C:","morf");
module.exports.morfpath = pathlib.join(module.exports.morfdir, "ESTMORF.EXE");
module.exports.tempdir = "E:";

module.exports.checkQuery = checkQuery;

function checkQuery(query, callback){

    var querywords = query.replace(/\s+/g," ").
            replace(/[:]\s*/g,": ").
            replace(/([a-zA-ZõäöüšžÕÄÖÜŠŽ\-]+)/g,"\t$1\t").split("\t"),
        i, len, querytree = [], txtcase, morftext=[];

    for(i=1, len = querywords.length; i<len-1; i+=2){
        
        if(querywords[i].match(/^[A-ZÕÄÖÜŠŽ\-]+$/)){
            txtcase = "allcaps";
        }else if(querywords[i].match(/^[A-ZÕÄÖÜŠŽ\-]+/)){
            txtcase = "firstcaps";
        }else{
            txtcase = "lower";
        }

        querytree.push({
            word: querywords[i],
            pos: i,
            txtcase: txtcase
        });

        morftext.push(querywords[i]);
    }

    morfSoovitaja(morftext, function(err, body){
    
        if(err){
            return callback(err);
        }

        var lines = body.split(/[\r\n]+/),
            currentWord,
            wordlist = {},
            fixed = [];

        lines.forEach(function(line){
            var words;

            if(!line.length)return;

            if(line.match(/^\s+/)){
                if(!currentWord || wordlist[currentWord])return;

                words = line.trim().split(/\s+/);
                for(i=0, len = words.length; i<len; i++){
                    if(words[i].toLowerCase() == currentWord){
                        wordlist[currentWord] = words[i];
                        return;
                    }
                }

                wordlist[currentWord] = words.length && words[0] || currentWord;
            }else{
                currentWord = line.trim().toLowerCase();
            }
        });

        querytree.forEach(function(word){
            if((currentWord = wordlist[word.word.toLowerCase()]) && currentWord.toLowerCase() != word.word.toLowerCase()){
                switch(word.txtcase){
                    case "allcaps":
                        currentWord = currentWord.toUpperCase();
                        break;
                    case "firstcaps":
                        currentWord = currentWord.toLowerCase();
                        currentWord = currentWord.substr(0,1).toUpperCase() + currentWord.substr(1);
                        break;
                }
                fixed.push(word.pos);
            }else{
                currentWord = word.word;
            }

            querywords[word.pos] = currentWord;
        });

        callback(null, {
            words: querywords,
            fixed: fixed
        });
    });
}

function morfSoovitaja(words, callback){
    fname = genFName();

    fpath = pathlib.join(module.exports.tempdir, fname);

    output = convertToWin1257(words.join("\n"));

    fs.writeFile(fpath+".txt", output, function(err){
        if(err){
            return callback(err);
        }
        exec(module.exports.morfpath + ' -X "' + fpath+'.txt"',{
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

                    if(err){
                        return callback(err);
                    }

                    var body = (convertFromWin1257(data) || "").toString("utf-8").trim();
                    
                    callback(null, body);
                });
            });

    });

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