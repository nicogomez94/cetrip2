import { useEffect, useState } from 'react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import RichTextContent from '../common/RichTextContent';
import '../../styles/pages.css';

function PageContent({ page }) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSections = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/public/sections/${page}`);
      setSections(res.data.data || []);
    } catch {
      setError('No se pudo cargar el contenido.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, [page]);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={fetchSections} />;

  return (
    <div className="page-content">
      {sections.map((section) => (
        <section key={section.id} className="page-section">
          <div className="container">
            <div className="section-header">
              <h2>{section.title}</h2>
              {section.description && <p className="section-lead">{section.description}</p>}
            </div>
            <div className="section-blocks">
              {section.blocks.map((block) => renderBlock(block))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

function renderBlock(block) {
  switch (block.type) {
    case 'HERO':
      return (
        <div key={block.id} className="inner-hero">
          {block.imageUrl && (
            <img src={block.imageUrl} alt={block.title || ''} className="inner-hero__img" />
          )}
          <div className="inner-hero__body">
            {block.title && <h2>{block.title}</h2>}
            {block.subtitle && <p className="inner-hero__subtitle">{block.subtitle}</p>}
            <RichTextContent content={block.content} className="rich-text-content" />
            {block.linkUrl && (
              <a href={block.linkUrl} className="btn btn--primary">
                {block.linkText || 'Ver más'}
              </a>
            )}
          </div>
        </div>
      );
    case 'TEXT':
      return (
        <div key={block.id} className="block-text">
          {block.title && <h3 className="block-text__title">{block.title}</h3>}
          <RichTextContent content={block.content} className="block-text__content rich-text-content" />
        </div>
      );
    case 'IMAGE':
      return (
        <div key={block.id} className="block-image">
          {block.imageUrl && (
            <img src={block.imageUrl} alt={block.title || ''} className="block-image__img" />
          )}
          {block.title && <p className="block-image__caption">{block.title}</p>}
        </div>
      );
    case 'VIDEO':
      return (
        <div key={block.id} className="block-video">
          {block.title && <h3>{block.title}</h3>}
          {block.videoUrl && (
            <div className="video-wrapper">
              <iframe
                src={block.videoUrl}
                title={block.title || 'Video'}
                allowFullScreen
                frameBorder="0"
              />
            </div>
          )}
        </div>
      );
    case 'CARD':
      return (
        <div key={block.id} className="page-card">
          {block.imageUrl && (
            <img src={block.imageUrl} alt={block.title || ''} className="page-card__img" />
          )}
          <div className="page-card__body">
            {block.title && <h3 className="page-card__title">{block.title}</h3>}
            <RichTextContent content={block.content} className="page-card__text rich-text-content" />
            {block.linkUrl && (
              <a href={block.linkUrl} className="btn btn--outline">
                {block.linkText || 'Ver más'}
              </a>
            )}
          </div>
        </div>
      );
    case 'CTA':
      return (
        <div key={block.id} className="block-cta">
          {block.title && <h3>{block.title}</h3>}
          <RichTextContent content={block.content} className="rich-text-content" />
          {block.linkUrl && (
            <a href={block.linkUrl} className="btn btn--primary">
              {block.linkText || 'Más información'}
            </a>
          )}
        </div>
      );
    default:
      return null;
  }
}

export default PageContent;
