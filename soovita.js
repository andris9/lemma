var soovitaja = require("./soovitaja"),
    pathlib = require("path");

soovitaja.morfdir = pathlib.join("/", "Users","andris","estmorf");
soovitaja.morfpath = "wine" +  " ESTMORF.EXE";
soovitaja.tempdir = pathlib.join("/", "Users","andris","Desktop","tmp");

query = "Kas see voi teine?"

soovitaja.checkQuery(query, function(err, data){
    if(err){
        console.log(err.message);
        console.log(err.stack);
        return
    }

    if(!data.fixed || !data.fixed.length){
        console.log("Kõik õige!");
        return;
    }

    var s1, s2;

    s1 = data.words.join("");

    for(var i=0, len=data.fixed.length; i<len; i++){
        data.words[data.fixed[i]] = "<strong>" + data.words[data.fixed[i]] + "</strong>";
    }

    s2 = data.words.join("");


    console.log(query);
    console.log(s1)
    console.log(s2)  
});
