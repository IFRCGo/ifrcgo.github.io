var gulp = require('gulp');
var cp = require('child_process');
var runSequence = require('run-sequence');
var compass = require('gulp-compass');
var uglify = require('gulp-uglify');
var clean = require('gulp-clean');
var browserSync = require('browser-sync');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var request = require('request');
var download = require("gulp-download-stream");
var csv2json = require('csv2json');
var fs = require("fs");
var replace = require('stream-replace');
var wiredep = require('wiredep');
var inject = require('gulp-inject');
var greplace = require('gulp-replace');
//Windows support
if (process.platform === "win32") {
    var args = ['build'];
    var runProcess = 'jekyll.bat';
} else {
    var args = ['exec', 'jekyll', 'build'];
    var runProcess = 'bundle';
}


////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//-------------------------- Copy tasks --------------------------------------//
//----------------------------------------------------------------------------//

// Copy from the .tmp to _site directory.
// To reduce build times the assets are compiles at the same time as jekyll
// renders the site. Once the rendering has finished the assets are copied.
gulp.task('copy:assets', function(done) {
  gulp.src('.tmp/assets/**')
  .pipe(gulp.dest('_site/assets'));

  gulp.src('CNAME')
  .pipe(gulp.dest('_site/'));

  return gulp.src('')
  .pipe(gulp.dest('_site/assets'));
});

////////////////////////////////////////////////////////////////////////////////
//--------------------------- Assets tasks -----------------------------------//
//----------------------------------------------------------------------------//

gulp.task('compass', function() {
  return gulp.src('app/assets/styles/*.scss')
  .pipe(plumber())
  .pipe(compass({
    css: '.tmp/assets/styles',
    sass: 'app/assets/styles',
    style: 'expanded',
    sourcemap: true,
    require: ['sass-css-importer'],
    bundle_exec: true
  }))
  .on('error', function(err) {
    this.emit('end');
  })
  .pipe(browserSync.reload({stream:true}));
});

gulp.task('compress:main', function() {
  // main.min.js
  var task = gulp.src([
    'app/assets/scripts/*.js'
  ])
  .pipe(plumber());

  if (environment == 'development') {
    task = task.pipe(concat('main.min.js'));
  }
  else {
    task = task.pipe(uglify('main.min.js', {
      outSourceMap: true,
      mangle: false
    }));
  }

  return task.pipe(gulp.dest('.tmp/assets/scripts'));
});

gulp.task('inject-vendor', function () {
    return gulp.src('./app/_layouts/*.html')
        //make the js
        .pipe(inject(gulp.src(wiredep().js)
        // .pipe(concat('bower.js')) //no concat for now, causes problems
        .pipe(gulp.dest('.tmp/assets/scripts/vendor'))))
        //make the css
        .pipe(inject(gulp.src(wiredep().css)
        // .pipe(concat('bower.css')) //no concat for now, causes problems
        .pipe(gulp.dest('.tmp/assets/styles/vendor/'))))
        //push all to the template
        .pipe(gulp.dest('./app/_layouts/'));
});

gulp.task('inject-own', function() {
  return gulp.src('./app/_layouts/*.html')
    .pipe(inject(gulp.src('.tmp/assets/scripts/*.js')))
    .pipe(gulp.dest('./app/_layouts/'));
});

gulp.task('fixin', function (){
  return gulp.src('./app/_layouts/*.html')
    .pipe(greplace('/.tmp/assets/', '{{ site.baseurl }}/assets/'))
    .pipe(gulp.dest('./app/_layouts/build/'));
});

// Build the jekyll website.
gulp.task('jekyll', function (done) {
  switch (environment) {
    case 'development':
    args.push('--config=_config.yml,_config-dev.yml');
    break;
    case 'stage':
    args.push('--config=_config.yml,_config-stage.yml');
    break;
    case 'production':
    args.push('--config=_config.yml');
    break;
  }
  //return cp.spawn('bundle', args, { stdio: 'inherit' })
  return cp.spawn(runProcess, args, { stdio: 'inherit' })
  .on('close', done);
});

// Build the jekyll website.
// Reload all the browsers.
gulp.task('jekyll:rebuild', ['jekyll'], function () {
  browserSync.reload();
});

gulp.task('build', function(done) {
  runSequence(['get-data', 'compress:main'], [ 'inject-vendor', 'inject-own'], 'fixin', ['jekyll', 'compass'], 'copy:assets', done);
});

gulp.task('dev', function(done) {
  runSequence('clean','compress:main', [ 'inject-vendor', 'inject-own'], 'fixin', ['jekyll', 'compass'], 'copy:assets', done);
});

gulp.task('serve', ['build'], function () {
  browserSync({
    port: 3000,
    server: {
      baseDir: ['.tmp', '_site']
    }
  });

  gulp.watch(['./app/assets/fonts/**/*', './app/assets/images/**/*'], function() {
    runSequence('jekyll', browserReload);
  });

  gulp.watch('app/assets/styles/**/*.scss', function() {
    runSequence('compass');
  });

  gulp.watch(['./app/assets/scripts/**/*.js', '!./app/assets/scripts/vendor/**/*'], function() {
    runSequence('compress:main', browserReload); //fix
  });

  gulp.watch(['app/**/*.html', 'app/**/*.md', 'app/**/*.json', 'app/**/*.geojson', '_config*'], function() {
    runSequence('jekyll', browserReload);
  });

});

gulp.task('local-dev', ['dev'], function () {
  browserSync({
    port: 3000,
    server: {
      baseDir: ['.tmp', '_site']
    }
  });

  gulp.watch(['./app/assets/fonts/**/*', './app/assets/images/**/*'], function() {
    runSequence('jekyll', browserReload);
  });

  gulp.watch('app/assets/styles/**/*.scss', function() {
    runSequence('compass');
  });

  gulp.watch(['./app/assets/scripts/**/*.js', '!./app/assets/scripts/vendor/**/*'], function() {
    runSequence(['compress:main','jekyll'], browserReload); //fix
  });

  gulp.watch(['app/**/*.html', 'app/**/*.md', 'app/**/*.json', 'app/**/*.geojson', '_config*'], function() {
    runSequence('jekyll', browserReload);
  });

});

var shouldReload = true;
gulp.task('no-reload', function(done) {
  shouldReload = false;
  runSequence('serve', done);
});

var environment = 'development';
gulp.task('prod', function(done) {
  environment = 'production';
  runSequence('clean', 'build', done);
});
gulp.task('stage', function(done) {
  environment = 'stage';
  runSequence('clean', 'build', done);
});

// Removes jekyll's _site folder
gulp.task('clean', function() {
  return gulp.src(['_site', '.tmp'], {read: false})
  .pipe(clean());
});

////////////////////////////////////////////////////////////////////////////////
//------------------------- Helper functions ---------------------------------//
//----------------------------------------------------------------------------//

function browserReload() {
  if (shouldReload) {
    browserSync.reload();
  }
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//-------------------------- Download JSON -----------------------------------//
//----------------------------------------------------------------------------//

gulp.task('get-data', function(datacb) {

  //get todays date in iso3
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1;
  var yyyy = today.getFullYear();
  if(dd<10) {
      dd='0'+dd
  }
  if(mm<10) {
      mm='0'+mm
  }
  var date = yyyy + '-' + mm + '-' + dd;

  var dlstream = download({
    file: "appealsplus.csv",
    //url: "https://proxy.hxlstandard.org/data.csv?select-query01-01=%23date%2Bend%3E"+date+"&merge-keys04=%23country%2Bname&filter04=merge&merge-tags02=%23meta%2Bcoverage%2C%23meta%2Bfunding&url=https%3A//docs.google.com/spreadsheets/d/19pBx2NpbgcLFeWoJGdCqECT2kw9O9_WmcZ3O41Sj4hU/edit%23gid%3D0&filter03=replace-map&merge-keys06=%23meta%2Bid&filter02=merge&merge-tags04=%23country%2Bcode&filter05=select&replace-map-url03=https%3A//docs.google.com/spreadsheets/d/1hTE0U3V8x18homc5KxfA7IIrv1Y9F1oulhJt0Z4z3zo/edit%3Fusp%3Dsharing&merge-url06=https%3A//proxy.hxlstandard.org/data.csv%3Fcount-tags01%3D%2523meta%252Bid%26url%3Dhttps%253A//docs.google.com/spreadsheets/d/1rJ5gt-JaburVcfzTeNmLglEWfhTlEuoaOedTH5T7Qek/edit%2523gid%253D0%26filter03%3Dadd%26filter02%3Dcut%26add-tag03%3D%2523meta%252Bappealplus%26count-header01-01%3DCount%26add-value03%3DTRUE%26count-type01-01%3Dcount%26cut-include-tags02%3D%2523meta%252Bid%26count-column01-01%3D%2523meta%252Bcount%26force%3Don%26filter01%3Dcount%26strip-headers%3Don&filter01=select&merge-url02=https%3A//docs.google.com/spreadsheets/d/1rVAE8b3uC_XIqU-eapUGLU7orIzYSUmvlPm9tI0bCbU/edit%23gid%3D0&merge-url04=https%3A//docs.google.com/spreadsheets/d/1GugpfyzridvfezFcDsl6dNlpZDqI8TQJw-Jx52obny8/edit%3Fusp%3Dsharing&merge-tags06=%23meta%2Bappealplus&force=on&merge-keys02=%23meta%2Bid&strip-headers=on&filter06=merge&select-query05-01=%23meta%2Bfunding%21%3D"
    url: "https://proxy.hxlstandard.org/data.csv?replace-map-url05=https%3A//docs.google.com/spreadsheets/d/1hTE0U3V8x18homc5KxfA7IIrv1Y9F1oulhJt0Z4z3zo/edit%3Fusp%3Dsharing&force=on&filter05=replace-map&merge-tags06=%23country%2Bcode&select-query01-01=%23date%2Bend%3E"+date+"&merge-tags07=%23meta%2Bappealplus&merge-keys07=%23meta%2Bid&merge-keys02=%23meta%2Bid&filter02=merge&strip-headers=on&filter01=select&merge-url07=https%3A//proxy.hxlstandard.org/data.csv%3Fcount-tags01%3D%2523meta%252Bid%26url%3Dhttps%253A//docs.google.com/spreadsheets/d/1rJ5gt-JaburVcfzTeNmLglEWfhTlEuoaOedTH5T7Qek/edit%2523gid%253D0%26filter03%3Dadd%26filter02%3Dcut%26add-tag03%3D%2523meta%252Bappealplus%26count-header01-01%3DCount%26add-value03%3DTRUE%26count-type01-01%3Dcount%26cut-include-tags02%3D%2523meta%252Bid%26count-column01-01%3D%2523meta%252Bcount%26force%3Don%26filter01%3Dcount%26strip-headers%3Don&append-dataset04-01=https%3A//docs.google.com/spreadsheets/d/1IYtE5nT-FpXja9ek4xbOohse0DUU_AvTT91nlJ-wXpI/edit%23gid%3D0&filter07=merge&filter03=select&filter04=append&select-query03-01=%23meta%2Bfunding%21%3D&merge-url02=https%3A//docs.google.com/spreadsheets/d/1rVAE8b3uC_XIqU-eapUGLU7orIzYSUmvlPm9tI0bCbU/edit%23gid%3D0&merge-url06=https%3A//docs.google.com/spreadsheets/d/1GugpfyzridvfezFcDsl6dNlpZDqI8TQJw-Jx52obny8/edit%3Fusp%3Dsharing&merge-keys06=%23country%2Bname&filter06=merge&url=https%3A//docs.google.com/spreadsheets/d/19pBx2NpbgcLFeWoJGdCqECT2kw9O9_WmcZ3O41Sj4hU/edit%23gid%3D0&merge-tags02=%23meta%2Bcoverage%2C%23meta%2Bfunding"
  })
  .pipe(gulp.dest("app/_data/temp"));

  //allow the site to build using the old appeals if the download errors out
  //useful for offline debugging
  dlstream.on('error', function () {
    datacb(console.log("dl using local"));
  });

  //download and unhxl the appealsplus.csv
  dlstream.on('finish', function () {
    fs.createReadStream('app/_data/temp/appealsplus.csv')
      .pipe(replace(/\#/g, ''))
      .pipe(replace(/\+/g, '_'))
      .pipe(csv2json({
        // Defaults to comma.
        separator: ','
      }))
      .pipe(
        fs.createWriteStream('app/_data/appealsplus.json')
      );
      datacb(console.log("dl finished"));
  });

});

///////////////////////////////////////////////////////////////////////////////
//--------------------------- Humans task -----------------------------------//
//---------------------------------------------------------------------------//
gulp.task('get-humans', function(){

  var getHumans = function(callback){
    var options = {
      url: 'https://api.github.com/repos/IFRCgo/ifrcgo_v2/contributors',
      headers: {
        'User-Agent': 'request'
      }
    };

    request(options, function (err, res) {
      var humans = JSON.parse(res.body).map(function(human){
        return {login: human.login, html_url: human.html_url, contributions: human.contributions}
      });
      humans.sort(function(a,b){
        return b.contributions - a.contributions;
      })
      callback(humans);
    });
  }

  getHumans(function(humans){
    fs.readFile('./docs/humans-tmpl.txt', 'utf8', function (err, doc) {
      if (err) throw err;
      //Do your processing, MD5, send a satellite to the moon, etc.
      for (i = 0; i < humans.length; i++) {
        doc = doc + '\nContributor: '+humans[i].login + '\nGithub: '+humans[i].html_url +'\n';
      }
      fs.writeFile('./app/humans.txt', doc, function(err) {
        if (err) throw err;
        console.log('complete');
      });
    });
  });
});
