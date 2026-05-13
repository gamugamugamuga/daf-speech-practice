import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type InputBindingOptions = {
  enabled: boolean;
  holdKeyCode: string;
  onHoldKeyCodeChange: (code: string) => void;
};

const editableTags = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return target.isContentEditable || editableTags.has(target.tagName);
};

export const formatKeyCode = (code: string) => {
  if (code === 'Space') {
    return 'Space';
  }

  if (/^Key[A-Z]$/.test(code)) {
    return code.replace('Key', '');
  }

  if (/^Digit[0-9]$/.test(code)) {
    return code.replace('Digit', '');
  }

  return code;
};

export const isCompetingKeyCode = (code: string) => code === 'Space' || /^Key[A-Z]$/.test(code);

export const isFootPedalFriendlyKeyCode = (code: string) => /^F(1[3-9]|2[0-4])$/.test(code);

export function useInputBindingService({ enabled, holdKeyCode, onHoldKeyCodeChange }: InputBindingOptions) {
  const [isFocusedHoldKeyPressed, setIsFocusedHoldKeyPressed] = useState(false);
  const [isGlobalHoldKeyPressed, setIsGlobalHoldKeyPressed] = useState(false);
  const [globalInputStatus, setGlobalInputStatus] = useState({
    available: Boolean(window.globalInput),
    mapped: true,
  });
  const [isRecordingKey, setIsRecordingKey] = useState(false);
  const recordingTokenRef = useRef(0);

  const startKeyRecording = useCallback(() => {
    const token = recordingTokenRef.current + 1;
    recordingTokenRef.current = token;
    setIsFocusedHoldKeyPressed(false);
    setIsGlobalHoldKeyPressed(false);
    setIsRecordingKey(true);

    void window.globalInput?.recordNextKey().then((code) => {
      if (recordingTokenRef.current !== token) {
        return;
      }

      if (code) {
        onHoldKeyCodeChange(code);
      }

      setIsRecordingKey(false);
    });
  }, [onHoldKeyCodeChange]);

  const cancelKeyRecording = useCallback(() => {
    recordingTokenRef.current += 1;
    window.globalInput?.cancelKeyRecord();
    setIsRecordingKey(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const code = event.code || event.key;

      if (isRecordingKey) {
        event.preventDefault();
        event.stopPropagation();

        if (code === 'Escape') {
          cancelKeyRecording();
          return;
        }

        window.globalInput?.cancelKeyRecord();
        onHoldKeyCodeChange(code);
        setIsRecordingKey(false);
        return;
      }

      if (!enabled || event.repeat || code !== holdKeyCode || isEditableTarget(event.target)) {
        return;
      }

      event.preventDefault();
      setIsFocusedHoldKeyPressed(true);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const code = event.code || event.key;

      if (!enabled || code !== holdKeyCode) {
        return;
      }

      event.preventDefault();
      setIsFocusedHoldKeyPressed(false);
    };

    const resetPressedState = () => setIsFocusedHoldKeyPressed(false);

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('blur', resetPressedState);
    document.addEventListener('visibilitychange', resetPressedState);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('blur', resetPressedState);
      document.removeEventListener('visibilitychange', resetPressedState);
    };
  }, [cancelKeyRecording, enabled, holdKeyCode, isRecordingKey, onHoldKeyCodeChange]);

  useEffect(() => {
    setIsFocusedHoldKeyPressed(false);
    setIsGlobalHoldKeyPressed(false);
    if (!window.globalInput) {
      setGlobalInputStatus({ available: false, mapped: false });
      return;
    }

    void window.globalInput.configureHold({ enabled, holdKeyCode }).then(setGlobalInputStatus);

    return () => {
      void window.globalInput?.configureHold({ enabled: false, holdKeyCode });
    };
  }, [enabled, holdKeyCode]);

  useEffect(() => {
    return window.globalInput?.onHoldState((state) => {
      if (state.code !== holdKeyCode) {
        return;
      }

      if (document.hasFocus() && isEditableTarget(document.activeElement)) {
        if (!state.pressed) {
          setIsGlobalHoldKeyPressed(false);
        }

        return;
      }

      setIsGlobalHoldKeyPressed(state.pressed);
    });
  }, [holdKeyCode]);

  const isHoldKeyPressed = enabled && (isFocusedHoldKeyPressed || isGlobalHoldKeyPressed);

  return useMemo(
    () => ({
      isHoldKeyPressed,
      isRecordingKey,
      startKeyRecording,
      cancelKeyRecording,
      formattedHoldKey: formatKeyCode(holdKeyCode),
      hasCompetingKeyWarning: isCompetingKeyCode(holdKeyCode),
      isFootPedalFriendly: isFootPedalFriendlyKeyCode(holdKeyCode),
      isGlobalInputAvailable: globalInputStatus.available,
      isGlobalInputMapped: globalInputStatus.mapped,
    }),
    [cancelKeyRecording, globalInputStatus.available, globalInputStatus.mapped, holdKeyCode, isHoldKeyPressed, isRecordingKey, startKeyRecording],
  );
}
