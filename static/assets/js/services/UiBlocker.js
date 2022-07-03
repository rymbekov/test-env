import Spinner from '../components/spinner';

class UiBlocker {
  spinner = null;

  block(title, { text, styleList = {}, classList = [] } = {}) {
    const parentEl = document.body;
    classList.push('blockUI');

    if (this.spinner) this.spinner.destroy();

    this.spinner = new Spinner({
      parentEl,
      title,
      text,
      classList,
      styleList,
    });

    return this.spinner;
  }

  unblock() {
    if (this.spinner) {
      this.spinner.destroy();
      this.spinner = null;
    }
  }
}
export default new UiBlocker();
