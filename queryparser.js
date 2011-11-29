module.exports = queryParser;

function queryParser(query){
    var querywords,
        word,
        parts,
        words = [],
        checklist = [],
        lemmamap = [],
        hpos1, hpos2,
        quotetype, firstquote, lastquote,
        i, len,
        skiplist = ["and", "or", "not"],
        txtcase;
    
    if(typeof query != "string" || !query.length){
        return {words:[], map:[], list:[]};
    }

    querywords = query.replace(/\s+/g," ").
        replace(/((?:[a-zA-ZõäöüšžÕÄÖÜŠŽ\?\*][a-zA-ZõäöüšžÕÄÖÜŠŽ\?\*\-\.]*\:?)|["'])/g,"\t$1\t").split("\t");

    for(i=0, len = querywords.length; i<len; i++){
        word = querywords[i];
        
        hpos1 = word.indexOf("\"");
        hpos2 = word.indexOf("'");
        
        if((hpos1>=0 || hpos2>=0) && !(i>0 && querywords[i-1] && querywords[i-1].substr(-1)=="\\")){

            if((hpos1>=0 && hpos1 < hpos2) || hpos2<0){
                quotetype = '"';
            }else{
                quotetype = "'";
            }
            firstquote = lastquote = i++;
            while(i<len){
                if(querywords[i].indexOf(quotetype)>=0 && !(i>0 && querywords[i-1] && querywords[i-1].substr(-1)=="\\")){
                    lastquote = ++i;
                    break;
                }else{
                    i++;
                }
            }
            i = firstquote;
            if(lastquote != firstquote){
                querywords.splice(firstquote, lastquote - firstquote, querywords.slice(firstquote, lastquote).join(""));
                len = querywords.length;
                if(i>=len)break;
            }
        }
    }
    
    for(i=0, len = querywords.length; i<len; i++){
        if((word = querywords[i])){
            words.push(word);
        }
    }

    for(i=0, len = words.length; i<len; i++){
        word = words[i]
        if(word && word.length>1 && word.substr(-1) == ":" && i < len - 1 && words[i+1].match(/^[a-zA-ZöäõüšžÕÄÖÜŠŽ\-\.]+$/)){
            words.splice(i, 2, words.slice(i, i + 2).join(""));
            i++;
            len = words.length;
        }else if(word && word.match(/\./)){
            parts = words[i].replace(/\./g,"\t.\t").split(/\t/);
            parts = [i,1].concat(parts);
            words.splice.apply(words, parts);
            i += parts.length-2;
            len = words.length;
        }
    }
    
    for(i=0, len = words.length; i<len; i++){
        if(words[i].match(/^[a-zA-ZöäõüšžÕÄÖÜŠŽ]/) && !words[i].match(/[\?\*\:]/) && skiplist.indexOf(words[i].toLowerCase())<0){
            if(words[i].match(/^[A-ZÕÄÖÜŠŽ\-]+$/)){
                txtcase = "allcaps";
            }else if(querywords[i].match(/^[A-ZÕÄÖÜŠŽ\-]+/)){
                txtcase = "firstcaps";
            }else{
                txtcase = "lower";
            }
            lemmamap.push({pos:i, word:words[i], txtcase: txtcase});
            checklist.push(words[i]);
        }
    }

    return {
        words: words,
        map: lemmamap,
        list: checklist
    }
}