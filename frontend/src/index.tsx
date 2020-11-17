import {store} from "@app/store";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Provider} from "react-redux";
import {App} from "./App";
import * as Wails from "@wailsapp/runtime";

import './styles.css';
import "react-datepicker/dist/react-datepicker.css";

Wails.Init(() => {
    ReactDOM.render(
        <Provider store={store}>
            <App/>
        </Provider>,
        document.getElementById('app')
    )
});