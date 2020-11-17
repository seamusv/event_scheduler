import * as classnames from "classnames";
import * as React from "react";

export const Label = (props: React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>) => {
    const classes = classnames(
        "block text-sm font-medium leading-5 text-gray-700",
        props.className,
    );

    return (
        <label
            {...props}
            className={classes}
        >
            {props.children}
        </label>
    )
}
