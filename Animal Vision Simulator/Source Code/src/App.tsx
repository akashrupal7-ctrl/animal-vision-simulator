import { useState, useCallback, useEffect } from 'react';
import { ANIMALS_DATA } from './data/animals';
import { AnimalProfile, FilterControls, InputSourceType, NavTab, AppSettings, UserProfile } from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { LibraryScreen } from './components/LibraryScreen';
import { FavoritesScreen } from './components/FavoritesScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { CameraCanvas } from './components/CameraCanvas';
import { AnimalDetailsModal } from './components/AnimalDetailsModal';
import { SnapshotModal } from './components/SnapshotModal';
import { AIChatButton } from './components/AIChatButton';
import { AIAssistant } from './pages/AIAssistant';
import { GamesSection } from './pages/GamesSection';
import { ProfileScreen } from './components/ProfileScreen';
import { AuthModal } from './components/AuthModal';
import { loadUserProfile, saveUserProfile } from './services/userService';
import { checkAndRequestCameraPermissions } from './utils/capacitorBridge';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => loadUserProfile());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const handleUpdateUser = useCallback((updated: UserProfile) => {
    setCurrentUser(updated);
    saveUserProfile(updated);
  }, []);

  const [selectedAnimal, setSelectedAnimal] = useState<AnimalProfile>(
    ANIMALS_DATA.find((a) => a.id === 'dog') || ANIMALS_DATA[1]
  );

  const [detailModalAnimal, setDetailModalAnimal] = useState<AnimalProfile | null>(null);

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('animal_vision_favorites');
      return saved ? JSON.parse(saved) : ['dog', 'eagle', 'mantis_shrimp'];
    } catch {
      return ['dog', 'eagle', 'mantis_shrimp'];
    }
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('animal_vision_settings');
      return saved
        ? JSON.parse(saved)
        : {
            theme: 'dark',
            cameraQuality: '720p',
            performanceMode: 'gpu_high',
            language: 'English',
            autoStartCamera: true,
            soundEnabled: true,
            musicEnabled: false,
            notificationsEnabled: true,
          };
    } catch {
      return {
        theme: 'dark',
        cameraQuality: '720p',
        performanceMode: 'gpu_high',
        language: 'English',
        autoStartCamera: true,
        soundEnabled: true,
        musicEnabled: false,
        notificationsEnabled: true,
      };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('animal_vision_favorites', JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem('animal_vision_settings', JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  const [isComparisonActive, setIsComparisonActive] = useState<boolean>(true);
  const [comparisonSplit, setComparisonSplit] = useState<number>(50);
  const [inputSource, setInputSource] = useState<InputSourceType>('sample_image');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [filterControls, setFilterControls] = useState<FilterControls>({
    intensity: 100,
    nightGain: 50,
    zoomLevel: 2.5,
    compoundScale: 50,
    motionSensitivity: 60,
  });

  const [snapshotDataUrl, setSnapshotDataUrl] = useState<string | null>(null);
  const [isSnapshotOpen, setIsSnapshotOpen] = useState<boolean>(false);

  const handleRequestCamera = useCallback(async () => {
    setCameraError(null);
    const granted = await checkAndRequestCameraPermissions();
    if (!granted) {
      setCameraError('Camera access was not granted or is blocked by browser permissions');
    }
  }, []);

  const handleToggleFavorite = useCallback((id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAnimalAndLaunch = useCallback((animal: AnimalProfile) => {
    setSelectedAnimal(animal);
    setActiveTab('camera');
  }, []);

  const handleCaptureSnapshot = useCallback((dataUrl: string) => {
    setSnapshotDataUrl(dataUrl);
    setIsSnapshotOpen(true);
  }, []);

  const handleToggleComparison = useCallback(() => {
    setIsComparisonActive((prev) => !prev);
  }, []);

  const handleCloseSnapshot = useCallback(() => {
    setIsSnapshotOpen(false);
  }, []);

  return (
    <div
      className={`min-h-screen font-sans selection:bg-emerald-500 selection:text-slate-950 flex flex-col transition-colors duration-300 ${
        settings.theme === 'light'
          ? 'bg-slate-100 text-slate-900'
          : 'bg-slate-950 text-slate-100'
      }`}
    >
      {/* App Header (Shown on all tabs except camera for edge-to-edge full screen experience) */}
      {activeTab !== 'camera' && (
        <Header
          currentUser={currentUser}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onNavigateToProfile={() => setActiveTab('profile')}
        />
      )}

      {/* Main Screen Content Viewport according to active BottomNav Tab */}
      <main className={`flex-1 w-full transition-all duration-300 ${
        activeTab === 'camera'
          ? 'p-0 max-w-none overflow-hidden h-screen'
          : 'max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-28'
      }`}>
        {activeTab === 'home' && (
          <HomeScreen
            onSelectTab={setActiveTab}
            onSelectAnimalAndLaunch={handleSelectAnimalAndLaunch}
            onOpenDetails={setDetailModalAnimal}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {activeTab === 'camera' && (
          <CameraCanvas
            selectedAnimal={selectedAnimal}
            onSelectAnimal={setSelectedAnimal}
            onCaptureSnapshot={handleCaptureSnapshot}
            onRequestCamera={handleRequestCamera}
            cameraError={cameraError}
            onNavigateToAI={() => setActiveTab('ai')}
            onNavigateToSettings={() => setActiveTab('settings')}
          />
        )}

        {activeTab === 'library' && (
          <LibraryScreen
            onSelectAnimalAndLaunch={handleSelectAnimalAndLaunch}
            onOpenDetails={setDetailModalAnimal}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {activeTab === 'games' && (
          <GamesSection
            onNavigateToAI={() => setActiveTab('ai')}
            userStats={currentUser}
            onUpdateStats={(newStats) =>
              handleUpdateUser({
                ...currentUser,
                ...newStats,
              })
            }
          />
        )}

        {activeTab === 'profile' && (
          <ProfileScreen
            user={currentUser}
            onUpdateUser={handleUpdateUser}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onSelectAnimalAndLaunch={handleSelectAnimalAndLaunch}
            onOpenDetails={setDetailModalAnimal}
          />
        )}

        {activeTab === 'favorites' && (
          <FavoritesScreen
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onSelectAnimalAndLaunch={handleSelectAnimalAndLaunch}
            onOpenDetails={setDetailModalAnimal}
            onSelectTab={setActiveTab}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsScreen settings={settings} onUpdateSettings={setSettings} />
        )}

        {activeTab === 'ai' && (
          <AIAssistant
            selectedAnimal={selectedAnimal}
            onSelectAnimalAndLaunch={handleSelectAnimalAndLaunch}
          />
        )}
      </main>

      {/* Auth & Signup Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUpdateUser={handleUpdateUser}
      />

      {/* Floating AI Chat Button */}
      <AIChatButton
        onClick={() => setActiveTab('ai')}
        isChatActive={activeTab === 'ai'}
      />

      {/* Floating Material 3 / FlutterFlow Bottom Animated Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        favoritesCount={favorites.length}
      />

      {/* Animal Details Drawer / Modal */}
      <AnimalDetailsModal
        animal={detailModalAnimal}
        onClose={() => setDetailModalAnimal(null)}
        onSelectAnimalAndLaunch={handleSelectAnimalAndLaunch}
        isFavorite={detailModalAnimal ? favorites.includes(detailModalAnimal.id) : false}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Snapshot Modal */}
      <SnapshotModal
        isOpen={isSnapshotOpen}
        onClose={handleCloseSnapshot}
        dataUrl={snapshotDataUrl}
        animal={selectedAnimal}
      />
    </div>
  );
}

export default App;
