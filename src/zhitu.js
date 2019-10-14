
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
  webp = false,
}) {
  return new Promise((resolve, reject) => {
    const fileName = path.basename(file_path);
    const fileStat = fs.statSync(file_path);
    const fileSize = parseFloat((fileStat.size / 1024).toFixed(2));

    const progress = new ProgressBar(`${file_path} :description`, {
      total: 10,
    });

    const file = {
      name: fileName,
      path: file_path,
      size: fileSize,
      id: uuid(),
      data: fs.readFileSync(file_path),
    };

    progress.tick({
      description: '优化中',
    });

    try {
      process.env.ZHITU_QUALITY = [4 * 20, 3 * 20, 2 * 20, 1 * 20, 0, -15][quality] || 0;
      process.env.ZHITU_TYPECHANGE = type_change;

      logicEach(file, file.data, (info) => {
        // 优化失败
        if (info === false) {
          progress.tick(10, {
            description: chalk.red('优化失败'),
          });
          reject(new Error('优化失败'));
          return;
        }

        let resource = file_path;
        let newFilePath = info.path.replace(`${path.sep}${info.basename}.`, `${path.sep}zhitu-des${path.sep}${file.id}/${info.basename}.`);
        let webpFilePath = info.path.replace(`${path.sep}${info.basename}.`, `${path.sep}zhitu-des${path.sep}${file.id}/webp/${info.basename}.`);
        let covertFilePath = newFilePath;
        let clalkColor = 2;

        const rootDirPath = path.resolve(path.dirname(info.path), 'zhitu-des');

        webpFilePath = webpFilePath.split(`${path.sep}${info.basename}.`);
        webpFilePath[webpFilePath.length - 1] = 'webp';
        webpFilePath = webpFilePath.join(`${path.sep}${info.basename}.`);

        covertFilePath = covertFilePath.split(`${path.sep}${info.basename}.`);
        covertFilePath[covertFilePath.length - 1] = 'jpg';
        covertFilePath = covertFilePath.join(`${path.sep}${info.basename}-jpg.`);

        const converStat = fs.existsSync(covertFilePath) ? fs.statSync(covertFilePath) : null;
        const webpStat = fs.existsSync(webpFilePath) ? fs.statSync(webpFilePath) : null;
        let newFileStat = fs.existsSync(newFilePath) ? fs.statSync(newFilePath) : { size: 0 };

        // 比对大小，选最优
        if (type_change && converStat && converStat.size < newFileStat.size) {
          newFilePath = covertFilePath;
          newFileStat = converStat;
          resource = resource.split(`${path.sep}${info.basename}.`);
          resource[resource.length - 1] = 'jpg';
          resource = resource.join(`${path.sep}${info.basename}.`);
          clalkColor = 3;
        }

        // 比对大小，选最优
        if (webp && webpStat && webpStat.size < newFileStat.size) {
          newFilePath = webpFilePath;
          newFileStat = webpStat;
          resource = resource.split(`${path.sep}${info.basename}.`);
          resource[resource.length - 1] = 'webp';
          resource = resource.join(`${path.sep}${info.basename}.`);
          clalkColor = 4;
        }

        // 如果比原始文件大，就不变
        if (fileStat.size - newFileStat.size < 1) {
          newFilePath = file_path;
          newFileStat = fileStat;
          resource = file_path;
          clalkColor = 1;
        }

        const clalkLog = chalk[['red', 'white', 'green', 'blue', 'magenta'][clalkColor]];
        const newFileSize = parseFloat((newFileStat.size / 1024).toFixed(2));

        fs.readFile(newFilePath, (err, data) => {
          resolve({
            data,
            resource,
          });

          progress.tick(10, {
            description: `${fileSize}KB ${clalkLog(`${resource} ${newFileSize}KB`)}`,
          });

          fse.remove(path.resolve(rootDirPath, `${file.id}`));
          fse.readdir(rootDirPath, (derr, files) => {
            if (err) {
              throw new Error(derr);
            }

            if (!(files && files.length)) {
              fse.remove(rootDirPath);
            }
          });
        });
      });
    } catch (err) {
      progress.tick(10, {
        description: chalk.red('优化失败'),
      });
      reject(err);
    }
  });
};
