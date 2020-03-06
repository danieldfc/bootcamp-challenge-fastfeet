import { Op } from 'sequelize';

import {
  startOfDay,
  endOfDay,
  setHours,
  isWithinInterval,
  startOfHour,
  parseISO,
} from 'date-fns';

import Deliveryman from '../models/Deliveryman';
import File from '../models/File';
import Order from '../models/Order';
import Recipient from '../models/Recipient';

class DeliverymanOrderController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const { id: deliveryman_id } = req.params;

    const deliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!deliveryman) {
      return res
        .status(404)
        .json({ error: { message: 'Deliveryman not found' } });
    }

    const limit = 20;

    const orders = await Order.findAll({
      attributes: ['id', 'product', 'start_date', 'end_date', 'canceled_at'],
      limit,
      offset: (page - 1) * limit,
      where: {
        deliveryman_id,
        end_date: null,
        canceled_at: null,
      },
      include: [
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
      ],
    });

    return res.json(orders);
  }

  async update(req, res) {
    let { end_date } = req.body;
    const { id, deliveryman_id } = req.params;

    /**
     * verify exist deliveryman and order
     */

    const checkDeliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!checkDeliveryman) {
      return res
        .status(404)
        .json({ error: { message: 'Deliveryman not found' } });
    }

    const checkOrder = await Order.findByPk(id, {
      attributes: ['id', 'product', 'canceled_at', 'start_date', 'end_date'],
      include: [
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
      ],
    });

    if (!checkOrder) {
      return res.status(404).json({ error: { message: 'Order not found' } });
    }

    /**
     * verify date
     */
    const start_date = new Date();

    if (
      !isWithinInterval(start_date, {
        start: startOfHour(setHours(start_date, 1)),
        end: startOfHour(setHours(start_date, 18)),
      })
    ) {
      return res.status(400).json({
        error: {
          message:
            'You can only withdraw the deliveries between 08:00h and 18:00h',
        },
      });
    }

    const ordersCollectedOnTheDay = await Order.findAndCountAll({
      where: {
        deliveryman_id,
        start_date: {
          [Op.between]: [startOfDay(start_date), endOfDay(start_date)],
        },
      },
    });

    if (ordersCollectedOnTheDay.count > 5) {
      return res.status(400).json({
        error: { message: 'Your orders have reached a goal of 5 a day.' },
      });
    }

    end_date = parseISO(end_date);

    const order = await checkOrder.update({
      start_date,
      end_date,
    });

    return res.json(order);
  }
}

export default new DeliverymanOrderController();
