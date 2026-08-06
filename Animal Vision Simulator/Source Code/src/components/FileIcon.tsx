import React from 'react';
import {
  Folder,
  FileText,
  Table,
  Presentation,
  FileCode,
  Image as ImageIcon,
  Film,
  Music,
  File,
  FileSpreadsheet
} from 'lucide-react';

interface FileIconProps {
  mimeType?: string;
  className?: string;
}

export const FileIcon: React.FC<FileIconProps> = ({ mimeType, className = 'w-5 h-5' }) => {
  if (!mimeType) return <File className={`${className} text-slate-400`} />;

  if (mimeType === 'application/vnd.google-apps.folder') {
    return <Folder className={`${className} text-amber-500 fill-amber-500/20`} />;
  }
  if (mimeType.includes('google-apps.document') || mimeType.includes('word')) {
    return <FileText className={`${className} text-blue-600`} />;
  }
  if (mimeType.includes('google-apps.spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) {
    return <Table className={`${className} text-emerald-600`} />;
  }
  if (mimeType.includes('google-apps.presentation') || mimeType.includes('powerpoint')) {
    return <Presentation className={`${className} text-amber-600`} />;
  }
  if (mimeType === 'application/pdf') {
    return <FileText className={`${className} text-rose-600`} />;
  }
  if (mimeType.startsWith('image/')) {
    return <ImageIcon className={`${className} text-purple-600`} />;
  }
  if (mimeType.startsWith('video/')) {
    return <Film className={`${className} text-violet-600`} />;
  }
  if (mimeType.startsWith('audio/')) {
    return <Music className={`${className} text-indigo-600`} />;
  }
  if (mimeType.includes('json') || mimeType.includes('javascript') || mimeType.includes('typescript') || mimeType.includes('html') || mimeType.includes('text/')) {
    return <FileCode className={`${className} text-cyan-600`} />;
  }

  return <File className={`${className} text-slate-400`} />;
};
