const gulp = require("gulp");
const $ = require("gulp-load-plugins")(); // 用于gulp-之类的 引用$.即可
const autoprefixer = require("autoprefixer");
const browserSync = require("browser-sync").create();
const minimist = require("minimist");

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
    .src("src/css/index.styl")
    .pipe($.plumber())
    .pipe($.if(options.env !== "production", $.sourcemaps.init()))
    .pipe($.stylus())
    .pipe($.postcss(plugins))
    .pipe($.if(options.env === "production", $.minifyCss()))
    .pipe($.if(options.env !== "production", $.sourcemaps.write(".")))
    .pipe(gulp.dest("dist/css"))
    .pipe(browserSync.stream());
});

gulp.task("img", () => {
  return gulp
    .src("src/img/*")
    .pipe($.plumber())
    .pipe($.if(options.env === "production", $.imagemin()))
    .pipe(gulp.dest("dist/img"))
    .pipe(browserSync.stream());
});
//引入雪碧图合成插件
gulp.task("sprite", function() {
  gulp
    .src("src/img/icon/*.png")
    .pipe(
      spritesmith({
        imgName: "img/sprite.png", //保存合并后的名称
        cssName: "css/sprite.css", //保存合并后css样式的地址
        padding: 2, //合并时两个图片的间距
        cssTemplate: function(data) {
          //如果是函数的话，这可以这样写
          var arr = [];
          data.sprites.forEach(function(sprite) {
            arr.push(
              ".icon-" +
                sprite.name +
                "{" +
                "display:block;" +
                "background-image: url('" +
                sprite.escaped_image +
                "');" +
                "background-repeat: no-repeat;" +
                "background-position: " +
                sprite.px.offset_x +
                " " +
                sprite.px.offset_y +
                ";" +
                "width: " +
                sprite.px.width +
                ";" +
                "height: " +
                sprite.px.height +
                ";" +
                "}\n"
            );
          });
          return arr.join("");
        }
      })
    )
    .pipe(gulp.dest(".temp")) //输出目录
    .pipe(browserSync.stream());
});
gulp.task("js", () => {
  return gulp
    .src([
      "src/js/base/*.js",
      "src/js/lib/*.js",
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
  gulp.watch("src/css/**/*.styl", ["stylus"]);
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
    "stylus",
    "js",
    "img",
    "brower-sync",
    "watch"
  );
});
gulp.task("build", ["clean"], () => {
  gulp.start("index-html", "view", "stylus", "js", "img");
});
