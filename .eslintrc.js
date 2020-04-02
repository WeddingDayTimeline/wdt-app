/**
 * Basic formatting settings for "onSave" purposes
 * You can find the config for "yarn run lint" at ~/lintFull.eslintrc.js
 * *** Fixable rules only!
 */
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: ['@nuxtjs'],
  plugins: ['vue'],
  rules: {
    'no-multi-spaces': [2, { ignoreEOLComments: true }],
    'array-bracket-spacing': 2,
    'block-spacing': 2,
    'brace-style': 2,
    'capitalized-comments': 2,
    'comma-spacing': 2,
    'comma-style': 2,
    'computed-property-spacing': 2,
    'eol-last': 2,
    indent: [2, 2],
    'key-spacing': 2,
    'keyword-spacing': 2,
    'lines-between-class-members': 2,
    'multiline-comment-style': 2,
    'new-parens': 2,
    'no-trailing-spaces': 2,
    'no-whitespace-before-property': 2,
    'space-before-function-paren': [2, 'never'],
    'object-curly-spacing': [2, 'always'],
    quotes: [
      2,
      'single',
      {
        avoidEscape: true,
        allowTemplateLiterals: true
      }
    ],
    'space-in-parens': 2,
    'space-infix-ops': 2,
    'space-unary-ops': 2,
    'spaced-comment': 2,
    'switch-colon-spacing': 2,
    'wrap-regex': 2,

    // ES6
    'arrow-body-style': 2,
    'arrow-spacing': 2,
    'no-confusing-arrow': 2,
    'rest-spread-spacing': 2,
    'template-curly-spacing': 2,

    // Vue Rules

    // Strongly Recommended (Improving Readability)
    'vue/attribute-hyphenation': [2, 'always'],
    'vue/html-closing-bracket-newline': 2,
    'vue/html-closing-bracket-spacing': 2,
    'vue/html-end-tags': 2,
    'vue/html-indent': 2,
    'vue/html-quotes': 2,
    'vue/html-self-closing': 2,
    'vue/max-attributes-per-line': 2,
    'vue/mustache-interpolation-spacing': 2,
    'vue/name-property-casing': 2,
    'vue/no-multi-spaces': 2,
    'vue/no-spaces-around-equal-signs-in-attribute': 2,
    'vue/singleline-html-element-content-newline': 2,
    'vue/v-bind-style': 2,
    'vue/v-on-style': 2,

    // Recommended (Minimizing Arbitrary Choices and Cognitive Overhead)
    'vue/attributes-order': [
      2,
      {
        order: [
          'DEFINITION',
          'LIST_RENDERING',
          'CONDITIONALS',
          'RENDER_MODIFIERS',
          'GLOBAL',
          'OTHER_ATTR',
          'TWO_WAY_BINDING',
          'OTHER_DIRECTIVES',
          'EVENTS',
          'UNIQUE',
          'CONTENT'
        ]
      }
    ],
    'vue/order-in-components': [
      2,
      {
        order: [
          'el',
          'name',
          'parent',
          'functional',
          ['delimiters', 'comments'],
          ['components', 'directives', 'filters'],
          'extends',
          'mixins',
          'inheritAttrs',
          'model',
          ['props', 'propsData'],
          'fetch',
          'asyncData',
          'data',
          'watch',
          'computed',
          'methods',
          'LIFECYCLE_HOOKS',
          'head',
          ['template', 'render'],
          'renderError'
        ]
      }
    ],

    // Uncategorized
    'vue/array-bracket-spacing': 2,
    'vue/arrow-spacing': 2,
    'vue/block-spacing': 2,
    'vue/comma-dangle': 2,
    'vue/component-name-in-template-casing': [2, 'kebab-case'],
    'vue/dot-location': [2, 'object'],
    'vue/key-spacing': 2,
    'vue/keyword-spacing': 2,
    'vue/object-curly-spacing': 2,
    'vue/padding-line-between-blocks': [2, 'always'],
    'vue/script-indent': 2,
    'vue/space-infix-ops': 2,
    'vue/space-unary-ops': 2,
    'vue/v-on-function-call': 2
  }
}
