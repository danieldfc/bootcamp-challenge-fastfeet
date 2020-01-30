import Sequelize from 'sequelize';

import File from '../app/models/File';
import Recipient from '../app/models/Recipient';
import User from '../app/models/User';

import dbConfig from '../config/database';

const models = [User, Recipient, File];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(dbConfig);

    models.map(model => model.init(this.connection));
  }
}

export default new Database();
