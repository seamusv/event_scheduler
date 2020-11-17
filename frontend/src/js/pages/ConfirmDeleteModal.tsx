import * as React from "react";
import {useEffect, useState} from "react";
import {Transition} from "@headlessui/react";

export const ConfirmDeleteModal = (props: Props) => {
    const [show, setShow] = useState(false);

    useEffect(() => setShow(true), []);

    const onClose = () => {
        setShow(false);
        setTimeout(() => props.onConfirm(false), 1000);
    }

    const onConfirm = () => {
        setShow(false);
        setTimeout(() => props.onConfirm(true), 1000);
    }

    return (
        <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

                <Transition
                    show={show}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    {ref => (

                        <div ref={ref} className="fixed inset-0 transition-opacity">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"/>
                        </div>
                    )}
                </Transition>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen"/>&#8203;

                <Transition
                    show={show}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    enterTo="opacity-100 translate-y-0 sm:scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                    leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                    {ref => (
                        <div ref={ref}
                             className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
                             role="dialog" aria-modal="true" aria-labelledby="modal-headline">
                            <div className="sm:flex sm:items-start">
                                <div
                                    className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none"
                                         viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                    </svg>
                                </div>
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                                        Delete schedule
                                    </h3>
                                    <div className="mt-2">
                                        <p className="text-sm leading-5 text-gray-500 pb-4">
                                            Are you sure you want to
                                            delete <span className="font-medium text-gray-900">{props.name}</span>?
                                        </p>
                                        <p className="text-sm leading-5 text-gray-500">
                                            This schedule will be permanently removed and cannot be undone.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                <span className="flex w-full rounded-md shadow-sm sm:ml-3 sm:w-auto">
                                  <button
                                      type="button"
                                      className="inline-flex justify-center w-full rounded-md border border-transparent px-4 py-2 bg-red-600 text-base leading-6 font-medium text-white shadow-sm hover:bg-red-500 focus:outline-none focus:border-red-700 focus:shadow-outline-red transition ease-in-out duration-150 sm:text-sm sm:leading-5"
                                      onClick={onConfirm}
                                  >
                                    Delete
                                  </button>
                                </span>
                                <span className="mt-3 flex w-full rounded-md shadow-sm sm:mt-0 sm:w-auto">
                                  <button
                                      type="button"
                                      className="inline-flex justify-center w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-base leading-6 font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue transition ease-in-out duration-150 sm:text-sm sm:leading-5"
                                      onClick={onClose}
                                  >
                                    Cancel
                                  </button>
                                </span>
                            </div>
                        </div>
                    )}
                </Transition>
            </div>
        </div>
    )
}

interface Props {
    name: string;
    onConfirm: (confirm: boolean) => void;
}
