import './polyfills';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import TaleWeaver from './TaleWeaver';

ReactDOM.render(
  <React.StrictMode>
    <TaleWeaver />
  </React.StrictMode>,
  document.getElementById('root')
);
