function generateDash(data,geom){

}

function hxlProxyToJSON(input,headers){
    var output = [];
    var keys=[]
    input.forEach(function(e,i){
        if(i==0){
            e.forEach(function(e2,i2){
                var parts = e2.split('+');
                var key = parts[0]
                if(parts.length>1){
                    var atts = parts.splice(1,parts.length);
                    atts.sort();
                    atts.forEach(function(att){
                        key +='+'+att
                    });
                }
                keys.push(key);
            });
        } else {
            var row = {};
            e.forEach(function(e2,i2){
                row[keys[i2]] = e2;
            });
            output.push(row);
        }
    });
    return output;
}

// $('#loadingmodal').modal('show');

var dataCall = $.ajax({
    type: 'GET',
    url: 'https://beta.proxy.hxlstandard.org/data.json?explode-header-att01=header&filter02=clean&filter01=explode&cut-exclude-tags04=%23sector%2Bvalue&explode-value-att01=value&url=https%3A//docs.google.com/spreadsheets/d/1n1SDhAOYxeMXqjlFZccV0G8bZJIy_tkE3KOP8dKhBNg/edit%3Fusp%3Dsharing&filter04=cut&clean-whitespace-tags02=%23sector%2Bvalue&select-query03-01=%23sector%2Bvalue%3DX&strip-headers=on&filter03=select',
    dataType: 'json',
});

$.when(dataCall).then(function(dataArgs){
    var data = dataArgs;
    data = hxlProxyToJSON(data);
    // $('#loadingmodal').modal('hide');
    generateDash(data);
});
