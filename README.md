## [IFRC GO LABS](http://ifrcgo.github.io)

### Understanding Jekyll

- Good introductory tutorial to Jekyll: <https://www.taniarascia.com/make-a-static-website-with-jekyll/>

### Adding Language support

The site is configured to support 2-letter core language codes. So english is 'en' not 'en-US' and/or 'en-GB'. Using a longer code will not function.

There are four main steps in incorporating a language:

1. tell app config the language exists
  1. add 2-letter language code to ```authorized_locales``` array in \_config.yml
2. include locale file (to support date/time localization)
  1. several already in place (in \_locales dir), otherwise get from [here](https://github.com/svenfuchs/rails-i18n/tree/master/rails/locale)
3. include \_data/```2-letter code```.yml to support site content translations
  1. copy \_data/en.yml, then update text values
  2. note that the url for the nav items can be updates for your language. this needs to align with the permalink in the page frontmatter (see item 4.2 below)
4. create folder of page templates
  1. copy 'en' dir, rename copy as your 2-letter language code
  2. in frontmatter for all templates there within, you need to add the language code and pagename to the ```permalink``` (i.e. /about/ becomes /fr/apropos/ for the french translation)
5. create folder of blog posts
  1. copy the \_posts/en dir, rename folder as your 2-letter language code
  2. in frontmatter for all templates there within, you need to change the ```language``` to the correct code and add the language code to the ```permalink``` (i.e. /blog/:year/:month/:day/:title/ becomes /fr/blog/:year/:month/:day/:title/ for the french translation)
6. (OPTIONAL) Add translations of pdf assets
  1. add documents to assets/downloads
  2. update \_data/```2-letter code```.yml host.materials_list.asset(s) with the filename you created

## Development

### Environment
To set up the development environment for this website, you'll need to install the following on your system:

- [Node and npm](http://nodejs.org/)
- Ruby and [Bundler](http://bundler.io/), preferably through something like [rvm](https://rvm.io/)
- Gulp ( $ npm install -g gulp )

After these basic requirements are met, run the following commands in the website's folder:

##### Command #1

```
$ npm install (Mac)
$ npm install express (Ubuntu)
```

##### Command #2: Installing Bundler

```
$ bundle install (Mac)
$ gem bundle install (Ubuntu)
```

##### Command #3: Installing Jeykll

```
$ gem install jekyll --no-rdoc --no-ri (Ubuntu)
```

##### Command #4: Installing earlier version of Chunky PNG (version 1.3.7)

When trying to compile everything with 'gulp serve', it threw an error that my "bundle [was] locked to chunky_png (1.3.8), but that version could not be found in any of the sources listed in your Gemfile", so recommended installing a different version.

```
$ gem install chunky_png -v 1.3.7 (Ubuntu)
```


### Getting started

```
$ gulp serve
```
Compiles the compass files, javascripts, and launches the server making the site available at `http://localhost:3000/`
The system will watch files and execute tasks whenever one of them changes.
The site will automatically refresh since it is bundled with livereload.

The `_config-dev.yml` file will be loaded alongside `_config.yml`.

##### Running on Cloud9 IDE:

You need to change the IP and port for it to run on a cloud IDE: <https://docs.c9.io/docs/run-an-application>.
> If you're developing a server application, please note that you need to listen to 0.0.0.0 ($IP) and 8080 ($PORT). 

Follow these instructions to change the port and IP for gulp serve: <https://github.com/Swiip/generator-gulp-angular/issues/848>

###### Step #1
Changed the port in the gulpfile.js on line 107 as follows:
```
gulp.task('serve', ['build'], function () {
  browserSync({
    port: 8080,
    server: {
      baseDir: ['.tmp', '_site']
    }
  });
```
###### Step #2
Click on the local host link in the terminal
```
[16:58:31] Finished 'serve' after 246 ms
[BS] Access URLs:
 -------------------------------------
       Local: http://localhost:8080
    External: http://172.17.0.154:8080
 -------------------------------------
 ```
 You will need to open it in a new tab to view.


### Other commands
Clean the compiled site. I.e. the `_site` folder
```
$ gulp clean
```

Compile the compass files, javascripts, and builds the jekyll site using `_config-dev.yml`.
Use this instead of ```gulp serve``` if you don't want to watch.
```
$ gulp
```

Compiles the site loading the `_config-stage.yml` alongside `_config.yml`. The javascript files will be minified.
```
$ gulp stage
```

Compiles the site loading the `_config-prod.yml` alongside `_config.yml`. The javascript files will be minified.
```
$ gulp prod
```
