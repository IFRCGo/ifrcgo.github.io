function generateDash(data,geom){
    var cf = crossfilter(data);
        cf.whereDim = cf.dimension(function(d){return d['#country+code']});
        cf.whoDim = cf.dimension(function(d){return d['#org']});
        cf.whatDim = cf.dimension(function(d){return d['#sector']});

        cf.whereGroup = cf.whereDim.group();
        cf.whoGroup = cf.whoDim.group();
        cf.whatGroup = cf.whatDim.group();

        cf.whoChart = dc.rowChart('#whochart');
        cf.whatChart = dc.rowChart('#whatchart');
        cf.whereChart = dc.leafletChoroplethChart('#wherechart');

        cf.whoChart.width($('#whochart').width()).height(700)
            .dimension(cf.whoDim)
            .group(cf.whoGroup)
            .elasticX(true)
            .colors(['#CCCCCC', '#EF9A9A'])
            .colorDomain([0,1])
            .colorAccessor(function(d, i){return 1;})
            .ordering(function(d){ return -d.value })
            .xAxis().ticks(5);

        cf.whatChart.width($('#whatchart').width()).height(700)
            .dimension(cf.whatDim)
            .group(cf.whatGroup)
            .elasticX(true)
            .colors(['#CCCCCC', '#EF9A9A'])
            .colorDomain([0,1])
            .colorAccessor(function(d, i){return 1;})
            .ordering(function(d){ return -d.value })
            .xAxis().ticks(5);

        cf.whereChart.width($('#wherechart').width()).height(700)
            .dimension(cf.whereDim)
            .group(cf.whereGroup)
            .center([0,0])
            .zoom(1)    
            .geojson(geom)
            .colors(['#999999', '#B71C1C'])
            .colorDomain([0, 1])
            .colorAccessor(function (d) {
                var c=0;
                if (d>0) {
                    c=1;
                }
                    return c;
                })          
            .featureKeyAccessor(function(feature){
                return feature.properties['ISO_A3'];
            })
            .popup(function(feature){
                return feature.properties['NAME'];
            })
            .renderPopup(true)
            .featureOptions({
                'fillColor': '#cccccc',
                'color': '#cccccc',
                'opacity':1,
                'fillOpacity': 0,
                'weight': 1
            });

        cf.whereChart.on("postRedraw",(function(e){
                var html = "";
                e.filters().forEach(function(l){
                    html += l+", ";
                });
                $('#mapfilter').html(html);
            }));      

        dc.dataTable("#data-table")
            .dimension(cf.whereDim)                
            .group(function (d) {
                    return 0;
            })
            .ordering(function(d){ return -d.value })
            .size(650)
            .columns([
                function(d){
                   return d['#country+name']; 
                },
                function(d){
                   return d['#org']; 
                },
                function(d){
                   return d['#sector']; 
                },
                function(d){
                    if(d['#meta+url'].length>0){
                        return '<a href="'+d['#meta+url']+'" target="_blank">Link</a>';
                    } else {
                        return 'No link available';
                    }
                }
            ]).sortBy(function(d) {
                return d['#country+name'];
            });                        

            dc.renderAll();

    var g = d3.selectAll('#whochart').select('svg').append('g');
    
    g.append('text')
        .attr('class', 'x-axis-label')
        .attr('text-anchor', 'middle')
        .attr('x', $('#whochart').width()/2)
        .attr('y', 700)
        .text('Activities');

    var g = d3.selectAll('#whatchart').select('svg').append('g');
    
    g.append('text')
        .attr('class', 'x-axis-label')
        .attr('text-anchor', 'middle')
        .attr('x', $('#whatchart').width()/2)
        .attr('y', 700)
        .text('Activities');            

            $('#reset').on('click',function(){
                dc.filterAll();
                dc.redrawAll();
            }); 
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
    url: 'https://proxy.hxlstandard.org/data.json?strip-headers=on&url=https%3A//docs.google.com/spreadsheets/d/1Yq9uFEM0FKFDfhi7rlkhU2L6TmNOSky91MZSFn24F7Y/edit%23gid%3D0',
    dataType: 'json',
});

var geomCall = $.ajax({ 
    type: 'GET', 
    url: '/data/worldmap.json', 
    dataType: 'json'
});

$.when(dataCall, geomCall).then(function(dataArgs, geomArgs){
    var data = dataArgs[0];
    data = hxlProxyToJSON(data);
    var geom = topojson.feature(geomArgs[0],geomArgs[0].objects.geom);
    $('#loadingmodal').modal('hide');
    generateDash(data,geom);
});