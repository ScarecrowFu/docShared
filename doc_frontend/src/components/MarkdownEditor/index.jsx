import React, {Component} from 'react';
import PropTypes from 'prop-types';
import MDEditor, {commands, ICommand, TextApi, TextState} from "@uiw/react-md-editor"
import ImageModal from './ImageModal'

/**
 * 操作封装，Markdown 编辑器
 */
export default class MarkdownEditor extends Component {
    static propTypes = {
        content: PropTypes.string,
        handleContentChange: PropTypes.func,
    };

    static defaultProps = {
        content: '',
    };

    state = {
        insertImageVisible: false,
    };

    render() {
        const {content, handleContentChange} = this.props;

        const insertImages: ICommand = {
            name: '插入图片',
            keyCommand: 'insertImages',
            buttonProps: { 'aria-label': 'Insert title3' },
            icon: (
                <svg width="12" height="12" viewBox="0 0 20 20">
                    <path fill="currentColor" d="M15 9c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4-7H1c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm-1 13l-6-5-2 2-4-5-4 8V4h16v11z" />
                </svg>
            ),
            execute: (state: TextState, api: TextApi) => {
                // let modifyText = `### ${state.selectedText}\n`;
                // if (!state.selectedText) {
                //     modifyText = `### `;
                // }
                // api.replaceSelection(modifyText);
                this.setState({insertImageVisible: true});
            },
        };

        return (
            <div>
                <MDEditor
                    value={content}
                    height={650}
                    commands={[
                        commands.bold, commands.italic, commands.strikethrough, commands.hr, commands.title,
                        commands.divider, commands.link, commands.quote, commands.code,
                        commands.unorderedListCommand, commands.orderedListCommand, commands.checkedListCommand,
                        commands.codeEdit, commands.codeLive, commands.codePreview, commands.fullscreen,
                        insertImages,
                    ]}
                    onChange={handleContentChange}
                />

                <ImageModal
                    visible={this.state.insertImageVisible}
                    onOk={() => this.setState({ insertImageVisible: false })}
                    onCancel={() => this.setState({ insertImageVisible: false })}
                />
            </div>

        );
    }
}
