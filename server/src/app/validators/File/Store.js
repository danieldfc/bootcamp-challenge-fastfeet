import { mixed, setLocale } from 'yup';

export default async (req, res, next) => {
  try {
    setLocale({
      mixed: {
        notType: 'File is required',
      },
    });

    const schema = mixed()
      .required()
      .label('file');

    await schema.validate(req.file, { abortEarly: false });

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
