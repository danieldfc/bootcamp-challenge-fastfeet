import { parseISO, setHours, startOfHour, isWithinInterval } from 'date-fns';

import Deliveryman from '../models/Deliveryman';
import File from '../models/File';
import Order from '../models/Order';
import Recipient from '../models/Recipient';

import Queue from '../../lib/Queue';

import OrderRegisteredMail from '../jobs/OrderRegisteredMail';

class OrderController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const limit = 20;

    const orders = await Order.findAll({
      where: { canceled_at: null },
      order: ['start_date'],
      limit,
      offset: (page - 1) * limit,
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
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'name', 'path', 'url'],
            },
          ],
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
    const startDate = new Date(start_date);

    if (
      !isWithinInterval(startDate, {
        start: startOfHour(setHours(startDate, 8)),
        end: startOfHour(setHours(startDate, 18)),
      })
    ) {
      return res.status(401).json({
        error: {
          message:
            'You can only withdraw the deliveries between 08:00h and 18:00h',
        },
      });
    }

    /**
     * Create order and send mail
     */

    const deliveryman = await Deliveryman.findByPk(deliveryman_id, {
      attributes: ['id', 'name', 'email'],
    });

    if (!deliveryman) {
      return res
        .status(404)
        .json({ error: { message: 'Deliveryman does not exist' } });
    }

    const recipient = await Recipient.findByPk(recipient_id, {
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

    if (!recipient) {
      return res
        .status(404)
        .json({ error: { message: 'Recipient does not exist' } });
    }

    const { id, canceled_at } = await Order.create({
      product,
      recipient_id,
      deliveryman_id,
      start_date: startDate,
    });

    await Queue.add(OrderRegisteredMail.key, {
      deliveryman,
      product,
      recipient,
    });

    return res.json({
      id,
      product,
      start_date,
      canceled_at,
      deliveryman,
      recipient,
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

    const checkDeliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!checkDeliveryman) {
      return res
        .status(404)
        .json({ error: { message: 'Delivery man not found' } });
    }

    const checkRecipient = await Recipient.findByPk(recipient_id);

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
          model: Deliveryman,
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
