import * as classnames from "classnames";
import * as React from "react";

interface Props {
    checked: boolean;
    classNames?: "",
    onChange?: (state: boolean) => void;
}

export const Toggle = (props: Props) => {
    const {checked, onChange} = {
        onChange: () => {
        }, ...props
    };

    const outerClasses = classnames(
        "bg-gray-200 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:shadow-outline",
        {"bg-indigo-600": checked},
        {"bg-gray-200": !checked},
        props.classNames,
    );

    const innerClasses = classnames(
        "translate-x-0 inline-block h-5 w-5 rounded-full bg-white shadow transform transition ease-in-out duration-200",
        {"translate-x-5": checked},
        {"translate-x-0": !checked},
    );

    return (
        <span
            role="checkbox"
            aria-checked="false"
            className={outerClasses}
            onClick={() => onChange(!checked)}
        >
            <span
                aria-hidden="true"
                className={innerClasses}
            />
        </span>
    )
}