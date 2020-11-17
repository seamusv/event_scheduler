import * as React from "react";
import {useEffect, useState} from "react";
import {Transition} from "@headlessui/react";
import {Controller, useForm} from "react-hook-form";
import DatePicker from "react-datepicker";
import * as moment from "moment-timezone";
import {Entry} from "@app/pages/ASGTable";

export const AddEntryModal = (props: Props) => {
    const [show, setShow] = useState(false);
    const {control, register, handleSubmit} = useForm<FormInput>();

    useEffect(() => setShow(true), []);

    const onClose = () => {
        setShow(false);
        setTimeout(() => props.onClose(), 1000);
    }

    const onEntry = (data: FormInput) => {
        console.log("DATA", data);
        const entry: Entry = {
            name: data.name,
            start: moment(data.start).tz(data.tz, true).format("YYYY-MM-DDTHH:mm:ssZ"),
            finish: moment(data.finish).tz(data.tz, true).format("YYYY-MM-DDTHH:mm:ssZ"),
            servers: parseInt(data.servers),
        };
        props.onEntry(entry);
        onClose();
    }

    const timezones = moment.tz.names().reduce((acc, f) => f.startsWith("Canada") || f.startsWith("US") || f.startsWith("Australia") ? [...acc, f] : acc, []);

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
                        <div
                            ref={ref}
                            className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6"
                            role="dialog" aria-modal="true" aria-labelledby="modal-headline">
                            <form onSubmit={handleSubmit(onEntry)}>
                                <div className="hidden sm:block absolute top-0 right-0 pt-4 pr-4">
                                    <button type="button"
                                            className="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 transition ease-in-out duration-150"
                                            onClick={onClose}
                                            aria-label="Close">
                                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none"
                                             viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M6 18L18 6M6 6l12 12"/>
                                        </svg>
                                    </button>
                                </div>
                                <div className="sm:flex sm:items-start">
                                    <div
                                        className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg"
                                             fill="none"
                                             viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M5 13l4 4L19 7"/>
                                        </svg>
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                                            Add schedule
                                        </h3>
                                        <div className="mt-2 grid grid-cols-7 gap-4">
                                            <div className="col-span-6">
                                                <label htmlFor="name"
                                                       className="block text-sm font-medium leading-5 text-gray-700">Name</label>
                                                <div className="mt-1 relative rounded-md shadow-sm">
                                                    <input id="name"
                                                           name="name"
                                                           className="form-input block w-full sm:text-sm sm:leading-5"
                                                           ref={register({required: true})}
                                                           autoFocus={true}
                                                    />
                                                </div>
                                            </div>

                                            <div className="col-span-1">
                                                <label htmlFor="servers"
                                                       className="block text-sm font-medium leading-5 text-gray-700">Servers</label>
                                                <div className="mt-1 relative rounded-md shadow-sm">
                                                    <input id="servers"
                                                           name="servers"
                                                           type="number"
                                                           className="form-input block w-full sm:text-sm sm:leading-5"
                                                           ref={register({required: true, min: 2, max: 20})}
                                                    />
                                                </div>
                                            </div>

                                            <div className="col-span-3">
                                                <label
                                                    className="block text-sm font-medium leading-5 text-gray-700">Start</label>
                                                <div className="mt-1 relative rounded-md shadow-sm">
                                                    <Controller
                                                        name="start"
                                                        control={control}
                                                        defaultValue={moment().hours(9).toDate()}
                                                        rules={{required: true}}
                                                        render={data => (
                                                            <DatePicker
                                                                selected={data.value}
                                                                onChange={(date: Date) => data.onChange(date)}
                                                                inline
                                                                showTimeSelect
                                                                minDate={new Date()}
                                                                timeFormat="HH:mm"
                                                                timeIntervals={15}
                                                                timeCaption="time"
                                                                dateFormat="MMMM d, yyyy h:mm aa"
                                                            />
                                                        )}
                                                    />
                                                </div>
                                            </div>

                                            <div className="col-span-3">
                                                <label
                                                    className="block text-sm font-medium leading-5 text-gray-700">Finish</label>
                                                <div className="mt-1 relative rounded-md shadow-sm">
                                                    <Controller
                                                        name="finish"
                                                        control={control}
                                                        defaultValue={moment().hours(9).toDate()}
                                                        rules={{required: true}}
                                                        render={data => (
                                                            <DatePicker
                                                                selected={data.value}
                                                                onChange={(date: Date) => data.onChange(date)}
                                                                inline
                                                                showTimeSelect
                                                                minDate={new Date()}
                                                                timeFormat="HH:mm"
                                                                timeIntervals={15}
                                                                timeCaption="time"
                                                                dateFormat="MMMM d, yyyy h:mm aa"
                                                            />
                                                        )}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="tz"
                                                       className="block text-sm font-medium leading-5 text-gray-700">Timezone</label>
                                                <div className="mt-1 relative rounded-md shadow-sm">
                                                    <select
                                                        id="tz"
                                                        name="tz"
                                                        className="form-input block w-full sm:text-sm sm:leading-5"
                                                        ref={register({required: true})}
                                                        defaultValue="US/Pacific"
                                                    >
                                                        {timezones.map((value, index) => (
                                                            <option key={`tz_${index}`}>{value}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                <span className="flex w-full rounded-md shadow-sm sm:ml-3 sm:w-auto">
                                  <button type="submit"
                                          className="inline-flex justify-center w-full rounded-md border border-transparent px-4 py-2 bg-indigo-600 text-base leading-6 font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo transition ease-in-out duration-150 sm:text-sm sm:leading-5"
                                  >
                                    Add schedule
                                  </button>
                                </span>
                                    <span className="mt-3 flex w-full rounded-md shadow-sm sm:mt-0 sm:w-auto">
                                  <button type="button"
                                          className="inline-flex justify-center w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-base leading-6 font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue transition ease-in-out duration-150 sm:text-sm sm:leading-5"
                                          onClick={onClose}
                                  >
                                    Cancel
                                  </button>
                                </span>
                                </div>
                            </form>
                        </div>
                    )}
                </Transition>
            </div>
        </div>
    )
}

interface Props {
    onClose: () => void;
    onEntry: (data: Entry) => void;
}

interface FormInput {
    name: string;
    start: Date;
    finish: Date;
    servers: string;
    tz: string;
}