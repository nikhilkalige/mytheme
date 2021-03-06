var gulp = require("gulp");
var browser_sync = require("browser-sync");
var less = require("gulp-less");
var filter = require("gulp-filter");
var plumber = require('gulp-plumber');
var colors = require("colors");
var reload = browser_sync.reload;
var minify_css = require('gulp-clean-css');
var rename = require('gulp-rename');
var gulpif = require('gulp-if');
var lazypipe = require('lazypipe');
var del = require("del");
var imagemin = require("gulp-imagemin");
//var optipng = require("imagemin-optipng");
var argv = require('yargs').argv;

var production = !!(argv.production);

var paths = {
    less: "./less/index.less",
    less_glob: "./less/**/*.less",
    production: "./pelican-theme",
    development: ".",
    css: "/static/css",
    js: "/statis/js"
}

/**
 * Plumber error handler
 */
var error_handler = function(err) {
    console.log('[SASS] '.bold.magenta + err.message.bold.red);
    this.emit('end');
};

/**
 * Css minify Pipe
 */
var css_minify_pipe = lazypipe()
    .pipe(minify_css)
    .pipe(rename, 'index.min.css')
    .pipe(gulp.dest, (paths.production + paths.css));


/**
 * Sass Task
 */
gulp.task("less", function() {
    console.log('[less]'.bold.magenta + ' Compiling Less');
    return gulp.src(paths.less)
        .pipe(plumber({
            errorHandler: error_handler
        }))
        .pipe(less({
            //sourcemapPath: paths.css,
        }))
        .pipe(gulp.dest(paths.development + paths.css))
        .pipe(filter("**/*.css"))
        .pipe(browser_sync.reload({stream: true}))
        .pipe(gulpif(production, css_minify_pipe()));
});

/**
 * Copy static files
 */
gulp.task("copy", function() {
    del([paths.production + "**/*"]);
    gulp.src([
        // paths.development + "/static/fonts/**/*",
        paths.production + "/static/js"
        ],
        { base: 'static'}
    )
        .pipe(gulp.dest(paths.production + "/static"));

    // copy images
    gulp.src([paths.development + "/static/images/**/*.ico"])
        .pipe(gulp.dest(paths.production + "/static/images/"));

    // copy images
    gulp.src([paths.development + "/static/images/**/logo.svg"])
        .pipe(gulp.dest(paths.production + "/static/images/"));

    // copy templates
    gulp.src([paths.development + "/templates/**/*"], {base: 'templates'})
        .pipe(gulp.dest(paths.production + "/templates"));
});

/**
 * Imagemin task
 */
gulp.task("image", function() {
    gulp.src([paths.development + "/static/images/**/*.png",
              paths.development + "/static/images/**/*.svg",
              '!' + paths.development + "/static/images/**/logo.svg"])
        .pipe(imagemin({verbose: true}))
        .pipe(gulp.dest(paths.production + "/static/images/"));
});

/**
 * Start server
 */
gulp.task("server", function() {
    browser_sync({
        server: {
            baseDir: "./",
            browser: "google-chrome",
            notify: false
        }
    });
});

gulp.task("default", ["server", "less"], function() {
    /* Watch less */
    gulp.watch([paths.less_glob], ["less"]);
    /* Watch html files */
    //gulp.watch(["*.html"], [reload]);
});

// Use --production for minifying
gulp.task("theme", ["copy", "less", "image"]);

