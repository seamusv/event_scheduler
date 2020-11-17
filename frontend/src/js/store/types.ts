export const OPERATION_BEGIN = "OPERATION_BEGIN";
export const OPERATION_SUCCESS = "OPERATION_SUCCESS";
export const OPERATION_FAILURE = "OPERATION_FAILURE";
export const OPERATION_POP_FAILURE = "OPERATION_POP_FAILURE";

interface OperationBegin {
    type: typeof OPERATION_BEGIN;
}

interface OperationSuccess {
    type: typeof OPERATION_SUCCESS;
}

interface OperationFailure {
    type: typeof OPERATION_FAILURE;
    status: string;
    message: string;
}

interface OperationPopFailure {
    type: typeof OPERATION_POP_FAILURE;
}

export interface Error {
    status: string;
    message: string;
}

export type OperationActionTypes = OperationBegin | OperationSuccess | OperationFailure | OperationPopFailure;

export interface OperationState {
    isLoading: boolean;
    errors: Error[];
}

export const initialState: OperationState = {
    errors: [],
    isLoading: false,
}

export function opsReducer(state = initialState, action: OperationActionTypes): OperationState {
    switch (action.type) {
        case "OPERATION_BEGIN":
            return {...state, isLoading: true};
        case "OPERATION_FAILURE":
            return {...state, errors: [...state.errors, {status: action.status, message: action.message}], isLoading: false};
        case "OPERATION_POP_FAILURE":
            return {...state, errors: state.errors.slice(1)};
        case "OPERATION_SUCCESS":
            return {...state, isLoading: false};
        default:
            return state;
    }
}