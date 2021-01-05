import React from 'react';
import { CopyrightOutlined, MailOutlined, FieldTimeOutlined } from '@ant-design/icons';
import './style.less';
import {Divider} from "antd"

export default function Footer (props) {
    let year = new Date().getFullYear();
    return (
        <div styleName="footer" {...props}>
            <Divider />
            Copyright <CopyrightOutlined /> <a rel="noreferrer" href="https://github.com/ScarecrowFu" target="_blank">司马扶妖</a>
            <FieldTimeOutlined /> 2020 - {year}
            <MailOutlined /> fualan1990@gmail.com
        </div>
    );
}
