import React, {Component} from 'react';
import PropTypes from 'prop-types';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import toc from "markdown-it-toc-done-right";
import anchor from 'markdown-it-anchor';
import lists from 'markdown-it-task-lists';
import table from 'markdown-it-multimd-table';
import './style.less'
/**
 * 操作封装，Markdown 渲染等庄
 */
export default class MarkdownRender extends Component {
    static propTypes = {
        content: PropTypes.string,
        content_toc: PropTypes.bool,
        only_toc: PropTypes.bool,
    };

    static defaultProps = {
        content: '',
        content_toc: false,
        only_toc: false,
    };

    state = {};

    handlerRender = (content) => {
        let render_content = content;
        let render_toc = '';
        const {content_toc, only_toc} = this.props;
        const md = new MarkdownIt({
            highlight: function (str, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(lang, str).value;
                    } catch (__) { }
                }
                return ''; // use external default escaping
            },
            html: true, // Enable HTML tags in source
            xhtmlOut: true, // Use '/' to close single tags (<br />)
            breaks: false, // Convert '\n' in paragraphs into <br>
            linkify: true, // Autoconvert URL-like text to links
            typographer: true, // Enable smartypants and other sweet transforms
        });
        md.use(anchor, { permalink: true, permalinkBefore: true, permalinkSymbol: '§' } )
        md.use(toc, { listType: 'ul', callback: function (html, ast) {
                // render_toc = html;
                let div = document.createElement('div');
                div.innerHTML = html.replace(/<ul>/g, '').replace(/<\/ul>/g, '').replace(/<nav class="table-of-contents">/g, '').replace(/<\/nav>/g, '');
                const li_tags = div.getElementsByTagName('li');

                console.log('toc html', html);
                console.log('render_toc html', div.innerHTML);
                console.log('div.getElementsByTagName(\'li\') html', div.getElementsByTagName('li'));
            } })
        md.use(lists)
        md.use(table)
        if (content_toc || only_toc) render_content = '[toc]\n' + render_content;
        if (only_toc) {
            md.render(render_content);
            return render_toc;
        }
        return md.render(render_content);
    }

    render() {
        const {content} = this.props;

        return (
            <div>
                <article styleName="markdown-body" >
                    <div dangerouslySetInnerHTML={{__html: this.handlerRender(content)}}/>
                </article>
            </div>

        );
    }
}
