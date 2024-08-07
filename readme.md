# jrkyushu_dia_scraper

JR九州の駅別時刻表から路線、駅、列車情報を取得する。

## 実行コマンド

### 初回実行時

先に、submoduleのmysqlを立ち上げておく。
はじめに、本プロジェクト用のdatabaseを準備する。

```terminal
cd dockerized-mysql
docker-compose up -d --build
docker ps
# <container id>をメモ
docker exec -it <container id> bash
```

```bash
mysql -u root -p
# パスワードはroot
CREATE DATABASE jrkyushu_dia;
# jrkyushu_diaが作られていることを確認
SHOW DATABASES;
# userを作成
CREATE USER 'user'@'localhost' IDENTIFIED BY 'password';
# userに権限付与
GRANT ALL PRIVILEGES ON jrkyushu_dia.* TO 'user'@'localhost';
FLUSH PRIVILEGES;
```

`.env`を作成する。上記のそのままコマンドを実行した場合はexampleをコピーするだけ。

```terminal
`cp .env.example .env`
```

```
// 反映とマイグレーションファイルの作成
npx prisma migrate dev --name init
npx prisma migrate dev --name add_station_line_relation
npx prisma migrate dev --name add_station_name_kana


// マイグレーションファイルの作成
npx prisma migrate dev --create-only --name add_train_models

// マイグレーション反映
npx prisma migrate deploy

```

実行時
```terminal
npm install
npm run build
npm start
```
