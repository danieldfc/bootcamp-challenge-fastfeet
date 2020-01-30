import Recipient from '../models/Recipient';
import User from '../models/User';

class RecipientController {
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

    if (name !== recipient) {
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
