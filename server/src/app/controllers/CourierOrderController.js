import { Op } from 'sequelize';

import {
  startOfDay,
  endOfDay,
  setHours,
  isWithinInterval,
  startOfHour,
  parseISO,
} from 'date-fns';

import Courier from '../models/Courier';
import File from '../models/File';
import Order from '../models/Order';
import Recipient from '../models/Recipient';

class CourierOrderController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const { id: deliveryman_id } = req.params;

    const courier = await Courier.findByPk(deliveryman_id);

    if (!courier) {
      return res.status(404).json({ error: { message: 'Courier not found' } });
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
          model: Courier,
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
    const { end_date } = req.body;
    const { id, id_courier } = req.params;

    /**
     * verify exist courier and order
     */

    const checkCourier = await Courier.findByPk(id_courier);

    if (!checkCourier) {
      return res.status(404).json({ error: { message: 'Courier not found' } });
    }

    const checkOrder = await Order.findByPk(id);

    if (!checkOrder) {
      return res.status(404).json({ error: { message: 'Order not found' } });
    }

    /**
     * verify date
     */
    const currentDate = new Date();

    if (
      !isWithinInterval(currentDate, {
        start: startOfHour(setHours(currentDate, 1)),
        end: startOfHour(setHours(currentDate, 18)),
      })
    )
      return res.status(400).json({
        error: {
          message:
            'You can only withdraw the deliveries between 08:00h and 18:00h',
        },
      });

    const order = await checkOrder.update({
      start_date: currentDate,
      end_date: parseISO(end_date),
    });

    const ordersCollectedOnTheDay = await Order.findAndCountAll({
      where: {
        deliveryman_id: id_courier,
        start_date: {
          [Op.between]: [startOfDay(currentDate), endOfDay(currentDate)],
        },
      },
    });

    if (ordersCollectedOnTheDay.count > 5) {
      return res.status(400).json({
        error: { message: 'Your orders have reached a goal of 5 a day.' },
      });
    }

    return res.json({
      order,
      countColletedTheDay: ordersCollectedOnTheDay.count,
    });
  }
}

export default new CourierOrderController();
