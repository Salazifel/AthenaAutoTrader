import React from 'react';

const AnalysisModal = ({ isOpen, onClose, analysisContent }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" 
         style={{
           position: 'fixed',
           top: 0,
           left: 0,
           right: 0,
           bottom: 0,
           backgroundColor: 'rgba(0, 0, 0, 0.7)',
           display: 'flex',
           justifyContent: 'center',
           alignItems: 'center',
           zIndex: 1000,
         }}>
      <div className="modal-content" 
           style={{
             backgroundColor: '#16161A',
             borderRadius: '12px',
             padding: '1.5rem',
             width: '80%',
             maxWidth: '800px',
             maxHeight: '80vh',
             boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
             position: 'relative',
             overflow: 'hidden',
             display: 'flex',
             flexDirection: 'column'
           }}>
        <div className="modal-header" 
             style={{
               display: 'flex',
               justifyContent: 'space-between',
               alignItems: 'center',
               marginBottom: '1rem',
               borderBottom: '1px solid #222',
               paddingBottom: '0.5rem'
             }}>
          <h2 style={{ 
            color: '#FFF', 
            fontSize: '18px', 
            fontWeight: '600',
            margin: 0 
          }}>Strategy Analysis Results</h2>
          <button onClick={onClose} 
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#FFF',
                    fontSize: '20px',
                    cursor: 'pointer',
                    padding: '0.25rem 0.5rem'
                  }}>×</button>
        </div>
        <div className="modal-body" 
             style={{
               overflowY: 'auto',
               flex: 1
             }}>
          <pre style={{ 
            color: '#0BDF86', 
            whiteSpace: 'pre-wrap', 
            fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
            fontSize: '14px',
            padding: '1rem',
            backgroundColor: '#0C0C0E',
            borderRadius: '8px',
            margin: 0,
            height: '100%'
          }}>{analysisContent}</pre>
        </div>
        <div className="modal-footer" 
             style={{
               marginTop: '1rem',
               paddingTop: '0.5rem',
               borderTop: '1px solid #222',
               display: 'flex',
               justifyContent: 'flex-end'
             }}>
          <button onClick={onClose} 
                  style={{
                    backgroundColor: '#3712CB',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.5rem 1rem',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisModal;