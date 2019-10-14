
const path = require('path');
const chalk = require('chalk');
const fs = require('fs');
const fse = require('fs-extra');
const uuid = require('uuid/v4');
const ProgressBar = require('progress');

const logicEach = require('../app/assets/js/logic').each;

module.exports.upload = function upload({
  file_path,
  quality = 5, // 0 10%, 1 30%, 2 50%, 3  80%, 4 默认, 5 保真
  type_change = false, // 自动格式转换
}) {
  return new Promise((resolve, reject) => {
    const filename = path.basename(file_path);
    const filesize = parseFloat((fs.statSync(file_path).size / 1024).toFixed(2));

    const progress = new ProgressBar(chalk.green(`${file_path} :percent ${filesize}KB :description`), {
      total: 10,
    });

    const file = {
      name: filename,
      path: file_path,
      size: filesize,
      id: uuid(),
    };

    progress.tick({
      description: '优化中',
    });

    try {
      process.env.ZHITU_QUALITY = [4 * 20, 3 * 20, 2 * 20, 1 * 20, 0, -15][quality] || 0;
      process.env.ZHITU_TYPECHANGE = type_change;
      logicEach(file, fs.readFileSync(file.path), (info) => {
        const newFilePath = info.path.replace(info.basename, `zhitu-des/${info.basename}`);
        const newFileStat = fs.statSync(newFilePath);

        resolve(fs.readFileSync(newFilePath));
        progress.tick(10, {
          description: `优化成功 ${parseFloat((newFileStat.size / 1024).toFixed(2))}KB`,
        });
        fse.removeSync(path.resolve(path.dirname(info.path), 'zhitu-des'));
      });
    } catch (err) {
      progress.tick(10, {
        description: '优化失败',
      });
      reject(err);
    }
  });
};
