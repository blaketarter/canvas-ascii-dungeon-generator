var rollup = require('rollup');
var babel = require('rollup-plugin-babel');

rollup.rollup({
  entry: 'src/main.js',
  plugins: [ babel({
    exclude: 'node_modules/**'
  }) ]
}).then(function(bundle) {
  bundle.write({
    dest: 'dist/bundle.js',
    format: 'umd',
    moduleName: 'dung',
  });
});
