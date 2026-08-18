import { useState, useEffect } from 'react';

// Success page after uploading photos with optional print function
export default function Done({ userEmail, finalImage, onReset }) {
  const [imageUrl, setImageUrl] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    if (!finalImage) return;
    
    // Create object URL from File or Blob for printing and preview
    let url;
    if (finalImage instanceof File || finalImage instanceof Blob) {
      url = URL.createObjectURL(finalImage);
      setImageUrl(url);
    } else if (typeof finalImage === 'string') {
      // If it is already a URL/path
      setImageUrl(finalImage);
    }

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [finalImage]);

  const getBase64 = (fileOrBlob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(fileOrBlob);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handlePrint = async () => {
    if (!imageUrl) {
      alert("Gambar cetak belum siap!");
      return;
    }

    if (isPrinting) return;

    const isElectron = !!window.electronAPI;

    if (isElectron) {
      setIsPrinting(true);
      try {
        let base64Data = '';
        if (finalImage instanceof File || finalImage instanceof Blob) {
          base64Data = await getBase64(finalImage);
        } else if (typeof finalImage === 'string') {
          const res = await fetch(finalImage);
          const blob = await res.blob();
          base64Data = await getBase64(blob);
        } else if (imageUrl.startsWith('data:')) {
          base64Data = imageUrl;
        } else if (imageUrl.startsWith('blob:')) {
          const res = await fetch(imageUrl);
          const blob = await res.blob();
          base64Data = await getBase64(blob);
        }

        if (!base64Data) {
          throw new Error("Gagal memproses data gambar.");
        }

        await window.electronAPI.printImage(base64Data);
      } catch (err) {
        console.error("Gagal mencetak:", err);
        // Do not alert if user cancelled the OS print dialog
        if (!err.message.includes("cancelled") && !err.message.includes("cancelled or failed")) {
          alert("Gagal mencetak: " + err.message);
        }
      } finally {
        setIsPrinting(false);
      }
    } else {
      // Create a hidden iframe for printing (browser fallback)
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow.document;
      doc.write(`
        <html>
          <head>
            <style>
              @page {
                size: auto;
                margin: 0mm;
              }
              body {
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
              }
              img {
                width: 100%;
                height: auto;
                max-height: 100vh;
                object-fit: contain;
              }
            </style>
          </head>
          <body>
            <img src="${imageUrl}" />
            <script>
              document.querySelector('img').onload = () => {
                window.focus();
                window.print();
                setTimeout(() => {
                  try {
                    window.frameElement.remove();
                  } catch (e) {
                    parent.document.body.removeChild(window.frameElement);
                  }
                }, 1000);
              };
            </script>
          </body>
        </html>
      `);
      doc.close();
    }
  };

  return (
    <div className="done-page-container">
      <div className="done-card-wrapper" style={{ maxWidth: '600px' }}>
        <div className="done-status-icon">🎉</div>
        <h1 className="done-title">SELESAI!</h1>
        <p className="done-text-success">Foto berhasil diupload!</p>
        <p className="done-text-email">
          Cek email Anda: <strong>{userEmail}</strong>
        </p>
        
        {/* Render final image preview if available */}
        {imageUrl && (
          <div className="done-image-preview-container" style={{
            margin: '20px 0',
            maxHeight: '280px',
            overflow: 'auto',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            padding: '10px',
            background: '#f8fafc',
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <img 
              src={imageUrl} 
              alt="Final Strip Preview" 
              style={{ maxHeight: '250px', width: 'auto', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
            />
          </div>
        )}

        <p className="done-text-note" style={{ marginBottom: '24px' }}>
          Hasil foto akan dikirim dalam beberapa menit. Silakan cek folder inbox atau spam Anda.
        </p>
        
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', width: '100%' }}>
          {imageUrl && (
            <button 
              onClick={handlePrint} 
              disabled={isPrinting}
              className="done-home-btn" 
              style={{ 
                background: '#10B981', 
                color: '#ffffff', 
                boxShadow: '0 10px 24px rgba(16, 185, 129, 0.4)',
                flex: '1',
                padding: '14px 20px',
                opacity: isPrinting ? 0.7 : 1,
                cursor: isPrinting ? 'not-allowed' : 'pointer'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              {isPrinting ? "Memproses..." : "Cetak Foto"}
            </button>
          )}
          <button 
            onClick={onReset} 
            className="done-home-btn" 
            style={{ 
              flex: '1',
              padding: '14px 20px'
            }}
          >
            Kembali ke Awal
          </button>
        </div>
      </div>
    </div>
  );
}
