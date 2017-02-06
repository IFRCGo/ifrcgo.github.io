//extend date object for add months

var colors = ['#cccccc','#FFCDD2','#E57373','#E53935','#B71C1C']

Date.isLeapYear = function (year) {
    return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
};

Date.getDaysInMonth = function (year, month) {
    return [31, (Date.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
};

Date.prototype.isLeapYear = function () {
    return Date.isLeapYear(this.getFullYear());
};

Date.prototype.getDaysInMonth = function () {
    return Date.getDaysInMonth(this.getFullYear(), this.getMonth());
};

Date.prototype.addMonths = function (value) {
    var n = this.getDate();
    this.setDate(1);
    this.setMonth(this.getMonth() + value);
    this.setDate(Math.min(n, this.getDaysInMonth()));
    return this;
};

function generateDash(data,geom){


    function reduceAdd(p, v) {
        v['months'].forEach (function(val, idx) {
            if(p[val] == undefined){
                p[val] = {};
                p[val].key = val;
            }
            p[val].value = (p[val].value || 0) + 1; //increment counts
        });
        return p;
    }

    function reduceRemove(p, v) {
         v['months'].forEach (function(val, idx) {
            if(p[val] == undefined){
                p[val] = {};
                p[val].key = val;
            }
            p[val].value = (p[val].value || 0) - 1; //increment counts
        });
        return p;
    }

    function reduceInitial() {
           return {};
    }

    var rowtip = d3.tip().attr('class', 'd3-tip').html(function(d) { return d.key+': '+d3.format('0,000')(d.value); });

    var timeLine = dc.lineChart('#time_chart');
    var disasterType = dc.rowChart('#disastertype_chart');
    var region = dc.rowChart('#region_chart');
    var map = dc.leafletChoroplethChart('#map');

    var cf = crossfilter(data);

    var timeDimension = cf.dimension(function(d){ return d['months']; });
    var timeGroup = timeDimension.groupAll().reduce(reduceAdd, reduceRemove, reduceInitial).value();

    timeGroup.all = function() {
            var newObject = [];
            for (var key in this) {
              if (this.hasOwnProperty(key) && key !== "all") {
                newObject.push({
                  key: this[key].key,
                  value: this[key].value
                });
              }
            }
            newObject.sort(
                function(a, b) {
                    return a.key - b.key;
                }
            )
            return newObject;
    };

    var disasterTypeDimension = cf.dimension(function(d){return d['#crisis+type']});
    var disasterTypeGroup = disasterTypeDimension.group().reduceSum(function(d){
        var val = parseInt(d['#meta+value']);
        if(isNaN(val)){
            val=0;
        }
        return d['#meta+value']
    });

    var regionDimension = cf.dimension(function(d){return d['#region+name']});
    var regionGroup = regionDimension.group().reduceSum(function(d){
        var val = parseInt(d['#meta+value']);
        if(isNaN(val)){
            val=0;
        }
        return d['#meta+value']
    });

    var mapDimension = cf.dimension(function(d){return d['#country+code']});
    var mapGroup = mapDimension.group();

    var countryDimension = cf.dimension(function(d){return d['#country+name']});
    var countryGroup = countryDimension.group();

    var beneficiaryAll = cf.groupAll().reduceSum(function(d){
        if(isNaN(d['#targeted'])){
            return 0
        } else {
            return d['#targeted'];
        }
    });

    var drefAll = cf.groupAll().reduceSum(function(d){
        if(isNaN(d['#meta+value'])){
            return 0
        } else {
            return d['#meta+value'];
        }
    });



    var maxDate = d3.max(data, function(d) {
        return d3.max(d.months);
    });

    var minDate = d3.min(data, function(d) {
        return d3.min(d.months);
    });

    var xScaleRange = d3.time.scale().domain([minDate, maxDate]);

    var all = cf.groupAll();

    timeLine
        .width($('#time_chart').width())
        .height(100)
        .dimension(timeDimension)
        .group(timeGroup)
        .x(xScaleRange)
        .elasticY(true);

    timeLine.filterHandler (function (dimension, filters) {
        dimension.filter(null);
        if (filters.length === 0){
            dimension.filter(null);
        } else {
            console.log(filters);
            dimension.filterFunction(function (d) {
                for (var i=0; i < d.length; i++) {
                    if (filters[0][0]<d[i] && filters[0][1]>d[i]) return true;
                }
                return false;
            });
        return filters;
        }
    });

    disasterType
        .width($('#disasterType_chart').width())
        .height(650)
        .cap(20)
        .ordering(function(d){ return -d.value })
        .dimension(disasterTypeDimension)
        .group(disasterTypeGroup)
        .elasticX(true)
        .colors([colors[0], colors[3]])
        .colorDomain([0, 1])
        .colorAccessor(function (d) {
            return 1;
        })
        .xAxis().ticks(4);

    region
        .width($('#region_chart').width())
        .height(200)
        .dimension(regionDimension)
        .group(regionGroup)
        .elasticX(true)
        .colors([colors[0], colors[3]])
        .colorDomain([0, 1])
        .colorAccessor(function (d) {
            return 1;
        })
        .xAxis().ticks(4);

    dc.dataCount('#count-info')
            .dimension(cf)
            .group(all);

    dc.dataCount('#bentotal')
        .dimension(cf)
        .group(beneficiaryAll);

    dc.dataCount('#dreftotal')
        .dimension(cf)
        .group(drefAll);

    map.width($('#map').width()).height(250)
            .dimension(mapDimension)
            .group(mapGroup)
            .center([0,0])
            .zoom(2)
            .geojson(geom)
            .colors(colors)
            .colorDomain([0, 4])
            .colorAccessor(function (d) {
                if(d>10){
                    return 4;
                } else if(d>5){
                    return 3;
                } else if(d>1){
                    return 2;
                } else if (d>0){
                    return 1;
                } else {
                    return 0;
                }
            })
            .featureKeyAccessor(function(feature){
                return feature.properties['ISO_A3'];
            })
            .popup(function(feature){
                return feature.properties['NAME'];
            })
            .renderPopup(true)
            .featureOptions({
                'fillColor': 'gray',
                'color': 'gray',
                'opacity':0,
                'fillOpacity': 0,
                'weight': 1
            });

        map.on("postRedraw",(function(e){
                var html = "";
                e.filters().forEach(function(l){
                    html += l+", ";
                });
                $('#mapfilter').html(html);
            }));


        dc.dataTable("#data-table")
            .dimension(countryDimension)
            .group(function (d) {
                return d[countryGroup];
            })
            .ordering(function(d){ return -d.value })
            .size(650)
            .columns([
                function(d){
                   return d['#country+name'];
                },
                function(d){
                   return d['#region_name'];
                },
                function(d){
                   return d['#crisis+type'];
                },
                function(d){
                   return d['#date+start'].getDate()  + "-" + (d['#date+start'].getMonth()+1) + "-" + d['#date+start'].getFullYear();
                },
                function(d){
                   return d['#date+end'].getDate()  + "-" + (d['#date+end'].getMonth()+1) + "-" + d['#date+end'].getFullYear();;
                },
                function(d){
                   return niceFormatNumber(d['#meta+value'],false);
                },
                function(d){
                   return niceFormatNumber(d['#targeted'],false);
                }
            ]);

    dc.renderAll();

    map = map.map();
    map.scrollWheelZoom.disable();


    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            labels = ['0','1','2 to 5','5 to 9' ,'10+'];

        for (var i = 0; i < labels.length; i++) {
            div.innerHTML +='<i style="background:' + colors[i] + '"></i> ' + labels[i] + '<br />';
        }

        return div;
    };

    legend.addTo(map);

    d3.selectAll('g.row').call(rowtip);
    d3.selectAll('g.row').on('mouseover', rowtip.show).on('mouseout', rowtip.hide);


    $('#lasttwelve').on("click",function(){
        var now = new Date();
        var then = new Date();
        then.addMonths(-12);
        filterDates(then,now);
    });

    $('#lastsix').on("click",function(){
        var now = new Date();
        var then = new Date();
        then.addMonths(-6);
        filterDates(then,now);
    });

    $('#filter2017').on("click",function(){
        filterDates(new Date(2016,11,31),new Date(2017,11,31));
    });

    $('#filter2016').on("click",function(){
        filterDates(new Date(2015,11,31),new Date(2016,11,31));
    });

    $('#filter2015').on("click",function(){
        filterDates(new Date(2014,11,31),new Date(2015,11,31));
    });

    $('#filter2014').on("click",function(){
        filterDates(new Date(2013,11,31),new Date(2014,11,31));
    });

    $('#filter2013').on("click",function(){
        filterDates(new Date(2012,11,31),new Date(2013,11,31));
    });

    $('#filter2012').on("click",function(){
        filterDates(new Date(2011,11,31),new Date(2012,11,31));
    });

    $('#filter2011').on("click",function(){
        filterDates(new Date(2010,11,31),new Date(2011,11,31));
    });

    $('#filter2010').on("click",function(){
        filterDates(new Date(2010,0,1),new Date(2010,11,31));
    });

    $('#filter2000').on("click",function(){
        filterDates(new Date(2000,0,1),new Date(2009,11,31));
    });

    $('#filter1990').on("click",function(){
        filterDates(new Date(1990,0,1),new Date(1999,11,31));
    });

    $('#filter1980').on("click",function(){
        filterDates(new Date(1980,0,1),new Date(1989,11,31));
    });
    $('#filter1970').on("click",function(){
        filterDates(new Date(1970,0,1),new Date(1979,11,31));
    });
    $('#filter1960').on("click",function(){
        filterDates(new Date(1960,0,1),new Date(1969,11,31));
    });
    $('#filter1950').on("click",function(){
        filterDates(new Date(1950,0,1),new Date(1959,11,31));
    });
    $('#filter1940').on("click",function(){
        filterDates(new Date(1940,0,1),new Date(1949,11,31));
    });
    $('#filter1930').on("click",function(){
        filterDates(new Date(1930,0,1),new Date(1939,11,31));
    });
    $('#filter1920').on("click",function(){
        filterDates(new Date(1920,0,1),new Date(1929,11,31));
    });

    $('#reset').on('click',function(){
        dc.filterAll();
        dc.redrawAll();
    });

    function filterDates(start,end){
        timeLine.filterAll();
        timeLine.filter([start,end]);
        dc.redrawAll();
    }
}

function dataPrep(data){

    var dateFormat = d3.time.format("%Y-%m-%d");

    var today = new Date();
    var oneDay = 24*60*60*1000;

    data.forEach(function(d,i){
        d['#date+start'] = dateFormat.parse(d['#date+start']);
        d['#date+end'] = dateFormat.parse(d['#date+end']);
        if(d['#date+end']==null){
            var diffDays = Math.round(Math.abs((d['#date+start'].getTime() - today.getTime())/(oneDay)));
            if(diffDays>365){
                d['#date+end'] = new Date();
                d['#date+end'].setDate(today.getDate() + 100);
            } else {
                d['#date+end'] = new Date();
            }
        }
        var diffDays = Math.round((d['#date+end'].getTime() - d['#date+start'].getTime())/(oneDay));

        if(diffDays<1){
            d['#date+end'] = new Date(d['#date+start']);
            d['#date+end'].setDate(d['#date+start'].getDate()+100);
        }
    });
    return data;
}

function deriveMonths(data){

    var dateFormat = d3.time.format("%d/%m/%Y");
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    var min = d3.min(data,function(d){return d['#date+start']});
    var max = d3.max(data,function(d){return d['#date+end']});

    var monthsList = [months[min.getMonth()]+" "+(min.getYear()-100)]
    var date = min;
    while(date<max){
        date.addMonths(1);
        monthsList.push(months[date.getMonth()]+" "+(date.getYear()-100));
    }

    return monthsList;
}

function addMonths(data){
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    data.forEach(function(d){
        var currentMonth = d['#date+start'].getMonth();
        var currentYear = d['#date+start'].getYear();
        var endMonth = d['#date+end'].getMonth();
        var endYear = d['#date+end'].getYear();
        d.months = [months[currentMonth] + ' ' + (currentYear -100)];
        while(currentMonth+currentYear*12 < endMonth+endYear*12){
            currentMonth++
            if(currentMonth==12){
                currentMonth = 0;
                currentYear++;
            }
            d.months.push(months[currentMonth] + ' ' + (currentYear-100));
        }
    });
    return data;
}

function roundMonths(data){
    data.forEach(function(d){
        var currentMonth = d['#date+start'].getMonth();
        var currentYear = d['#date+start'].getYear();
        var endMonth = d['#date+end'].getMonth();
        var endYear = d['#date+end'].getYear();
        d.months = [new Date(d['#date+start'].getFullYear(), d['#date+start'].getMonth(), 1)];
        /*while(currentMonth+currentYear*12 < endMonth+endYear*12){
            currentMonth++
            if(currentMonth==12){
                currentMonth = 0;
                currentYear++;
            }
            d.months.push(new Date(currentYear+1900, currentMonth, 1));
        }*/
    });
    return data
}

$('#intro').click(function(){
    var intro = introJs();
        intro.setOptions({
            steps: [
              {
                element: '#disastertype_chart',
                intro: "Charts can be clicked and interacted with.  When you click an item on a chart if filters the data so the other charts only show data for this item.",
                position: 'right'
              },
              {
                element: '#tabletip',
                intro: "This table lists the data that matches the filters selected on the charts above.",
              },
              {
                element: '#count-info',
                intro: "This number shows the current number of records selected.",
              },
              {
                element: '#reset',
                intro: "Click this button to reset the dashboard.",
              }
            ]
        });
    intro.start();
});

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

// $('#loadingmodal').modal('show');

var dataCall = $.ajax({
    type: 'GET',
    url: 'https://proxy.hxlstandard.org/data.json?replace-map-url01=https%3A//docs.google.com/spreadsheets/d/1hTE0U3V8x18homc5KxfA7IIrv1Y9F1oulhJt0Z4z3zo/edit%23gid%3D0&strip-headers=on&merge-url02=https%3A//docs.google.com/spreadsheets/d/1GugpfyzridvfezFcDsl6dNlpZDqI8TQJw-Jx52obny8/edit&merge-tags02=country%2Bcode&filter02=merge&filter01=replace-map&url=https%3A//docs.google.com/spreadsheets/d/19pBx2NpbgcLFeWoJGdCqECT2kw9O9_WmcZ3O41Sj4hU/edit%23gid%3D0&merge-keys02=country%2Bname',
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
    data = roundMonths(data);
    var geom = topojson.feature(geomArgs[0],geomArgs[0].objects.geom);
    // $('#loadingmodal').modal('hide');
    generateDash(data,geom);
});
