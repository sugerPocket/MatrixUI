/**
 *
 * @description markdown组件
 * @author 吴家荣 <jiarongwu.se@foxmail.com>
 *
 * @usage <mu-markdown ng-model='your scope property' content='your markdown content'></mu-markdown>
 * ng-model: 可以动态改变markdown文本
 * content: 静态内容，如果ng-model的值有效，则会显示ng-model的值得内容
 */

angular
  .module('matrixui.components.markdown', [])
  .directive('muMarkdown', muMarkdowndDirective);

muMarkdowndDirective.$inject = ['$parse'];

function muMarkdowndDirective($parse) {

  return {
    require: '?ngModel',
    restrict: 'E',
    template: `
      <div class='markdown-body'>
        <div ng-transclude></div>
      </div>
    `,
    transclude: true,
    scope: true,
    link: muMarkdownLink
  };

  /**
   *
   * @description muMarkdown指令的Link函数
   * @param {object} scope 指令的$scope对象
   * @param {object} element 指令对应的jqlite元素对象
   * @param {object} attrs 能拿到用户赋予指令的所有属性的值
   * @author 吴家荣 <jiarongwu.se@foxmail.com>
   */

  function muMarkdownLink(scope, element, attrs, ngModel) {

    /* 指令绑定的ng-model属性 */

    let modelName = attrs.ngModel;
    let getter = $parse(modelName);
    let setter = getter.assign;
    /* 提取要显示的content的值，ng-model的重要性高于content */

    let content = attrs.content;
    if (!content) {
      content = '';
    }
    if (ngModel) {
      if (getter(scope.$parent)) {
        content = getter(scope.$parent);
      } else {
        setter(scope.$parent, '');
      }
    }
    scope.content = content;

    /* 把渲染出来的html插入页面 */

    element
      .find('div')
      .html(markdownToHTML(scope.content));

    /* scope.name用来判断ng-model属性是否存在，如果ng-model属性存在，当ng-model属性改变的时候，动态渲染markdown文本 */

    if (modelName && ngModel) 
      configNgModelLink(scope, ngModel, modelName);
    
    function insertHTML(content) {
      element
        .find('div')
        .html(markdownToHTML(content));
    }

    /**
     * @description 配置ng-model的函数
     * @author 邓廷礼 <mymikotomisaka@gmail.com>
     * @param {object} scope
     * @param {object} ngModel 控制器
     * @param {string} modelName ng-model监视的字符串
     *
     */
    function configNgModelLink(scope, ngModel, modelName) {

      scope
        .$watch(modelName, function (newVal, oldVal) {
          setter(scope.$parent, newVal);
        });

      scope
        .$parent
        .$watch(modelName, function () {
          let content = getter(scope.$parent);

          if (!content) {
            content = scope.content;
          }

          /* 如果MathJax存在，则开始渲染，否则直到MathJax加载完毕才开始渲染 */

          function initMarkdown() {
            insertHTML(content);
            MathJax
              .Hub
              .Typeset(element[0]);
          }

          if (window.MathJax) {
            try {
              initMarkdown();
            } catch (e) {
              console.warn('markdown warn: 给定的数据暂时无法渲染，等待数据更新...');
            }
          } else {
            throw Error('MathJax没有加载');
          }
        });
    }
  }

  /**
   *
   * @description 将markdown文本渲染成html字符串
   * @param {string} content 需要渲染的markdown文本
   * @author 吴家荣 <jiarongwu.se@foxmail.com>
   *
   */

  function markdownToHTML(content) {
    if (window.marked) {
      if (hljs) {
        marked.setOptions({
          highlight: function (code) {
            return hljs
              .highlightAuto(code)
              .value;
          }
        });
      }
      return marked(content);
    } else {
      throw Error('marked is not defined');
    }
  }
};
