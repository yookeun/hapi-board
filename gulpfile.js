/**
 * Created by ykkim on 2016. 3. 6..
 */

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');


var src = 'public/src/';
var dist = 'public/dist/';

gulp.task('hello', function() {
    return console.log("Hello");
});

gulp.task('world',['hello'], function() {
    return console.log("world")
});

/**
 * js 파일을 압축한다.
 */
gulp.task('compress', function() {
    return gulp.src(src+'js/*.js') //src폴더안의 모든 js파일을
        .pipe(concat('main.min.js'))//파일들을 합쳐서 all.js로 만들고
        .pipe(uglify())  //mify 해서
        .pipe(gulp.dest(dist+'js')); //dist/js 폴더에 저장
});

/**
 * 파일 변경을 감지한다.
 */
gulp.task('watch', function() {
    gulp.watch(src+'js/*.js', ['compress']);
});

/**
 * gulp를 실행하면 default로 compress, watch가 실행된다
 */
gulp.task('default', ['compress', 'watch']);
