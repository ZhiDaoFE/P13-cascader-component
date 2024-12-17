const Cascader = ((document) => {
  const EXPAND_TRIGGER_TYPE = {
    HOVER: 'hover',
    CLICK: 'click'
  };
  
  function findDomByCls(root, dom, cls) {
    if (!dom) {
      return false;
    }

    while (dom !== root) {
      if (dom.classList.contains(cls)) {
        return dom;
      }

      dom = dom.parentNode;
    }

    return null;
  }

  const defaultCls = 'zd-cascader';
  const selectorCls = 'zd-cascader-selector';
  const selectorIconCls = 'zd-cascader-selector-icon';
  const selectorArrowCls = 'zd-cascader-selector-icon--arrow';
  const selectorClearCls = 'zd-cascader-selector-icon--clear';
  const displayItemCls = 'zd-cascader-display-item';
  const menuCls = 'zd-cascader-menu';
  const listCls = 'zd-cascader-list';
  const listItemCls = 'zd-cascader-list-item';
  const listItemLabelCls = 'zd-cascader-list-item-label';
  const listItemArrowCls = 'zd-cascader-list-item-arrow';
  const focusCls = 'z-focus';
  const hasCntCls = 'z-has-cnt';
  const DISPLAY_SEP = ' / ';

  function defaultDisplayRender(labels) {
    return labels.join(DISPLAY_SEP);
  }

  return class extends BaseComWithDom {
    // _options;
    // _onChange;
    // _valueMap;
    // _value;
    // _selectValue;
    // _selectorDom;
    // _displayItemDom;
    // _clearBtnDom;
    // _menuDom;
    // _dropdown;
    // _displayRender;
    // _expandTrigger;

    static EXPAND_TRIGGER_TYPE = EXPAND_TRIGGER_TYPE;

    constructor(props = {}) {
      super({...props, cls: props.cls ? `${props.cls} ${defaultCls}` : defaultCls});

      this.onClick = this.onClick.bind(this);
      this.onClear = this.onClear.bind(this);
      this.onMouseOver = this.onMouseOver.bind(this);

      this._build();
    }

    genValueMap() {
      this._valueMap = {};

      const inner = (options, values) => {
        options.map(({ value, label, children }) => {
          this._valueMap[value] = {
            label,
            valuePath: [...values, value],
            option: children,
          };
          if (children) {
            inner(children, this._valueMap[value].valuePath);
          }
        });
      }

      inner(this._options, []);
    }

    init(props = {}) {
      const { 
        options,
        onChange = () => {},
        displayRender = defaultDisplayRender,
        expandTrigger = EXPAND_TRIGGER_TYPE.CLICK,
      } = props;

      this._value = [];
      this._selectValue = [];
      this._onChange = onChange;
      this._displayRender = displayRender;
      this._expandTrigger = expandTrigger;
      // TODO: 应该要做参数校验
      this._options = options;
      this.genValueMap();
    }

    renderMenu() {
      const lists = [];
      let idx = 0;
      let listValue;
      let listOptions;

      do {
        listOptions = idx === 0 ? this._options : this._valueMap[listValue].option;
        listValue = this._selectValue[idx];
        if (!listOptions) {
          continue;
        }
        lists.push(`
          <ul class="${listCls}">
            ${listOptions.map(({ value, label, children }) => 
              `<li class="${listItemCls} ${value === listValue ? 'z-sel' : ''}" data-v="${value}">
                <span class="${listItemLabelCls}">${label}</span>
                ${!!children && children.length ? `<img class="${listItemArrowCls}" src="./assets/arrow-right.svg" />` : ''}
              </li>`
            ).join('')}
          </ul>
        `);
        idx++;
      } while (listValue);

      this._menuDom.innerHTML = lists.join('');

      return this;
    }

    _build() {
      this.getRoot().innerHTML = `
        <div>
          <span class="${displayItemCls}"></span>
          <img class="${selectorIconCls} ${selectorArrowCls}" src="./assets/arrow-down.png" />
          <span class="${selectorIconCls} ${selectorClearCls}"></span>
        </div>
      `;

      this._selectorDom = this.getRoot().children[0];
      this._displayItemDom = this.getRoot().querySelector(`.${displayItemCls}`);
      this._clearBtnDom = this.getRoot().querySelector(`.${selectorClearCls}`);
      this._menuDom = document.createElement('DIV');
      this._menuDom.classList.add(menuCls);
      this._dropdown = new Dropdown({
        root: this._selectorDom,
        cls: selectorCls,
        trigger: Dropdown.TRIGGER_TYPE.CLICK,
        menu: this._menuDom,
        onMenuOpen: () => {
          this._selectorDom.classList.add(focusCls);
        },
        onMenuClose: () => {
          this._selectorDom.classList.remove(focusCls);
          if (this._selectValue.join(DISPLAY_SEP) !== this._value.join(DISPLAY_SEP)) {
            this._selectValue = this._value;
            this.renderMenu();
          }
        },
      });

      this._menuDom.addEventListener('click', this.onClick);
      this._menuDom.addEventListener('mouseover', this.onMouseOver);
      this._clearBtnDom.addEventListener('click', this.onClear);

      this.renderMenu();
    }

    _setDispalyWord(valuePath) {
      const text = this._displayRender(this._value.map(v => this._valueMap[v].label));
      this._displayItemDom.innerText = text;

      if (this._value && this._value.length) {
        this._selectorDom.classList.add(hasCntCls);
      } else {
        this._selectorDom.classList.remove(hasCntCls);
      }

      return this;
    }

    onMouseOver(event) {
      event.stopPropagation();

      const { target } = event;
      const item = findDomByCls(this._menuDom, target, listItemCls);
      if (!item) {
        return
      }

      const value = item.dataset?.v;
      const { valuePath, option } = this._valueMap[value];

      if (!option || this._selectValue === valuePath) {
        return
      }

      this._selectValue = valuePath;
      this.renderMenu();
    }

    onClick(event) {
      event.stopPropagation();

      const { target } = event;
      const item = findDomByCls(this._menuDom, target, listItemCls);
      if (!item) {
        return
      }

      const value = item.dataset?.v;
      const { valuePath, option } = this._valueMap[value];

      if (this._expandTrigger === EXPAND_TRIGGER_TYPE.HOVER && option) {
        return
      }

      this._selectValue = valuePath;
      this.renderMenu();

      if (!option) {
        this._value = this._selectValue;
        this._setDispalyWord(this._value);
        this._dropdown.closeMenu();
        this._onChange(this._value);
      }
    }

    onClear(event) {
      event.stopPropagation();

      this._value = [];
      this._selectValue = [];
      this._dropdown.closeMenu();
      this._setDispalyWord().renderMenu();
      this._onChange(this._value);
    }

    destory() {
      this._menuDom.removeEventListener('click', this.onClick);
      this._dropdown.destory();
      this._dropdown = null;
      this.getRoot().innerHTML = '';
      this._selectorDom = this._displayItemDom = this._menuDom = null;

      return this;
    }
  }
})(document);