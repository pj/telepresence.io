import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import { Link as GatsbyLink } from 'gatsby';
import { Link as ScrollLink } from 'react-scroll';
import scrollUtils from 'react-scroll/modules/mixins/utils';
import url from 'url';

function trimPrefix(str, prefix) {
  return str?.startsWith(prefix) ? str.slice(prefix.length) : str;
}

const Link = ({ children, ...props}) => {
  const to = trimPrefix(props.to || props.href, useStaticQuery(graphql`
    query HeaderQuery {
      site {
        siteMetadata {
          siteUrl
        }
      }
    }
    `).site.siteMetadata.siteUrl + '/');

  if (!to) {
    // not a link
    return <a {...props}>{children}</a>;
  } else if (url.parse(to).protocol || props.target === "_blank") {
    // external link
    props.target = "_blank";
    props.rel = "nofollow noopener noreferrer";
    delete props.to;
    props.href = to;
    return <a {...props}>{children}</a>;
  } else if (to.startsWith('#')) {
    // internal link to a fragment within this page

    props.to = to.slice(1); // JS-scroll
    props.href = to;        // non-JS/copy-link

    // Update the history/URL bar, since react-scroll disables that by default.
    const origOnClick = props.onClick;
    props.onClick = (ev) => {
      if (origOnClick) {
        origOnClick(ev);
      }
      if (scrollUtils.getHash() !== props.to) {
        scrollUtils.updateHash(props.to, true);
      }
    };

    return <ScrollLink smooth={true} {...props}>{children}</ScrollLink>
  } else {
    // internal link to a different page

    // If you're thinking "wait, <GatsbyLink> doesn't support
    // relative links, we need to do something about that!", then
    // you're out-of-date.  Relative links were fixed in Gatsby
    // 2.22.17.

    props.to = to;
    delete props.href;
    return <GatsbyLink {...props}>{children}</GatsbyLink>
  }
};

export default Link;
