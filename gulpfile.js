const concat = require('gulp-concat');
const gulp = require('gulp');
const prefix = require('gulp-autoprefixer');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');

/* ----------------------------------------- */
/*  Compile Sass
/* ----------------------------------------- */

gulp.task('sass', function () {
  return gulp.src('scss/**/*.scss')
    .pipe(sass({
      outputStyle: 'expanded'
    }).on('error', sass.logError))
    .pipe(prefix({
      // TODO: switch to true?
      cascade: false
    }))
//    .pipe(concat('morkborg.css'))
    .pipe(gulp.dest('./css'))
})

gulp.task('watch', gulp.series(['sass'], () => {
  gulp.watch('scss/**/*.scss', gulp.series(['sass']))
}))