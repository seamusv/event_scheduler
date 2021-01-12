import * as React from "react";
import {useEffect, useState} from "react";
import {Button} from "@app/components";
import * as moment from "moment";
import {AddEntryModal} from "@app/pages/AddEntryModal";
import {ConfirmDeleteModal} from "@app/pages/ConfirmDeleteModal";

export const ASGTable = () => {
    const [modal, setModal] = useState<JSX.Element | null>(null);
    const [refresh, setRefresh] = useState(false);
    const [schedules, setSchedules] = useState<Schedule[]>([]);

    useEffect(() => {
        setSchedules([]);
        (window as any).backend.AutoScaler.GetSchedule().then(setSchedules);
    }, [refresh]);

    useEffect(() => {
        console.log(schedules);
    }, [schedules]);

    const onAddEntry = (data: Entry) => {
        (window as any).backend.AutoScaler.AddSchedule(data).then(() => setRefresh(!refresh));
    }

    const onDeleteEntry = (ids: string[]) => {
        (window as any).backend.AutoScaler.DeleteSchedule(ids).then(() => setRefresh(!refresh));
    }

    const importICS = () => {
        (window as any).backend.AutoScaler.ParseICSFile().then(() => setRefresh(!refresh));
    }

    return (
        <>
            {modal}
            <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <div className="flex justify-end">
                        <Button
                            onClick={importICS}
                        >
                            Import from ICS
                        </Button>
                        <Button
                            className="ml-2"
                            onClick={() => setModal(
                                <AddEntryModal
                                    onClose={() => setModal(null)}
                                    onEntry={onAddEntry}
                                />
                            )}
                        >
                            Add schedule
                        </Button>
                        <Button
                            className="ml-2"
                            onClick={() => setRefresh(!refresh)}
                        >
                            Refresh
                        </Button>
                    </div>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:p-6">
                    <div className="flex flex-col">
                        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead>
                                        <tr>
                                            <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                                                Event Name
                                            </th>
                                            <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                                                Start Time
                                            </th>
                                            <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                                                Finish Time
                                            </th>
                                            <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                                                Servers
                                            </th>
                                            <th className="px-6 py-3 bg-gray-50"></th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {schedules.map((schedule, index) => (
                                            <tr key={`entry_${index}`}
                                                className={index % 2 == 0 ? "bg-white" : "bg-gray-50"}>
                                                <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 font-medium text-gray-900">
                                                    {schedule.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                                                    {schedule.start !== null && (
                                                        <>
                                                            <div>{moment.utc(schedule.start).utcOffset(schedule.tz).format()}</div>
                                                            <div>{moment.utc(schedule.start).local().format()}</div>
                                                        </>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                                                    <div>{moment.utc(schedule.finish).utcOffset(schedule.tz).format()}</div>
                                                    <div>{moment.utc(schedule.finish).local().format()}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500 text-center">
                                                    {schedule.size}
                                                </td>
                                                <td className="px-6 py-4 whitespace-no-wrap text-right text-sm leading-5 font-medium">
                                                    <a href="#"
                                                       className="text-indigo-600 hover:text-indigo-900"
                                                       onClick={() => setModal(
                                                           <ConfirmDeleteModal
                                                               name={schedule.name}
                                                               onConfirm={((confirm) => {
                                                                   if (confirm) {
                                                                       onDeleteEntry(schedule.ids);
                                                                   }
                                                                   setModal(null);
                                                               })}
                                                           />
                                                       )}
                                                    >
                                                        Delete
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

interface Schedule {
    ids: string[];
    name: string;
    size: number;
    start: string;
    finish: string;
    tz: string;
}

export interface Entry {
    name: string;
    start: string;
    finish: string;
    servers: number;
}