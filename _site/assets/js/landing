var colors = ['#D33F49'];

$.ajax({
  url:'https://proxy.hxlstandard.org/data.json?url=https%3A//docs.google.com/spreadsheets/d/1mF8R8dLHSlN3574RO2EmOHLns-pPLS3wzpBxle5aIDw/edit%3Fusp%3Dsharing&strip-headers=on',
  dataType: 'json',
  success: function(data) {
    initGrid(data);
  }
});

hover = false;

function initGrid(data){

  data = hxlProxyToJSON(data);

  data.sort(
    function(a, b) {
      return b['#meta+priority'] - a['#meta+priority'];
    }
  )

  generateGrid(data);
  generateButtons(data);
  var $grid;
  $('.container').imagesLoaded(function(){

    // $grid =  $('#grid').isotope({
    //   // options
    //   itemSelector: '.column',
    //   // layoutMode: 'fitRows',
    //   // masonry: {
    //   //   columnWidth: '.column'
    //   // }
    // });
  });


  $('.filter-button-group').on( 'click', 'button', function() {
    $('.filterbutton').removeClass('highlight');
    var filterValue = $(this).attr('data-filter');
    $grid.isotope({ filter: filterValue });
    $(this).addClass('highlight');
  });

}

function generateGrid(data){
  data.forEach(function(d,i){
    var classes = 'column';
    d.tags = d['#meta+tags'].split(',');
    d.tags.forEach(function(tag){
      classes += ' '+tag.replace(/ /g, '_').toLowerCase();
    });
    console.log(classes);
    var html = '<div id="grid'+i+'" class="'+classes+'"><div class="inner"><h3 class="grid-title">'+d['#meta+title']+'</h3><div id="overlay'+i+'" class="overlay">';
    html+='<p class="overlaydesc">'+d['#meta+description']+'</p>';
    html +='</div></div></div>';

    $('#grid').append(html);

    // $('#grid'+i).height($('#overlay'+i).height());

    // var color = Math.floor((Math.random() * (colors.length-1)));
    // $('#overlay'+i).css({'background-color':colors[color]});
    //
    // $('#overlay'+i).on('click touchstart',function(){
    //   if($('#overlay'+i).css('opacity')>0.5){
    //     if(d['#meta+url'].substring(0,1).toLowerCase()=='h'){
    //       window.open(d['#meta+url'], '_blank');
    //       console.log('external');
    //     } else {
    //       window.open(d['#meta+url'],'_self');
    //       console.log('internal');
    //     }
    //   }
    // });
    //
    // $('#grid'+i).on("mouseenter", function(){
    //   $('#overlay'+i).fadeIn(400);
    // });
    //
    // $('#grid'+i).on("mouseleave", function(){
    //   $('#overlay'+i).stop().fadeOut(100);
    // });
  });
}

function generateButtons(data){
  var filters = [];
  data.forEach(function(d){
    d.tags.forEach(function(tag){
      if(filters.indexOf(tag)==-1){
        filters.push(tag);
      }
    });
  });

  filters.forEach(function(f){
    var html = '<button class="filterbutton" data-filter=".'+f.replace(/ /g,'_').toLowerCase()+'">'+f+'</button> ';
    $('.filter-button-group').append(html);
  });
}

function hxlProxyToJSON(input,headers){
  var output = [];
  var keys=[]
  input.forEach(function(e,i){
    if(i==0){
      keys = e;
    }
    if(headers==true && i>1){
      var row = {};
      e.forEach(function(e2,i2){
        row[keys[i2]] = e2;
      });
      output.push(row);
    }
    if(headers!=true && i>0){
      var row = {};
      e.forEach(function(e2,i2){
        row[keys[i2]] = e2;
      });
      output.push(row);
    }
  });
  return output;
}
