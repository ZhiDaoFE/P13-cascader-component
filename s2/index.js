document.addEventListener('DOMContentLoaded', () => {
  function displayWord(word) {
    alert(word);
  }

  function gotoService() {
    window.open('https://wx.zsxq.com/solution_list/8855184855241882');
  }

  const valueKeyMap = {
    shiming: 'shiming',
    yuanjing: 'yuanjing',
    cr: 'cr',
    plan: 'plan',
    jianli: 'jianli',
    mianshi: 'mianshi',
    what: 'what',
  }

  const handlerMap = {
    [valueKeyMap.shiming]: () => {
      displayWord('提升前端开发的职业天花板，延长前端开发的职业寿命');
    },
    [valueKeyMap.yuanjing]: () => {
      displayWord('打造万人共学前端圈子');
    },
    [valueKeyMap.cr]: gotoService,
    [valueKeyMap.plan]: gotoService,
    [valueKeyMap.jianli]: gotoService,
    [valueKeyMap.mianshi]: gotoService,
    [valueKeyMap.what]: () => {
      displayWord('学前端，来之道 —— 陪伴式自学前端圈子');
    },
  }

  const options = [
    {
      value: 'zhidaoFE',
      label: '之道前端',
      children: [
        {
          value: valueKeyMap.shiming,
          label: '使命',
        },
        {
          value: valueKeyMap.yuanjing,
          label: '愿景',
        },
        {
          value: 'fuwu',
          label: '服务',
          children: [
            {
              value: valueKeyMap.cr,
              label: '原创项目 Code Review',
            },
            {
              value: valueKeyMap.plan,
              label: '职业发展规划',
            },
            {
              value: valueKeyMap.jianli,
              label: '简历修改',
            },
            {
              value: valueKeyMap.mianshi,
              label: '模拟面试',
            },
          ]
        },
      ],
    },
    {
      value: valueKeyMap.what,
      label: '之道前端是什么',
    },
  ];

  const p1 = new Cascader({
    id: 'cascader1',
    options,
    onChange: (valuePath) => {
      const value = valuePath[valuePath.length - 1];

      if (value && handlerMap[value]) {
        handlerMap[value]();
      }
    }
  });

  const p2 = new Cascader({
    id: 'cascader2',
    options,
    expandTrigger: Cascader.EXPAND_TRIGGER_TYPE.HOVER,
    onChange: (valuePath) => {
      const value = valuePath[valuePath.length - 1];

      if (value && handlerMap[value]) {
        handlerMap[value]();
      }
    },
    displayRender: (labels) => {
      return labels.join(' -- ');
    }
  });
});
