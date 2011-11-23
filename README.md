# Lemma

**lemma** finds canonical forms of estonian language words. This is a wrapper for ESTMORF.EXE

## Installation

    npm install lemma

## Usage

**lemma(words, callback)** where

  * **words** is a single word (a string) or a set of words (an array)
  * **callback** is the return callback with two parameters - `err` if there was an error and `lemmas` which is an object in the form of `{"word":["lemma1", "lemma2"]}`

Example:

    var lemma = require("lemma");

    lemma("vanamehed", function(err, lemmas){
        console.log(lemmas["vanamehed"]); //  [ 'vanamees', 'vana', 'mees', 'mesi' ]
    });

## License

**MIT**