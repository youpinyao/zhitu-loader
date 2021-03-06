
const path = require('path');
const chalk = require('chalk');
const fs = require('fs');
const hasha = require('hasha');
const fse = require('fs-extra');

const logicEach = require('../app/assets/js/logic').each;

const cacheCallback = {};

module.exports.upload = function upload(options) {
  const {
    file_path,
    quality = 5, // 0 10%, 1 30%, 2 50%, 3  80%, 4 默认, 5 保真
    type_change = false, // 自动格式转换
    webp = false,
    dir_name = '.zhitu-des',
    count,
  } = options;
  const fileName = path.basename(file_path);
  const fileStat = fs.statSync(file_path);
  const fileSize = parseFloat((fileStat.size / 1024).toFixed(2));
  const rootDirPath = path.join(process.cwd(), dir_name);
  const optionPath = path.join(rootDirPath, 'option.json');
  const fileData = fs.readFileSync(file_path);

  // 配置文件判断
  if (count === 1) {
    if (fs.existsSync(optionPath)
    && fs.readFileSync(optionPath).toString() !== JSON.stringify(options)) {
      fse.removeSync(rootDirPath);
    }

    if (!fs.existsSync(rootDirPath)) {
      fs.mkdirSync(rootDirPath);
    }

    fs.writeFileSync(optionPath, JSON.stringify(options));
  }

  return new Promise((resolve, reject) => {
    const file = {
      name: fileName,
      path: file_path,
      size: fileSize,
      id: hasha(fileData, {
        algorithm: 'md5',
      }),
      ext: path.parse(file_path).ext,
      data: fileData,
    };
    const cut = (text, len) => {
      let arr = `${text}`.split('');

      if (arr.length >= len) {
        arr = arr.splice(arr.length - len, len);
      } else {
        arr = arr.concat(Array(len - arr.length).fill('-'));
      }

      return arr.join('');
    };

    const consolelog = (...args) => {
      console.log(file.id, cut(file.name, 30), ...args);
    };
    const removeDir = () => {
      // fse.remove(path.join(rootDirPath, `${file.id}`));
      // fse.readdir(rootDirPath, (derr, files) => {
      //   if (derr) {
      //     throw new Error(derr);
      //   }
      //   if (!(files && files.length)) {
      //     fse.remove(rootDirPath);
      //   }
      // });
    };

    const cacheDir = path.join(rootDirPath, file.id);
    const cachePath = path.join(cacheDir, 'data.json');

    if (file.ext === '.jpeg') {
      file.ext = '.jpg';
    }

    if (fs.existsSync(cachePath)) {
      const cacheData = JSON.parse(fs.readFileSync(cachePath).toString());

      if (!cacheData.success) {
        consolelog('[from cache]', 'fail');
        reject(new Error('fail'));
      } else {
        fs.readFile(cacheData.from_path, (err, data) => {
          if (err) {
            throw new Error(err);
          }

          resolve({
            data,
            resource: cacheData.to_path,
          });
          consolelog('[from cache]', cacheData.text);
          removeDir();
        });
      }
      return;
    }

    if (!cacheCallback[file.id]) {
      cacheCallback[file.id] = [];
    } else if (cacheCallback[file.id]) {
      cacheCallback[file.id].push((d, e) => {
        if (e) {
          reject(e);
        } else {
          resolve(d);
        }
      });
      return;
    }

    try {
      process.env.ZHITU_QUALITY = [4 * 20, 3 * 20, 2 * 20, 1 * 20, 0, -15][quality] || 0;
      process.env.ZHITU_TYPECHANGE = type_change;
      process.env.ZHITU_DIR = dir_name;

      logicEach(file, file.data, (info) => {
        // 优化失败
        if (info === false) {
          consolelog(chalk.red('fail'));
          fs.writeFileSync(cachePath, JSON.stringify({
            success: false,
          }));
          removeDir();
          reject(new Error('fail'));
          cacheCallback[file.id].forEach((item) => item({}, new Error('fail')));
          return;
        }

        let resource = file_path;
        let newFilePath = path.join(process.cwd(), `${path.sep}${dir_name}${path.sep}${file.id}/${info.basename}${file.ext}`);
        let webpFilePath = path.join(process.cwd(), `${path.sep}${dir_name}${path.sep}${file.id}/webp/${info.basename}${file.ext}`);
        let covertFilePath = newFilePath;
        let clalkColor = 2;

        // jpeg自动转jpg
        if (/\.jpeg$/g.test(resource)) {
          resource = resource.replace(/\.jpeg$/g, '.jpg');
        }

        webpFilePath = webpFilePath.split(`${path.sep}${info.basename}.`);
        webpFilePath[webpFilePath.length - 1] = 'webp';
        webpFilePath = webpFilePath.join(`${path.sep}${info.basename}.`);

        covertFilePath = covertFilePath.split(`${path.sep}${info.basename}.`);
        covertFilePath[covertFilePath.length - 1] = 'jpg';
        covertFilePath = covertFilePath.join(`${path.sep}${info.basename}-jpg.`);

        const converStat = fs.existsSync(covertFilePath) ? fs.statSync(covertFilePath) : null;
        const webpStat = fs.existsSync(webpFilePath) ? fs.statSync(webpFilePath) : null;
        let newFileStat = fs.existsSync(newFilePath) ? fs.statSync(newFilePath) : { size: 0 };

        // png => jpg 比对大小，选最优
        if (type_change && converStat && converStat.size < newFileStat.size) {
          newFilePath = covertFilePath;
          newFileStat = converStat;
          resource = resource.split(`${path.sep}${info.basename}.`);
          resource[resource.length - 1] = 'jpg';
          resource = resource.join(`${path.sep}${info.basename}.`);
          clalkColor = 3;
        }

        // webp 比对大小，选最优
        if (webp && webpStat && webpStat.size < newFileStat.size) {
          newFilePath = webpFilePath;
          newFileStat = webpStat;
          resource = resource.split(`${path.sep}${info.basename}.`);
          resource[resource.length - 1] = 'webp';
          resource = resource.join(`${path.sep}${info.basename}.`);
          clalkColor = 4;
        }

        // 如果比原始文件大，或压缩不大于1k，就不变
        if (fileStat.size - newFileStat.size < 1024) {
          newFilePath = file_path;
          newFileStat = fileStat;
          resource = file_path;
          clalkColor = 1;
        }

        const clalkLog = chalk[['red', 'white', 'green', 'blue', 'magenta'][clalkColor]];
        const newFileSize = parseFloat((newFileStat.size / 1024).toFixed(2));
        const text = `[${fileSize}KB => ${newFileSize}KB] [${path.parse(file_path).ext} => ${path.parse(resource).ext}]`;

        // 缓存配置
        fs.writeFileSync(cachePath, JSON.stringify({
          from_path: newFilePath,
          to_path: resource,
          text,
          success: true,
        }));

        fs.readFile(newFilePath, (err, data) => {
          if (err) {
            throw new Error(err);
          }

          cacheCallback[file.id].forEach((item) => item({
            data,
            resource,
          }));
          resolve({
            data,
            resource,
          });

          consolelog(clalkLog(text));
          removeDir();
        });
      });
    } catch (err) {
      consolelog(chalk.red('fail'));
      fs.writeFileSync(cachePath, JSON.stringify({
        success: false,
      }));
      removeDir();
      cacheCallback[file.id].forEach((item) => item({}, err));
      reject(err);
    }
  });
};
