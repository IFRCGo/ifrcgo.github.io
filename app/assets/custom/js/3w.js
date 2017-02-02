function generateDash(data,geom,config){
    console.log(data);
    console.log(config);
    $('#datadownload').attr('href',config['download']);
    $('.title3w').html(config['title']);
    $('#description').html(config['description']);
    var cf = crossfilter(data);
        cf.whereDim = cf.dimension(function(d){return d[config['whereFieldName']]});
        cf.whoDim = cf.dimension(function(d){return d[config['whoFieldName']]});
        cf.whatDim = cf.dimension(function(d){return d[config['whatFieldName']]});

        cf.whereGroup = cf.whereDim.group();
        cf.whoGroup = cf.whoDim.group();
        cf.whatGroup = cf.whatDim.group();

        cf.whoChart = dc.rowChart('#whochart');
        cf.whatChart = dc.rowChart('#whatchart');
        cf.whereChart = dc.leafletChoroplethChart('#wherechart');

        cf.whoChart.width($('#whochart').width()).height(650)
            .dimension(cf.whoDim)
            .group(cf.whoGroup)
            .elasticX(true)
            .colors(['#CCCCCC', '#EF9A9A'])
            .colorDomain([0,1])
            .colorAccessor(function(d, i){return 1;})
            .ordering(function(d){ return -d.value })
            .xAxis().ticks(5);

        cf.whatChart.width($('#whatchart').width()).height(650)
            .dimension(cf.whatDim)
            .group(cf.whatGroup)
            .elasticX(true)
            .colors(['#CCCCCC', '#EF9A9A'])
            .colorDomain([0,1])
            .colorAccessor(function(d, i){return 1;})
            .ordering(function(d){ return -d.value })
            .xAxis().ticks(5);

        cf.whereChart.width($('#wherechart').width()).height(650)
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
                return feature.properties[config['joinAttribute']];
            })
            .popup(function(feature){
                return feature.properties[config['nameAttribute']];
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

        //config()
        /*
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
            */
    dc.renderAll();

    var map = cf.whereChart.map();

    zoomToGeom(geom);

    function zoomToGeom(geom){
        var bounds = d3.geo.bounds(geom);
        map.fitBounds([[bounds[0][1],bounds[0][0]],[bounds[1][1],bounds[1][0]]]);
    }

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

function createConfig(data){
    var config = {};
    data.forEach(function(d,i){
        config[d['#meta+key']]=d['#meta+value'];
    });
    return config;
}


// $('#loadingmodal').modal('show');

function processHash(){
    var hashid = decodeURIComponent(window.location.hash).substring(1);
    var hashurl = 'https://beta.proxy.hxlstandard.org/data.json?url=https%3A//docs.google.com/spreadsheets/d/17Qm5o5YTiSA7seoLDa8OQWcX8NPQW62PXfNG3BCn7mQ/edit%3Fusp%3Dsharing&strip-headers=on&filter01=select&force=on&select-query01-01=%23meta%2Bid%3D'+hashid;

    var hashCall = $.ajax({
        type: 'GET',
        url: hashurl,
        dataType: 'json',
        success: function(data){
            var data = hxlProxyToJSON(data)[0];
            var configCall = $.ajax({
                type: 'GET',
                url: data['#meta+config'],
                dataType: 'json',
            });

            var dataCall = $.ajax({
                type: 'GET',
                url: data['#meta+data'],
                dataType: 'json',
            });

            var geomCall = $.ajax({
                type: 'GET',
                url: data['#meta+geo'],
                dataType: 'json'
            });

            $.when(configCall, dataCall, geomCall).then(function(configArgs, dataArgs, geomArgs){
                var data = dataArgs[0];
                var config = createConfig(hxlProxyToJSON(configArgs[0]));
                data = hxlProxyToJSON(data);
                if(config['topojson']=='TRUE'){
                    var geom = topojson.feature(geomArgs[0],geomArgs[0].objects[config['toponame']]);
                } else  {
                    geom = geomArgs[0];
                }
                // $('#loadingmodal').modal('hide');
                generateDash(data,geom,config);
            });

        }
    });
}

processHash();
