import Mail from '../../lib/Mail';

class CanceledDeliveryProblemMail {
  get key() {
    return 'CanceledDeliveryProblemMail';
  }

  async handle({ data }) {
    const { deliveryman, order, problem } = data;

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: `Order: ${order.product} - Canceled`,
      template: 'CanceledDeliveryProblemMail',
      context: {
        order,
        deliveryman,
        problem,
      },
    });
  }
}

export default new CanceledDeliveryProblemMail();
