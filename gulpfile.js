const gulp = require("gulp");
const sass = require('gulp-sass')(require('sass'));
const sourcemap = require("gulp-sourcemaps");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync");
const fs = require("fs");
const path = require("path");
const csso = require("gulp-csso");
const rename = require("gulp-rename");
const imageMin = require("gulp-imagemin");
const webP = require("gulp-webp");
const jsMin = require("gulp-jsmin");

const styles = () => {
  return gulp.src("sass/style.scss")
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([autoprefixer]))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("css"))
    .pipe(sync.stream());
}

exports.styles = styles;

const server = (done) => {
  sync.init({
    server: {
      baseDir: './'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}
exports.server = server;

const watcher = () => {
  gulp.watch("sass/**/*.scss", gulp.series("styles"));
  gulp.watch("*.html").on("change", sync.reload);
}

exports.dev = gulp.series(
  styles, server, watcher
);

function changeSrc(src, target, ext) {
  let files = [];

  fs.readdirSync(src).forEach(file => {
    if (path.extname(file) === ext) {
      files.push(file);
    }
  });

  files.forEach(file => {
    fs.readFile(`${src}/${file}`, 'utf-8', (err, content) => {
      const newContent = content.replace(/.jpg/g, '.webp').replace(/.jpeg/g, '.webp').replace(/.png/g, '.webp').replace(/style.css/g, 'style.min.css').replace(/script.js/g, 'script.min.js');

      fs.writeFileSync(`${target}/${file}`, newContent, (err) => {
        console.log(`${file} is done.`);
      });
    });
  });
}

function deleteImgs() {
  let files = [];

  fs.readdirSync('build/img').forEach(file => {
    if (path.extname(file) === '.png' || path.extname(file) === '.jpg' || path.extname(file) === '.jpeg') {
      files.push(file);
    }
  });

  files.forEach(file => {
    fs.unlink(`build/img/${file}`, err => {
      if (err) throw err;
    });
  });
}

const change = (done) => {
  changeSrc('./', 'build', '.html');
  changeSrc('build/css', 'build/css', '.css');
  done();
}
exports.change = change;

const copyFonts = () => {
  return gulp.src('source/fonts/*.{woff,woff2,ttf}')
    .pipe(gulp.dest('build/fonts'));
}
exports.copyFonts = copyFonts;

const style = () => {
  return gulp.src('css/style.css')
    .pipe(csso())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css'))
    .pipe(sync.stream());
}
exports.style = style;

const js = () => {
  return gulp.src('js/*.js')
    .pipe(jsMin())
    .pipe(rename('script.min.js'))
    .pipe(gulp.dest('build/js'));
}
exports.js = js;

const images = () => {
  return gulp.src('img/*.{jpg,jpeg,png}')
    .pipe(imageMin([
      imageMin.optipng({optimizationLevel: 3}),
      imageMin.mozjpeg({progressive: false}),
    ]))
    .pipe(gulp.dest('build/img'));
}
exports.images = images;

const webpImg = () => {
  return gulp.src('build/img/*.{jpg,jpeg,png}')
    .pipe(webP({quality: 90}))
    .pipe(gulp.dest('build/img'));
}
exports.webpImg = webpImg;

const copyWebp = () => {
  return gulp.src('img/*.webp')
    .pipe(webP({quality: 90}))
    .pipe(gulp.dest('build/img'));
}

exports.copyWebp = copyWebp;

const copySVG = () => {
  return gulp.src('img/*.svg')
    .pipe(gulp.dest('build/img'));
}

exports.copySVG = copySVG;

const cleanImg = (done) => {
  deleteImgs();
  done();
}
exports.cleanImg = cleanImg;

const copyPHP = () => {
  return gulp.src('js/*.php')
    .pipe(gulp.dest('build/js'));
}
exports.copyPHP = copyPHP;

exports.build = gulp.series(style, js, change, copyFonts, images, copyWebp, copySVG, webpImg, copyPHP, cleanImg);
