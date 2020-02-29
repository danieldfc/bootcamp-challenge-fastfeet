import { object, string } from 'yup';

const schema = object().shape({
  email: string()
    .email('Insira um email válido')
    .required('O email é obrigatório!'),
  password: string().required('A senha é obrigatório!'),
});

export default schema;
