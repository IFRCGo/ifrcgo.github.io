//extend date object for add months

var colors = ['#cccccc','#FFCDD2','#E57373','#E53935','#B71C1C']

function generateDash(data,geom){
    initMap(geom);
    var countries = data.map(function(d){return d['#country+code']});
    updateMap(countries);
    generateTypes(data);
    generateRegions(data);
    generateHeadlineFigs(data);
    generateTimeGraph(data);
}

function generateHeadlineFigs(data){
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
    $('#drefs').html(drefs);
    $('#appeals').html(appeals);
    $('#operations').html(operations);
    $('#funding').html(niceFormatNumber(fundingRequested,true)+ ' (CHF)');
}

function generateTypes(data){

    var data = d3.nest()
        .key(function(d) { return d['#crisis+type'];})
        .rollup(function(d) {
            return d3.sum(d, function(g) {return g['#meta+value']; });
        })
        .entries(data)
        .sort(function(a, b) {
            return b.values - a.values
        });

    var chart = c3.generate({
        bindto: '#type',
        padding: {
            left: 100
        },
        data: {
            json:data,
            keys: {
                x: 'key',
                value: ['values']
            },
            type: 'bar'
        },
        axis: {
            rotated: true,
            x: {
                type: 'category'
            }
        },
        color: {pattern:['#D33F49']},
        tooltip: {
            format: {
                value: function (value, ratio, id) {
                    return niceFormatNumber(value, true)+ ' (CHF)';
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

function generateRegions(data){

    var data = d3.nest()
        .key(function(d) { return d['#region+name'];})
        .rollup(function(d) {
            return d3.sum(d, function(g) {return g['#meta+value']; });
        })
        .entries(data)
        .sort(function(a, b) {
            return b.values - a.values
        });

    var chart = c3.generate({
        bindto: '#region',
        padding: {
            left: 100
        },
        data: {
            json:data,
            keys: {
                x: 'key',
                value: ['values']
            },
            type: 'bar'
        },
        axis: {
            rotated: true,
            x: {
                type: 'category'
            }
        },
        color: {pattern:['#D33F49']},
        tooltip: {
            format: {
                value: function (value, ratio, id) {
                    return niceFormatNumber(value, true)+ ' (CHF)';
                }
            }
        }
    });

    var i=0;

    d3.select('#region').select('.c3-axis-y').selectAll('.tick').selectAll('text').attr('opacity',function(d){
        i++
        if(i % 3==0){
            return 1;
        } else {
            return 0;
        }
    });
}

function generateTimeGraph(data){
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var graphData = [];
    months.forEach(function(m,i){
        graphData.push({'month':m,'drefs':0,'appeals':0,'monthIndex':i});
    });
    data.forEach(function(d){
        graphData.forEach(function(g){
            if(d['#date+start'].getMonth()==g['monthIndex']){
                if(d['#meta+type']=='DREF'){
                    g['drefs']++
                } else {
                    g['appeals']++
                }
            }
        });
    });

    var chart = c3.generate({
        bindto: '#months',
        padding: {
            left: 60
        },
        data: {
            json:graphData,
            keys: {
                x: 'month',
                value: ['drefs','appeals']
            },
            type: 'bar'
        },
        axis: {
            x: {
                type: 'category'
            }
        },
        color: {pattern:['#D33F49','#E57373']}
    });
}

function initMap(geom){
    var width = $('#map').width(),
    height =  $('#map').height();

    var svg = d3.select("#map").append("svg")
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

function updateMap(countries){
    $('.country').removeClass('selected');

    countries.forEach(function(d){
        d3.selectAll('#country'+d).classed("selected", true);
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
        console.log(output);
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

// $('#loadingmodal').modal('show');


startdate = '2016-12-31';
enddate = '2018-01-01';

//before cuts
//https://proxy.hxlstandard.org/data/edit?filter01=select&select-query01-01=%23date%2Bstart%3E2016-12-31&filter02=select&select-query02-01=%23date%2Bstart%3C2018-01-01&filter03=append&append-dataset03-01=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1bnAThPpBk2NkeVA2_XvVspTbvowDOe1ee2-SbF_qe0A%2Fedit%23gid%3D0&filter04=merge&merge-url04=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1Q8w79fodebq5BokKjnp1MCx7wvXzQmqJ4IG4gP7a8JA%2Fedit%3Fusp%3Dsharing&merge-keys04=%23region%2Bcode&merge-tags04=%23region%2Bname&filter05=replace-map&replace-map-url05=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1hTE0U3V8x18homc5KxfA7IIrv1Y9F1oulhJt0Z4z3zo%2Fedit&filter06=merge&merge-url06=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1GugpfyzridvfezFcDsl6dNlpZDqI8TQJw-Jx52obny8%2Fedit%3Fusp%3Dsharing&merge-keys06=%23country%2Bname&merge-tags06=%23country%2Bcode&force=on&url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F19pBx2NpbgcLFeWoJGdCqECT2kw9O9_WmcZ3O41Sj4hU%2Fedit%23gid%3D0
//final url edit
//https://beta.proxy.hxlstandard.org/data/edit?filter01=select&select-query01-01=%23date%2Bstart%3E2016-12-31&filter02=select&select-query02-01=%23date%2Bstart%3C2018-01-01&filter03=add&add-tag03=%23meta%2Btype&add-value03=Emergency+Appeal&filter04=select&select-query04-01=%23severity%3DEmergency&filter05=append&append-dataset05-01=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1bnAThPpBk2NkeVA2_XvVspTbvowDOe1ee2-SbF_qe0A%2Fedit%23gid%3D0&filter06=merge&merge-url06=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1Q8w79fodebq5BokKjnp1MCx7wvXzQmqJ4IG4gP7a8JA%2Fedit%3Fusp%3Dsharing&merge-keys06=%23region%2Bcode&merge-tags06=%23region%2Bname&merge-replace06=on&filter07=replace-map&replace-map-url07=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1hTE0U3V8x18homc5KxfA7IIrv1Y9F1oulhJt0Z4z3zo%2Fedit&filter08=merge&merge-url08=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1GugpfyzridvfezFcDsl6dNlpZDqI8TQJw-Jx52obny8%2Fedit%3Fusp%3Dsharing&merge-keys08=%23country%2Bname&merge-tags08=%23country%2Bcode&filter09=cut&cut-include-tags09=%23meta%2Bid%2C%23date%2Bstart%2C%23country%2Bname%2C%23country%2Bcode%2C%23crisis%2Bname%2C%23crisis%2Btype%2C%23targeted-cost%2C%23meta%2Bvalue%2C%23region%2Bname%2C%23meta%2Btype&filter10=replace&replace-pattern10=%5E%5Cs*%24&replace-regex10=on&replace-value10=DREF&replace-tags10=%23meta%2Btype&strip-headers=on&url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F19pBx2NpbgcLFeWoJGdCqECT2kw9O9_WmcZ3O41Sj4hU%2Fedit%23gid%3D0
var dataCall = $.ajax({
    type: 'GET',
    url: 'https://beta.proxy.hxlstandard.org/data.json?merge-replace06=on&merge-keys08=%23country%2Bname&filter10=replace&filter02=select&select-query01-01=%23date%2Bstart%3E2016-12-31&merge-keys06=%23region%2Bcode&filter03=add&replace-value10=DREF&filter01=select&filter06=merge&select-query04-01=%23severity%3DEmergency&merge-tags06=%23region%2Bname&merge-url08=https%3A//docs.google.com/spreadsheets/d/1GugpfyzridvfezFcDsl6dNlpZDqI8TQJw-Jx52obny8/edit%3Fusp%3Dsharing&add-tag03=%23meta%2Btype&filter05=append&filter09=cut&replace-map-url07=https%3A//docs.google.com/spreadsheets/d/1hTE0U3V8x18homc5KxfA7IIrv1Y9F1oulhJt0Z4z3zo/edit&url=https%3A//docs.google.com/spreadsheets/d/19pBx2NpbgcLFeWoJGdCqECT2kw9O9_WmcZ3O41Sj4hU/edit%23gid%3D0&add-value03=Emergency+Appeal&cut-include-tags09=%23meta%2Bid%2C%23date%2Bstart%2C%23country%2Bname%2C%23country%2Bcode%2C%23crisis%2Bname%2C%23crisis%2Btype%2C%23targeted-cost%2C%23meta%2Bvalue%2C%23region%2Bname%2C%23meta%2Btype&filter07=replace-map&filter08=merge&replace-pattern10=%5E%5Cs%2A%24&strip-headers=on&merge-tags08=%23country%2Bcode&merge-url06=https%3A//docs.google.com/spreadsheets/d/1Q8w79fodebq5BokKjnp1MCx7wvXzQmqJ4IG4gP7a8JA/edit%3Fusp%3Dsharing&append-dataset05-01=https%3A//docs.google.com/spreadsheets/d/1bnAThPpBk2NkeVA2_XvVspTbvowDOe1ee2-SbF_qe0A/edit%23gid%3D0&select-query02-01=%23date%2Bstart%3C2018-01-01&filter04=select&replace-tags10=%23meta%2Btype&replace-regex10=on',
    dataType: 'json',
});


var geomCall = $.ajax({
    type: 'GET',
    url: worldmap,
    dataType: 'json'
});

$.when(dataCall, geomCall).then(function(dataArgs, geomArgs){
    var data = dataArgs[0];
    data = dataPrep(hxlProxyToJSON(data));
    var geom = topojson.feature(geomArgs[0],geomArgs[0].objects.geom);
    console.log(data);
    // $('#loadingmodal').modal('hide');
    generateDash(data,geom);
});
