
const spawn = require('cross-spawn');
const path = require('path');

process.chdir(path.resolve(__dirname));
spawn.sync('git', ['add', '*'], { stdio: 'inherit' });
spawn.sync('git', ['commit', '-m', 'archive app.zip'], { stdio: 'inherit' });
spawn.sync('git', ['push'], { stdio: 'inherit' });
