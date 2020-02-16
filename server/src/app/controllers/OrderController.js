import { parseISO, getHours } from 'date-fns';

import Courier from '../models/Courier';
import File from '../models/File';
import Order from '../models/Order';
import Recipient from '../models/Recipient';

import Queue from '../../lib/Queue';

import OrderRegisteredMail from '../jobs/OrderRegisteredMail';

class OrderController {
  async index(req, res) {
    const orders = await Order.findAll({
      where: { canceled_at: null },
      attributes: ['id', 'product', 'canceled_at', 'start_date', 'end_date'],
      include: [
        {
          model: Recipient,
          as: 'recipient',
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
        },
        {
          model: Courier,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: File,
          as: 'signature_recipient',
          attributes: ['id', 'name', 'path', 'url'],
        },
      ],
    });
    return res.json(orders);
  }

  async store(req, res) {
    const { start_date, recipient_id, deliveryman_id, product } = req.body;

    const checkOrder = await Order.findOne({
      where: { recipient_id, deliveryman_id, product, canceled_at: null },
    });

    if (checkOrder) {
      return res
        .status(400)
        .json({ error: { message: 'Order already exist' } });
    }
    /**
     * Verify start time
     */

    const parsedHours = parseISO(start_date);
    const hourStart = getHours(parsedHours);

    if (hourStart < 8 || hourStart > 18) {
      return res.status(400).json({
        error: {
          hourStart,
          message: 'Your start time must be between 8am and 6pm!',
        },
      });
    }

    /**
     * Create order and send mail
     */

    const deliveryman = await Courier.findByPk(deliveryman_id);

    if (!deliveryman) {
      return res
        .status(404)
        .json({ error: { message: 'Deliveryman does not exist' } });
    }

    const recipient = await Recipient.findByPk(recipient_id);

    if (!recipient) {
      return res
        .status(404)
        .json({ error: { message: 'Recipient does not exist' } });
    }

    const { id, canceled_at } = await Order.create({
      ...req.body,
      start_date: parsedHours,
    });

    const { id: id_deliveryman, name, email } = deliveryman;
    const {
      id: id_recipient,
      name: name_recipient,
      street,
      number,
      complement,
      state,
      city,
      cep,
    } = recipient;

    await Queue.add(OrderRegisteredMail.key, {
      deliveryman: {
        name,
        email,
      },
      product,
      recipient: {
        name: name_recipient,
        street,
        number,
        complement,
        state,
        city,
        cep,
      },
    });

    return res.json({
      id,
      product,
      start_date,
      canceled_at,
      deliveryman: {
        id: id_deliveryman,
        name,
        email,
      },
      recipient: {
        id: id_recipient,
        name: name_recipient,
        street,
        number,
        complement,
        state,
        city,
        cep,
      },
    });
  }

  async update(req, res) {
    const { id } = req.params;
    const { end_date, deliveryman_id, recipient_id, signature_id } = req.body;

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({ error: { message: 'Order not found' } });
    }

    if (order.end_date) {
      return res.status(400).json({
        error: { message: 'This order was already delivered' },
      });
    }

    const checkDeliveryman = await Courier.findByPk(deliveryman_id);

    if (!checkDeliveryman) {
      return res
        .status(404)
        .json({ error: { message: 'Delivery man not found' } });
    }

    const checkRecipient = await Courier.findByPk(recipient_id);

    if (!checkRecipient) {
      return res
        .status(404)
        .json({ error: { message: 'Recipient not found' } });
    }

    const checkSignature = await File.findByPk(signature_id);

    if (!checkSignature) {
      return res
        .status(404)
        .json({ error: { message: 'Signature not found' } });
    }

    const parsedHoursEnd = parseISO(end_date);

    await order.update({
      ...req.body,
      end_date: parsedHoursEnd,
    });

    const {
      id: id_order,
      product,
      start_date,
      recipient,
      deliveryman,
      signature_recipient,
    } = await Order.findByPk(id, {
      include: [
        {
          model: Recipient,
          as: 'recipient',
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
        },
        {
          model: Courier,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: File,
          as: 'signature_recipient',
          attributes: ['id', 'name', 'path', 'url'],
        },
      ],
    });

    return res.json({
      id: id_order,
      product,
      start_date,
      recipient,
      deliveryman,
      signature_recipient,
    });
  }

  async delete(req, res) {
    const { id } = req.params;

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({ error: { message: 'Order not found' } });
    }

    if (!order.canceled_at) {
      return res
        .status(400)
        .json({ error: { message: 'this order cannot be deleted' } });
    }

    await order.destroy();

    return res.json();
  }
}

export default new OrderController();
