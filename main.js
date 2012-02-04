(function(){

  var cssOptions = {
    "Layout": {
      "Border": {
        "width": {
          "type": "number",
          "css": "border-right-width border-left-width border-top-width border-bottom-width",
        },
        "color": {
          "type": "color",
          "css": "border-color",
        },
        "style": {
          "type": "choice",
          "css": "border-style",
          "options": [
            "solid"
          ]
        }
      },
    }   
  };

  function NumberItem( name, item ){
    var _element = document.createElement( "div" ),
        _cssAttributes = item.css.split( " " ),
        _helpers = [],
        _target;

    _element.className = "item number-item";

    var nameElement = document.createElement( "span" );
    nameElement.className = "name";
    nameElement.innerHTML = name;
    _element.appendChild( nameElement );

    function Helper( attrib ){
      var _cssAttribute = attrib;

      var _helperElement = document.createElement( "input" );
      _helperElement.className = "helper";
      _helperElement.type = "text"
      _helperElement.innerHTML = "";
      _element.appendChild( _helperElement );

      _helperElement.addEventListener( "focusin", function( e ){
        _helperElement.setAttribute( "data-state", "focused" );
      }, false );

      _helperElement.addEventListener( "focusout", function( e ){
        _helperElement.removeAttribute( "data-state" );
        if( _target ){
          _target.style[ _cssAttribute ] = _helperElement.value + "px";
        } //if
      }, false );

      _helperElement.addEventListener( "keydown", function( e ){
        if( e.which === 13 ){
          _helperElement.blur();
        } //if
      }, false );

      this.set = function( style ){
        var value = style[ _cssAttribute ],
            safeVal = Number( value.replace( /px/g, "" ) );
        _helperElement.value = safeVal;
      }; //set
    } //Helper

    for( var i=0; i<_cssAttributes.length; ++i ){
      _helpers.push( new Helper( _cssAttributes[ i ] ) );
    } //for

    this.setTarget = function( target ){
      _target = target;
      var style = window.getComputedStyle( _target );
      for( var i=0; i<_cssAttributes.length; ++i ){
        _helpers[ i ].set( style );
      } //for
    }; //setTarget
    
    Object.defineProperties( this, {
      element: {
        get: function(){ return _element; }
      }
    });
  } //NumberItem

  function ColorItem( name, item ){
    var _element = document.createElement( "div" );
    _element.className = "item color-item";

    var nameElement = document.createElement( "span" );
    nameElement.className = "name";
    nameElement.innerHTML = name;
    _element.appendChild( nameElement );

    this.setTarget = function( target ){
    }; //setTarget

    Object.defineProperties( this, {
      element: {
        get: function(){ return _element; }
      }
    });
  } //ColorItem

  function ChoiceItem( name, item ){
    var _element = document.createElement( "div" );
    _element.className = "item choice-item";

    var nameElement = document.createElement( "span" );
    nameElement.className = "name";
    nameElement.innerHTML = name;
    _element.appendChild( nameElement );

    this.setTarget = function( target ){
    }; //setTarget

    Object.defineProperties( this, {
      element: {
        get: function(){ return _element; }
      }
    });
  } //ChoiceItem

  function Attribute( name, items ){
    var _element = document.createElement( "div" ),
        _items = [],
        _itemTypes = {
          number: NumberItem,
          color: ColorItem,
          choice: ChoiceItem
        };

    _element.className = "attribute";

    var nameElement = document.createElement( "span" );
    nameElement.className = "name";
    nameElement.innerHTML = name;
    _element.appendChild( nameElement );

    for( var iName in items ){
      var item = items[ iName ];
      if( item.type && _itemTypes[ item.type ] ){
        var newItem = new _itemTypes[ item.type ]( iName, item );
        _element.appendChild( newItem.element );
        _items.push( newItem );
      } //if
    } //for

    this.setTarget = function( target ){
      for( var i=0, l=_items.length; i<l; ++i ){
        _items[ i ].setTarget( target );
      } //for
    }; //setTarget

    Object.defineProperties( this, {
      element: {
        get: function(){ return _element; }
      }
    });
  } //Attribute

  function Category( name, attributes ){
    var _element = document.createElement( "div" ),
        _attributes = [];

    _element.className = "category";

    var nameElement = document.createElement( "span" );
    nameElement.className = "name";
    nameElement.innerHTML = name;
    _element.appendChild( nameElement );

    for( var aName in attributes ){
      var attribute = new Attribute( aName, attributes[ aName ] );
      _attributes.push( attribute );
      _element.appendChild( attribute.element );
    } //for items

    this.setTarget = function( target ){
      for( var i=0, l=_attributes.length; i<l; ++i ){
        _attributes[ i ].setTarget( target );
      } //for
    }; //setTarget

    Object.defineProperties( this, {
      element: {
        get: function(){ return _element; }
      }
    });
  } //Category

  function Tray( css ){
    var _categories = [],
        _element = document.createElement( "div" );

    _element.id = "css-analyzer-tray";

    document.body.appendChild( _element );

    var selectButton = document.createElement( "input" );   
    selectButton.type = "button";
    selectButton.value = "Select Item";
    _element.appendChild( selectButton );

    var _hoverElement = document.createElement( "div" );
    _hoverElement.className = "css-analyzer-hover-element";
    _hoverElement.id = "css-analyzer-hover-element";
    document.body.appendChild( _hoverElement );

    var _targetMode = false;

    function setupNode( node ){
      node.addEventListener( "mouseover", function( e ){
        if( _targetMode && e.currentTarget === e.target ){
          var pos = node.getBoundingClientRect();
          _hoverElement.style.display = "block";
          _hoverElement.style.left = pos.left + "px";
          _hoverElement.style.top = pos.top + "px";
          _hoverElement.style.width = pos.width + "px";
          _hoverElement.style.height = pos.height + "px";
        } //if
      }, false );
      node.addEventListener( "mouseout", function( e ){
        _hoverElement.style.display = "none";
      }, false );

      node.addEventListener( "click", function( e ){
        if( _targetMode ){
          _targetMode = false;
          setTarget( node );
        } //if
      }, false );
    } //Node

    function getElements( root ){
      for( var i=0; i<root.childNodes.length; ++i ){
        var node = root.childNodes[ i ];
        if( node === _element ){
          continue;
        } //if
        setupNode( node );
        getElements( node );
      } //for
    } //getElements

    function setTarget( target ){
      for( var i=0, l=_categories.length; i<l; ++i ){
        _categories[ i ].setTarget( target );
      } //for
    } //setTarget

    window.addEventListener( "keydown", function( e ){
      if( e.which === 27 ) {
        _targetMode = false;
        _hoverElement.style.display = "none";
      } //if
    }, false );

    selectButton.addEventListener( "click", function( e ){
      _targetMode = true;
    }, false );

    for( var cName in css ){
      var category = new Category( cName, css[ cName ] );
      _categories.push( category );
      _element.appendChild( category.element );
    } //for categories

    getElements( document.body );

  } //Tray

  document.addEventListener( "DOMContentLoaded", function( e ){
    var tray = new Tray( cssOptions );
  }, false );
})();
