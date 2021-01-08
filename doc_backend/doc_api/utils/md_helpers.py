"""
已更改为前端控制
无用
"""

import re
import json

markdown_reg = re.compile(r'^(#+)\s*(.*)\s*$')


def extract_toc_text(text):
    level_key = {0: '', 1: '', 2: '', 3: '', 4: '', 5: ''}
    toc_tree = []
    text = re.sub(r'```(.|\n).*?```', '', text)
    for line in text.split('\n'):
        match = markdown_reg.match(line)
        if match is not None:
            level, text = match.groups()
            if len(level) <= 5:
                level_key[len(level)] = text
                # tab = ((len(level) - 1) * 2) * " "
                toc_tree.append({'level': len(level), 'name': text, 'parent': level_key[len(level) - 1]})
    return toc_tree


def extract_toc_to_tree(top_trees, toc_text):
    for top_tree in top_trees:
        children_toc = [default_toc for default_toc in toc_text if default_toc['parent'] == top_tree['name'] and default_toc['level'] == top_tree['level'] + 1]
        if len(children_toc) > 1:
            top_tree['children'] = extract_toc_to_tree(children_toc, toc_text)
        else:
            top_tree['children'] = []
    return top_trees


def extract_toc(text):
    toc_text = extract_toc_text(text)
    top_toc = [{'level': toc['level'], 'name': toc['name'], 'parent': '', 'children': []} for toc in toc_text if toc['parent'] == ""]
    toc_trees = extract_toc_to_tree(top_toc, toc_text)
    return toc_trees


if __name__ == '__main__':
    markdown_text = open('/home/alan/test.md').read()
    new_toc_tree = extract_toc(markdown_text)
    print(json.dumps(new_toc_tree, ensure_ascii=False))
