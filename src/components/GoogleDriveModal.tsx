import React, { useState, useEffect } from 'react';
import { X, Cloud, CloudUpload, CloudDownload, Trash2, CheckCircle2, AlertTriangle, Loader2, HardDrive, RefreshCw } from 'lucide-react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
  findDriveSaveFile,
  saveGameToDrive,
  loadGameFromDrive,
  deleteDriveSaveFile,
  GameSaveData,
  DriveFileInfo,
} from '../services/googleDriveService';
import { Upgrade, StarArmor, MysticRelic } from '../types/game';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSaveData: {
    unlockedLevelId: number;
    scrap: number;
    upgrades: Upgrade[];
    unlockedArmors: string[];
    activeArmor: StarArmor;
    selectedGuardianId: string;
    relicsFound: MysticRelic[];
  };
  onRestoreSave: (data: GameSaveData) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  currentSaveData,
  onRestoreSave,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [driveFileInfo, setDriveFileInfo] = useState<DriveFileInfo | null>(null);
  const [isCheckingDrive, setIsCheckingDrive] = useState<boolean>(false);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState<boolean>(false);
  const [confirmRestoreModal, setConfirmRestoreModal] = useState<boolean>(false);
  const [loadedPreviewData, setLoadedPreviewData] = useState<GameSaveData | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
        checkDriveFile(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setDriveFileInfo(null);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [isOpen]);

  const checkDriveFile = async (token: string) => {
    try {
      setIsCheckingDrive(true);
      const file = await findDriveSaveFile(token);
      setDriveFileInfo(file);
    } catch (err: unknown) {
      console.error('Error al verificar archivo en Drive:', err);
    } finally {
      setIsCheckingDrive(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
        setStatusMessage({ type: 'success', text: `Conectado como ${res.user.displayName || res.user.email}` });
        await checkDriveFile(res.accessToken);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setStatusMessage({ type: 'error', text: `No se pudo iniciar sesión con Google: ${errorMsg}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await logout();
      setUser(null);
      setAccessToken(null);
      setDriveFileInfo(null);
      setStatusMessage({ type: 'info', text: 'Sesión cerrada exitosamente.' });
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToCloud = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    setStatusMessage(null);

    const payload: GameSaveData = {
      version: '1.2.0',
      timestamp: new Date().toISOString(),
      unlockedLevelId: currentSaveData.unlockedLevelId,
      scrap: currentSaveData.scrap,
      upgrades: currentSaveData.upgrades,
      unlockedArmors: currentSaveData.unlockedArmors,
      activeArmorId: currentSaveData.activeArmor.id,
      selectedGuardianId: currentSaveData.selectedGuardianId,
      relicsFound: currentSaveData.relicsFound,
    };

    try {
      const savedFile = await saveGameToDrive(accessToken, payload);
      setDriveFileInfo(savedFile);
      setStatusMessage({
        type: 'success',
        text: '¡Progreso multiversal guardado exitosamente en Google Drive!',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error de red';
      setStatusMessage({ type: 'error', text: `Error al guardar: ${msg}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrepareRestore = async () => {
    if (!accessToken || !driveFileInfo) return;
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const data = await loadGameFromDrive(accessToken, driveFileInfo.id);
      setLoadedPreviewData(data);
      setConfirmRestoreModal(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al leer archivo';
      setStatusMessage({ type: 'error', text: `No se pudo leer el archivo: ${msg}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteRestore = () => {
    if (!loadedPreviewData) return;
    onRestoreSave(loadedPreviewData);
    setConfirmRestoreModal(false);
    setStatusMessage({
      type: 'success',
      text: `¡Partida restaurada con éxito! Nivel alcanzado: ${loadedPreviewData.unlockedLevelId}, Fragmentos: ${loadedPreviewData.scrap}`,
    });
  };

  const handleExecuteDelete = async () => {
    if (!accessToken || !driveFileInfo) return;
    setIsLoading(true);
    setConfirmDeleteModal(false);
    try {
      await deleteDriveSaveFile(accessToken, driveFileInfo.id);
      setDriveFileInfo(null);
      setStatusMessage({ type: 'info', text: 'El archivo de guardado en Google Drive ha sido eliminado.' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar';
      setStatusMessage({ type: 'error', text: `Error al eliminar: ${msg}` });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="relative w-full max-w-lg bg-slate-950 border-2 border-purple-900/70 rounded-3xl shadow-2xl shadow-purple-950/60 overflow-hidden flex flex-col text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-900/50 bg-gradient-to-r from-purple-950/80 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-900/50 rounded-xl border border-purple-500/50">
              <Cloud className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="font-cinzel text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-purple-300 to-amber-200">
                Nube de Google Drive
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                Sincronización Multiversal y Respaldo de Progreso
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl border text-xs font-mono flex items-start gap-2.5 animate-fadeIn ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-950/80 border-rose-500 text-rose-200'
                  : 'bg-sky-950/80 border-sky-500 text-sky-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : statusMessage.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <Cloud className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* User Authentication Status */}
          {!user ? (
            <div className="text-center py-6 px-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-center">
                <HardDrive className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h4 className="font-cinzel text-base font-bold text-white">
                  Conectar con Google Drive
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Guarda tu progreso de Midnight Dimensions (reliquias reales, fragmentos del Pandorum, armaduras y runas) en tu unidad personal de Google Drive.
                </p>
              </div>

              {/* Official Google Sign-In Button */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={handleSignIn}
                  disabled={isLoading}
                  className="flex items-center gap-3 bg-white hover:bg-slate-100 text-slate-800 font-medium px-5 py-2.5 rounded-full shadow-lg transition-all transform active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span className="text-sm font-semibold tracking-wide">
                    {isLoading ? 'Conectando...' : 'Iniciar sesión con Google'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Connected User Badge */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Usuario'}
                      className="w-10 h-10 rounded-full border border-purple-400"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-purple-700 flex items-center justify-center font-bold text-white">
                      {user.displayName?.[0] || 'U'}
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-white font-cinzel">
                      {user.displayName || 'Arquitecto Cósmico'}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono">{user.email}</p>
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
                >
                  Desconectar
                </button>
              </div>

              {/* Current Local Save Summary */}
              <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-800/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-purple-300 font-bold">Estado Local Actual (Navegador)</span>
                  <span className="text-amber-300">Nivel {currentSaveData.unlockedLevelId} desbloqueado</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-slate-300">
                  <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Fragmentos:</span>
                    <span className="font-bold text-amber-300">{currentSaveData.scrap}</span>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Reliquias Reales:</span>
                    <span className="font-bold text-emerald-300">{currentSaveData.relicsFound.length}/4</span>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Armaduras:</span>
                    <span className="font-bold text-sky-300">{currentSaveData.unlockedArmors.length}/3</span>
                  </div>
                </div>
              </div>

              {/* Cloud Save Info in Google Drive */}
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-bold font-cinzel text-white">
                      Archivo en Google Drive:
                    </span>
                  </div>

                  {accessToken && (
                    <button
                      onClick={() => checkDriveFile(accessToken)}
                      disabled={isCheckingDrive}
                      className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Refrescar estado en Google Drive"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isCheckingDrive ? 'animate-spin text-purple-400' : ''}`} />
                    </button>
                  )}
                </div>

                {isCheckingDrive ? (
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400 py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                    <span>Consultando Google Drive...</span>
                  </div>
                ) : driveFileInfo ? (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono space-y-1.5">
                    <div className="flex items-center justify-between text-emerald-400">
                      <span className="font-semibold">✓ {driveFileInfo.name}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(driveFileInfo.modifiedTime).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>ID en Drive: {driveFileInfo.id.substring(0, 14)}...</span>
                      <button
                        onClick={() => setConfirmDeleteModal(true)}
                        className="text-rose-400 hover:text-rose-300 flex items-center gap-1 text-[10px] cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        Eliminar respaldo
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-dashed border-slate-800 text-xs font-mono text-slate-400 text-center py-4">
                    No hay ningún archivo de guardado previo en tu Google Drive.
                  </div>
                )}

                {/* Cloud Actions */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleSaveToCloud}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudUpload className="w-4 h-4" />}
                    <span>Guardar en Drive</span>
                  </button>

                  <button
                    onClick={handlePrepareRestore}
                    disabled={isLoading || !driveFileInfo}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudDownload className="w-4 h-4" />}
                    <span>Restaurar de Drive</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mandatory User Confirmation Dialog: Delete File */}
        {confirmDeleteModal && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-fadeIn">
            <div className="bg-slate-900 border-2 border-rose-600 p-6 rounded-2xl max-w-sm w-full space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-500 flex items-center justify-center mx-auto text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="font-cinzel text-base font-bold text-white">
                ¿Eliminar guardado de Google Drive?
              </h4>
              <p className="text-xs text-slate-300">
                Esta acción eliminará permanentemente el archivo <code className="text-amber-300 font-mono">midnight_dimensions_save.json</code> de tu Google Drive. Esta operación no se puede deshacer.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setConfirmDeleteModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleExecuteDelete}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold cursor-pointer shadow-lg shadow-rose-950"
                >
                  Confirmar Eliminación
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mandatory User Confirmation Dialog: Overwrite/Restore Save */}
        {confirmRestoreModal && loadedPreviewData && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-fadeIn">
            <div className="bg-slate-900 border-2 border-sky-500 p-6 rounded-2xl max-w-sm w-full space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-sky-950/80 border border-sky-400 flex items-center justify-center mx-auto text-sky-400">
                <CloudDownload className="w-6 h-6" />
              </div>
              <h4 className="font-cinzel text-base font-bold text-white">
                ¿Cargar y Sobrescribir Partida Local?
              </h4>
              <p className="text-xs text-slate-300">
                Se sobrescribirá el progreso local con el guardado de Google Drive:
              </p>
              <div className="text-[11px] font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-left space-y-1">
                <div className="text-amber-300">Nivel Desbloqueado: {loadedPreviewData.unlockedLevelId}</div>
                <div className="text-emerald-300">Fragmentos Chrono: {loadedPreviewData.scrap}</div>
                <div className="text-sky-300">Reliquias Místicas: {loadedPreviewData.relicsFound.length}/4</div>
                <div className="text-purple-300">Fecha del Respaldo: {new Date(loadedPreviewData.timestamp).toLocaleString()}</div>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setConfirmRestoreModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleExecuteRestore}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-mono font-bold cursor-pointer shadow-lg shadow-sky-950"
                >
                  Cargar y Reemplazar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
