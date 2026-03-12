const HTML_TAG_REGEX = /<\/?[a-z][\s\S]*>/i;

function RichTextContent({ content, className = '', as = 'div' }) {
  if (!content) return null;
  const Tag = as;

  if (HTML_TAG_REGEX.test(content)) {
    return <Tag className={className} dangerouslySetInnerHTML={{ __html: content }} />;
  }

  return <Tag className={className}>{content}</Tag>;
}

export default RichTextContent;
