import { useCallback, useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import './FileUploader.css';

interface FileUploaderProps {
    onFileSelect: (file: File) => void;
    isLoading?: boolean;
    disabled?: boolean;
}

export function FileUploader({ onFileSelect, isLoading = false, disabled = false }: FileUploaderProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
            setIsDragOver(true);
        }
    }, [disabled]);

    const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        if (disabled) return;

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            onFileSelect(files[0]);
        }
    }, [onFileSelect, disabled]);

    const handleClick = useCallback(() => {
        if (!disabled) {
            fileInputRef.current?.click();
        }
    }, [disabled]);

    const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            onFileSelect(files[0]);
        }
        // リセットして同じファイルを再選択可能に
        e.target.value = '';
    }, [onFileSelect]);

    return (
        <div
            className={`file-uploader ${isDragOver ? 'drag-over' : ''} ${disabled ? 'disabled' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept=".json,.lottie"
                onChange={handleFileChange}
                className="file-input"
            />

            <div className="upload-content">
                {isLoading ? (
                    <div className="loading-spinner" />
                ) : (
                    <>
                        <div className="upload-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                        </div>
                        <p className="upload-text">
                            ドラッグ&ドロップ<br />
                            または クリックしてファイル選択
                        </p>
                        <p className="upload-hint">.json / .lottie</p>
                    </>
                )}
            </div>
        </div>
    );
}
