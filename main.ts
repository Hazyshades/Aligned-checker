import csv from 'csv-parser'; // Используем правильный синтаксис для TypeScript
import * as fs from 'fs';

// Путь к файлам
const airdropFilePath = 'airdrop_wallets.csv'; // CSV-файл
const myWalletsFilePath = 'my_wallets.txt';   // TXT-файл

// Читаем текстовый файл с моими кошельками
const readMyWallets = (filePath: string): Promise<Set<string>> => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        return reject(err);
      }
      const wallets = new Set(
        data
          .split('\n')
          .map(line => line.trim().toLowerCase()) // Переводим в нижний регистр
          .filter(Boolean)
      );
      resolve(wallets);
    });
  });
};

// Читаем CSV-файл с аирдропными кошельками (только поле address)
const readAirdropWallets = (filePath: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const wallets: string[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row: { address?: string }) => {
        if (row.address) {
          wallets.push(row.address.trim().toLowerCase()); // Переводим в нижний регистр
        }
      })
      .on('end', () => resolve(wallets))
      .on('error', reject);
  });
};

// Основной процесс
const findEligibleWallets = async () => {
  try {
    const myWallets = await readMyWallets(myWalletsFilePath);
    const airdropWallets = await readAirdropWallets(airdropFilePath);

    // Фильтруем кошельки
    const eligibleWallets = airdropWallets.filter(wallet => myWallets.has(wallet));

    // Выводим подходящие кошельки в консоль
    console.log('Подходящие кошельки:');
    eligibleWallets.forEach(wallet => console.log(wallet));

    // Сохраняем результат в файл
    fs.writeFileSync('eligible_wallets.txt', eligibleWallets.join('\n'));
    console.log(`Всего найдено ${eligibleWallets.length} подходящих кошельков.`);
  } catch (error) {
    console.error('Ошибка:', error);
  }
};

// Запуск скрипта
findEligibleWallets();
