import { useState, useCallback } from 'react';
import api from '../services/api';

function useApi() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (method, url, payload = null) => {
    setLoading(true);
    setError(null);
    try {
      const config = {};
      if (payload instanceof FormData) {
        config.headers = { 'Content-Type': 'multipart/form-data' };
      }
      const res = await api[method](url, payload, config);
      setData(res.data);
      return { success: true, data: res.data };
    } catch (err) {
      const msg =
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.message ||
        'Ocurrió un error inesperado.';
      setError(msg);
      return { success: false, message: msg, errors: err.response?.data?.errors };
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback((url) => request('get', url), [request]);
  const post = useCallback((url, body) => request('post', url, body), [request]);
  const put = useCallback((url, body) => request('put', url, body), [request]);
  const patch = useCallback((url, body) => request('patch', url, body), [request]);
  const del = useCallback((url) => request('delete', url), [request]);

  return { data, loading, error, get, post, put, patch, del };
}

export default useApi;
