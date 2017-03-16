//extend date object for add months

var colors = ['#cccccc','#FFCDD2','#E57373','#E53935','#B71C1C']

function generateDREFs(data2017,data2016,data2015,geom){    
    initMap('#map',geom);
    var countries = data2017.map(function(d){return d['#country+code']});
    updateMap('#map',countries);
    generateTypes('#type',[data2017,data2016,data2015]);
    generateRegions('#region',[data2017,data2016,data2015]);
    generateHeadlineFigs(data2017);
    generateTimeGraph('#months',[data2017,data2016,data2015]);
    generateLists('#dreftable',data2017);
}

function generateAppeals(data2017,data2016,data2015,geom){    
    initMap('#mapappeals',geom);
    var countries = data2017.map(function(d){return d['#country+code']});
    updateMap('#mapappeals',countries);
    generateTypes('#typeappeals',[data2017,data2016,data2015]);
    generateRegions('#regionappeals',[data2017,data2016,data2015]);
    generateHeadlineFigs(data2017);
    generateTimeGraph('#monthsappeals',[data2017,data2016,data2015]);
    generateLists('#appealtable',data2017);
}

function generateHeadlineFigs(data,year){
    var drefs = 0;
    var appeals = 0;
    var operations = 0;
    var fundingRequested = 0;
    data.forEach(function(d){
        if(d['#meta+type']=='DREF'){
            drefs++;
        } else {
            appeals ++;
        }
        if(d['#meta+value']>0){
            fundingRequested+=d['#meta+value'];
            operations++;
        }
    });
    $('#drefs'+year).html(drefs);
    $('#appeals'+year).html(appeals);
    $('#operations'+year).html(operations);
    $('#funding'+year).html(niceFormatNumber(fundingRequested,true)+ ' (CHF)');
}

function generateLists(id,data){
    var html ='';
    data.forEach(function(d){
        var date = d['#date+start'].getDate();
        var month = '0'+parseInt(d['#date+start'].getMonth()+1);
        var year = d['#date+start'].getFullYear();
        html += '<tr><td>'+d['#crisis+name']+'</td><td>'+d['#country+name']+'</td><td>'+date+'-'+month+'-'+year+'</td><td>'+d['#crisis+type']+'</td><td>'+niceFormatNumber(d['#meta+value'])+'</td></tr>';
    });
    $(id).append(html);
}

function generateTypes(id,datalist){

    var newdata = [];
    var keys = [];

    datalist.forEach(function(data){
        newdata.push(d3.nest()
            .key(function(d) {
                if(keys.indexOf(d['#crisis+type'])==-1){
                    keys.push(d['#crisis+type']);
                } 
                return d['#crisis+type'];
            })
            .rollup(function(d) { 
                return d3.sum(d, function(g) {
                    return 1;
                });
            })
            .entries(data)
            .sort(function(a, b) {
                return b.values - a.values
            }));
    });
    keys.sort();
    var data = [['x'].concat(keys)];    
    newdata.forEach(function(year,i){
        var row = [String(2017-i)];
        keys.forEach(function(k){
            var value = 0;
            year.forEach(function(y){
                if(y.key==k){
                    value = y.values;
                }
            });
            row.push(value);
        });
        data.push(row);
    });

    var chart = c3.generate({
        bindto: id,
        padding: {
            left: 120
        },
        data: {
            x : 'x',
            columns: data,
            type: 'bar',
        },
        axis: {
            rotated: true,
            x: {
                type: 'category'
            }
        },
        color: {pattern:['#BFBFBF','#848484','#EE3224']},
        tooltip: {
            format: {
                value: function (value, ratio, id) {
                    return niceFormatNumber(value, true);
                }
            }
        }
    });
    var i=0;
    d3.select('#type').select('.c3-axis-y').selectAll('.tick').selectAll('text').attr('opacity',function(d){
        i++
        if(i % 3==0){
            return 1;
        } else {
            return 0;
        }
    });
}

function generateRegions(id,datalist){

        var newdata = [];
        var keys = [];

    datalist.forEach(function(data){
        newdata.push(d3.nest()
            .key(function(d) {
                if(keys.indexOf(d['#region+name'])==-1){
                    keys.push(d['#region+name']);
                } 
                return d['#region+name'];
            })
            .rollup(function(d) { 
                return d3.sum(d, function(g) {
                    return 1;
                });
            })
            .entries(data)
            .sort(function(a, b) {
                return b.values - a.values
            }));
    });
    keys.sort();
    var data = [['x'].concat(keys)];    
    newdata.forEach(function(year,i){
        var row = [String(2017-i)];
        keys.forEach(function(k){
            var value = 0;
            year.forEach(function(y){
                if(y.key==k){
                    value = y.values;
                }
            });
            row.push(value);
        });
        data.push(row);
    });

    var chart = c3.generate({
        bindto: id,
        padding: {
            left: 100
        },
        data: {
            x : 'x',
            columns: data,
            type: 'bar',
        },
        axis: {
            rotated: true,
            x: {
                type: 'category'
            }
        },
        color: {pattern:['#BFBFBF','#848484','#EE3224']},
        tooltip: {
            format: {
                value: function (value, ratio, id) {
                    return niceFormatNumber(value, true);
                }
            }
        }
    });

    var i=0;

    d3.select('#region').select('.c3-axis-y').selectAll('.tick').selectAll('text').attr('opacity',function(d){
        i++
        if(i % 4==0){
            return 1;
        } else {
            return 0;
        }
    });
}

function generateTimeGraph(id,datalist){
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    var newdata = [];
    var keys = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    datalist.forEach(function(data){
        newdata.push(d3.nest()
            .key(function(d) {
                return keys[d['#date+start'].getMonth()];
            })
            .rollup(function(d) { 
                return d3.sum(d, function(g) {
                    return 1;
                });
            })
            .entries(data)
            .sort(function(a, b) {
                return b.values - a.values
            }));
    });

    var data = [['x'].concat(keys)];    
    newdata.forEach(function(year,i){
        var row = [String(2017-i)];
        keys.forEach(function(k){
            var value = 0;
            year.forEach(function(y){
                if(y.key==k){
                    value = y.values;
                }
            });
            row.push(value);
        });
        data.push(row);
    });

    var chart = c3.generate({
        bindto: id,
        padding: {
            left: 60
        },
        data: {
            x : 'x',
            columns: data,
            type: 'bar',
        },
        axis: {
            x: {
                type: 'category'
            }
        },
        color: {pattern:['#BFBFBF','#848484','#EE3224']}
    });
}

function initMap(id,geom){
    var width = $(id).width(),
    height =  $(id).height();

    var svg = d3.select(id).append("svg")
        .attr("width", width)
        .attr("height", height);

    var projection = d3.geo.mercator()
        .center([0, 0])
        .scale(width/6.2)
        .translate([width / 2, height / 2]);    

    svg.selectAll("path")
      .data(geom.features)
      .enter().append("path")
      .attr("d", d3.geo.path().projection(projection))
      .attr('class','country')
      .attr('id',function(d){
        return 'country'+d.properties.ISO_A3;
      });
}

function updateMap(id,countries){
    //$('.country').removeClass('selected');

    countries.forEach(function(d){
        d3.select(id).selectAll('#country'+d).classed("selected", true);
    });
}

function dataPrep(data){
    var dateFormat = d3.time.format("%Y-%m-%d");
    var appealCodes = [];
    data.forEach(function(d,i){
        d['#meta+value']=d['#meta+value']*1
        if(appealCodes.indexOf(d['#meta+id'])>-1){
            d['#meta+value']=0
        } else {
            appealCodes.push(d['#meta+id']);
        }
        d['#date+start'] = dateFormat.parse(d['#date+start']);
    });

    return data;
}

function niceFormatNumber(num,round){
    if(!round){
        var format = d3.format("0,000");
        return format(num);
    } else {
        var output = d3.format(".4s")(num);
        if(output.slice(-1)=='k'){
            output = Math.round(output.slice(0, -1) * 1000);
            output = d3.format("0,000")(output);
        } else if(output.slice(-1)=='M'){
            output = d3.format(".1f")(output.slice(0, -1))+' million';
        } else if (output.slice(-1) == 'G') {
            output = output.slice(0, -1) + ' billion';
        } else {
            output = ''+d3.format(".3s")(num);
        }            
        return output;
    }
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

function load(){

    var dataURL2017 = 'https://beta.proxy.hxlstandard.org/data.json?filter10=cut&filter07=merge&merge-url07=https%3A//docs.google.com/spreadsheets/d/1Q8w79fodebq5BokKjnp1MCx7wvXzQmqJ4IG4gP7a8JA/edit%3Fusp%3Dsharing&merge-url09=https%3A//docs.google.com/spreadsheets/d/1GugpfyzridvfezFcDsl6dNlpZDqI8TQJw-Jx52obny8/edit%3Fusp%3Dsharing&select-query01-01=%23date%2Bstart%3E2016-12-31&filter06=select&cut-include-tags10=%23meta%2Bid%2C%23date%2Bstart%2C%23country%2Bname%2C%23country%2Bcode%2C%23crisis%2Bname%2C%23crisis%2Btype%2C%23targeted-cost%2C%23meta%2Bvalue%2C%23region%2Bname%2C%23meta%2Btype&merge-replace07=on&filter09=merge&filter08=replace-map&select-reverse06=on&select-query04-01=%23severity%3DEmergency&merge-keys09=%23country%2Bname&select-query02-01=%23date%2Bstart%3C2018-01-01&select-query06-01=%23severity%2Bcode%3DEA&filter01=select&merge-keys07=%23region%2Bcode&replace-map-url12=https%3A//docs.google.com/spreadsheets/d/11NaZOlM8YRn3bdbkoXj1vLlXWr7t9dLhdnURzzQD8Qg/edit%23gid%3D0&merge-tags07=%23region%2Bname&filter05=append&replace-regex11=on&replace-tags11=%23meta%2Btype&add-tag03=%23meta%2Btype&strip-headers=on&replace-value11=DREF&append-dataset05-01=https%3A//docs.google.com/spreadsheets/d/1bnAThPpBk2NkeVA2_XvVspTbvowDOe1ee2-SbF_qe0A/edit%23gid%3D0&filter04=select&url=https%3A//docs.google.com/spreadsheets/d/19pBx2NpbgcLFeWoJGdCqECT2kw9O9_WmcZ3O41Sj4hU/edit%23gid%3D0&add-value03=Emergency+Appeal&replace-pattern11=%5E%5Cs%2A%24&filter12=replace-map&filter03=add&filter02=select&replace-map-url08=https%3A//docs.google.com/spreadsheets/d/1hTE0U3V8x18homc5KxfA7IIrv1Y9F1oulhJt0Z4z3zo/edit&merge-tags09=%23country%2Bcode&filter11=replace';

    var dataURL2016 = 'https://beta.proxy.hxlstandard.org/data.json?filter10=cut&filter07=merge&merge-url07=https%3A//docs.google.com/spreadsheets/d/1Q8w79fodebq5BokKjnp1MCx7wvXzQmqJ4IG4gP7a8JA/edit%3Fusp%3Dsharing&merge-url09=https%3A//docs.google.com/spreadsheets/d/1GugpfyzridvfezFcDsl6dNlpZDqI8TQJw-Jx52obny8/edit%3Fusp%3Dsharing&select-query01-01=%23date%2Bstart%3E2015-12-31&filter06=select&cut-include-tags10=%23meta%2Bid%2C%23date%2Bstart%2C%23country%2Bname%2C%23country%2Bcode%2C%23crisis%2Bname%2C%23crisis%2Btype%2C%23targeted-cost%2C%23meta%2Bvalue%2C%23region%2Bname%2C%23meta%2Btype&merge-replace07=on&filter09=merge&filter08=replace-map&select-reverse06=on&select-query04-01=%23severity%3DEmergency&merge-keys09=%23country%2Bname&select-query02-01=%23date%2Bstart%3C2017-01-01&select-query06-01=%23severity%2Bcode%3DEA&filter01=select&merge-keys07=%23region%2Bcode&replace-map-url12=https%3A//docs.google.com/spreadsheets/d/11NaZOlM8YRn3bdbkoXj1vLlXWr7t9dLhdnURzzQD8Qg/edit%3Fusp%3Dsharing&merge-tags07=%23region%2Bname&force=on&filter05=append&replace-regex11=on&replace-tags11=%23meta%2Btype&add-tag03=%23meta%2Btype&strip-headers=on&replace-value11=DREF&append-dataset05-01=https%3A//docs.google.com/spreadsheets/d/1bnAThPpBk2NkeVA2_XvVspTbvowDOe1ee2-SbF_qe0A/edit%23gid%3D1515849183&filter04=select&url=https%3A//docs.google.com/spreadsheets/d/19pBx2NpbgcLFeWoJGdCqECT2kw9O9_WmcZ3O41Sj4hU/edit%23gid%3D0&add-value03=Emergency+Appeal&replace-pattern11=%5E%5Cs%2A%24&filter12=replace-map&filter03=add&filter02=select&replace-map-url08=https%3A//docs.google.com/spreadsheets/d/1hTE0U3V8x18homc5KxfA7IIrv1Y9F1oulhJt0Z4z3zo/edit&merge-tags09=%23country%2Bcode&filter11=replace';

    var dataURL2015 = 'https://beta.proxy.hxlstandard.org/data.json?filter10=cut&filter07=merge&merge-url07=https%3A//docs.google.com/spreadsheets/d/1Q8w79fodebq5BokKjnp1MCx7wvXzQmqJ4IG4gP7a8JA/edit%3Fusp%3Dsharing&merge-url09=https%3A//docs.google.com/spreadsheets/d/1GugpfyzridvfezFcDsl6dNlpZDqI8TQJw-Jx52obny8/edit%3Fusp%3Dsharing&select-query01-01=%23date%2Bstart%3E2014-12-31&filter06=select&cut-include-tags10=%23meta%2Bid%2C%23date%2Bstart%2C%23country%2Bname%2C%23country%2Bcode%2C%23crisis%2Bname%2C%23crisis%2Btype%2C%23targeted-cost%2C%23meta%2Bvalue%2C%23region%2Bname%2C%23meta%2Btype&merge-replace07=on&filter09=merge&filter08=replace-map&select-reverse06=on&select-query04-01=%23severity%3DEmergency&merge-keys09=%23country%2Bname&select-query02-01=%23date%2Bstart%3C2016-01-01&select-query06-01=%23severity%2Bcode%3DEA&filter01=select&merge-keys07=%23region%2Bcode&replace-map-url12=https%3A//docs.google.com/spreadsheets/d/11NaZOlM8YRn3bdbkoXj1vLlXWr7t9dLhdnURzzQD8Qg/edit%23gid%3D0&merge-tags07=%23region%2Bname&force=on&filter05=append&replace-regex11=on&replace-tags11=%23meta%2Btype&add-tag03=%23meta%2Btype&strip-headers=on&replace-value11=DREF&append-dataset05-01=https%3A//docs.google.com/spreadsheets/d/1bnAThPpBk2NkeVA2_XvVspTbvowDOe1ee2-SbF_qe0A/edit%23gid%3D1104224777&filter04=select&url=https%3A//docs.google.com/spreadsheets/d/19pBx2NpbgcLFeWoJGdCqECT2kw9O9_WmcZ3O41Sj4hU/edit%23gid%3D0&add-value03=Emergency+Appeal&replace-pattern11=%5E%5Cs%2A%24&filter12=replace-map&filter03=add&filter02=select&replace-map-url08=https%3A//docs.google.com/spreadsheets/d/1hTE0U3V8x18homc5KxfA7IIrv1Y9F1oulhJt0Z4z3zo/edit&merge-tags09=%23country%2Bcode&filter11=replace';


    var dataCall2017 = $.ajax({ 
        type: 'GET', 
        url: dataURL2017,
        dataType: 'json',
    });

    var dataCall2016 = $.ajax({ 
        type: 'GET', 
        url: dataURL2016,
        dataType: 'json',
    });

    var dataCall2015 = $.ajax({ 
        type: 'GET', 
        url: dataURL2015,
        dataType: 'json',
    });        

    var geomCall = $.ajax({ 
        type: 'GET', 
        url: worldmap, 
        dataType: 'json'
    });

    $.when(dataCall2017, dataCall2016, dataCall2015, geomCall).then(function(dataArgs2017, dataArgs2016, dataArgs2015, geomArgs){
        
        var data2017 = dataArgs2017[0];
        data2017 = dataPrep(hxlProxyToJSON(data2017));
        var drefs2017 = [];
        var appeals2017 = [];
        data2017.forEach(function(d){
            if(d['#meta+type']=='DREF'){
                drefs2017.push(d);
            } else {
                appeals2017.push(d);
            }
        });

        var data2016 = dataArgs2016[0];
        data2016 = dataPrep(hxlProxyToJSON(data2016));
        var drefs2016 = [];
        var appeals2016 = [];
        data2016.forEach(function(d){
            if(d['#meta+type']=='DREF'){
                drefs2016.push(d);
            } else {
                appeals2016.push(d);
            }
        });

        var data2015 = dataArgs2015[0];
        data2015 = dataPrep(hxlProxyToJSON(data2015));
        var drefs2015 = [];
        var appeals2015 = [];
        data2015.forEach(function(d){
            if(d['#meta+type']=='DREF'){
                drefs2015.push(d);
            } else {
                appeals2015.push(d);
            }
        });

        var geom = topojson.feature(geomArgs[0],geomArgs[0].objects.geom);
        generateDREFs(drefs2017,drefs2016,drefs2015,geom);
        generateAppeals(appeals2017,appeals2016,appeals2015,geom);
        generateHeadlineFigs(data2017,'2017');
        generateHeadlineFigs(data2016,'2016');
        generateHeadlineFigs(data2015,'2015');
    });
}

//before cuts
//https://proxy.hxlstandard.org/data/edit?filter01=select&select-query01-01=%23date%2Bstart%3E2016-12-31&filter02=select&select-query02-01=%23date%2Bstart%3C2018-01-01&filter03=append&append-dataset03-01=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1bnAThPpBk2NkeVA2_XvVspTbvowDOe1ee2-SbF_qe0A%2Fedit%23gid%3D0&filter04=merge&merge-url04=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1Q8w79fodebq5BokKjnp1MCx7wvXzQmqJ4IG4gP7a8JA%2Fedit%3Fusp%3Dsharing&merge-keys04=%23region%2Bcode&merge-tags04=%23region%2Bname&filter05=replace-map&replace-map-url05=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1hTE0U3V8x18homc5KxfA7IIrv1Y9F1oulhJt0Z4z3zo%2Fedit&filter06=merge&merge-url06=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1GugpfyzridvfezFcDsl6dNlpZDqI8TQJw-Jx52obny8%2Fedit%3Fusp%3Dsharing&merge-keys06=%23country%2Bname&merge-tags06=%23country%2Bcode&force=on&url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F19pBx2NpbgcLFeWoJGdCqECT2kw9O9_WmcZ3O41Sj4hU%2Fedit%23gid%3D0
//final url edit

//https://beta.proxy.hxlstandard.org/data/edit?filter01=select&select-query01-01=%23date%2Bstart%3E2016-12-31&filter02=select&select-query02-01=%23date%2Bstart%3C2018-01-01&filter03=add&add-tag03=%23meta%2Btype&add-value03=Emergency+Appeal&filter04=select&select-query04-01=%23severity%3DEmergency&filter05=append&append-dataset05-01=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1bnAThPpBk2NkeVA2_XvVspTbvowDOe1ee2-SbF_qe0A%2Fedit%23gid%3D0&filter06=merge&merge-url06=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1Q8w79fodebq5BokKjnp1MCx7wvXzQmqJ4IG4gP7a8JA%2Fedit%3Fusp%3Dsharing&merge-keys06=%23region%2Bcode&merge-tags06=%23region%2Bname&merge-replace06=on&filter07=replace-map&replace-map-url07=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1hTE0U3V8x18homc5KxfA7IIrv1Y9F1oulhJt0Z4z3zo%2Fedit&filter08=merge&merge-url08=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1GugpfyzridvfezFcDsl6dNlpZDqI8TQJw-Jx52obny8%2Fedit%3Fusp%3Dsharing&merge-keys08=%23country%2Bname&merge-tags08=%23country%2Bcode&filter09=cut&cut-include-tags09=%23meta%2Bid%2C%23date%2Bstart%2C%23country%2Bname%2C%23country%2Bcode%2C%23crisis%2Bname%2C%23crisis%2Btype%2C%23targeted-cost%2C%23meta%2Bvalue%2C%23region%2Bname%2C%23meta%2Btype&filter10=replace&replace-pattern10=%5E%5Cs*%24&replace-regex10=on&replace-value10=DREF&replace-tags10=%23meta%2Btype&strip-headers=on&url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F19pBx2NpbgcLFeWoJGdCqECT2kw9O9_WmcZ3O41Sj4hU%2Fedit%23gid%3D0
load();