import {opsReducer} from "./types";
import {applyMiddleware, combineReducers, createStore} from "redux";
import thunk from 'redux-thunk';

export const rootReducer = combineReducers({
    ops: opsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export const store = createStore(rootReducer, applyMiddleware(thunk));

