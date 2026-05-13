import { useEffect } from 'react';
import { AudioSettingsPanel } from './components/AudioSettingsPanel';
import { AudioFeedbackPanel } from './components/AudioFeedbackPanel';
import { Header } from './components/Header';
import { MetronomePanel } from './components/MetronomePanel';
import { Notice } from './components/Notice';
import { PracticeTextPanel } from './components/PracticeTextPanel';
import { RecorderPanel } from './components/RecorderPanel';
import { defaultPracticeText, practiceLibrary } from './i18n';
import { useInputBindingService } from './hooks/useInputBindingService';
import { useStoredSettings } from './hooks/useStoredSettings';
import type { Language, PracticeCategory } from './types';

export function App() {
  const { settings, setSettings } = useStoredSettings();

  const updateSetting = <Key extends keyof typeof settings>(key: Key, value: (typeof settings)[Key]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const inputBinding = useInputBindingService({
    enabled: settings.holdToDafEnabled,
    holdKeyCode: settings.holdKeyCode,
    onHoldKeyCodeChange: (code) => updateSetting('holdKeyCode', code),
  });

  const changeLanguage = (language: Language) => {
    setSettings((current) => ({
      ...current,
      language,
      practiceText: Object.values(practiceLibrary[current.language]).flat().includes(current.practiceText)
        ? practiceLibrary[language][current.practiceCategory][current.practiceTextIndex] ?? defaultPracticeText[language]
        : current.practiceText,
    }));
  };

  const selectPracticeText = (category: PracticeCategory, index: number) => {
    const texts = practiceLibrary[settings.language][category];
    const safeIndex = Math.max(0, Math.min(index, texts.length - 1));

    setSettings((current) => ({
      ...current,
      practiceCategory: category,
      practiceTextIndex: safeIndex,
      practiceText: texts[safeIndex],
    }));
  };

  const randomPracticeText = () => {
    const texts = practiceLibrary[settings.language][settings.practiceCategory];
    const nextIndex = Math.floor(Math.random() * texts.length);
    selectPracticeText(settings.practiceCategory, nextIndex);
  };

  const nextPracticeText = () => {
    const texts = practiceLibrary[settings.language][settings.practiceCategory];
    selectPracticeText(settings.practiceCategory, (settings.practiceTextIndex + 1) % texts.length);
  };

  useEffect(() => {
    document.documentElement.lang = settings.language;
  }, [settings.language]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#183a34_0,#071013_34%,#05090b_100%)] px-8 py-7">
      <div className="mx-auto grid max-w-7xl gap-6">
        <Header language={settings.language} onLanguageChange={changeLanguage} />
        <Notice language={settings.language} />

        <div className="grid grid-cols-[1.08fr_0.92fr] gap-6">
          <div className="grid gap-6">
            <AudioSettingsPanel
              language={settings.language}
              inputDeviceId={settings.inputDeviceId}
              outputDeviceId={settings.outputDeviceId}
              onInputDeviceChange={(value) => updateSetting('inputDeviceId', value)}
              onOutputDeviceChange={(value) => updateSetting('outputDeviceId', value)}
            />
            <AudioFeedbackPanel
              language={settings.language}
              inputDeviceId={settings.inputDeviceId}
              outputDeviceId={settings.outputDeviceId}
              delayMs={settings.delayMs}
              volume={settings.feedbackVolume}
              holdToDafEnabled={settings.holdToDafEnabled}
              holdKeyCode={settings.holdKeyCode}
              formattedHoldKey={inputBinding.formattedHoldKey}
              fadeMs={settings.fadeMs}
              isHoldKeyPressed={inputBinding.isHoldKeyPressed}
              isRecordingKey={inputBinding.isRecordingKey}
              hasCompetingKeyWarning={inputBinding.hasCompetingKeyWarning}
              isFootPedalFriendly={inputBinding.isFootPedalFriendly}
              isGlobalInputAvailable={inputBinding.isGlobalInputAvailable}
              isGlobalInputMapped={inputBinding.isGlobalInputMapped}
              onDelayChange={(value) => updateSetting('delayMs', value)}
              onVolumeChange={(value) => updateSetting('feedbackVolume', value)}
              onHoldToDafEnabledChange={(value) => updateSetting('holdToDafEnabled', value)}
              onFadeChange={(value) => updateSetting('fadeMs', value)}
              onHoldKeyChange={(value) => updateSetting('holdKeyCode', value)}
              onStartKeyRecording={inputBinding.startKeyRecording}
              onCancelKeyRecording={inputBinding.cancelKeyRecording}
            />
            <PracticeTextPanel
              language={settings.language}
              category={settings.practiceCategory}
              text={settings.practiceText}
              onCategoryChange={(value) => selectPracticeText(value, 0)}
              onTextChange={(value) => updateSetting('practiceText', value)}
              onRandomText={randomPracticeText}
              onNextText={nextPracticeText}
            />
          </div>

          <div className="grid content-start gap-6">
            <MetronomePanel
              language={settings.language}
              bpm={settings.bpm}
              tone={settings.metronomeTone}
              outputDeviceId={settings.outputDeviceId}
              onBpmChange={(value) => updateSetting('bpm', value)}
              onToneChange={(value) => updateSetting('metronomeTone', value)}
            />
            <RecorderPanel
              language={settings.language}
              inputDeviceId={settings.inputDeviceId}
              outputDeviceId={settings.outputDeviceId}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
