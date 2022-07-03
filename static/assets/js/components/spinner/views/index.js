const template = `
  <div class="innerPicsioSpinner">
    <div class="spinner">
      <div></div>
      <span></span>
    </div>
    <span class="titleSpinner"></span>
    <span class="textSpinner"></span>
  </div>
`;

export default function initSpinner(options) {
  const Spinner = {
    defaultConfig: {
      title: null,
      text: null,
      classList: [],
      styleList: {},
      parentEl: document.body,
    },

    initialize(params) {
      this.defaultConfig = { ...this.defaultConfig, ...params };

      this.$el = document.createElement('div');
      this.$el.classList.add('picsioSpinner');
      this.$el.innerHTML = template;

      this.setTitle(this.defaultConfig.title);
      this.setText(this.defaultConfig.text);
      this.setClassList(this.defaultConfig.classList);
      this.setStyleList(this.defaultConfig.styleList);

      this.render();
      return this;
    },

    render() {
      this.defaultConfig.parentEl.appendChild(this.$el);
      return this;
    },

    /** Set spinner title
     * @param {string} value
     */
    setTitle(value) {
      if (!value) return;

      const $title = this.$el.querySelector('.titleSpinner');
      $title.classList.add('show');
      $title.innerHTML = value;
    },

    /** Set spinner text
     * @param {string} value
     */
    setText(value) {
      if (!value) return;

      const $text = this.$el.querySelector('.textSpinner');
      $text.classList.add('show');
      $text.innerHTML = value;
    },

    setClassList(valueArray) {
      if (!valueArray || !valueArray.length) return;

      this.$el.classList.add(...valueArray);
    },

    setStyleList(valueObj) {
      if (!valueObj) return;

      Object.keys(valueObj).forEach((key) => {
        this.$el.style[key] = valueObj[key];
      });
    },

    destroy() {
      if (this.$el.parentNode) {
        this.$el.parentNode.removeChild(this.$el);
      }
    },
  };

  return Spinner.initialize(options);
}
