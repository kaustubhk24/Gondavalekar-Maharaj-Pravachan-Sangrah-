// @ts-check

const config = {
  title: 'प्रवचन संग्रह',
  tagline: 'दिनांक आणि भाषा नुसार प्रवचन मिळवा',
  favicon: 'img/favicon.ico',

  url: 'https://pravachane.sangrah.justinclicks.com',
  baseUrl: '/',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: false,
        blog: false,
        pages: {
          path: 'src/pages',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],

  plugins: [
    ...(process.env.NODE_ENV === 'production'
      ? [
          [
            '@docusaurus/plugin-pwa',
            {
              debug: false,
              offlineModeActivationStrategies: ['appInstalled', 'standalone'],
              swCustom: require.resolve('./src/sw.js'),
              pwaHead: [
                {
                  tagName: 'link',
                  rel: 'manifest',
                  href: '/manifest.json',
                },
                {
                  tagName: 'meta',
                  name: 'theme-color',
                  content: '#b43baf',
                },
                {
                  tagName: 'meta',
                  name: 'apple-mobile-web-app-capable',
                  content: 'yes',
                },
                {
                  tagName: 'meta',
                  name: 'apple-mobile-web-app-status-bar-style',
                  content: 'default',
                },
              ],
            },
          ],
        ]
      : []),
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'प्रवचन संग्रह',
      hideOnScroll: false,
    },
    footer: {
      style: 'dark',
      copyright: `© ${new Date().getFullYear()} प्रवचन संग्रह`,
    },
  },
};

module.exports = config;
