/**
 * venjs Example Gallery
 * Path: examples/app.js
 * Requires: examples/examples.css loaded by host HTML
 */

const counter = venjs.state(0);
const email = venjs.state('');
const password = venjs.state('');

const CounterExample = () =>
  venjs.div({ className: 'ex-block' }, [
    venjs.text({ textContent: 'Counter Example', className: 'ex-title' }),
    venjs.text({ textContent: `Count: ${counter.get()}`, className: 'ex-body' }),
    venjs.div({ className: 'ex-row' }, [
      venjs.button({
        textContent: 'Increment (onClick)',
        className: 'ex-btn-primary',
        onClick: () => counter.set((v) => v + 1)
      }),
      venjs.button({
        textContent: 'Increment (onclick)',
        className: 'ex-btn-alt',
        onclick: () => counter.set((v) => v + 1)
      })
    ])
  ]);

const ProfileCard = () =>
  venjs.div({ className: 'ex-block' }, [
    venjs.text({ textContent: 'Profile Card', className: 'ex-title' }),
    venjs.text({ textContent: 'Myxo Victor', className: 'ex-name' }),
    venjs.text({
      textContent: 'Founder of Aximon. Building native-first apps with venjsX.',
      className: 'ex-body'
    })
  ]);

const LoginExample = () =>
  venjs.div({ className: 'ex-block' }, [
    venjs.text({ textContent: 'Login Example', className: 'ex-title' }),
    venjs.input({
      placeholder: 'Email',
      value: email.get(),
      className: 'ex-input',
      onChange: (e) => email.set(e.value || '')
    }),
    venjs.input({
      placeholder: 'Password',
      value: password.get(),
      className: 'ex-input',
      onChange: (e) => password.set(e.value || '')
    }),
    venjs.button({
      textContent: 'Submit',
      className: 'ex-btn-primary',
      onClick: () => {
        console.log('Login payload', { email: email.get(), password: password.get() });
      }
    })
  ]);

const ExampleGalleryApp = () =>
  venjs.div({ className: 'ex-page' }, [CounterExample(), ProfileCard(), LoginExample()]);

venjs.mount(ExampleGalleryApp);

const Examples = {
  CounterExample,
  ProfileCard,
  LoginExample,
  ExampleGalleryApp
};