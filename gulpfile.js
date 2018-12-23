const gulp = require("gulp");
const $ = require("gulp-load-plugins")(); // 用于gulp-之类的 引用$.即可
// const stylus = require("gulp-stylus");
// const ejs = require("gulp-ejs");
// const plumber = require("gulp-plumber");
// const postcss = require("gulp-postcss");
// const sourcemaps = require('gulp-sourcemaps');
// const babel = require('gulp-babel');
// const concat = require('gulp-concat');
const mainBowerFiles = require("main-bower-files");
const autoprefixer = require("autoprefixer");
const browserSync = require("browser-sync").create();
const minimist = require("minimist");
const sequence = require("gulp-sequence");

const envOptions = {
  string: "env",
  default: {
    env: "develop"
  }
};
const options = minimist(process.argv.slice(2), envOptions);
console.log(options);

gulp.task("clean", function() {
  return gulp.src(["./.tmp", "dist"], { read: false }).pipe($.clean());
});
gulp.task("ejs", () => {
  return gulp
    .src("src/*.ejs")
    .pipe($.plumber())
    .pipe(
      $.ejs(
        {
          msg: "Hello Gulp!"
        },
        {},
        { ext: ".html" }
      )
    )
    .pipe(gulp.dest("dist"))
    .pipe(browserSync.stream());
});
gulp.task("stylus", () => {
  const plugins = [
    autoprefixer({ browsers: ["last 3 version", ">5%", "ie 8"] })
  ];
  return gulp
    .src("src/css/**/*")
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.stylus())
    .pipe($.postcss(plugins))
    .pipe($.if(options.env === "production", $.minifyCss()))
    .pipe($.sourcemaps.write("."))
    .pipe(gulp.dest("dist/css"))
    .pipe(browserSync.stream());
});
gulp.task("img-min", () => {
  return gulp
    .src("src/imgs/**/*")
    .pipe($.if(options.env === "production", $.imagemin()))
    .pipe(gulp.dest("dist/imgs"));
});
gulp.task("babel", () => {
  gulp
    .src("src/js/**/*")
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.concat("index.js"))
    .pipe(
      $.if(
        options.env === "production",
        // 去掉console
        $.uglify({
          compress: {
            drop_console: true
          }
        })
      )
    )
    .pipe($.sourcemaps.write("."))
    .pipe(gulp.dest("dist/js"))
    .pipe(browserSync.stream());
});
gulp.task("bower", () => {
  return gulp.src(mainBowerFiles()).pipe(gulp.dest("./.tmp/vendors"));
});
gulp.task("vendorJs", ["bower"], () => {
  //跑完bower 才能跑vendors
  return gulp
    .src("./.tmp/vendors")
    .pipe($.concat("vendors.js"))
    .pipe($.if(options.env === "production", $.uglify()))
    .pipe(gulp.dest("dist/js"))
    .pipe(browserSync.stream());
});

gulp.task("watch", () => {
  gulp.watch("src/css/**/*", ["stylus"]);
  gulp.watch("./src/templates/**/*", ["ejs"]);
  gulp.watch("./src/js/**/*", ["babel"]);
});
gulp.task("brower-sync", () => {
  browserSync.init({
    server: {
      baseDir: "dist"
    }
  });
});
gulp.task("default", [
  "ejs",
  "babel",
  "stylus",
  "img-min",
  "vendorJs",
  "brower-sync",
  "watch"
]);

gulp.task(
  "build",
  sequence("clean", "stylus", "img-min", "ejs", "babel", "vendorJs")
);
