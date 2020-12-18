import os
import re
import argparse

HDRS = {
    'markdown': re.compile(r'^(#+)\s*(.*)\s*$'),
    'asciidoc': re.compile(r'^(=+)\s*(.*)\s*$')
}


def guess_type(path):
    _, ext = os.path.splitext(path)
    if ext.lower() in {'.md', '.mdown', '.markdown', '.mkdn', '.rmd'}:
        return 'markdown'

    if ext.lower() in {'.asciidoc', '.adoc'}:
        return 'asciidoc'

    raise ValueError('Unknown extenion type "{}"'.format(ext))


def extract_toc(path, indent=2, dtype=None):
    # Get the header regular expression from the markup format
    dtype = dtype or guess_type(path)
    if dtype not in HDRS:
        raise ValueError("{} is not a valid document type".format(dtype))

    hdr = HDRS[dtype]

    # Open up the file for reading
    with open(path, 'r') as f:
        for line in f:
            match = hdr.match(line)
            if match is not None:
                level, text = match.groups()
                tab = ((len(level) - 1) * indent) * " "
                print("{}- {}".format(tab, text))


if __name__ == '__main__':
    extract_toc('/home/alan/test.md', indent=5, dtype='markdown')