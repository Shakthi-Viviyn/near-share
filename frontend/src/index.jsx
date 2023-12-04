import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App.jsx';
import { Authenticator} from '@aws-amplify/ui-react';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Authenticator.Provider>
        <App />
    </Authenticator.Provider>
);

