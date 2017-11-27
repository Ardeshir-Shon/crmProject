var R = require("r-script");
var dataFrame = require("dataframe-js");
var out = R("test.R").data(4).callSync();
console.log(dataFrame(out))
    //console.log(JSON.parse(JSOout[0]));