import { Model, DataTypes } from 'sequelize';

class Order extends Model {
  static init(sequelize) {
    super.init(
      {
        product: DataTypes.STRING,
        canceled_at: DataTypes.DATE,
        start_date: DataTypes.DATE,
        end_date: DataTypes.DATE,
      },
      {
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.File, {
      foreignKey: 'signature_id',
      as: 'signature_recipient',
    });
    this.belongsTo(models.Courier, {
      foreignKey: 'deliveryman_id',
      as: 'deliveryman',
    });
    this.belongsTo(models.Recipient, {
      foreignKey: 'recipient_id',
      as: 'recipient',
    });
  }
}

export default Order;
