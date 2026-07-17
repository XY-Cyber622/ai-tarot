import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, PageHeader, QuestionInput } from '@/components';
import { ROUTES } from '@/constants/routes';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useSession } from '@/hooks/useSession';
import { validateQuestion } from '@/utils/validate';
import styles from './Question.module.css';

const DRAFT_KEY = 'ai-tarot:question-draft';

export default function Question() {
  const navigate = useNavigate();
  const { setQuestion, question } = useSession();
  const [draft, setDraft] = useLocalStorage<string>(DRAFT_KEY, '');
  const [submitted, setSubmitted] = useState(false);

  // Prefer session value (entered earlier) over local draft
  const [value, setValue] = useState<string>(question || draft || '');

  const error = useMemo(() => {
    if (!submitted) return null;
    return validateQuestion(value);
  }, [value, submitted]);

  const trimmedLength = value.trim().length;
  const isValid = trimmedLength >= 2 && !validateQuestion(value);

  const handleSubmit = () => {
    setSubmitted(true);
    if (!isValid) return;
    setQuestion(value.trim());
    setDraft(''); // clear draft after committing to session
    navigate(ROUTES.SPREAD);
  };

  // Save draft on change (debounced via setTimeout, simple 1-shot)
  useEffect(() => {
    if (value === question) return; // already in session, no need to save
    setDraft(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <main className={styles.page}>
      <Container size="narrow" className={`${styles.container} fade-in-up`}>
        <PageHeader
          title="问一个问题"
          subtitle="用一句话描述你真正想知道的"
          onBack={() => navigate(ROUTES.LANDING)}
        />

        <div className={styles.body}>
          <p className={styles.guidance}>
            心中默念你的问题，让它清晰、具体。 <br />
            越是真诚，越接近答案。
          </p>
          <QuestionInput
            value={value}
            onChange={setValue}
            error={error}
            autoFocus
          />
        </div>

        <div className={styles.actions}>
          <Button
            variant="primary"
            size="large"
            fullWidth
            disabled={!isValid && submitted}
            onClick={handleSubmit}
          >
            下一步 · 选择牌阵
          </Button>
        </div>
      </Container>
    </main>
  );
}
