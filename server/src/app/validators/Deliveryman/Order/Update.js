import { object, date } from 'yup';

export default async (req, res, next) => {
  try {
    const schema = object().shape({
      start_date: date(),
    });

    await schema.validate(req.body, { abortEarly: false });

    return next();
  } catch (err) {
    return res.status(403).json({
      error: {
        title: 'Validation failure',
        messages: err.inner.map(mes => mes.message),
      },
    });
  }
};
