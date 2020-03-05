import Sequelize from 'sequelize';

import Courier from '../app/models/Courier';
import DeliveryProblem from '../app/models/DeliveryProblem';
import File from '../app/models/File';
import Order from '../app/models/Order';
import Recipient from '../app/models/Recipient';
import User from '../app/models/User';

import dbConfig from '../config/database';

const models = [User, Recipient, File, Courier, Order, DeliveryProblem];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(dbConfig);

    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }
}

export default new Database();
