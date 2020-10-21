import React from 'react';
import { CopyrightOutlined } from '@ant-design/icons';
import './index.less';

export default function (props) {
    return (
        <div className="footer" {...props}>
            Copyright <CopyrightOutlined /> xxx 2020
        </div>
    );
}
