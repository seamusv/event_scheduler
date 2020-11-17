import * as React from "react";
import {useState} from "react";
import {Transition} from '@headlessui/react';
import {ASGTable} from "@app/pages/ASGTable";

export const App = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div>
            <nav className="bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <h2 className="text-2xl font-bold leading-7 text-white sm:text-3xl sm:leading-9 sm:truncate">
                                    AWS Event Scheduler
                                </h2>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <ASGTable/>
                    </div>
                </div>
            </main>
        </div>
    )
}
