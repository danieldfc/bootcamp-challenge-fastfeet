import styled from 'styled-components';

import { darken } from 'polished';

export const Wrapper = styled.div`
  height: 100%;
  min-height: 100vh;
  background: #7d40e7;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Content = styled.div`
  width: 100%;
  max-width: 360px;
  max-height: 425px;
  text-align: center;
  background: #fff;
  padding: 60px 30px;
  border-radius: 4px;

  form {
    display: flex;
    flex-direction: column;
    margin-top: 50px;

    label {
      display: flex;
      margin: 0 0 9px 0;
      font-weight: bold;
      color: #444;
      font-size: 14px;
    }

    input {
      background: #fff;
      border: 1px solid #ccc;
      border-radius: 4px;
      height: 44px;
      padding: 12px 15px;
      color: #222;
      font-size: 16px;
      margin-bottom: 10px;

      &::placeholder {
        color: #999;
      }
    }

    span {
      color: #7d40e7;
      align-self: flex-end;
      font-weight: bold;
    }

    button {
      margin: 5px 0 5px;
      height: 45px;
      background: #7d40e7;
      font-weight: bold;
      color: #fff;
      border: 0;
      border-radius: 4px;
      font-size: 16px;
      transition: background 0.3s;

      &:hover {
        background: ${darken(0.06, '#7d40e7')};
      }
    }
  }
`;
