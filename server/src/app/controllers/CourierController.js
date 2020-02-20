import Courier from '../models/Courier';
import File from '../models/File';

class CourierController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const limit = 20;

    const couriers = await Courier.findAll({
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

    return res.json(couriers);
  }

  async store(req, res) {
    const { email, avatar_id } = req.body;

    const checkCourier = await Courier.findOne({ where: { email } });

    if (checkCourier) {
      return res
        .status(400)
        .json({ error: { message: 'Courier already exist' } });
    }

    const checkFile = await File.findByPk(avatar_id);

    if (!checkFile) {
      return res.status(404).json({ error: { message: 'File not found' } });
    }

    const { id } = await Courier.create(req.body);

    const { name, avatar } = await Courier.findByPk(id, {
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
    const { id: courier_id } = req.params;

    const courier = await Courier.findByPk(courier_id);

    if (!courier) {
      return res.status(404).json({ error: { message: 'Courier not found' } });
    }

    if (email !== courier.email) {
      const checkCourier = await Courier.findOne({ where: { email } });

      if (checkCourier) {
        return res
          .status(400)
          .json({ error: { message: 'Courier already exist' } });
      }
    }

    if (avatar_id !== courier.avatar_id) {
      const checkFile = await File.findByPk(avatar_id);

      if (!checkFile) {
        return res.status(400).json({ error: { message: 'File not found' } });
      }
    }

    await courier.update(req.body);
    const { id, name, avatar } = await Courier.findByPk(courier_id, {
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

    const courier = await Courier.findByPk(id);

    if (!courier) {
      return res.status(404).json({ error: { message: 'Courier not found' } });
    }

    await courier.destroy();

    return res.json();
  }
}

export default new CourierController();
