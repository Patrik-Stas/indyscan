import React from 'react';
import ReactDOM from 'react-dom';
import ConnectionTable  from './';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<ConnectionTable  />, div);
  ReactDOM.unmountComponentAtNode(div);
});
