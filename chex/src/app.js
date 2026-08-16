const createStoragePlugin = require('../plugins/Chex-plugin-storage');
Chex.use(createStoragePlugin(), { fileName: 'app_storage.json' });

const App = () => Chex.div({ style: { padding: '16' } }, [
  Chex.text({ textContent: 'venjsX Tooling Demo' }),
  Chex.button({
    textContent: 'Create + read file',
    onClick: async () => {
      await Chex.createFile({ name: 'example.txt', write: 'Hello this is an example' });
      const { read } = await Chex.readFile({ name: 'example.txt' });
      alert(read);
    }
  }),
  Chex.button({
    textContent: 'Storage: increment counter',
    onClick: async () => {
      const current = await Chex.storage.get('counter', 0);
      const next = Number(current || 0) + 1;
      await Chex.storage.set('counter', next);
      alert(`counter=${next}`);
    }
  }),
  Chex.button({
    textContent: 'Get location',
    onClick: async () => {
      try {
        const loc = await Chex.getLocation({ enableHighAccuracy: true, timeoutMs: 15000 });
        alert(`lat=${loc.latitude}\nlon=${loc.longitude}\nacc=${loc.accuracy}`);
      } catch (e) {
        alert(`Location error: ${e.message}`);
      }
    }
  }),
  Chex.button({
    textContent: 'Double tap me',
    onDoubleTap: () => alert('Double tap!')
  }),
  Chex.text({ textContent: 'Shake the phone to trigger a handler (see console).' })
]);

Chex.onShake(() => {
  console.log('shake detected');
});

Chex.mount(App);
