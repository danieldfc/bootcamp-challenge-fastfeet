import { Op } from 'sequelize';

import Recipient from '../models/Recipient';
import User from '../models/User';

class RecipientController {
  async index(req, res) {
    const { page = 1, name = '' } = req.query;
    const limit = 20;

    const recipients = await Recipient.findAll({
      where: {
        name: {
          [Op.iLike]: `%${name}%`,
        },
      },
      order: [['name', 'desc']],
      limit,
      offset: (page - 1) * limit,
      attributes: [
        'id',
        'name',
        'street',
        'number',
        'complement',
        'state',
        'city',
        'cep',
      ],
    });

    return res.json(recipients);
  }

  async store(req, res) {
    const { name } = req.body;

    const checkUser = await User.findByPk(req.userId);

    if (!checkUser) {
      return res.status(401).json({ error: { message: 'User not found' } });
    }

    const checkRecipient = await Recipient.findOne({ where: { name } });

    if (checkRecipient) {
      return res
        .status(401)
        .json({ error: { message: 'Recipient already exist' } });
    }

    const {
      id,
      street,
      number,
      complement,
      state,
      city,
    } = await Recipient.create(req.body);

    return res.json({
      id,
      name,
      street,
      number,
      complement,
      state,
      city,
    });
  }

  async update(req, res) {
    const { name } = req.body;
    const { id: id_recipient } = req.params;

    const checkUser = await User.findByPk(req.userId);

    if (!checkUser) {
      return res.status(401).json({ error: { message: 'User not found' } });
    }

    const recipient = await Recipient.findByPk(id_recipient);

    if (name !== recipient.name) {
      const checkRecipient = await Recipient.findOne({ where: { name } });

      if (checkRecipient) {
        return res
          .status(401)
          .json({ error: { message: 'Recipient already exist' } });
      }
    }

    const {
      id,
      street,
      number,
      complement,
      state,
      city,
    } = await recipient.update(req.body);

    return res.json({
      id,
      name,
      street,
      number,
      complement,
      state,
      city,
    });
  }
}

export default new RecipientController();
