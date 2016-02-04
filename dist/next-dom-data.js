(function (nx, global) {

  var $ = nx.$;
  $.uuid = 0;
  var data = {}, dataAttr = $.fn.data, camelize = $.camelCase,
    exp = $.expando = 'Zepto' + (+new Date()), emptyArray = [];
  var overrideApi = ['remove', 'empty'];
  var undefined;

  // Get value from node:
  // 1. first try key as given,
  // 2. then try camelized key,
  // 3. fall back to reading "data-*" attribute.
  function getData(node, name) {
    var id = node[exp], store = id && data[id];
    if (name === undefined) return store || setData(node);
    else {
      if (store) {
        if (name in store) return store[name];
        var camelName = camelize(name);
        if (camelName in store) return store[camelName]
      }
      return dataAttr.call($(node), name);
    }
  }

  // Store value under camelized key on node
  function setData(node, name, value) {
    var id = node[exp] || (node[exp] = ++$.uuid),
      store = data[id] || (data[id] = attributeData(node));
    if (name !== undefined) store[camelize(name)] = value;
    return store
  }

  // Read all "data-*" attributes from a node
  function attributeData(node) {
    var store = {};
    nx.each(node.attributes || emptyArray, function (i, attr) {
      if (attr.name.indexOf('data-') == 0)
        store[camelize(attr.name.replace('data-', ''))] =
          nx.deserializeValue(attr.value)
    });
    return store
  }

  $.fn.data = function (name, value) {
    return value === undefined ?
      // set multiple values via object
      nx.isPlainObject(name) ?
        this.each(function (i, node) {
          nx.each(name, function (key, value) {
            setData(node, key, value)
          })
        }) :
        // get value from first element
        (0 in this ? getData(this[0], name) : undefined) :
      // set value on all elements
      this.each(function () {
        setData(this, name, value)
      })
  };

  $.fn.removeData = function (names) {
    if (typeof names == 'string') names = names.split(/\s+/);
    return this.each(function () {
      var id = this[exp], store = id && data[id];
      if (store) nx.each(names || store, function (key) {
        delete store[names ? camelize(this) : key];
      })
    })
  };

  // Generate extended `remove` and `empty` functions
  overrideApi.forEach(function (methodName) {
    var origFn = $.fn[methodName];
    $.fn[methodName] = function () {
      var elements = this.find('*');
      if (methodName === 'remove') elements = elements.add(this);
      elements.removeData();
      return origFn.call(this);
    }
  });

}(nx, nx.GLOBAL));
