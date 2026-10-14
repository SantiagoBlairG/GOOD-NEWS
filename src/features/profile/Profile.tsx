import { useState } from 'react';
import { useNavigate } from 'react-router';
import { SlidersHorizontal, Smartphone, ArrowUpRight, Trash2 } from 'lucide-react';
import { useApp } from '../../state/provider';
import { topics } from '../../lib/schemas';
import type { Preferences } from '../../state/reducer';
import { Button } from '../../components/ui/button';
import { Modal } from '../../components/ui/dialog';
export function Profile() {
  const { state, dispatch, notify } = useApp();
  const [draft, setDraft] = useState(state.preferences.topics);
  const [confirm, setConfirm] = useState(false);
  const navigate = useNavigate();
  const change = (value: Partial<Preferences>) =>
    dispatch({ type: 'preferences', value: { ...state.preferences, ...value } });
  return (
    <section className="profile">
      <div className="profile-heading">
        <span className="profile-symbol">
          <SlidersHorizontal size={32} />
        </span>
        <h1>Make it your own.</h1>
        <p className="intro">A brighter perspective, at your pace.</p>
      </div>
      <div className="local-note">
        <Smartphone size={23} />
        <p>No account needed. Your saved stories and preferences stay on this device.</p>
      </div>
      <div className="settings-section">
        <h2>What lights you up?</h2>
        <p>
          Pick your interests to prioritize your next Home batch. Discover always includes every
          topic.
        </p>
        <div className="preferences-topics">
          {topics.map((t) => (
            <button
              key={t.id}
              className={'pill ' + (draft.includes(t.id) ? 'selected' : '')}
              aria-pressed={draft.includes(t.id)}
              onClick={() =>
                setDraft((previous) =>
                  previous.includes(t.id)
                    ? previous.filter((id) => id !== t.id)
                    : [...previous, t.id],
                )
              }
            >
              {t.name}
            </button>
          ))}
        </div>
        <Button
          onClick={() => {
            change({ topics: draft });
            dispatch({ type: 'batch', restart: true });
            notify('Your preferences are saved. A fresh batch is ready.');
            navigate('/');
          }}
        >
          Apply & start new batch <ArrowUpRight size={17} />
        </Button>
      </div>
      <div className="settings-section">
        <h2>Your comfort comes first.</h2>
        <div className="setting-row">
          <div>
            <label htmlFor="appearance">Appearance</label>
            <p>Choose a look that feels right.</p>
          </div>
          <select
            id="appearance"
            value={state.preferences.appearance}
            onChange={(e) => change({ appearance: e.target.value as Preferences['appearance'] })}
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <div className="setting-row">
          <div>
            <label htmlFor="motion">Reduce motion</label>
            <p>Gentler transitions. We also respect your device setting.</p>
          </div>
          <input
            id="motion"
            type="checkbox"
            role="switch"
            checked={state.preferences.reduceMotion}
            onChange={(e) => change({ reduceMotion: e.target.checked })}
          />
        </div>
        <div className="setting-row">
          <div>
            <strong>Content language</strong>
            <p>More languages may come later.</p>
          </div>
          <span className="language">English</span>
        </div>
      </div>
      <div className="settings-section">
        <h2>A fresh start</h2>
        <p>Clear your saved stories and preferences from this device.</p>
        <Button
          variant="secondary"
          onClick={(event) => {
            event.currentTarget.focus();
            setConfirm(true);
          }}
        >
          <Trash2 size={17} />
          Clear local data
        </Button>
      </div>
      <p className="profile-footnote">
        Bright Side · Fictional demo edition
        <br />
        Built for a little perspective, without the endless scroll.
      </p>
      <Modal
        open={confirm}
        onOpenChange={setConfirm}
        title="Clear your local data?"
        description="This will erase all saved stories, preferences, and deck progress on this device. This action cannot be undone."
      >
        <div className="dialog-actions">
          <Button variant="secondary" onClick={() => setConfirm(false)}>
            Keep my data
          </Button>
          <Button
            onClick={() => {
              dispatch({ type: 'reset' });
              setDraft([]);
              setConfirm(false);
              notify('Local data cleared. A fresh start is ready.');
            }}
          >
            Clear everything
          </Button>
        </div>
      </Modal>
    </section>
  );
}
