var lemma = require("./lemma"),
    pathlib = require("path");

/*
soovitaja.morfdir = pathlib.join("/", "Users","andris","estmorf");
soovitaja.morfpath = "wine" +  " ESTMORF.EXE";
soovitaja.tempdir = pathlib.join("/", "Users","andris","Desktop","tmp");
*/

query = 'mis seee seee* veel ollema peaks? title:"terre teree, vanna kerre"';

lemma.queryCheck(query, function(err, output){
    console.log(err || output);
});