import React, {Component} from 'react';
import PropTypes from 'prop-types';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import toc from "markdown-it-toc-done-right";
import anchor from 'markdown-it-anchor';
import lists from 'markdown-it-task-lists';
import table from 'markdown-it-multimd-table';
import './style.less'
import {Anchor} from "antd"

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

    state = {
        toc : null,
    };



    // 渲染文档目录
    renderDocToc = (toc_element) =>{
        const tags = toc_element.querySelectorAll('li');
        const { Link } = Anchor;
        const _that = this;
        return [...tags].map(function (item, index) {
            const children = item.childNodes;
            console.log(item.getAttribute('title'), 'parent', item.parentNode)
            console.log(item.getAttribute('title'), 'children', children)
            return (
                <Link key={index} href={item.getAttribute('href')} title={item.getAttribute('title')}>
                    {children.length > 0 ? _that.renderDocToc(children) : null}
                </Link>
            )
        });
    }

    handlerRender = (content) => {
        let render_content = content;
        let render_toc = 'test';
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
                let div = document.createElement('div');
                div.innerHTML = html;
                const li_tags = div.querySelectorAll('li');
                li_tags.forEach(li_tag => {
                    const child = li_tag.childNodes[0];
                    for (let i = 0; i < child.attributes.length; i++) {
                        const attr = child.attributes[i]
                        li_tag.setAttribute(attr.name, attr.value)
                        li_tag.getAttribute(attr.name, attr.value)
                    }
                    li_tag.setAttribute('title', child.textContent);
                    child.remove();
                })
                render_toc = div.innerHTML.replace(/<ul>/g, '')
                    .replace(/<\/ul>/g, '')
                    .replace(/<nav class="table-of-contents">/g, '')
                    .replace(/<\/nav>/g, '')
                console.log('render_toc', render_toc);
                div.innerHTML = render_toc;
                render_toc = div;
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
        const {content, only_toc} = this.props;

        return (
            only_toc? this.renderDocToc(this.handlerRender(content)) :
                <div>
                    <article styleName="markdown-body" >
                        <div dangerouslySetInnerHTML={{__html: this.handlerRender(content)}}/>
                    </article>
                </div>


        );
    }
}
