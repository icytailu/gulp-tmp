const gulp = require("gulp");
const $ = require("gulp-load-plugins")(); // 用于gulp-之类的 引用$.即可
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
gulp.task("clean", function() {
  return gulp.src(["./.tmp", "dist"], { read: false }).pipe($.clean());
});
gulp.task("index", () => {
  return gulp
    .src("src/index.html")
    .pipe($.plumber()) // 出错了也会继续执行
    .pipe(gulp.dest("dist"))
    .pipe(browserSync.stream());
});
gulp.task("views", () => {
  return gulp
    .src("src/views/**/*")
    .pipe($.plumber())
    .pipe(gulp.dest("dist/views"))
    .pipe(browserSync.stream());
});
gulp.task("stylus", () => {
  const plugins = [
    autoprefixer({ browsers: ["last 3 version", ">5%", "ie 8"] })
  ];
  return gulp
    .src("src/css/index.styl")
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
    .pipe($.plumber())
    .pipe($.if(options.env === "production", $.imagemin()))
    .pipe(gulp.dest("dist/imgs"))
    .pipe(browserSync.stream());
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
gulp.task("watch", () => {
  gulp.watch("src/index.html", ["index"]);
  gulp.watch("src/views/**/*", ["views"]);
  gulp.watch("src/css/**/*", ["stylus"]);
  gulp.watch("src/imgs/**/**", ["img-min"]);
  gulp.watch("src/js/**/*", ["babel"]);
});
gulp.task("brower-sync", () => {
  browserSync.init({
    server: {
      baseDir: "dist"
    }
  });
});
gulp.task("default", [
  "clean",
  "index",
  "views",
  "stylus",
  "img-min",
  "babel",
  "brower-sync",
  "watch"
]);
gulp.task(
  "build",
  sequence("clean", "img-min", "stylus", "babel", "index", "views")
);
