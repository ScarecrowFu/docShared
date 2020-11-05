import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Pagination} from 'antd';
import './index.less';

/**
 * 分页封装
 */
export default class PaginationComponent extends Component {
    static propTypes = {
        size: PropTypes.string,
        showSizeChanger: PropTypes.bool,
        showQuickJumper: PropTypes.bool,
        showMessage: PropTypes.bool,
        pageSize: PropTypes.number,
        pageNum: PropTypes.number,
        total: PropTypes.number,
        onPageNumChange: PropTypes.func,
        onPageSizeChange: PropTypes.func,
    };

    static defaultProps = {
        size: 'small',
        showSizeChanger: true,
        showQuickJumper: true,
        showMessage: true,
        pageSize: 15,
        pageNum: 1,
        total: 0,
        onPageNumChange: () => void 0,
        onPageSizeChange: () => void 0,
    };

    render() {
        const {
            size,
            showSizeChanger,
            showQuickJumper,
            showMessage,
            pageSize,
            pageNum,
            total,
            onPageNumChange,
            onPageSizeChange,
        } = this.props;

        const props = {};
        if (showSizeChanger) {
            props.showSizeChanger = true;
        }
        if (showQuickJumper) {
            props.showQuickJumper = true;
        }

        const totalPage = Math.ceil(total / pageSize);
        let style = this.props.style;
        if (total <= 0) {
            style = {/* display: 'none', */ ...style};
        }
        return (
            <div className="pagination-wrap" style={style}>
                <Pagination
                    {...props}
                    size={size}
                    pageSizeOptions={['10', '15', '20', '30', '50', '100']}
                    onShowSizeChange={(num, size) => onPageSizeChange(size)}
                    onChange={(num) => onPageNumChange(num)}
                    defaultCurrent={1}
                    pageSize={pageSize}
                    current={pageNum}
                    total={total}
                />
                {showMessage ? (
                    <div className="total-count">
                        共{totalPage}页 {total}条数据
                    </div>
                ) : null}
            </div>
        );
    }
}
