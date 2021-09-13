const concat = require('gulp-concat');
const gulp = require('gulp');
const prefix = require('gulp-autoprefixer');
const gsass = require('gulp-sass')(require('sass'));

// concatenate all morkborg scss into an uber morkborg.css
gulp.task('mork-sass', function () {
  return gulp.src('scss/morkborg/**/*.scss')
    .pipe(gsass({
      outputStyle: 'expanded'
    }).on('error', gsass.logError))
    .pipe(prefix({
      // TODO: switch to true?
      cascade: false
    }))
    .pipe(concat('morkborg.css'))
    .pipe(gulp.dest('./css'))
})

// keep tinymce skin files separate
gulp.task('skin-sass', function () {
  return gulp.src('scss/skins/**/*.scss')
    .pipe(gsass({
      outputStyle: 'expanded'
    }).on('error', gsass.logError))
    .pipe(prefix({
      // TODO: switch to true?
      cascade: false
    }))
    .pipe(gulp.dest('./css/skins'))
})

gulp.task('sass', gulp.parallel('mork-sass', 'skin-sass'))

gulp.task('watch', gulp.parallel(['mork-sass', 'skin-sass'], () => {
  gulp.watch('scss/morkborg/**/*.scss', gulp.series(['mork-sass']))
  gulp.watch('scss/skins/**/*.scss', gulp.series(['skin-sass']))
}))
