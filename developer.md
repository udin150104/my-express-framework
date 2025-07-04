# sequelize-cli, sequelize

```bash
// rollback migration
npx sequelize-cli db:migrate:undo:all
// run migration
npx sequelize-cli db:migrate
// generate new migration
npx sequelize-cli migration:generate --name file-name
// generate seeder
npx sequelize-cli seed:generate --name file-name
// run seeder
npx sequelize-cli db:seed:all
```