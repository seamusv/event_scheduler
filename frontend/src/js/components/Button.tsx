import * as classnames from "classnames";
import * as React from "react";

export enum ButtonStyle {
    primary,
    secondary,
}

interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    buttonStyle?: ButtonStyle
}

export const Button = (props: Props) => {
    const {buttonStyle, ...rest} = {buttonStyle: ButtonStyle.primary, ...props};

    const classes = classnames(
        "inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md focus:outline-none focus:shadow-outline-indigo transition ease-in-out duration-150",
        {"text-white      bg-indigo-600 hover:bg-indigo-500 focus:border-indigo-700 active:bg-indigo-700": buttonStyle == ButtonStyle.primary},
        {"text-indigo-700 bg-indigo-100 hover:bg-indigo-50  focus:border-indigo-300 active:bg-indigo-200": buttonStyle == ButtonStyle.secondary},
        props.className,
    );

    return (
        <button
            {...rest}
            className={classes}
        >
            {props.children}
        </button>
    )
}