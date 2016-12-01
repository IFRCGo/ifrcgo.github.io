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