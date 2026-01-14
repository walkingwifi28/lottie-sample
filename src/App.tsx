import { useEffect, useCallback, useState, useRef } from 'react';
import { FileUploader } from './components/FileUploader';
import { LottiePlayer } from './components/LottiePlayer';
import { ColorEditor } from './components/ColorEditor';
import { useLottieFile } from './hooks/useLottieFile';
import { useLottieColors } from './hooks/useLottieColors';
import './App.css';

function App() {
  const { fileData, error, isLoading, handleFile, clearFile, updateSrcFromJson } = useLottieFile();

  const {
    colors,
    selectedColorId,
    selectColor,
    updateColor,
    resetColor,
    resetAllColors,
    getModifiedJson,
    hasChanges,
  } = useLottieColors({ lottieJson: fileData?.rawJson ?? null });

  // カラースライダーをドラッグ中かどうかを追跡
  const [isSliderDragging, setIsSliderDragging] = useState(false);
  // ドラッグ中に更新が保留されているかどうか
  const hasPendingUpdate = useRef(false);

  const handleSliderDragStart = useCallback(() => {
    setIsSliderDragging(true);
  }, []);

  const handleSliderDragEnd = useCallback(() => {
    setIsSliderDragging(false);
  }, []);

  // 色が変更されたらアニメーションを更新
  const handleColorUpdate = useCallback((id: string, newColor: number[]) => {
    updateColor(id, newColor);
  }, [updateColor]);

  // 色変更後にJSONを更新（ドラッグ中はスキップ）
  useEffect(() => {
    if (hasChanges) {
      if (isSliderDragging) {
        // ドラッグ中は更新を保留
        hasPendingUpdate.current = true;
      } else {
        const modifiedJson = getModifiedJson();
        if (modifiedJson) {
          updateSrcFromJson(modifiedJson);
        }
        hasPendingUpdate.current = false;
      }
    }
  }, [colors, hasChanges, getModifiedJson, updateSrcFromJson, isSliderDragging]);

  // ドラッグ終了時に保留中の更新を適用
  useEffect(() => {
    if (!isSliderDragging && hasPendingUpdate.current && hasChanges) {
      const modifiedJson = getModifiedJson();
      if (modifiedJson) {
        updateSrcFromJson(modifiedJson);
      }
      hasPendingUpdate.current = false;
    }
  }, [isSliderDragging, hasChanges, getModifiedJson, updateSrcFromJson]);

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Lottie Player</h1>
      </header>

      <main className="app-main">
        {!fileData ? (
          <div className="upload-section">
            <FileUploader
              onFileSelect={handleFile}
              isLoading={isLoading}
            />
            {error && (
              <div className="error-message">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="editor-layout">
            <div className="player-section">
              <LottiePlayer
                src={fileData.src}
                title={fileData.name}
                forcePause={isSliderDragging}
              />
              <button className="change-file-button" onClick={clearFile}>
                別のファイルを選択
              </button>
            </div>

            {colors.length > 0 && (
              <div className="color-editor-section">
                <ColorEditor
                  colors={colors}
                  selectedColorId={selectedColorId}
                  onSelectColor={selectColor}
                  onUpdateColor={handleColorUpdate}
                  onResetColor={resetColor}
                  onResetAllColors={resetAllColors}
                  hasChanges={hasChanges}
                  onSliderDragStart={handleSliderDragStart}
                  onSliderDragEnd={handleSliderDragEnd}
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
