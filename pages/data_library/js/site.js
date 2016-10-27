function generateDash(data){
    html='';
    data.forEach(function(d){
        html+='<tr class="tablerow"><td>'+d['#meta+title']+'</td><td>'+d['#description']+'</td>'
        if(d['#meta+download']!=''){
            html+='<td><a href="'+d['#meta+download']+'" target="_blank">Link</a></td>'
        } else {
            html+= '<td></td>';
        }
        if(d['#meta+googlesheet']!=''){
            html+='<td><a href="'+d['#meta+googlesheet']+'" target="_blank">Link</a></td>'
        } else {
            html+= '<td></td>';
        }
        if(d['#meta+hxlproxy']!=''){
            html+='<td><a href="'+d['#meta+hxlproxy']+'" target="_blank">Link</a></td>'
        } else {
            html+= '<td></td>';
        }
        if(d['#meta+viz']!=''){
            html+='<td><a href="'+d['#meta+viz']+'" target="_blank">Link</a></td>'
        } else {
            html+= '<td></td>';
        }
        html += '<td>'+d['#meta+collaborate']+'</td></tr>';
    });
    $('#content').html(html);
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

$('#loadingmodal').modal('show');

var dataCall = $.ajax({ 
    type: 'GET', 
    url: 'https://proxy.hxlstandard.org/data.json?strip-headers=on&url=https%3A//docs.google.com/spreadsheets/d/1HXOdqQdf61n52WtyrDQZVcfvzdL9AMmQMiqMpPK9n88/edit%3Fusp%3Dsharing',
    dataType: 'json',
});

$.when(dataCall).then(function(dataArgs){
    var data = dataArgs;
    data = hxlProxyToJSON(data);
    $('#loadingmodal').modal('hide');
    generateDash(data);
});