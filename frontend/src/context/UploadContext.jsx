import { createContext, useContext, useState } from 'react';

const UploadContext = createContext(null);

export function UploadProvider({ children }) {
  const [isUploading, setIsUploading] = useState(false);

  return (
    <UploadContext.Provider value={{ isUploading, setIsUploading }}>
      {children}
    </UploadContext.Provider>
  );
}

export function useUpload() {
  const ctx = useContext(UploadContext);
  if (!ctx) throw new Error('useUpload debe usarse dentro de UploadProvider');
  return ctx;
}
