import {Tag} from 'antd'
import React from "react"

export function yesOrNoTag(value, yesText='是', noText='否') {
    let color = value ? 'green' : 'volcano';
    let txt = value ? yesText : noText;
    return (
        <Tag color={color}>
            {txt}
        </Tag>
    );
}