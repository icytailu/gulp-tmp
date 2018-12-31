const gulp = require("gulp");
const $ = require("gulp-load-plugins")(); // 用于gulp-之类的 引用$.即可
const autoprefixer = require("autoprefixer");
const browserSync = require("browser-sync").create();
const minimist = require("minimist");
const merge = require("merge-stream");

const envOptions = {
  string: "env",
  default: {
    env: "develop"
  }
};
const options = minimist(process.argv.slice(2), envOptions);
gulp.task("clean", function() {
  return gulp.src(["dist"], { read: false }).pipe($.clean());
});
gulp.task("index-html", () => {
  return gulp
    .src("src/index.html")
    .pipe($.plumber())
    .pipe(gulp.dest("dist"))
    .pipe(browserSync.stream());
});
gulp.task("view", () => {
  return gulp
    .src("src/view/**/*.html")
    .pipe($.plumber())
    .pipe(gulp.dest("dist/view"))
    .pipe(browserSync.stream());
});
gulp.task("stylus", () => {
  const plugins = [
    autoprefixer({ browsers: ["last 3 version", ">5%", "ie 8"] })
  ];
  return gulp
    .src("src/css/common/index.styl")
    .pipe($.plumber())
    .pipe($.if(options.env !== "production", $.sourcemaps.init()))
    .pipe($.stylus())
    .pipe($.postcss(plugins))
    .pipe($.if(options.env === "production", $.minifyCss()))
    .pipe($.if(options.env !== "production", $.sourcemaps.write(".")))
    .pipe(gulp.dest("dist/css"))
    .pipe(browserSync.stream());
});
gulp.task("plugin-css", () => {
  return merge(gulp.src("src/css/plugin/**.css"))
    .pipe($.concat("plugin.css"))
    .pipe(gulp.dest("dist/css"))
    .pipe(browserSync.stream());
});
gulp.task("img", () => {
  return gulp
    .src("src/img/**/*")
    .pipe($.plumber())
    .pipe($.if(options.env === "production", $.imagemin()))
    .pipe(gulp.dest("dist/img"))
    .pipe(browserSync.stream());
});
gulp.task("js", () => {
  return gulp
    .src([
      "src/js/base/*.js",
      "src/js/common/*.js",
      "src/js/index.js",
      "src/view/**/*.js"
    ])
    .pipe($.if(options.env !== "production", $.sourcemaps.init()))
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
    .pipe($.concat("index.js"))
    .pipe($.if(options.env !== "production", $.sourcemaps.write(".")))
    .pipe(gulp.dest("dist/js"))
    .pipe(browserSync.stream());
});
gulp.task("watch", () => {
  gulp.watch("src/index.html", ["index-html"]);
  gulp.watch("src/view/**/*", ["view"]);
  gulp.watch("src/css/common/**/*.styl", ["stylus"]);
  gulp.watch("src/css/plugin/*.css", ["plugin-css"]);
  gulp.watch("src/img/**/**", ["img"]);
  gulp.watch("src/**/*.js", ["js"]);
});
gulp.task("brower-sync", () => {
  browserSync.init({
    server: {
      baseDir: "dist"
    }
  });
});
gulp.task("default", ["clean"], () => {
  gulp.start(
    "index-html",
    "view",
    "plugin-css",
    "stylus",
    "js",
    "img",
    "brower-sync",
    "watch"
  );
});
gulp.task("build", ["clean"], () => {
  gulp.start("index-html", "view", "plugin-css", "stylus", "js", "img");
});
