import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';

interface SignaturePadProps {
  visible: boolean;
  onClose: () => void;
  onSave: (signature: string) => void;
  title?: string;
}

/**
 * Signature Pad Component using HTML Canvas
 * Captures signature as base64 PNG image
 */
export default function SignaturePad({
  visible,
  onClose,
  onSave,
  title = 'Sign Here',
}: SignaturePadProps) {
  const webViewRef = useRef<WebView>(null);
  const [hasSignature, setHasSignature] = useState(false);

  // HTML with canvas-based signature pad
  const signatureHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: #f5f5f5;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        #signature-pad {
          border: 2px dashed #2196F3;
          background: white;
          touch-action: none;
          border-radius: 12px;
        }
        .container {
          width: 95%;
          max-width: 600px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <canvas id="signature-pad" width="600" height="300"></canvas>
      </div>
      <script>
        const canvas = document.getElementById('signature-pad');
        const ctx = canvas.getContext('2d');
        let isDrawing = false;
        let hasDrawn = false;

        // Set canvas size
        function resizeCanvas() {
          const container = canvas.parentElement;
          const ratio = Math.min(
            container.clientWidth / 600,
            container.clientHeight / 300
          );
          canvas.style.width = (600 * ratio) + 'px';
          canvas.style.height = (300 * ratio) + 'px';
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Drawing settings
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        function getCoordinates(e) {
          const rect = canvas.getBoundingClientRect();
          const scaleX = canvas.width / rect.width;
          const scaleY = canvas.height / rect.height;
          
          if (e.touches && e.touches[0]) {
            return {
              x: (e.touches[0].clientX - rect.left) * scaleX,
              y: (e.touches[0].clientY - rect.top) * scaleY
            };
          }
          return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
          };
        }

        function startDrawing(e) {
          isDrawing = true;
          const coords = getCoordinates(e);
          ctx.beginPath();
          ctx.moveTo(coords.x, coords.y);
          e.preventDefault();
        }

        function draw(e) {
          if (!isDrawing) return;
          const coords = getCoordinates(e);
          ctx.lineTo(coords.x, coords.y);
          ctx.stroke();
          hasDrawn = true;
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'hasSignature', value: true }));
          e.preventDefault();
        }

        function stopDrawing() {
          isDrawing = false;
          ctx.closePath();
        }

        // Mouse events
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);

        // Touch events
        canvas.addEventListener('touchstart', startDrawing);
        canvas.addEventListener('touchmove', draw);
        canvas.addEventListener('touchend', stopDrawing);
        canvas.addEventListener('touchcancel', stopDrawing);

        // Clear canvas
        window.clearCanvas = function() {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          hasDrawn = false;
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'hasSignature', value: false }));
        };

        // Get signature as base64
        window.getSignature = function() {
          if (!hasDrawn) {
            return null;
          }
          return canvas.toDataURL('image/png');
        };
      </script>
    </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'hasSignature') {
        setHasSignature(data.value);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };

  const handleClear = () => {
    webViewRef.current?.injectJavaScript('window.clearCanvas();');
    setHasSignature(false);
  };

  const handleSave = () => {
    webViewRef.current?.injectJavaScript(`
      const signature = window.getSignature();
      if (signature) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'signature', data: signature }));
      }
    `);
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === 'signature' && message.data) {
        onSave(message.data);
        onClose();
        setHasSignature(false);
      } else if (message.type === 'hasSignature') {
        setHasSignature(message.value);
      }
    } catch (error) {
      console.error('Error handling webview message:', error);
    }
  };

  const handleClose = () => {
    handleClear();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* WebView with Signature Pad */}
          <View style={styles.webViewContainer}>
            <WebView
              ref={webViewRef}
              source={{ html: signatureHTML }}
              style={styles.webView}
              onMessage={handleWebViewMessage}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              scrollEnabled={false}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
            >
              <Ionicons name="refresh" size={20} color="#666" />
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.saveButton,
                !hasSignature && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!hasSignature}
            >
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text style={styles.saveButtonText}>Save Signature</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: Math.min(width * 0.9, 600),
    maxHeight: height * 0.7,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  webViewContainer: {
    height: 350,
    backgroundColor: '#f5f5f5',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  clearButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
    marginLeft: 6,
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2196F3',
  },
  saveButtonDisabled: {
    backgroundColor: '#BBDEFB',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
    marginLeft: 6,
  },
});
