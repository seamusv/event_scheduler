import thunk, {ThunkDispatch} from "redux-thunk";
import {RootState} from "./index";
import {AnyAction} from "redux";
import configureMockStore from "redux-mock-store";

type DispatchExts = ThunkDispatch<RootState, void, AnyAction>;

const middlewares = [thunk];
export const generateMockStore = configureMockStore<RootState, DispatchExts>(middlewares);
