import React from 'react';
import * as allIcons from '@ant-design/icons/es/icons';
import AntdIcon, {createFromIconfontCN, getTwoToneColor, setTwoToneColor} from '@ant-design/icons';
import {withThemeSuffix, removeTypeTheme, getThemeFromTypeName, alias} from './utils';
import warning from './warning';

const iconsMap = allIcons

const LegacyTypeIcon = function LegacyTypeIcon(props) {
    const type = props.type,
        theme = props.theme

    if (theme) {
        const themeInName = getThemeFromTypeName(type)
        warning(!themeInName || theme === themeInName, 'Icon', 'The icon name \''.concat(type, '\' already specify a theme \'').concat(themeInName, '\',') + ' the \'theme\' prop \''.concat(theme, '\' will be ignored.'));
    }

    const computedType = withThemeSuffix(removeTypeTheme(alias(type)), theme || 'outlined')
    const targetIconComponent = iconsMap[computedType]
    warning(targetIconComponent, 'Icon', 'The icon name \''.concat(type, '\'').concat(theme ? 'with '.concat(theme) : '', ' doesn\'t exist, please check it at https://ant.design/components/icon'));
    return targetIconComponent ? React.createElement(targetIconComponent, props) : null;
}

const Icon = function Icon(props) {
    // eslint-disable-next-line react/prop-types
    const type = props.type,
        // eslint-disable-next-line react/prop-types
        component = props.component,
        // eslint-disable-next-line react/prop-types
        children = props.children
    warning(Boolean(type || component || children), 'Icon', 'Should have `type` prop or `component` prop or `children`.');

    if (component || children) {
        return React.createElement(AntdIcon, Object.assign({}, props));
    }

    if (typeof type === 'string') {
        return React.createElement(LegacyTypeIcon, Object.assign({}, props, {
            type: type,
        }));
    }

    return React.createElement(AntdIcon, null);
}

Icon.createFromIconfontCN = createFromIconfontCN;
Icon.getTwoToneColor = getTwoToneColor;
Icon.setTwoToneColor = setTwoToneColor;
export default Icon;
