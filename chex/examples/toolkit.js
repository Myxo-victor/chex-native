/**
 * venjs UI Toolkit
 * Path: examples/toolkit.js
 * Requires: examples/examples.css loaded by host HTML
 */

const ScrollView = (children = [], className = '') =>
  venjs.div(
    { className: `tk-scroll ${className}`.trim() },
    Array.isArray(children) ? children : [children]
  );

const NativeImage = (src, className = '') =>
  venjs.image({
    src,
    className: `tk-image ${className}`.trim()
  });

const InputField = ({ placeholder = '', value = '', onChange = () => {}, className = '' } = {}) =>
  venjs.input({
    placeholder,
    value,
    className: `tk-input ${className}`.trim(),
    onChange
  });

const Card = (children = [], className = '') =>
  venjs.div(
    { className: `tk-card ${className}`.trim() },
    Array.isArray(children) ? children : [children]
  );

const Spinner = (className = '') =>
  venjs.activityIndicator({ className: `tk-spinner ${className}`.trim() });

const SocialFeedApp = () => {
  const liked = venjs.state(false);
  const posts = [
    { id: 1, user: 'Myxo', text: 'venjs is taking over.' },
    { id: 2, user: 'VenJS_Bot', text: 'Brother framework connected.' },
    { id: 3, user: 'Dev_User', text: 'This is native rendering.' }
  ];

  return venjs.div({ className: 'tk-feed-page' }, [
    venjs.text({ textContent: 'venjs Social', className: 'tk-feed-title' }),
    ScrollView(
      posts.map((post) =>
        Card([
          venjs.text({ textContent: post.user, className: 'tk-user' }),
          venjs.text({ textContent: post.text, className: 'tk-post' })
        ])
      )
    ),
    venjs.button({
      textContent: liked.get() ? 'Liked (onclick)' : 'Like (onclick)',
      className: liked.get() ? 'tk-like-btn tk-like-btn-on' : 'tk-like-btn',
      onclick: () => liked.set((v) => !v)
    })
  ]);
};

const Toolkit = {
  ScrollView,
  NativeImage,
  InputField,
  Card,
  Spinner,
  SocialFeedApp
};