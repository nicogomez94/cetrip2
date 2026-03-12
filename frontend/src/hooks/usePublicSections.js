import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';

function usePublicSections(page) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSections = useCallback(async () => {
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
  }, [page]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  return { sections, loading, error, refetch: fetchSections };
}

export default usePublicSections;
