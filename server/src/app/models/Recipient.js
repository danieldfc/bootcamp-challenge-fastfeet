import { Model, DataTypes } from 'sequelize';

class Recipient extends Model {
  static init(sequelize) {
    super.init(
      {
        name: DataTypes.STRING,
        street: DataTypes.STRING,
        haveNumber: DataTypes.VIRTUAL,
        number: DataTypes.INTEGER,
        complement: DataTypes.STRING,
        state: DataTypes.STRING,
        city: DataTypes.STRING,
        cep: DataTypes.STRING,
      },
      {
        sequelize,
      }
    );

    return this;
  }
}

export default Recipient;
