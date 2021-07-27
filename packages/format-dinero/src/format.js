import { _isDefined } from '@soldi/core/index.mjs';

const isUndefined = (arg) => !_isDefined(arg);

export default function Format(format) {
  const matches = /^(?:(\$|USD)?0(?:(,)0)?(\.)?(0+)?|0(?:(,)0)?(\.)?(0+)?\s?(dollar)?)$/gm.exec(
    format
  );

  return {
    /**
     * Returns the matches.
     * @ignore
     *
     * @return {Array}
     */
    getMatches() {
      return matches !== null
        ? matches.slice(1).filter(match => !isUndefined(match))
        : [];
    },
    /**
     * Returns the amount of fraction digits to display.
     * @ignore
     *
     * @return {Number}
     */
    getMinimumFractionDigits() {
      const decimalPosition = match => match === '.';
      const matches = this.getMatches();
      return !isUndefined(matches.find(decimalPosition))
        ? matches[
          matches.findIndex(decimalPosition) + 1
        ].split('').length
        : 0;
    },
    /**
     * Returns the currency display mode.
     * @ignore
     *
     * @return {String}
     */
    getCurrencyDisplay() {
      const modes = {
        USD: 'code',
        dollar: 'name',
        $: 'symbol'
      };
      return modes[
        this.getMatches().find(match => {
          return match === 'USD' || match === 'dollar' || match === '$';
        })
      ];
    },
    /**
     * Returns the formatting style.
     * @ignore
     *
     * @return {String}
     */
    getStyle() {
      return !isUndefined(this.getCurrencyDisplay(this.getMatches()))
        ? 'currency'
        : 'decimal';
    },
    /**
     * Returns whether grouping should be used or not.
     * @ignore
     *
     * @return {Boolean}
     */
    getUseGrouping() {
      return !isUndefined(this.getMatches().find(match => match === ','));
    }
  };
}
