import { Op } from 'sequelize';

import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

class DeliverymanController {
  async index(req, res) {
    const { page = 1, name = '' } = req.query;
    const limit = 20;

    const deliverymans = await Deliveryman.findAll({
      where: {
        name: {
          [Op.iLike]: `%${name}%`,
        },
      },
      limit,
      offset: (page - 1) * limit,
      order: [['name', 'asc']],
      attributes: ['id', 'name', 'email'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'name', 'path', 'url'],
        },
      ],
    });

    return res.json(deliverymans);
  }

  async store(req, res) {
    const { email, avatar_id } = req.body;

    const checkDeliveryman = await Deliveryman.findOne({ where: { email } });

    if (checkDeliveryman) {
      return res
        .status(400)
        .json({ error: { message: 'Deliveryman already exist' } });
    }

    const checkFile = await File.findByPk(avatar_id);

    if (!checkFile) {
      return res.status(404).json({ error: { message: 'File not found' } });
    }

    const { id } = await Deliveryman.create(req.body);

    const { name, avatar } = await Deliveryman.findByPk(id, {
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'name', 'path', 'url'],
        },
      ],
    });

    return res.json({
      id,
      name,
      email,
      avatar,
    });
  }

  async update(req, res) {
    const { email, avatar_id } = req.body;
    const { id: deliveryman_id } = req.params;

    const deliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!deliveryman) {
      return res
        .status(404)
        .json({ error: { message: 'Deliveryman not found' } });
    }

    if (email !== deliveryman.email) {
      const checkDeliveryman = await Deliveryman.findOne({ where: { email } });

      if (checkDeliveryman) {
        return res
          .status(400)
          .json({ error: { message: 'Deliveryman already exist' } });
      }
    }

    if (avatar_id !== deliveryman.avatar_id) {
      const checkFile = await File.findByPk(avatar_id);

      if (!checkFile) {
        return res.status(400).json({ error: { message: 'File not found' } });
      }
    }

    await deliveryman.update(req.body);
    const { id, name, avatar } = await Deliveryman.findByPk(deliveryman_id, {
      attributes: ['id', 'name', 'email'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'name', 'path', 'url'],
        },
      ],
    });

    return res.json({
      id,
      name,
      email,
      avatar,
    });
  }

  async delete(req, res) {
    const { id } = req.params;

    const deliveryman = await Deliveryman.findByPk(id);

    if (!deliveryman) {
      return res
        .status(404)
        .json({ error: { message: 'Deliveryman not found' } });
    }

    await deliveryman.destroy();

    return res.json();
  }
}

export default new DeliverymanController();
