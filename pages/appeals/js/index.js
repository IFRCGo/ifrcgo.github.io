

var url = 'https://proxy.hxlstandard.org/data.json?strip-headers=on&filter03=merge&cut-include-tags07=%23meta%2Bid%2C%23crisis%2Bname&clean-date-tags01=%23date&filter02=select&merge-keys03=%23meta%2Bid&filter04=replace-map&select-query06-01=%23meta%2Bfunding%3E0&filter05=merge&filter07=cut&merge-tags03=%23meta%2Bcoverage%2C%23meta%2Bfunding&merge-keys05=%23country%2Bname&merge-tags05=%23country%2Bcode&merge-url03=https%3A//docs.google.com/spreadsheets/d/1rVAE8b3uC_XIqU-eapUGLU7orIzYSUmvlPm9tI0bCbU/edit%23gid%3D0&filter01=clean&replace-map-url04=https%3A//docs.google.com/spreadsheets/d/1hTE0U3V8x18homc5KxfA7IIrv1Y9F1oulhJt0Z4z3zo/edit%3Fusp%3Dsharing&filter06=select&merge-url05=https%3A//docs.google.com/spreadsheets/d/1GugpfyzridvfezFcDsl6dNlpZDqI8TQJw-Jx52obny8/edit%3Fusp%3Dsharing&select-query02-01=%23date%2Bend%3E2016-09-01&url=https%3A//docs.google.com/spreadsheets/d/19pBx2NpbgcLFeWoJGdCqECT2kw9O9_WmcZ3O41Sj4hU/edit%23gid%3D0';
	$.ajax({
		type: 'GET', 
    	url: url,
    	dataType: 'json',
		success: function(result){
				var data = hxlProxyToJSON(result);
				appealsplus(data);
				console.log(data);
				data = data.sort(compare);	
				html = '';
				data.forEach(function(d){
					html+='<div class="col-md-4"><a href="code/#'+d['#meta+id']+'">'+d['#crisis+name']+'</a></div>';
				});
				$('#appeals').append(html);
			}
    	});

function appealsplus(data){
	var url = 'https://proxy.hxlstandard.org/data.json?strip-headers=on&filter01=count&cut-include-tags02=%23meta%2Bid&url=https%3A//docs.google.com/spreadsheets/d/1rJ5gt-JaburVcfzTeNmLglEWfhTlEuoaOedTH5T7Qek/edit%23gid%3D0&count-tags01=%23meta%2Bid&filter02=cut';
	$.ajax({
		type: 'GET', 
    	url: url,
    	dataType: 'json',
		success: function(result){
				console.log(result);
				var plus = hxlProxyToJSON(result);
				html = '';
				plus.forEach(function(p){
					var name='';
					data.forEach(function(d){
						if(d['#meta+id']==p['#meta+id']){
							name = d['#crisis+name'];
						}
					});
					html+='<div class="col-md-4"><a href="code/#'+p['#meta+id']+'">'+name+'</a></div>';
				});
				$('#appealplus').append(html);
			}
    	});
}

function compare(a,b) {
  if (a['#crisis+name'] < b['#crisis+name'])
    return -1;
  if (a['#crisis+name'] > b['#crisis+name'])
    return 1;
  return 0;
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