import React, { Component } from 'react';
import { Button, Spin } from 'antd';
import PropTypes from 'prop-types';
import { getElementTop, getParentByClassName } from 'src/utils';

/**
 * Modal 的内容容器，默认会使用屏幕剩余空间，内部内容滚动
 */
export default class ModalContent extends Component {
    state = {
        height: 'auto',
    };

    static propTypes = {
        surplusSpace: PropTypes.bool,   // 是否使用屏幕剩余空间
        otherHeight: PropTypes.number,  // 除了主体内容之外的其他高度，用于计算主体高度；
        loading: PropTypes.bool,        // 是否加载中
        loadingTip: PropTypes.any,      // 加载中提示文案
        footer: PropTypes.any,          // 底部
        okHtmlType: PropTypes.any,      // 确定按钮类型
        okText: PropTypes.any,          // 确定按钮文案
        onOk: PropTypes.func,           // 确定事件
        cancelText: PropTypes.any,      // 取消按钮文案
        onCancel: PropTypes.func,       // 取消事件
        resetText: PropTypes.any,       // 重置按钮文案
        onReset: PropTypes.func,        // 表单重置事件
        otherText1: PropTypes.any,          // 其他按钮文案
        otherButton1: PropTypes.func,           // 其他事件
        otherType1: PropTypes.any,      // 其他按钮类型
        otherText2: PropTypes.any,          // 其他按钮文案
        otherButton2: PropTypes.func,           // 其他事件
        otherType2: PropTypes.any,      // 其他按钮类型
        otherText3: PropTypes.any,          // 其他按钮文案
        otherButton3: PropTypes.func,           // 其他事件
        otherType3: PropTypes.any,      // 其他按钮类型
        otherText4: PropTypes.any,          // 其他按钮文案
        otherButton4: PropTypes.func,           // 其他事件
        otherType4: PropTypes.any,      // 其他按钮类型
        otherText5: PropTypes.any,          // 其他按钮文案
        otherButton5: PropTypes.func,           // 其他事件
        otherType5: PropTypes.any,      // 其他按钮类型

        style: PropTypes.object,        // 最外层容器样式
        bodyStyle: PropTypes.object,    // 内容容器样式
    };

    static defaultProps = {
        loading: false,
        style: {},
        bodyStyle: {},
        surplusSpace: false,
        okText: '确定',
        okHtmlType: '',
        resetText: '重置',
        cancelText: '取消',
        // onOk: () => void 0,
        onCancel: () => void 0,
    };

    componentDidMount() {
        const { surplusSpace } = this.props;

        if (surplusSpace) {
            this.handleWindowResize();
            window.addEventListener('resize', this.handleWindowResize);
        }
    }

    componentWillUnmount() {
        const { surplusSpace } = this.props;

        if (surplusSpace) window.removeEventListener('resize', this.handleWindowResize);
    }

    handleWindowResize = () => {
        let { otherHeight } = this.props;
        const windowHeight = document.documentElement.clientHeight;
        if (!otherHeight) {
            const top = getElementTop(this.wrapper);
            let bottom = 24;
            const antModalDom = getParentByClassName(this.wrapper, 'ant-modal');

            if (antModalDom) {
                const classList = Array.from(antModalDom.classList);
                const isFullScreen = classList.find(item => item.startsWith('full-screen'));

                if (isFullScreen) bottom = 0;
            }

            otherHeight = top + bottom;
        }
        const height = windowHeight - otherHeight;

        this.setState({ height });
    };

    render() {
        const {
            surplusSpace,
            loading,
            loadingTip,
            // eslint-disable-next-line no-unused-vars
            otherHeight,
            style,
            bodyStyle,
            footer,
            okHtmlType,
            okText,
            resetText,
            cancelText,
            onOk,
            onCancel,
            onReset,
            otherText1,
            otherButton1,
            otherType1,
            otherText2,
            otherButton2,
            otherType2,
            otherText3,
            otherButton3,
            otherType3,
            otherText4,
            otherButton4,
            otherType4,
            otherText5,
            otherButton5,
            otherType5,
            children,
            ...others
        } = this.props;
        const { height } = this.state;
        return (
            <Spin spinning={loading} tip={loadingTip}>
                <div
                    className="modal-content"
                    ref={node => this.wrapper = node}
                    style={{ display: 'flex', flexDirection: 'column', height, ...style }}
                    {...others}
                >
                    <div
                        className="modal-content-inner"
                        style={{ flex: 1, padding: 16, overflow: surplusSpace ? 'auto' : '', ...bodyStyle }}
                    >
                        {children}
                    </div>
                    {footer !== false ? (
                        <div className="ant-modal-footer" style={{ flex: 0 }}>
                            {footer ? footer : (
                                <>
                                    {onOk ? <Button type="primary" onClick={onOk} htmlType={okHtmlType}>{okText}</Button>: null}
                                    {onReset ? <Button onClick={onReset}>{resetText}</Button> : null}
                                    {otherButton1 ? <Button type={otherType1} onClick={otherButton1}>{otherText1}</Button> : null}
                                    {otherButton2 ? <Button type={otherType2} onClick={otherButton2}>{otherText2}</Button> : null}
                                    {otherButton3 ? <Button type={otherType3} onClick={otherButton3}>{otherText3}</Button> : null}
                                    {otherButton4 ? <Button type={otherType4} onClick={otherButton4}>{otherText4}</Button> : null}
                                    {otherButton5 ? <Button type={otherType5} onClick={otherButton5}>{otherText5}</Button> : null}
                                    {onCancel ? <Button onClick={onCancel}>{cancelText}</Button> : null}
                                </>
                            )}
                        </div>
                    ) : null}
                </div>
            </Spin>
        );
    }
}
