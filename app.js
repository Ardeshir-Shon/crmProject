var R = require("r-script");
    var out = R("RModules/1_extractRFM.R").data(__dirname.replace(/\\/g,'/')).callSync();
    var out = R("RModules/2_normalization.R").data(__dirname.replace(/\\/g,'/')).callSync();
    var out = R("RModules/3_optimumNumber.R").data(__dirname.replace(/\\/g,'/')).callSync();

console.log(__dirname.replace(/\\/g,'/'))
    //console.log(JSON.parse(JSOout[0]));