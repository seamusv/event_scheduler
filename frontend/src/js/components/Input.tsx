import * as classnames from "classnames";
import * as React from "react";

type Props = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

type Ref = HTMLInputElement;

export const Input = React.forwardRef<Ref, Props>((props, ref) => {
    const classes = classnames(
        "appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5",
        props.className,
    );

    return (
        <input
            {...props}
            className={classes}
            ref={ref}
        />
    )
})