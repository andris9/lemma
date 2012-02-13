var util = require('util'),
    exec = require('child_process').exec,
    fs = require("fs"),
    pathlib = require("path"),
    helpers = require("./helpers");

module.exports.findLemmas = findLemmas;

module.exports.config = {
    morfdir: pathlib.join("C:","lemma", "morf");
    tempdir: "R:"
};

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
    fpath = pathlib.join(module.exports.config.tempdir, fname);

    output = convertToWin1257(words.join("\n"));

    fs.writeFile(fpath+".txt", output, function(err){
        if(err){
            return callback(err);
        }
        makeLemma(fpath, callback);
    });
}

function makeLemma(fpath, callback){
    var morfpath = pathlib.join(module.exports.config.morfdir, "ESTMORF.EXE");

    exec(morfpath + ' -B "' + fpath+'.txt"',{
            cwd: module.exports.config.morfdir
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
