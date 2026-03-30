import { useEffect, useRef, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import RichTextEditor from '../../components/admin/RichTextEditor';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import Toast from '../../components/common/Toast';
import useToast from '../../hooks/useToast';
import { CET_DEFAULTS } from '../../constants/publicPageDefaults';
import { exceedsAdminRichTextLimit } from '../../utils/adminTextLimit';
import {
  PAGE_SLUGS,
  ensureSection,
  fetchSectionsByPage,
  replaceSectionBlocks,
} from '../../services/adminPageContent';
import api from '../../services/api';
import '../../styles/admin.css';
import '../../styles/forms.css';

function AdminCET() {
  const [sections, setSections] = useState([]);
  const [highlightImage, setHighlightImage] = useState(CET_DEFAULTS.highlightImage);
  const [highlightText, setHighlightText] = useState(CET_DEFAULTS.highlightText);
  const [galleryImages, setGalleryImages] = useState(CET_DEFAULTS.gallery);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingHighlight, setUploadingHighlight] = useState(false);
  const [uploadingGalleryIndex, setUploadingGalleryIndex] = useState(null);
  const formActionsRef = useRef(null);
  const { toast, showToast, hideToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const pageSections = await fetchSectionsByPage('cet');
      const highlightSection = pageSections.find((s) => s.slug === PAGE_SLUGS.cet.highlight);
      const gallerySection = pageSections.find((s) => s.slug === PAGE_SLUGS.cet.gallery);

      const highlightBlocks = highlightSection?.blocks || [];
      const imgBlock = highlightBlocks.find((b) => b.type === 'IMAGE');
      const txtBlock = highlightBlocks.find((b) => b.type === 'TEXT');

      const galleryBlocks = (gallerySection?.blocks || [])
        .filter((b) => b.type === 'IMAGE' && b.imageUrl)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((b) => b.imageUrl);

      setSections(pageSections);
      setHighlightImage(imgBlock?.imageUrl || CET_DEFAULTS.highlightImage);
      setHighlightText(txtBlock?.content || CET_DEFAULTS.highlightText);
      setGalleryImages(galleryBlocks.length > 0 ? galleryBlocks : CET_DEFAULTS.gallery);
    } catch {
      setError('No se pudo cargar el contenido de CET.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!formError) return;
    formActionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [formError]);

  useEffect(() => {
    if (!saved) return;
    showToast('success', 'Cambios guardados.');
    setSaved(false);
  }, [saved, showToast]);

  const handleHighlightImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingHighlight(true);
    setFormError(null);
    try {
      const data = new FormData();
      data.append('image', file);
      const res = await api.post('/admin/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setHighlightImage(res.data.url);
    } catch (err) {
      setFormError(err.response?.data?.message || 'No se pudo subir la imagen principal.');
    } finally {
      setUploadingHighlight(false);
    }
  };

  const handleGalleryUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const index = galleryImages.length;
    setUploadingGalleryIndex(index);
    setFormError(null);
    try {
      const data = new FormData();
      data.append('image', file);
      const res = await api.post('/admin/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setGalleryImages((prev) => [...prev, res.data.url]);
    } catch (err) {
      setFormError(err.response?.data?.message || 'No se pudo subir la imagen.');
    } finally {
      setUploadingGalleryIndex(null);
    }
  };

  const handleRemoveGalleryImage = (index) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleHighlightTextChange = (value) => {
    if (exceedsAdminRichTextLimit(value)) {
      setFormError('El texto admite hasta 5000 caracteres.');
      return;
    }
    setFormError(null);
    setHighlightText(value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (exceedsAdminRichTextLimit(highlightText)) {
      setFormError('El texto admite hasta 5000 caracteres.');
      return;
    }
    setSaving(true);
    setFormError(null);
    setSaved(false);
    try {
      const highlightSectionId = await ensureSection({
        sections,
        page: 'cet',
        slug: PAGE_SLUGS.cet.highlight,
        title: 'CET – Destacado',
        description: 'Imagen y texto principal de la página CET',
        order: 1,
      });
      const gallerySectionId = await ensureSection({
        sections,
        page: 'cet',
        slug: PAGE_SLUGS.cet.gallery,
        title: 'CET – Galería',
        description: 'Galería de imágenes de la página CET',
        order: 2,
      });

      await replaceSectionBlocks(highlightSectionId, [
        { type: 'IMAGE', title: 'Imagen principal', imageUrl: highlightImage, order: 1 },
        { type: 'TEXT', content: highlightText, order: 2 },
      ]);

      await replaceSectionBlocks(
        gallerySectionId,
        galleryImages.map((url, i) => ({
          type: 'IMAGE',
          imageUrl: url,
          order: i + 1,
        }))
      );

      await loadData();
      setSaved(true);
    } catch (err) {
      const message = err.response?.data?.message || 'No se pudo guardar CET.';
      showToast('error', message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="CET">
        <Loader />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="CET">
        <ErrorMessage message={error} onRetry={loadData} />
      </AdminLayout>
    );
  }

  const isUploading = uploadingHighlight || uploadingGalleryIndex !== null;

  return (
    <AdminLayout title="CET">
      <Toast toast={toast} onClose={hideToast} />
      <div className="admin-page">
        <div className="admin-form-card">
          <h3>Contenido de la página CET</h3>
          <form className="form admin-home-form" onSubmit={handleSubmit}>

            {/* ── Sección destacada ───────────────────────────────── */}
            <div className="admin-section-block admin-section-block--about">
              <div className="admin-section-block__header">
                <span>🖼️</span> Panel destacado (imagen izquierda + texto derecha)
              </div>
              <div className="form-group">
                <label>Imagen izquierda</label>
                <input
                  value={highlightImage}
                  onChange={(e) => setHighlightImage(e.target.value)}
                  placeholder="https://..."
                />
                <div className="form-upload">
                  <label className="btn btn--outline btn--sm">
                    {uploadingHighlight ? 'Subiendo...' : '📎 Subir imagen'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleHighlightImageUpload}
                      style={{ display: 'none' }}
                      disabled={uploadingHighlight}
                    />
                  </label>
                  {highlightImage && (
                    <img src={highlightImage} alt="Preview imagen principal" className="upload-preview" />
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Texto derecha</label>
                <RichTextEditor
                  value={highlightText}
                  onChange={handleHighlightTextChange}
                />
              </div>
            </div>

            {/* ── Galería de imágenes ─────────────────────────────── */}
            <div className="admin-section-block admin-section-block--services">
              <div className="admin-section-block__header">
                <span>🏞️</span> Galería de imágenes
              </div>

              {galleryImages.length === 0 && (
                <p className="admin-empty-hint">Aún no hay imágenes en la galería.</p>
              )}

              <div className="admin-gallery-grid">
                {galleryImages.map((url, index) => (
                  <div key={`${url}-${index}`} className="admin-gallery-item">
                    <img src={url} alt={`Galería ${index + 1}`} className="admin-gallery-item__img" />
                    <button
                      type="button"
                      className="admin-gallery-item__remove"
                      onClick={() => handleRemoveGalleryImage(index)}
                      aria-label="Eliminar imagen"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <label className="admin-gallery-add">
                  {uploadingGalleryIndex !== null ? (
                    <span>Subiendo...</span>
                  ) : (
                    <>
                      <span className="admin-gallery-add__icon">＋</span>
                      <span>Añadir imagen</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleGalleryUpload}
                    style={{ display: 'none' }}
                    disabled={uploadingGalleryIndex !== null}
                  />
                </label>
              </div>
            </div>

            <div className="form-actions" ref={formActionsRef}>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={saving || isUploading}
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
              {formError && <span className="form-inline-error">{formError}</span>}
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminCET;
