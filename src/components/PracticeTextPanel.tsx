import { Dices, RotateCcw, StepForward } from 'lucide-react';
import { Button } from './Button';
import { Panel } from './Panel';
import { categoryLabels, copy, defaultPracticeText, practiceCategories } from '../i18n';
import type { Language, PracticeCategory } from '../types';
import { SelectField } from './SelectField';

type PracticeTextPanelProps = {
  language: Language;
  category: PracticeCategory;
  text: string;
  onCategoryChange: (value: PracticeCategory) => void;
  onTextChange: (value: string) => void;
  onRandomText: () => void;
  onNextText: () => void;
};

export function PracticeTextPanel({
  language,
  category,
  text,
  onCategoryChange,
  onTextChange,
  onRandomText,
  onNextText,
}: PracticeTextPanelProps) {
  const t = copy[language];

  return (
    <Panel
      title={t.practiceText}
      action={
        <Button
          variant="ghost"
          icon={<RotateCcw size={16} aria-hidden />}
          onClick={() => onTextChange(defaultPracticeText[language])}
        >
          {t.resetText}
        </Button>
      }
    >
      <div className="mb-4 grid grid-cols-[1fr_auto_auto] items-end gap-3">
        <SelectField
          label={t.category}
          value={category}
          onChange={(event) => onCategoryChange(event.target.value as PracticeCategory)}
        >
          {practiceCategories.map((item) => (
            <option key={item} value={item}>
              {categoryLabels[language][item]}
            </option>
          ))}
        </SelectField>
        <Button variant="secondary" icon={<Dices size={16} aria-hidden />} onClick={onRandomText}>
          {t.randomText}
        </Button>
        <Button variant="secondary" icon={<StepForward size={16} aria-hidden />} onClick={onNextText}>
          {t.nextText}
        </Button>
      </div>
      <textarea
        className="min-h-72 w-full resize-y rounded-lg border border-white/10 bg-[#0b1418] p-5 text-lg font-semibold leading-9 text-ink outline-none transition placeholder:text-moss/60 focus:border-mint focus:ring-4 focus:ring-mint/20"
        placeholder={t.textPlaceholder}
        value={text}
        onChange={(event) => onTextChange(event.target.value)}
      />
    </Panel>
  );
}
