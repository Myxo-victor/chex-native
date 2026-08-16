const notes = Chex.state([]);
const title = Chex.state('');
const body = Chex.state('');
const remindSeconds = Chex.state('10');
const saving = Chex.state(false);
const status = Chex.state('');
const attachLocation = Chex.state(false);
const backups = Chex.state([]);

const NOTES_FILE = 'notes.json';

const cx = (...parts) => parts.filter(Boolean).join(' ').trim();

const nowLabel = () => {
  try {
    return new Date().toLocaleString();
  } catch (_err) {
    return '';
  }
};

const parseNotes = (raw) => {
  try {
    const data = JSON.parse(String(raw || '[]'));
    return Array.isArray(data) ? data : [];
  } catch (_err) {
    return [];
  }
};

const sortNotes = (items) => (items || [])
  .slice()
  .sort((a, b) => {
    const ap = a && a.pinned ? 1 : 0;
    const bp = b && b.pinned ? 1 : 0;
    if (ap !== bp) return bp - ap;
    return Number((b && b.createdAt) || 0) - Number((a && a.createdAt) || 0);
  });

const loadNotes = async () => {
  try {
    const res = await Chex.readFile({ name: NOTES_FILE });
    notes.set(sortNotes(parseNotes(res && res.read)));
  } catch (_err) {
    try {
      await Chex.createFile({ name: NOTES_FILE, write: '[]' });
    } catch (_err2) {}
    notes.set([]);
  }
};

const persistNotes = async (next) => {
  saving.set(true);
  try {
    const normalized = sortNotes(next || []);
    notes.set(normalized);
    await Chex.writeFile({ name: NOTES_FILE, write: JSON.stringify(normalized) });
  } finally {
    saving.set(false);
  }
};

const refreshBackups = async () => {
  try {
    const { files } = await Chex.listFiles();
    const list = Array.isArray(files) ? files : [];
    backups.set(list.filter((name) => String(name || '').startsWith('backup-')).slice(0, 20));
  } catch (_err) {
    backups.set([]);
  }
};

const backupNow = async () => {
  const name = `backup-${Date.now()}.json`;
  try {
    await Chex.createFile({ name, write: JSON.stringify(notes.get() || []), overwrite: true });
    status.set(`Backup created: ${name}`);
  } catch (e) {
    status.set(`Backup error: ${e.message || e}`);
  } finally {
    await refreshBackups();
  }
};

const loadBackup = async (name) => {
  try {
    const res = await Chex.readFile({ name });
    const next = sortNotes(parseNotes(res && res.read));
    status.set(`Loaded: ${name}`);
    await persistNotes(next);
  } catch (e) {
    status.set(`Load error: ${e.message || e}`);
  }
};

const addNote = async (preset = {}) => {
  const t = String(preset.title ?? title.get() ?? '').trim();
  const b = String(preset.body ?? body.get() ?? '').trim();
  if (!t && !b) {
    status.set('Add a title or body.');
    return;
  }

  const createdAt = Date.now();
  const note = {
    id: String(createdAt),
    title: t || 'Untitled',
    body: b,
    pinned: false,
    createdAt,
    createdLabel: nowLabel()
  };

  const shouldAttach = Boolean(preset.attachLocation ?? attachLocation.get());
  if (shouldAttach) {
    try {
      status.set('Getting location...');
      const loc = await Chex.getLocation({ enableHighAccuracy: false, timeoutMs: 10000 });
      if (loc && typeof loc === 'object') {
        note.location = {
          latitude: Number(loc.latitude),
          longitude: Number(loc.longitude),
          accuracy: Number(loc.accuracy)
        };
      }
    } catch (_err) {}
  }

  const next = sortNotes([note, ...(notes.get() || [])]);
  title.set('');
  body.set('');
  status.set('Saved.');
  await persistNotes(next);
};

const addQuickNote = async () => addNote({
  title: 'Quick note',
  body: `Shaken at ${nowLabel()}`,
  attachLocation: false
});

const togglePinned = async (id) => {
  const next = sortNotes((notes.get() || []).map((n) => {
    if (!n || n.id !== id) return n;
    return { ...n, pinned: !n.pinned };
  }));
  await persistNotes(next);
  status.set('Updated.');
};

const removeNote = async (id) => {
  const next = (notes.get() || []).filter((n) => n && n.id !== id);
  status.set('Deleted.');
  await persistNotes(next);
};

const scheduleReminder = async (note) => {
  if (!Chex.notifications) {
    status.set('Notifications not available.');
    return;
  }

  const seconds = Math.max(1, Number(remindSeconds.get() || 10) || 10);
  try {
    await Chex.notifications.requestPermission();
    await Chex.notifications.scheduleLocal({
      id: `note-${note.id}`,
      title: note.title || 'Reminder',
      body: note.body || 'Open the app to view.',
      delayMs: seconds * 1000,
      data: { noteId: note.id }
    });
    status.set(`Reminder set for ${seconds}s.`);
  } catch (e) {
    status.set(`Reminder error: ${e.message || e}`);
  }
};

const exportToText = async () => {
  const items = notes.get() || [];
  const text = items
    .map((n) => {
      const header = `${n.pinned ? '[PINNED] ' : ''}${n.title || 'Untitled'} (${n.createdLabel || ''})`;
      const loc = n.location && Number.isFinite(n.location.latitude) && Number.isFinite(n.location.longitude)
        ? `Location: ${n.location.latitude}, ${n.location.longitude} (+/- ${n.location.accuracy || '?'}m)`
        : '';
      const bodyText = n.body ? String(n.body) : '';
      return [header, loc, bodyText].filter(Boolean).join('\n');
    })
    .join('\n\n---\n\n');

  try {
    await Chex.createFile({ name: 'vennotes-export.txt', write: text, overwrite: true });
    status.set('Exported: vennotes-export.txt');
  } catch (e) {
    status.set(`Export error: ${e.message || e}`);
  }
};

const Btn = (textContent, onClick, variant, extraClass) =>
  Chex.button({
    textContent,
    onClick,
    className: cx('btn', variant ? `btn--${variant}` : '', extraClass || '')
  });

const Pill = (label, active, onClick) =>
  Chex.div({ onClick, className: cx('pill', active ? 'pill--active' : '') }, [
    Chex.text({ textContent: label, className: cx('pillText', active ? 'pillText--active' : '') })
  ]);

const NoteCard = (n) =>
  Chex.div({ onDoubleTap: () => togglePinned(n.id), className: 'noteCard stretch' }, [
    Chex.div({ className: 'row row--tight' }, [
      Chex.text({ textContent: n.title || 'Untitled', className: 'noteTitle' }),
      n.pinned ? Chex.text({ textContent: 'PINNED', className: 'badge' }) : null
    ]),
    n.createdLabel ? Chex.text({ textContent: n.createdLabel, className: 'meta' }) : null,
    n.location && Number.isFinite(n.location.latitude) && Number.isFinite(n.location.longitude)
      ? Chex.text({ textContent: `Location: ${n.location.latitude}, ${n.location.longitude}`, className: 'meta' })
      : null,
    n.body ? Chex.text({ textContent: n.body, className: 'noteBody' }) : null,
    Chex.div({ className: 'row' }, [
      Btn('Remind', () => scheduleReminder(n), 'success', 'btn--inline'),
      Btn('Delete', () => removeNote(n.id), 'danger', 'btn--inline')
    ])
  ]);

const App = () => {
  const list = notes.get() || [];
  const backupList = backups.get() || [];

  return Chex.div({ className: 'screen stretch' }, [
    Chex.div({ className: 'header' }, [
      Chex.text({ textContent: 'VenNotes', className: 'title' }),
      Chex.text({
        textContent: saving.get()
          ? 'Saving...'
          : (status.get() || 'Shake to quick-add. Double-tap a note to pin/unpin.'),
        className: 'subtitle'
      })
    ]),

    Chex.div({ className: 'card stretch' }, [
      Chex.input({
        placeholder: 'Title',
        value: title.get(),
        className: 'field',
        onChange: (p) => title.set(p.value || '')
      }),
      Chex.input({
        placeholder: 'Write a note...',
        value: body.get(),
        className: 'field field--body',
        onChange: (p) => body.set(p.value || '')
      }),
      Chex.div({ className: 'row' }, [
        Pill('Attach location', Boolean(attachLocation.get()), () => attachLocation.set((v) => !v)),
        Btn('Add note', () => addNote(), 'primary', 'btn--inline')
      ])
    ]),

    Chex.div({ className: 'card stretch' }, [
      Chex.div({ className: 'row' }, [
        Chex.text({ textContent: 'Reminder (sec):', className: 'label' }),
        Chex.input({
          placeholder: '10',
          value: remindSeconds.get(),
          className: 'field field--small',
          onChange: (p) => remindSeconds.set(p.value || '')
        }),
        Btn('Reload', () => { loadNotes(); refreshBackups(); }, 'dark', 'btn--inline')
      ]),
      Chex.div({ className: 'row row--tight' }, [
        Btn('Backup', backupNow, 'purple', 'btn--inline'),
        Btn('Export', exportToText, 'teal', 'btn--inline')
      ])
    ]),

    Chex.text({
      textContent: list.length === 0 ? 'No notes yet.' : `Notes (${list.length})`,
      className: 'sectionLabel'
    }),

    ...(list.length === 0 ? [] : list.map(NoteCard)),

    Chex.div({ className: 'footer stretch' }, [
      Chex.text({ textContent: 'Backups', className: 'sectionLabel' }),
      ...(backupList.length === 0
        ? [Chex.text({ textContent: 'No backups yet.', className: 'muted' })]
        : backupList.map((name) =>
          Chex.div({ onClick: () => loadBackup(name), className: 'backupItem' }, [
            Chex.text({ textContent: name, className: 'backupText' })
          ])
        ))
    ])
  ]);
};

try {
  if (typeof window !== 'undefined') {
    if (window.__vennotes_stopShake && typeof window.__vennotes_stopShake === 'function') {
      window.__vennotes_stopShake();
    }
    window.__vennotes_stopShake = Chex.onShake(() => {
      addQuickNote().catch(() => {});
    });
  }
} catch (_err) {}

try {
  if (Chex.notifications) {
    if (typeof window !== 'undefined') {
      if (window.__vennotes_stopTap && typeof window.__vennotes_stopTap === 'function') {
        window.__vennotes_stopTap();
      }
      window.__vennotes_stopTap = Chex.notifications.onTap((n) => {
        const id = n && (n.noteId || (n.data && n.data.noteId));
        if (id) status.set(`Notification tapped for note ${id}`);
      });
    }
  }
} catch (_err) {}

loadNotes().then(refreshBackups).catch(() => {});
Chex.mount(App);
