import Mail from '../../lib/Mail';

class OrderRegisteredMail {
  get key() {
    return 'OrderRegisteredMail';
  }

  async handle({ data }) {
    const { deliveryman, product, recipient } = data;

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Order registered',
      template: 'OrderRegisteredMail',
      context: {
        product,
        recipient,
      },
    });
  }
}

export default new OrderRegisteredMail();
