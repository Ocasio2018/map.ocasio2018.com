"use strict";
//API :AIzaSyBujKTRw5uIXp_NHZgjYVDtBy1dbyNuGEM

var AutocompleteManager = function ($) {
  //Initialization...

  return function (target) {

    var API_KEY = "AIzaSyDC2NuGE75jrukj3dtGRJ2TEGDfKdeA18Q";
    var targetItem = typeof target == "string" ? document.querySelector(target) : target;
    var queryMgr = QueryManager();
    var geocoder = new google.maps.Geocoder();

    return {
      $target: $(targetItem),
      target: targetItem,
      initialize: function initialize() {
        $(targetItem).typeahead({
          hint: true,
          highlight: true,
          minLength: 4,
          classNames: {
            menu: 'tt-dropdown-menu'
          }
        }, {
          name: 'search-results',
          display: function display(item) {
            return item.formatted_address;
          },
          limit: 10,
          source: function source(q, sync, async) {
            geocoder.geocode({ address: q }, function (results, status) {
              async(results);
            });
          }
        }).on('typeahead:selected', function (obj, datum) {
          if (datum) {

            var geometry = datum.geometry;
            queryMgr.updateViewport(geometry.viewport);
            //  map.fitBounds(geometry.bounds? geometry.bounds : geometry.viewport);
          }
        });
      }
    };

    return {};
  };
}(jQuery);
"use strict";

var LanguageManager = function ($) {
  //keyValue

  //targets are the mappings for the language
  return function () {
    var language = void 0;
    var dictionary = {};
    var $targets = $("[data-lang-target][data-lang-key]");

    var updatePageLanguage = function updatePageLanguage() {

      var targetLanguage = dictionary.rows.filter(function (i) {
        return i.lang === language;
      })[0];

      $targets.each(function (index, item) {
        var targetAttribute = $(item).data('lang-target');
        var langTarget = $(item).data('lang-key');

        switch (targetAttribute) {
          case 'text':
            $(item).text(targetLanguage[langTarget]);
            break;
          case 'value':
            $(item).val(targetLanguage[langTarget]);
            break;
          default:
            $(item).attr(targetAttribute, targetLanguage[langTarget]);
            break;
        }
      });
    };

    return {
      language: language,
      targets: $targets,
      dictionary: dictionary,
      initialize: function initialize(lang) {

        $.ajax({
          // url: 'https://gsx2json.com/api?id=1O3eByjL1vlYf7Z7am-_htRTQi73PafqIfNBdLmXe8SM&sheet=1',
          url: '/data/lang.json',
          dataType: 'json',
          success: function success(data) {
            dictionary = data;
            language = lang;
            updatePageLanguage();
          }
        });
      },
      updateLanguage: function updateLanguage(lang) {

        language = lang;
        updatePageLanguage();
      }
    };
  };
}(jQuery);
"use strict";

/* This loads and manages the list! */

var ListManager = function ($) {
  return function () {
    var targetList = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "#events-list";

    var $target = typeof targetList === 'string' ? $(targetList) : targetList;

    var renderEvent = function renderEvent(item) {
      var gmtDate = new Date(item.start_datetime).toGMTString();
      var date = moment(new Date(gmtDate)).format(new Date(item.start_datetime).getHours() == 0 ? "dddd MMM DD" : "dddd MMM DD, h:mma");

      // console.log(date, new Date(item.start_datetime), new Date(item.start_datetime).toGMTString())
      var url = item.url.match(/^https{0,1}:/) ? item.url : "//" + item.url;

      return "\n      <li class='" + item.event_type + " event-obj within-bound' data-lat='" + item.lat + "' data-lng='" + item.lng + "'>\n        <div class=\"type-event type-action\">\n          <h2 class=\"event-title\"><a href=\"" + (url == '//' ? 'javascript: void(null)' : url) + "\" target='_blank'>" + item.title + "</a></h2>\n          <div class=\"event-date date\" style=\"display: " + (!item.start_datetime ? 'none' : 'block') + "\">" + date + "</div>\n          <div class=\"event-address address-area\">\n            <p>" + item.venue + "</p>\n          </div>\n          <div class=\"call-to-action\" style='display: " + (url == '//' ? 'none' : 'block') + "'>\n            <a href=\"" + (url == '//' ? 'javascript: void(null)' : url) + "\" target='_blank' class=\"btn btn-secondary rsvp\">RSVP</a>\n          </div>\n        </div>\n      </li>\n      ";
    };

    var renderGroup = function renderGroup(item) {
      var url = item.website.match(/^https{0,1}:/) ? item.website : "//" + item.website;
      return "\n      <li class='" + item.event_type + " group-obj' data-lat='" + item.lat + "' data-lng='" + item.lng + "'>\n        <div class=\"type-group group-obj\">\n          <ul class=\"event-types-list\">\n            <li class=\"tag tag-" + item.supergroup + "\">" + item.supergroup + "</li>\n          </ul>\n          <h2><a href=\"" + url + "\" target='_blank'>" + item.name + "</a></h2>\n          <div class=\"group-details-area\">\n            <div class=\"group-location location\">" + item.location + "</div>\n            <div class=\"group-description\">\n              <p>" + item.description + "</p>\n            </div>\n          </div>\n          <div class=\"call-to-action\">\n            <a href=\"" + url + "\" target='_blank' class=\"btn btn-secondary\">Get Involved</a>\n          </div>\n        </div>\n      </li>\n      ";
    };

    return {
      $list: $target,
      updateFilter: function updateFilter(p) {
        if (!p) return;

        // Remove Filters

        $target.removeProp("class");
        $target.addClass(p.filter ? p.filter.join(" ") : '');
      },
      updateBounds: function updateBounds(bound1, bound2) {

        // const bounds = [p.bounds1, p.bounds2];


        $target.find('ul li.event-obj, ul li.group-obj').each(function (ind, item) {

          var _lat = $(item).data('lat'),
              _lng = $(item).data('lng');

          // console.log("updateBounds", item)
          if (bound1[0] <= _lat && bound2[0] >= _lat && bound1[1] <= _lng && bound2[1] >= _lng) {
            // console.log("Adding bounds");
            $(item).addClass('within-bound');
          } else {
            $(item).removeClass('within-bound');
          }
        });
        // $(item).addClass('within-bound');

        // Orders the set to nearest
        // let latCenter = (bound1[0] + bound2[0]) / 2,
        //     lngCenter = (bound1[1] + bound2[1]) / 2;
        // const sortList = (a, b) => {
        //   let _latA = $(a).data('lat'),
        //       _latB = $(b).data('lat'),
        //       _lngA = $(a).data('lng'),
        //       _lngB = $(b).data('lng');
        //
        //   let distA = Math.sqrt(Math.pow(latCenter - _latA, 2) + Math.pow(lngCenter - _lngA, 2)),
        //       distB = Math.sqrt(Math.pow(latCenter - _latB, 2) + Math.pow(lngCenter - _lngB, 2));
        //
        //   $(a).attr('data-distance', distA);
        //
        //   return distA - distB;
        // };
        //
        // $target.find('ul li.event-obj, ul li.group-obj')
        //     .sort(sortList)
        //     .appendTo($target.find('ul'));
      },
      populateList: function populateList(hardFilters, targetData) {
        //using window.EVENT_DATA
        var keySet = !hardFilters.key ? [] : hardFilters.key.split(',');

        // console.log(targetData);

        var $eventList = targetData.map(function (item) {
          if (keySet.length == 0) {
            return item.event_type && item.event_type.toLowerCase() == 'group' ? renderGroup(item) : renderEvent(item);
          } else if (keySet.length > 0 && item.event_type != 'group' && keySet.includes(item.event_type)) {
            return renderEvent(item);
          } else if (keySet.length > 0 && item.event_type == 'group' && keySet.includes(item.supergroup)) {
            return renderGroup(item);
          }

          return null;
        });
        $target.find('ul li').remove();
        $target.find('ul').append($eventList);

        $target.find('ul li');
      }
    };
  };
}(jQuery);
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var MapManager = function ($) {
  var LANGUAGE = 'en';
  var mapMarker;
  var wmIcon = L.icon({
    iconUrl: '/img/ocasio-marker.png',
    iconSize: [30, 41],
    iconAnchor: [15, 41],
    popupAnchor: [-3, -76],
    shadowUrl: '/img/ocasio-marker-shadow.png',
    shadowSize: [43, 19],
    shadowAnchor: [15, 19]
  });

  var renderEvent = function renderEvent(item) {
    var gmtDate = new Date(item.start_datetime).toGMTString();
    var date = moment(new Date(gmtDate)).format(new Date(item.start_datetime).getHours() == 0 ? "dddd MMM DD" : "dddd MMM DD, h:mma");

    var url = item.url.match(/^https{0,1}:/) ? item.url : "//" + item.url;

    return '\n    <div class=\'popup-item ' + item.event_type + '\' data-lat=\'' + item.lat + '\' data-lng=\'' + item.lng + '\'>\n      <div class="type-event type-action">\n        <h2 class="event-title"><a href="' + (url == '//' ? 'javascript: void(null)' : url) + '" target=\'_blank\'>' + item.title + '</a></h2>\n        <div class="event-date date" style="display: ' + (!item.start_datetime ? 'none' : 'block') + '">' + date + '</div>\n        <div class="event-address address-area">\n          <p>' + item.venue + '</p>\n        </div>\n        <div class="call-to-action" style=\'display: ' + (url == '//' ? 'none' : 'block') + '\'>\n          <a href="' + url + '" target=\'_blank\' class="btn btn-secondary rsvp">RSVP</a>\n        </div>\n      </div>\n    </div>\n    ';
  };

  var renderGroup = function renderGroup(item) {

    var url = item.website.match(/^https{0,1}:/) ? item.website : "//" + item.website;
    return '\n    <li>\n      <div class="type-group group-obj">\n        <ul class="event-types-list">\n          <li class="tag tag-' + item.supergroup + '">' + item.supergroup + '</li>\n        </ul>\n        <h2><a href="' + url + '" target=\'_blank\'>' + item.name + '</a></h2>\n        <div class="group-details-area">\n          <div class="group-location location">' + item.address + '</div>\n          <div class="group-description">\n            <p>' + item.description + '</p>\n          </div>\n        </div>\n        <div class="call-to-action">\n          <a href="' + url + '" target=\'_blank\' class="btn btn-secondary">Get Involved</a>\n        </div>\n      </div>\n    </li>\n    ';
  };

  var renderGeojson = function renderGeojson(list) {
    // console.log(list)
    // Get all unique Lat-long

    var dictLatLng = {};

    list.forEach(function (item) {
      if (!item.lat || !item.lng || item.lat == "" || item.lng == "") {
        return null;
      }

      if (!dictLatLng[item.lat + ',' + item.lng]) {
        dictLatLng[item.lat + ',' + item.lng] = [item];
      } else {
        dictLatLng[item.lat + ',' + item.lng].push(item);
      }
    });

    // Parse groups items
    var mapItems = [];
    Object.keys(dictLatLng).forEach(function (key) {
      var _key$split = key.split(','),
          _key$split2 = _slicedToArray(_key$split, 2),
          lat = _key$split2[0],
          lng = _key$split2[1];

      mapItems.push({
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        events: dictLatLng[key]
      });
    });

    // console.log(mapItems);

    return mapItems.map(function (item) {
      // rendered eventType
      var rendered = void 0;

      // console.log(item.events.length)
      if (item.events.length == 1) {
        rendered = renderEvent(item.events[0]);
      } else {
        rendered = '<div class=\'multiple-items\'><ul>' + item.events.map(function (i) {
          return '<li>' + renderEvent(i) + '</li>';
        }).join('') + '</ul></div>';
      }

      // console.log(rendered, item.events.length)

      return {
        "type": "Feature",
        geometry: {
          type: "Point",
          coordinates: [item.lng, item.lat]
        },
        properties: {
          eventProperties: item,
          popupContent: rendered,
          popupClassName: item.events.length > 1 ? 'popup-multiple-item' : 'popup-single-item'
        }
      };
    });
  };

  return function (options) {
    var map = null;

    if (!L.Browser.mobile) {
      map = L.map('map', { dragging: !L.Browser.mobile }).setView(window.CUSTOM_COORD || [38.4114271, -97.6411044], window.CUSTOM_ZOOM || 4);
      // map.scrollWheelZoom.disable();
    } else {
      map = L.map('map', { dragging: !L.Browser.mobile }).setView(window.CUSTOM_COORD || [38.4114271, -97.6411044], 3);
    }

    LANGUAGE = options.lang || 'en';

    if (options.onMove) {
      map.on('dragend', function (event) {

        var sw = [map.getBounds()._southWest.lat, map.getBounds()._southWest.lng];
        var ne = [map.getBounds()._northEast.lat, map.getBounds()._northEast.lng];
        options.onMove(sw, ne);
      }).on('zoomend', function (event) {

        https: //docs.google.com/document/d/1KWkLNNeIOeFEiVWMNwoYKu1yAZRUDf78xIbI1ie7Dvs/edit?usp=sharing
        var sw = [map.getBounds()._southWest.lat, map.getBounds()._southWest.lng];
        var ne = [map.getBounds()._northEast.lat, map.getBounds()._northEast.lng];
        options.onMove(sw, ne);
      });
    }

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
      maxZoom: 16 }).addTo(map);

    var geocoder = null;
    return {
      $map: map,
      initialize: function initialize(callback) {
        geocoder = new google.maps.Geocoder();
        if (callback && typeof callback === 'function') {
          callback();
        }
      },
      getMap: function getMap() {
        return map;
      },
      setBounds: function setBounds(bounds1, bounds2) {
        var bounds = [bounds1, bounds2];
        map.fitBounds(bounds);
      },
      setCenter: function setCenter(center) {
        var zoom = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;

        if (!center || !center[0] || center[0] == "" || !center[1] || center[1] == "") return;
        map.setView(center, zoom);
      },
      getBounds: function getBounds() {

        var sw = [map.getBounds()._southWest.lat, map.getBounds()._southWest.lng];
        var ne = [map.getBounds()._northEast.lat, map.getBounds()._northEast.lng];

        return [sw, ne];
      },
      // Center location by geocoded
      getCenterByLocation: function getCenterByLocation(location, callback) {

        geocoder.geocode({ address: location }, function (results, status) {

          if (callback && typeof callback === 'function') {
            callback(results[0]);
          }
        });
      },
      showMapMarker: function showMapMarker(lat, lng) {

        //console.log(mapMarker);
        if (mapMarker !== undefined) {
          map.removeLayer(mapMarker);
        }

        if (lat && lng) {
          mapMarker = new L.Marker([lat, lng], {
            icon: wmIcon
          }).addTo(map);
        }
      },
      refreshMap: function refreshMap() {
        map.invalidateSize(false);
        // map._onResize();

        // console.log("map is resized")
      },
      filterMap: function filterMap(filters) {

        $("#map").find(".event-item-popup").hide();

        if (!filters) return;

        filters.forEach(function (item) {

          $("#map").find(".event-item-popup." + item.toLowerCase()).show();
        });
      },
      plotPoints: function plotPoints(list, hardFilters) {
        // console.log(list)
        var keySet = !hardFilters.key ? [] : hardFilters.key.split(',');

        if (keySet.length > 0) {
          list = list.filter(function (item) {
            return keySet.includes(item.event_type);
          });
        }

        var geojson = {
          type: "FeatureCollection",
          features: renderGeojson(list)
        };

        L.geoJSON(geojson, {
          pointToLayer: function pointToLayer(feature, latlng) {
            var eventType = feature.properties.eventProperties.event_type;
            var geojsonMarkerOptions = {
              radius: 6,
              fillColor: eventType && eventType.toLowerCase() === 'group' ? "#3c2e81" : "#3c2e81",
              color: "white",
              weight: 4,
              opacity: 0.5,
              fillOpacity: 0.8
            };
            return L.circleMarker(latlng, geojsonMarkerOptions);
          },

          onEachFeature: function onEachFeature(feature, layer) {
            if (feature.properties && feature.properties.popupContent) {
              layer.bindPopup(feature.properties.popupContent, {
                className: feature.properties.popupClassName
              });
            }
          }
        }).addTo(map);
      },
      update: function update(p) {
        if (!p || !p.lat || !p.lng) return;

        map.setView(L.latLng(p.lat, p.lng), 10);
      }
    };
  };
}(jQuery);
'use strict';

var QueryManager = function ($) {
  return function () {
    var targetForm = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "form#filters-form";

    var $target = typeof targetForm === 'string' ? $(targetForm) : targetForm;
    var lat = null;
    var lng = null;

    var previous = {};

    $target.on('submit', function (e) {
      e.preventDefault();
      lat = $target.find("input[name=lat]").val();
      lng = $target.find("input[name=lng]").val();

      var form = $.deparam($target.serialize());

      window.location.hash = $.param(form);
    });

    $(document).on('change', '.filter-item input[type=checkbox]', function () {
      $target.trigger('submit');
    });

    return {
      initialize: function initialize(callback) {
        if (window.location.hash.length > 0) {
          var params = $.deparam(window.location.hash.substring(1));
          $target.find("input[name=lang]").val(params.lang);
          $target.find("input[name=lat]").val(params.lat);
          $target.find("input[name=lng]").val(params.lng);
          $target.find("input[name=bound1]").val(params.bound1);
          $target.find("input[name=bound2]").val(params.bound2);
          $target.find("input[name=loc]").val(params.loc);
          $target.find("input[name=key]").val(params.key);

          if (params.filter) {
            $target.find(".filter-item input[type=checkbox]").removeProp("checked");
            params.filter.forEach(function (item) {
              $target.find(".filter-item input[type=checkbox][value='" + item + "']").prop("checked", true);
            });
          }
        }

        if (callback && typeof callback === 'function') {
          callback();
        }
      },
      getParameters: function getParameters() {
        var parameters = $.deparam($target.serialize());
        // parameters['location'] ;

        for (var key in parameters) {
          if (!parameters[key] || parameters[key] == "") {
            delete parameters[key];
          }
        }

        return parameters;
      },
      updateLocation: function updateLocation(lat, lng) {
        $target.find("input[name=lat]").val(lat);
        $target.find("input[name=lng]").val(lng);
        // $target.trigger('submit');
      },
      updateViewport: function updateViewport(viewport) {

        var bounds = [[viewport.f.b, viewport.b.b], [viewport.f.f, viewport.b.f]];

        $target.find("input[name=bound1]").val(JSON.stringify(bounds[0]));
        $target.find("input[name=bound2]").val(JSON.stringify(bounds[1]));
        $target.trigger('submit');
      },
      updateViewportByBound: function updateViewportByBound(sw, ne) {

        var bounds = [sw, ne]; ////////


        $target.find("input[name=bound1]").val(JSON.stringify(bounds[0]));
        $target.find("input[name=bound2]").val(JSON.stringify(bounds[1]));
        $target.trigger('submit');
      },
      triggerSubmit: function triggerSubmit() {
        $target.trigger('submit');
      }
    };
  };
}(jQuery);
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var autocompleteManager = void 0;
var mapManager = void 0;

(function ($) {

  // 1. google maps geocode

  // 2. focus map on geocode (via lat/lng)
  var queryManager = QueryManager();
  queryManager.initialize();

  var initParams = queryManager.getParameters();
  mapManager = MapManager({
    onMove: function onMove(sw, ne) {
      // When the map moves around, we update the list
      queryManager.updateViewportByBound(sw, ne);
      //update Query
    }
  });

  window.initializeAutocompleteCallback = function () {

    autocompleteManager = AutocompleteManager("input[name='loc']");
    autocompleteManager.initialize();

    if (initParams.loc && initParams.loc !== '' && !initParams.bound1 && !initParams.bound2) {
      mapManager.initialize(function () {
        mapManager.getCenterByLocation(initParams.loc, function (result) {
          queryManager.updateViewport(result.geometry.viewport);
        });
      });
    }
  };

  var languageManager = LanguageManager();

  languageManager.initialize(initParams['lang'] || 'en');

  var listManager = ListManager();

  if (initParams.lat && initParams.lng) {
    mapManager.setCenter([initParams.lat, initParams.lng]);
  }

  /***
  * List Events
  * This will trigger the list update method
  */
  $(document).on('trigger-list-update', function (event, options) {
    listManager.populateList(options.params, options.data);
  });

  $(document).on('trigger-list-filter-update', function (event, options) {
    listManager.updateFilter(options);
  });

  $(document).on('trigger-list-filter-by-bound', function (event, options) {
    var bound1 = void 0,
        bound2 = void 0;

    if (!options || !options.bound1 || !options.bound2) {
      var _mapManager$getBounds = mapManager.getBounds();

      var _mapManager$getBounds2 = _slicedToArray(_mapManager$getBounds, 2);

      bound1 = _mapManager$getBounds2[0];
      bound2 = _mapManager$getBounds2[1];
    } else {
      bound1 = JSON.parse(options.bound1);
      bound2 = JSON.parse(options.bound2);
    }

    listManager.updateBounds(bound1, bound2);
  });

  /***
  * Map Events
  */
  $(document).on('trigger-map-update', function (event, options) {
    // mapManager.setCenter([options.lat, options.lng]);
    if (!options || !options.bound1 || !options.bound2) {
      return;
    }

    var bound1 = JSON.parse(options.bound1);
    var bound2 = JSON.parse(options.bound2);
    mapManager.setBounds(bound1, bound2);
    // console.log(options)
  });
  // 3. markers on map
  $(document).on('trigger-map-plot', function (e, opt) {

    mapManager.plotPoints(opt.data, opt.params);
    $(document).trigger('trigger-map-filter');
  });

  // Filter map
  $(document).on('trigger-map-filter', function (e, opt) {
    if (opt) {
      mapManager.filterMap(opt.filter);
    }
  });

  $(document).on('trigger-language-update', function (e, opt) {
    if (opt) {
      languageManager.updateLanguage(opt.lang);
    }
  });

  $(document).on('click', 'button#show-hide-map', function (e, opt) {
    $('body').toggleClass('map-view');
  });

  $(document).on('click', 'button#show-map', function (e, opt) {
    $('body').addClass('map-view');

    setTimeout(function () {
      mapManager.refreshMap();
    }, 10);
  });

  $(document).on('click', 'button#show-list', function (e, opt) {
    $('body').removeClass('map-view');
  });

  $(document).on('click', 'button.btn.more-items', function (e, opt) {
    $('#embed-area').toggleClass('open');
  });

  // Shows pointers within map
  $(document).on('trigger-show-marker', function (e, opt) {
    var lat = opt.lat,
        lng = opt.lng,
        className = opt.lat + '--' + opt.lng;
    mapManager.showMapMarker(lat, lng, className);
  });

  //Add event to listManager
  $(document).on('mouseenter', 'div#events-list ul li.event-obj', function (e) {
    mapManager.showMapMarker($(e.currentTarget).data('lat'), $(e.currentTarget).data('lng'));
  });

  $(document).on('mouseenter', 'section#map', function (e) {
    mapManager.showMapMarker();
  });

  // $(document).on('trigger-update-embed', (e, opt) => {
  //   //update embed line
  //   var copy = JSON.parse(JSON.stringify(opt));
  //   delete copy['lng'];
  //   delete copy['lat'];
  //   delete copy['bound1'];
  //   delete copy['bound2'];
  //
  //   $('#embed-area input[name=embed]').val('#' + $.param(copy));
  // });

  $(window).on("resize", function (e) {
    mapManager.refreshMap();
  });

  $(window).on("hashchange", function (event) {
    var hash = window.location.hash;
    if (hash.length == 0) return;
    var parameters = $.deparam(hash.substring(1));
    var oldURL = event.originalEvent.oldURL;

    var oldHash = $.deparam(oldURL.substring(oldURL.search("#") + 1));

    $(document).trigger('trigger-list-filter-update', parameters);
    $(document).trigger('trigger-map-filter', parameters);
    // $(document).trigger('trigger-update-embed', parameters);

    // So that change in filters will not update this
    if (oldHash.bound1 !== parameters.bound1 || oldHash.bound2 !== parameters.bound2) {

      $(document).trigger('trigger-map-update', parameters);
      $(document).trigger('trigger-list-filter-by-bound', parameters);
    }

    // Change items
    if (oldHash.lang !== parameters.lang) {
      $(document).trigger('trigger-language-update', parameters);
    }
  });

  // 4. filter out items in activity-area

  // 5. get map elements

  // 6. get Group data

  // 7. present group elements

  $.ajax({
    url: 'https://ocasio2018.com/api/events?candidate=alexandria-ocasio-cortez', //'|**DATA_SOURCE**|',
    dataType: 'json',
    success: function success(data) {
      // console.log(data);
      var parameters = queryManager.getParameters();
      var targetData = data.map(function (item) {
        return {
          lat: item.location.location.latitude,
          event_type: item.type,
          supergroup: "Ocasio for US Congress",
          start_datetime: item.start_date,
          tz: "EST",
          venue: '<strong>' + item.location.venue + '. </strong>' + [item.location.address_lines.join(), item.location.locality, item.location.region, item.location.postal_code].join(" "),
          lng: item.location.location.longitude,
          url: item.browser_url,
          title: item.title,
          group: null
        };
      });

      // $('#events-count').text(`${window.EVENTS_DATA.length} Walkouts and Counting`).css('opacity', 1);

      targetData.sort(function (a, b) {
        return new Date(a.start_datetime) - new Date(b.start_datetime);
      });
      targetData.forEach(function (item) {
        item['event_type'] = 'Action';
      });

      $(document).trigger('trigger-list-update', { params: parameters, data: targetData });
      // $(document).trigger('trigger-list-filter-update', parameters);
      $(document).trigger('trigger-map-plot', { data: targetData, params: parameters });
      // $(document).trigger('trigger-update-embed', parameters);
      //TODO: Make the geojson conversion happen on the backend

      //Refresh things
      setTimeout(function () {
        var p = queryManager.getParameters();
        $(document).trigger('trigger-map-update', p);
        $(document).trigger('trigger-map-filter', p);
        $(document).trigger('trigger-list-filter-update', p);
        $(document).trigger('trigger-list-filter-by-bound', p);
        //console.log(queryManager.getParameters())
      }, 100);

      var district_boundary = new L.geoJson(null, {
        clickable: false
      });
      district_boundary.addTo(mapManager.getMap());
      $.ajax({
        dataType: "json",
        url: "/data/NY-14.json",
        success: function success(data) {
          // $(data.geojson).each(function(key, item) {
          district_boundary.addData(data.geojson).setStyle({
            fillColor: 'rgba(60, 46, 129, 0.26)',
            color: 'rgba(60, 46, 129, 0.8)'
          });
          // if (!params.zipcode || params.zipcode === '') {

          // }
          // });
          // console.log(district_boundary);
          mapManager.getMap().fitBounds(district_boundary.getBounds(), { animate: false });
          district_boundary.bringToBack();
        }
      }).error(function () {});
    }
  });
})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9sYW5ndWFnZS5qcyIsImNsYXNzZXMvbGlzdC5qcyIsImNsYXNzZXMvbWFwLmpzIiwiY2xhc3Nlcy9xdWVyeS5qcyIsImFwcC5qcyJdLCJuYW1lcyI6WyJBdXRvY29tcGxldGVNYW5hZ2VyIiwiJCIsInRhcmdldCIsIkFQSV9LRVkiLCJ0YXJnZXRJdGVtIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwicXVlcnlNZ3IiLCJRdWVyeU1hbmFnZXIiLCJnZW9jb2RlciIsImdvb2dsZSIsIm1hcHMiLCJHZW9jb2RlciIsIiR0YXJnZXQiLCJpbml0aWFsaXplIiwidHlwZWFoZWFkIiwiaGludCIsImhpZ2hsaWdodCIsIm1pbkxlbmd0aCIsImNsYXNzTmFtZXMiLCJtZW51IiwibmFtZSIsImRpc3BsYXkiLCJpdGVtIiwiZm9ybWF0dGVkX2FkZHJlc3MiLCJsaW1pdCIsInNvdXJjZSIsInEiLCJzeW5jIiwiYXN5bmMiLCJnZW9jb2RlIiwiYWRkcmVzcyIsInJlc3VsdHMiLCJzdGF0dXMiLCJvbiIsIm9iaiIsImRhdHVtIiwiZ2VvbWV0cnkiLCJ1cGRhdGVWaWV3cG9ydCIsInZpZXdwb3J0IiwialF1ZXJ5IiwiTGFuZ3VhZ2VNYW5hZ2VyIiwibGFuZ3VhZ2UiLCJkaWN0aW9uYXJ5IiwiJHRhcmdldHMiLCJ1cGRhdGVQYWdlTGFuZ3VhZ2UiLCJ0YXJnZXRMYW5ndWFnZSIsInJvd3MiLCJmaWx0ZXIiLCJpIiwibGFuZyIsImVhY2giLCJpbmRleCIsInRhcmdldEF0dHJpYnV0ZSIsImRhdGEiLCJsYW5nVGFyZ2V0IiwidGV4dCIsInZhbCIsImF0dHIiLCJ0YXJnZXRzIiwiYWpheCIsInVybCIsImRhdGFUeXBlIiwic3VjY2VzcyIsInVwZGF0ZUxhbmd1YWdlIiwiTGlzdE1hbmFnZXIiLCJ0YXJnZXRMaXN0IiwicmVuZGVyRXZlbnQiLCJnbXREYXRlIiwiRGF0ZSIsInN0YXJ0X2RhdGV0aW1lIiwidG9HTVRTdHJpbmciLCJkYXRlIiwibW9tZW50IiwiZm9ybWF0IiwiZ2V0SG91cnMiLCJtYXRjaCIsImV2ZW50X3R5cGUiLCJsYXQiLCJsbmciLCJ0aXRsZSIsInZlbnVlIiwicmVuZGVyR3JvdXAiLCJ3ZWJzaXRlIiwic3VwZXJncm91cCIsImxvY2F0aW9uIiwiZGVzY3JpcHRpb24iLCIkbGlzdCIsInVwZGF0ZUZpbHRlciIsInAiLCJyZW1vdmVQcm9wIiwiYWRkQ2xhc3MiLCJqb2luIiwidXBkYXRlQm91bmRzIiwiYm91bmQxIiwiYm91bmQyIiwiZmluZCIsImluZCIsIl9sYXQiLCJfbG5nIiwicmVtb3ZlQ2xhc3MiLCJwb3B1bGF0ZUxpc3QiLCJoYXJkRmlsdGVycyIsInRhcmdldERhdGEiLCJrZXlTZXQiLCJrZXkiLCJzcGxpdCIsIiRldmVudExpc3QiLCJtYXAiLCJsZW5ndGgiLCJ0b0xvd2VyQ2FzZSIsImluY2x1ZGVzIiwicmVtb3ZlIiwiYXBwZW5kIiwiTWFwTWFuYWdlciIsIkxBTkdVQUdFIiwibWFwTWFya2VyIiwid21JY29uIiwiTCIsImljb24iLCJpY29uVXJsIiwiaWNvblNpemUiLCJpY29uQW5jaG9yIiwicG9wdXBBbmNob3IiLCJzaGFkb3dVcmwiLCJzaGFkb3dTaXplIiwic2hhZG93QW5jaG9yIiwicmVuZGVyR2VvanNvbiIsImxpc3QiLCJkaWN0TGF0TG5nIiwiZm9yRWFjaCIsInB1c2giLCJtYXBJdGVtcyIsIk9iamVjdCIsImtleXMiLCJwYXJzZUZsb2F0IiwiZXZlbnRzIiwicmVuZGVyZWQiLCJ0eXBlIiwiY29vcmRpbmF0ZXMiLCJwcm9wZXJ0aWVzIiwiZXZlbnRQcm9wZXJ0aWVzIiwicG9wdXBDb250ZW50IiwicG9wdXBDbGFzc05hbWUiLCJvcHRpb25zIiwiQnJvd3NlciIsIm1vYmlsZSIsImRyYWdnaW5nIiwic2V0VmlldyIsIndpbmRvdyIsIkNVU1RPTV9DT09SRCIsIkNVU1RPTV9aT09NIiwib25Nb3ZlIiwiZXZlbnQiLCJzdyIsImdldEJvdW5kcyIsIl9zb3V0aFdlc3QiLCJuZSIsIl9ub3J0aEVhc3QiLCJodHRwcyIsInRpbGVMYXllciIsImF0dHJpYnV0aW9uIiwibWF4Wm9vbSIsImFkZFRvIiwiJG1hcCIsImNhbGxiYWNrIiwiZ2V0TWFwIiwic2V0Qm91bmRzIiwiYm91bmRzMSIsImJvdW5kczIiLCJib3VuZHMiLCJmaXRCb3VuZHMiLCJzZXRDZW50ZXIiLCJjZW50ZXIiLCJ6b29tIiwiZ2V0Q2VudGVyQnlMb2NhdGlvbiIsInNob3dNYXBNYXJrZXIiLCJ1bmRlZmluZWQiLCJyZW1vdmVMYXllciIsIk1hcmtlciIsInJlZnJlc2hNYXAiLCJpbnZhbGlkYXRlU2l6ZSIsImZpbHRlck1hcCIsImZpbHRlcnMiLCJoaWRlIiwic2hvdyIsInBsb3RQb2ludHMiLCJnZW9qc29uIiwiZmVhdHVyZXMiLCJnZW9KU09OIiwicG9pbnRUb0xheWVyIiwiZmVhdHVyZSIsImxhdGxuZyIsImV2ZW50VHlwZSIsImdlb2pzb25NYXJrZXJPcHRpb25zIiwicmFkaXVzIiwiZmlsbENvbG9yIiwiY29sb3IiLCJ3ZWlnaHQiLCJvcGFjaXR5IiwiZmlsbE9wYWNpdHkiLCJjaXJjbGVNYXJrZXIiLCJvbkVhY2hGZWF0dXJlIiwibGF5ZXIiLCJiaW5kUG9wdXAiLCJjbGFzc05hbWUiLCJ1cGRhdGUiLCJsYXRMbmciLCJ0YXJnZXRGb3JtIiwicHJldmlvdXMiLCJlIiwicHJldmVudERlZmF1bHQiLCJmb3JtIiwiZGVwYXJhbSIsInNlcmlhbGl6ZSIsImhhc2giLCJwYXJhbSIsInRyaWdnZXIiLCJwYXJhbXMiLCJzdWJzdHJpbmciLCJsb2MiLCJwcm9wIiwiZ2V0UGFyYW1ldGVycyIsInBhcmFtZXRlcnMiLCJ1cGRhdGVMb2NhdGlvbiIsImYiLCJiIiwiSlNPTiIsInN0cmluZ2lmeSIsInVwZGF0ZVZpZXdwb3J0QnlCb3VuZCIsInRyaWdnZXJTdWJtaXQiLCJhdXRvY29tcGxldGVNYW5hZ2VyIiwibWFwTWFuYWdlciIsInF1ZXJ5TWFuYWdlciIsImluaXRQYXJhbXMiLCJpbml0aWFsaXplQXV0b2NvbXBsZXRlQ2FsbGJhY2siLCJyZXN1bHQiLCJsYW5ndWFnZU1hbmFnZXIiLCJsaXN0TWFuYWdlciIsInBhcnNlIiwib3B0IiwidG9nZ2xlQ2xhc3MiLCJzZXRUaW1lb3V0IiwiY3VycmVudFRhcmdldCIsIm9sZFVSTCIsIm9yaWdpbmFsRXZlbnQiLCJvbGRIYXNoIiwic2VhcmNoIiwibGF0aXR1ZGUiLCJzdGFydF9kYXRlIiwidHoiLCJhZGRyZXNzX2xpbmVzIiwibG9jYWxpdHkiLCJyZWdpb24iLCJwb3N0YWxfY29kZSIsImxvbmdpdHVkZSIsImJyb3dzZXJfdXJsIiwiZ3JvdXAiLCJzb3J0IiwiYSIsImRpc3RyaWN0X2JvdW5kYXJ5IiwiZ2VvSnNvbiIsImNsaWNrYWJsZSIsImFkZERhdGEiLCJzZXRTdHlsZSIsImFuaW1hdGUiLCJicmluZ1RvQmFjayIsImVycm9yIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBOztBQUNBLElBQU1BLHNCQUF1QixVQUFTQyxDQUFULEVBQVk7QUFDdkM7O0FBRUEsU0FBTyxVQUFDQyxNQUFELEVBQVk7O0FBRWpCLFFBQU1DLFVBQVUseUNBQWhCO0FBQ0EsUUFBTUMsYUFBYSxPQUFPRixNQUFQLElBQWlCLFFBQWpCLEdBQTRCRyxTQUFTQyxhQUFULENBQXVCSixNQUF2QixDQUE1QixHQUE2REEsTUFBaEY7QUFDQSxRQUFNSyxXQUFXQyxjQUFqQjtBQUNBLFFBQUlDLFdBQVcsSUFBSUMsT0FBT0MsSUFBUCxDQUFZQyxRQUFoQixFQUFmOztBQUVBLFdBQU87QUFDTEMsZUFBU1osRUFBRUcsVUFBRixDQURKO0FBRUxGLGNBQVFFLFVBRkg7QUFHTFUsa0JBQVksc0JBQU07QUFDaEJiLFVBQUVHLFVBQUYsRUFBY1csU0FBZCxDQUF3QjtBQUNaQyxnQkFBTSxJQURNO0FBRVpDLHFCQUFXLElBRkM7QUFHWkMscUJBQVcsQ0FIQztBQUlaQyxzQkFBWTtBQUNWQyxrQkFBTTtBQURJO0FBSkEsU0FBeEIsRUFRVTtBQUNFQyxnQkFBTSxnQkFEUjtBQUVFQyxtQkFBUyxpQkFBQ0MsSUFBRDtB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QUExQztBQUNBeEYsVUFBRUksUUFBRixFQUFZb04sT0FBWixDQUFvQixvQkFBcEIsRUFBMENoSSxDQUExQztBQUNBeEYsVUFBRUksUUFBRixFQUFZb04sT0FBWixDQUFvQiw0QkFBcEIsRUFBa0RoSSxDQUFsRDtBQUNBeEYsVUFBRUksUUFBRixFQUFZb04sT0FBWixDQUFvQiw4QkFBcEIsRUFBb0RoSSxDQUFwRDtBQUNBO0FBQ0QsT0FQRCxFQU9HLEdBUEg7O0FBVUEsVUFBSTJLLG9CQUFvQixJQUFJOUksRUFBRStJLE9BQU4sQ0FBYyxJQUFkLEVBQW9CO0FBQzFDQyxtQkFBVztBQUQrQixPQUFwQixDQUF4QjtBQUdBRix3QkFBa0JqRyxLQUFsQixDQUF3QnFFLFdBQVdsRSxNQUFYLEVBQXhCO0FBQ0FySyxRQUFFMkQsSUFBRixDQUFPO0FBQ0xFLGtCQUFVLE1BREw7QUFFTEQsYUFBSyxrQkFGQTtBQUdMRSxpQkFBUyxpQkFBU1QsSUFBVCxFQUFlO0FBQ3RCO0FBQ0U4TSw0QkFDR0csT0FESCxDQUNXak4sS0FBS3FJLE9BRGhCLEVBRUc2RSxRQUZILENBRVk7QUFDUnBFLHVCQUFXLHlCQURIO0FBRVJDLG1CQUFPO0FBRkMsV0FGWjtBQU1BOztBQUVBO0FBQ0Y7QUFDQTtBQUNBbUMscUJBQVdsRSxNQUFYLEdBQ0dLLFNBREgsQ0FDYXlGLGtCQUFrQnpHLFNBQWxCLEVBRGIsRUFDNEMsRUFBRThHLFNBQVMsS0FBWCxFQUQ1QztBQUVBTCw0QkFBa0JNLFdBQWxCO0FBQ0Q7QUFuQkksT0FBUCxFQW9CR0MsS0FwQkgsQ0FvQlMsWUFBVyxDQUFFLENBcEJ0QjtBQXFCRDtBQXZFSSxHQUFQO0FBNEVELENBeFFELEVBd1FHbk8sTUF4UUgiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG4vL0FQSSA6QUl6YVN5QnVqS1RSdzV1SVhwX05IWmdqWVZEdEJ5MWRieU51R0VNXG5jb25zdCBBdXRvY29tcGxldGVNYW5hZ2VyID0gKGZ1bmN0aW9uKCQpIHtcbiAgLy9Jbml0aWFsaXphdGlvbi4uLlxuXG4gIHJldHVybiAodGFyZ2V0KSA9PiB7XG5cbiAgICBjb25zdCBBUElfS0VZID0gXCJBSXphU3lEQzJOdUdFNzVqcnVrajNkdEdSSjJURUdEZktkZUExOFFcIjtcbiAgICBjb25zdCB0YXJnZXRJdGVtID0gdHlwZW9mIHRhcmdldCA9PSBcInN0cmluZ1wiID8gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpIDogdGFyZ2V0O1xuICAgIGNvbnN0IHF1ZXJ5TWdyID0gUXVlcnlNYW5hZ2VyKCk7XG4gICAgdmFyIGdlb2NvZGVyID0gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgJHRhcmdldDogJCh0YXJnZXRJdGVtKSxcbiAgICAgIHRhcmdldDogdGFyZ2V0SXRlbSxcbiAgICAgIGluaXRpYWxpemU6ICgpID0+IHtcbiAgICAgICAgJCh0YXJnZXRJdGVtKS50eXBlYWhlYWQoe1xuICAgICAgICAgICAgICAgICAgICBoaW50OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBoaWdobGlnaHQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG1pbkxlbmd0aDogNCxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lczoge1xuICAgICAgICAgICAgICAgICAgICAgIG1lbnU6ICd0dC1kcm9wZG93bi1tZW51J1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnc2VhcmNoLXJlc3VsdHMnLFxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAoaXRlbSkgPT4gaXRlbS5mb3JtYXR0ZWRfYWRkcmVzcyxcbiAgICAgICAgICAgICAgICAgICAgbGltaXQ6IDEwLFxuICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IGZ1bmN0aW9uIChxLCBzeW5jLCBhc3luYyl7XG4gICAgICAgICAgICAgICAgICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHsgYWRkcmVzczogcSB9LCBmdW5jdGlvbiAocmVzdWx0cywgc3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGFzeW5jKHJlc3VsdHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApLm9uKCd0eXBlYWhlYWQ6c2VsZWN0ZWQnLCBmdW5jdGlvbiAob2JqLCBkYXR1bSkge1xuICAgICAgICAgICAgICAgICAgICBpZihkYXR1bSlcbiAgICAgICAgICAgICAgICAgICAge1xuXG4gICAgICAgICAgICAgICAgICAgICAgdmFyIGdlb21ldHJ5ID0gZGF0dW0uZ2VvbWV0cnk7XG4gICAgICAgICAgICAgICAgICAgICAgcXVlcnlNZ3IudXBkYXRlVmlld3BvcnQoZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICAgICAgICAgICAgICAgIC8vICBtYXAuZml0Qm91bmRzKGdlb21ldHJ5LmJvdW5kcz8gZ2VvbWV0cnkuYm91bmRzIDogZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG5cblxuICAgIHJldHVybiB7XG5cbiAgICB9XG4gIH1cblxufShqUXVlcnkpKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgTGFuZ3VhZ2VNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIC8va2V5VmFsdWVcblxuICAvL3RhcmdldHMgYXJlIHRoZSBtYXBwaW5ncyBmb3IgdGhlIGxhbmd1YWdlXG4gIHJldHVybiAoKSA9PiB7XG4gICAgbGV0IGxhbmd1YWdlO1xuICAgIGxldCBkaWN0aW9uYXJ5ID0ge307XG4gICAgbGV0ICR0YXJnZXRzID0gJChcIltkYXRhLWxhbmctdGFyZ2V0XVtkYXRhLWxhbmcta2V5XVwiKTtcblxuICAgIGNvbnN0IHVwZGF0ZVBhZ2VMYW5ndWFnZSA9ICgpID0+IHtcblxuICAgICAgbGV0IHRhcmdldExhbmd1YWdlID0gZGljdGlvbmFyeS5yb3dzLmZpbHRlcigoaSkgPT4gaS5sYW5nID09PSBsYW5ndWFnZSlbMF07XG5cbiAgICAgICR0YXJnZXRzLmVhY2goKGluZGV4LCBpdGVtKSA9PiB7XG4gICAgICAgIGxldCB0YXJnZXRBdHRyaWJ1dGUgPSAkKGl0ZW0pLmRhdGEoJ2xhbmctdGFyZ2V0Jyk7XG4gICAgICAgIGxldCBsYW5nVGFyZ2V0ID0gJChpdGVtKS5kYXRhKCdsYW5nLWtleScpO1xuXG4gICAgICAgIHN3aXRjaCh0YXJnZXRBdHRyaWJ1dGUpIHtcbiAgICAgICAgICBjYXNlICd0ZXh0JzpcbiAgICAgICAgICAgICQoaXRlbSkudGV4dCh0YXJnZXRMYW5ndWFnZVtsYW5nVGFyZ2V0XSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICd2YWx1ZSc6XG4gICAgICAgICAgICAkKGl0ZW0pLnZhbCh0YXJnZXRMYW5ndWFnZVtsYW5nVGFyZ2V0XSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgJChpdGVtKS5hdHRyKHRhcmdldEF0dHJpYnV0ZSwgdGFyZ2V0TGFuZ3VhZ2VbbGFuZ1RhcmdldF0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICBsYW5ndWFnZSxcbiAgICAgIHRhcmdldHM6ICR0YXJnZXRzLFxuICAgICAgZGljdGlvbmFyeSxcbiAgICAgIGluaXRpYWxpemU6IChsYW5nKSA9PiB7XG5cbiAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAvLyB1cmw6ICdodHRwczovL2dzeDJqc29uLmNvbS9hcGk/aWQ9MU8zZUJ5akwxdmxZZjdaN2FtLV9odFJUUWk3M1BhZnFJZk5CZExtWGU4U00mc2hlZXQ9MScsXG4gICAgICAgICAgdXJsOiAnL2RhdGEvbGFuZy5qc29uJyxcbiAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PiB7XG4gICAgICAgICAgICBkaWN0aW9uYXJ5ID0gZGF0YTtcbiAgICAgICAgICAgIGxhbmd1YWdlID0gbGFuZztcbiAgICAgICAgICAgIHVwZGF0ZVBhZ2VMYW5ndWFnZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlTGFuZ3VhZ2U6IChsYW5nKSA9PiB7XG5cbiAgICAgICAgbGFuZ3VhZ2UgPSBsYW5nO1xuICAgICAgICB1cGRhdGVQYWdlTGFuZ3VhZ2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbn0pKGpRdWVyeSk7XG4iLCIvKiBUaGlzIGxvYWRzIGFuZCBtYW5hZ2VzIHRoZSBsaXN0ISAqL1xuXG5jb25zdCBMaXN0TWFuYWdlciA9ICgoJCkgPT4ge1xuICByZXR1cm4gKHRhcmdldExpc3QgPSBcIiNldmVudHMtbGlzdFwiKSA9PiB7XG4gICAgY29uc3QgJHRhcmdldCA9IHR5cGVvZiB0YXJnZXRMaXN0ID09PSAnc3RyaW5nJyA/ICQodGFyZ2V0TGlzdCkgOiB0YXJnZXRMaXN0O1xuXG4gICAgY29uc3QgcmVuZGVyRXZlbnQgPSAoaXRlbSkgPT4ge1xuICAgICAgdmFyIGdtdERhdGUgPSBuZXcgRGF0ZShpdGVtLnN0YXJ0X2RhdGV0aW1lKS50b0dNVFN0cmluZygpO1xuICAgICAgdmFyIGRhdGUgPSBtb21lbnQobmV3IERhdGUoZ210RGF0ZSkpLmZvcm1hdChuZXcgRGF0ZShpdGVtLnN0YXJ0X2RhdGV0aW1lKS5nZXRIb3VycygpID09IDAgPyBcImRkZGQgTU1NIEREXCIgOiBcImRkZGQgTU1NIERELCBoOm1tYVwiKTtcblxuICAgICAgLy8gY29uc29sZS5sb2coZGF0ZSwgbmV3IERhdGUoaXRlbS5zdGFydF9kYXRldGltZSksIG5ldyBEYXRlKGl0ZW0uc3RhcnRfZGF0ZXRpbWUpLnRvR01UU3RyaW5nKCkpXG4gICAgICBsZXQgdXJsID0gaXRlbS51cmwubWF0Y2goL15odHRwc3swLDF9Oi8pID8gaXRlbS51cmwgOiBcIi8vXCIgKyBpdGVtLnVybDtcblxuXG5cbiAgICAgIHJldHVybiBgXG4gICAgICA8bGkgY2xhc3M9JyR7aXRlbS5ldmVudF90eXBlfSBldmVudC1vYmogd2l0aGluLWJvdW5kJyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWV2ZW50IHR5cGUtYWN0aW9uXCI+XG4gICAgICAgICAgPGgyIGNsYXNzPVwiZXZlbnQtdGl0bGVcIj48YSBocmVmPVwiJHt1cmwgPT0gJy8vJyA/ICdqYXZhc2NyaXB0OiB2b2lkKG51bGwpJyA6IHVybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLnRpdGxlfTwvYT48L2gyPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1kYXRlIGRhdGVcIiBzdHlsZT1cImRpc3BsYXk6ICR7IWl0ZW0uc3RhcnRfZGF0ZXRpbWUgPyAnbm9uZScgOiAnYmxvY2snfVwiPiR7ZGF0ZX08L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtYWRkcmVzcyBhZGRyZXNzLWFyZWFcIj5cbiAgICAgICAgICAgIDxwPiR7aXRlbS52ZW51ZX08L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCIgc3R5bGU9J2Rpc3BsYXk6ICR7dXJsID09ICcvLycgPyAnbm9uZScgOiAnYmxvY2snfSc+XG4gICAgICAgICAgICA8YSBocmVmPVwiJHt1cmwgPT0gJy8vJyA/ICdqYXZhc2NyaXB0OiB2b2lkKG51bGwpJyA6IHVybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeSByc3ZwXCI+UlNWUDwvYT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2xpPlxuICAgICAgYFxuICAgIH07XG5cbiAgICBjb25zdCByZW5kZXJHcm91cCA9IChpdGVtKSA9PiB7XG4gICAgICBsZXQgdXJsID0gaXRlbS53ZWJzaXRlLm1hdGNoKC9eaHR0cHN7MCwxfTovKSA/IGl0ZW0ud2Vic2l0ZSA6IFwiLy9cIiArIGl0ZW0ud2Vic2l0ZTtcbiAgICAgIHJldHVybiBgXG4gICAgICA8bGkgY2xhc3M9JyR7aXRlbS5ldmVudF90eXBlfSBncm91cC1vYmonIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZ3JvdXAgZ3JvdXAtb2JqXCI+XG4gICAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgICAgPGxpIGNsYXNzPVwidGFnIHRhZy0ke2l0ZW0uc3VwZXJncm91cH1cIj4ke2l0ZW0uc3VwZXJncm91cH08L2xpPlxuICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgPGgyPjxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLm5hbWV9PC9hPjwvaDI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRldGFpbHMtYXJlYVwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWxvY2F0aW9uIGxvY2F0aW9uXCI+JHtpdGVtLmxvY2F0aW9ufTwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRlc2NyaXB0aW9uXCI+XG4gICAgICAgICAgICAgIDxwPiR7aXRlbS5kZXNjcmlwdGlvbn08L3A+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICAgIDxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeVwiPkdldCBJbnZvbHZlZDwvYT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2xpPlxuICAgICAgYFxuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgJGxpc3Q6ICR0YXJnZXQsXG4gICAgICB1cGRhdGVGaWx0ZXI6IChwKSA9PiB7XG4gICAgICAgIGlmKCFwKSByZXR1cm47XG5cbiAgICAgICAgLy8gUmVtb3ZlIEZpbHRlcnNcblxuICAgICAgICAkdGFyZ2V0LnJlbW92ZVByb3AoXCJjbGFzc1wiKTtcbiAgICAgICAgJHRhcmdldC5hZGRDbGFzcyhwLmZpbHRlciA/IHAuZmlsdGVyLmpvaW4oXCIgXCIpIDogJycpXG4gICAgICB9LFxuICAgICAgdXBkYXRlQm91bmRzOiAoYm91bmQxLCBib3VuZDIpID0+IHtcblxuICAgICAgICAvLyBjb25zdCBib3VuZHMgPSBbcC5ib3VuZHMxLCBwLmJvdW5kczJdO1xuXG5cbiAgICAgICAgJHRhcmdldC5maW5kKCd1bCBsaS5ldmVudC1vYmosIHVsIGxpLmdyb3VwLW9iaicpLmVhY2goKGluZCwgaXRlbSk9PiB7XG5cbiAgICAgICAgICBsZXQgX2xhdCA9ICQoaXRlbSkuZGF0YSgnbGF0JyksXG4gICAgICAgICAgICAgIF9sbmcgPSAkKGl0ZW0pLmRhdGEoJ2xuZycpO1xuXG4gICAgICAgICAgLy8gY29uc29sZS5sb2coXCJ1cGRhdGVCb3VuZHNcIiwgaXRlbSlcbiAgICAgICAgICBpZiAoYm91bmQxWzBdIDw9IF9sYXQgJiYgYm91bmQyWzBdID49IF9sYXQgJiYgYm91bmQxWzFdIDw9IF9sbmcgJiYgYm91bmQyWzFdID49IF9sbmcpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiQWRkaW5nIGJvdW5kc1wiKTtcbiAgICAgICAgICAgICQoaXRlbSkuYWRkQ2xhc3MoJ3dpdGhpbi1ib3VuZCcpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkKGl0ZW0pLnJlbW92ZUNsYXNzKCd3aXRoaW4tYm91bmQnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAvLyAkKGl0ZW0pLmFkZENsYXNzKCd3aXRoaW4tYm91bmQnKTtcblxuICAgICAgICAvLyBPcmRlcnMgdGhlIHNldCB0byBuZWFyZXN0XG4gICAgICAgIC8vIGxldCBsYXRDZW50ZXIgPSAoYm91bmQxWzBdICsgYm91bmQyWzBdKSAvIDIsXG4gICAgICAgIC8vICAgICBsbmdDZW50ZXIgPSAoYm91bmQxWzFdICsgYm91bmQyWzFdKSAvIDI7XG4gICAgICAgIC8vIGNvbnN0IHNvcnRMaXN0ID0gKGEsIGIpID0+IHtcbiAgICAgICAgLy8gICBsZXQgX2xhdEEgPSAkKGEpLmRhdGEoJ2xhdCcpLFxuICAgICAgICAvLyAgICAgICBfbGF0QiA9ICQoYikuZGF0YSgnbGF0JyksXG4gICAgICAgIC8vICAgICAgIF9sbmdBID0gJChhKS5kYXRhKCdsbmcnKSxcbiAgICAgICAgLy8gICAgICAgX2xuZ0IgPSAkKGIpLmRhdGEoJ2xuZycpO1xuICAgICAgICAvL1xuICAgICAgICAvLyAgIGxldCBkaXN0QSA9IE1hdGguc3FydChNYXRoLnBvdyhsYXRDZW50ZXIgLSBfbGF0QSwgMikgKyBNYXRoLnBvdyhsbmdDZW50ZXIgLSBfbG5nQSwgMikpLFxuICAgICAgICAvLyAgICAgICBkaXN0QiA9IE1hdGguc3FydChNYXRoLnBvdyhsYXRDZW50ZXIgLSBfbGF0QiwgMikgKyBNYXRoLnBvdyhsbmdDZW50ZXIgLSBfbG5nQiwgMikpO1xuICAgICAgICAvL1xuICAgICAgICAvLyAgICQoYSkuYXR0cignZGF0YS1kaXN0YW5jZScsIGRpc3RBKTtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gICByZXR1cm4gZGlzdEEgLSBkaXN0QjtcbiAgICAgICAgLy8gfTtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gJHRhcmdldC5maW5kKCd1bCBsaS5ldmVudC1vYmosIHVsIGxpLmdyb3VwLW9iaicpXG4gICAgICAgIC8vICAgICAuc29ydChzb3J0TGlzdClcbiAgICAgICAgLy8gICAgIC5hcHBlbmRUbygkdGFyZ2V0LmZpbmQoJ3VsJykpO1xuICAgICAgfSxcbiAgICAgIHBvcHVsYXRlTGlzdDogKGhhcmRGaWx0ZXJzLCB0YXJnZXREYXRhKSA9PiB7XG4gICAgICAgIC8vdXNpbmcgd2luZG93LkVWRU5UX0RBVEFcbiAgICAgICAgY29uc3Qga2V5U2V0ID0gIWhhcmRGaWx0ZXJzLmtleSA/IFtdIDogaGFyZEZpbHRlcnMua2V5LnNwbGl0KCcsJyk7XG5cbiAgICAgICAgLy8gY29uc29sZS5sb2codGFyZ2V0RGF0YSk7XG5cbiAgICAgICAgdmFyICRldmVudExpc3QgPSB0YXJnZXREYXRhLm1hcChpdGVtID0+IHtcbiAgICAgICAgICBpZiAoa2V5U2V0Lmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gaXRlbS5ldmVudF90eXBlICYmIGl0ZW0uZXZlbnRfdHlwZS50b0xvd2VyQ2FzZSgpID09ICdncm91cCcgPyByZW5kZXJHcm91cChpdGVtKSA6IHJlbmRlckV2ZW50KGl0ZW0pO1xuICAgICAgICAgIH0gZWxzZSBpZiAoa2V5U2V0Lmxlbmd0aCA+IDAgJiYgaXRlbS5ldmVudF90eXBlICE9ICdncm91cCcgJiYga2V5U2V0LmluY2x1ZGVzKGl0ZW0uZXZlbnRfdHlwZSkpIHtcbiAgICAgICAgICAgIHJldHVybiByZW5kZXJFdmVudChpdGVtKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGtleVNldC5sZW5ndGggPiAwICYmIGl0ZW0uZXZlbnRfdHlwZSA9PSAnZ3JvdXAnICYmIGtleVNldC5pbmNsdWRlcyhpdGVtLnN1cGVyZ3JvdXApKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVuZGVyR3JvdXAoaXRlbSlcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gbnVsbDtcblxuICAgICAgICB9KVxuICAgICAgICAkdGFyZ2V0LmZpbmQoJ3VsIGxpJykucmVtb3ZlKCk7XG4gICAgICAgICR0YXJnZXQuZmluZCgndWwnKS5hcHBlbmQoJGV2ZW50TGlzdCk7XG5cbiAgICAgICAgJHRhcmdldC5maW5kKCd1bCBsaScpXG5cbiAgICAgIH1cbiAgICB9O1xuICB9XG59KShqUXVlcnkpO1xuIiwiXG5jb25zdCBNYXBNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIGxldCBMQU5HVUFHRSA9ICdlbic7XG4gIHZhciBtYXBNYXJrZXI7XG4gIGNvbnN0IHdtSWNvbiA9IEwuaWNvbih7XG4gICAgICBpY29uVXJsOiAnL2ltZy9vY2FzaW8tbWFya2VyLnBuZycsXG4gICAgICBpY29uU2l6ZTogWzMwLCA0MV0sXG4gICAgICBpY29uQW5jaG9yOiBbMTUsIDQxXSxcbiAgICAgIHBvcHVwQW5jaG9yOiBbLTMsIC03Nl0sXG4gICAgICBzaGFkb3dVcmw6ICcvaW1nL29jYXNpby1tYXJrZXItc2hhZG93LnBuZycsXG4gICAgICBzaGFkb3dTaXplOiBbNDMsIDE5XSxcbiAgICAgIHNoYWRvd0FuY2hvcjogWzE1LCAxOV1cbiAgfSk7XG5cbiAgY29uc3QgcmVuZGVyRXZlbnQgPSAoaXRlbSkgPT4ge1xuICAgIHZhciBnbXREYXRlID0gbmV3IERhdGUoaXRlbS5zdGFydF9kYXRldGltZSkudG9HTVRTdHJpbmcoKTtcbiAgICB2YXIgZGF0ZSA9IG1vbWVudChuZXcgRGF0ZShnbXREYXRlKSkuZm9ybWF0KG5ldyBEYXRlKGl0ZW0uc3RhcnRfZGF0ZXRpbWUpLmdldEhvdXJzKCkgPT0gMCA/IFwiZGRkZCBNTU0gRERcIiAgOiBcImRkZGQgTU1NIERELCBoOm1tYVwiKTtcblxuICAgIGxldCB1cmwgPSBpdGVtLnVybC5tYXRjaCgvXmh0dHBzezAsMX06LykgPyBpdGVtLnVybCA6IFwiLy9cIiArIGl0ZW0udXJsO1xuXG5cbiAgICByZXR1cm4gYFxuICAgIDxkaXYgY2xhc3M9J3BvcHVwLWl0ZW0gJHtpdGVtLmV2ZW50X3R5cGV9JyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ldmVudCB0eXBlLWFjdGlvblwiPlxuICAgICAgICA8aDIgY2xhc3M9XCJldmVudC10aXRsZVwiPjxhIGhyZWY9XCIke3VybCA9PSAnLy8nID8gJ2phdmFzY3JpcHQ6IHZvaWQobnVsbCknIDogdXJsfVwiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0udGl0bGV9PC9hPjwvaDI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1kYXRlIGRhdGVcIiBzdHlsZT1cImRpc3BsYXk6ICR7IWl0ZW0uc3RhcnRfZGF0ZXRpbWUgPyAnbm9uZScgOiAnYmxvY2snfVwiPiR7ZGF0ZX08L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImV2ZW50LWFkZHJlc3MgYWRkcmVzcy1hcmVhXCI+XG4gICAgICAgICAgPHA+JHtpdGVtLnZlbnVlfTwvcD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiIHN0eWxlPSdkaXNwbGF5OiAke3VybCA9PSAnLy8nID8gJ25vbmUnIDogJ2Jsb2NrJ30nPlxuICAgICAgICAgIDxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeSByc3ZwXCI+UlNWUDwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICBgXG4gIH07XG5cbiAgY29uc3QgcmVuZGVyR3JvdXAgPSAoaXRlbSkgPT4ge1xuXG4gICAgbGV0IHVybCA9IGl0ZW0ud2Vic2l0ZS5tYXRjaCgvXmh0dHBzezAsMX06LykgPyBpdGVtLndlYnNpdGUgOiBcIi8vXCIgKyBpdGVtLndlYnNpdGU7XG4gICAgcmV0dXJuIGBcbiAgICA8bGk+XG4gICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ncm91cCBncm91cC1vYmpcIj5cbiAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgIDxsaSBjbGFzcz1cInRhZyB0YWctJHtpdGVtLnN1cGVyZ3JvdXB9XCI+JHtpdGVtLnN1cGVyZ3JvdXB9PC9saT5cbiAgICAgICAgPC91bD5cbiAgICAgICAgPGgyPjxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLm5hbWV9PC9hPjwvaDI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXRhaWxzLWFyZWFcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtbG9jYXRpb24gbG9jYXRpb25cIj4ke2l0ZW0uYWRkcmVzc308L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGVzY3JpcHRpb25cIj5cbiAgICAgICAgICAgIDxwPiR7aXRlbS5kZXNjcmlwdGlvbn08L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICA8YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIj5HZXQgSW52b2x2ZWQ8L2E+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9saT5cbiAgICBgXG4gIH07XG5cbiAgY29uc3QgcmVuZGVyR2VvanNvbiA9IChsaXN0KSA9PiB7XG4gICAgLy8gY29uc29sZS5sb2cobGlzdClcbiAgICAvLyBHZXQgYWxsIHVuaXF1ZSBMYXQtbG9uZ1xuXG4gICAgbGV0IGRpY3RMYXRMbmcgPSB7fTtcblxuICAgIGxpc3QuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgaWYoIWl0ZW0ubGF0IHx8ICFpdGVtLmxuZyB8fCBpdGVtLmxhdCA9PSBcIlwiIHx8IGl0ZW0ubG5nID09IFwiXCIpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIGlmICggIWRpY3RMYXRMbmdbYCR7aXRlbS5sYXR9LCR7aXRlbS5sbmd9YF0gKSB7XG4gICAgICAgIGRpY3RMYXRMbmdbYCR7aXRlbS5sYXR9LCR7aXRlbS5sbmd9YF0gPSBbaXRlbV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkaWN0TGF0TG5nW2Ake2l0ZW0ubGF0fSwke2l0ZW0ubG5nfWBdLnB1c2goaXRlbSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBQYXJzZSBncm91cHMgaXRlbXNcbiAgICBsZXQgbWFwSXRlbXMgPSBbXTtcbiAgICBPYmplY3Qua2V5cyhkaWN0TGF0TG5nKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgbGV0IFtsYXQsIGxuZ10gPSBrZXkuc3BsaXQoJywnKTtcbiAgICAgIG1hcEl0ZW1zLnB1c2goe1xuICAgICAgICBsYXQ6IHBhcnNlRmxvYXQobGF0KSxcbiAgICAgICAgbG5nOiBwYXJzZUZsb2F0KGxuZyksXG4gICAgICAgIGV2ZW50czogZGljdExhdExuZ1trZXldXG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIGNvbnNvbGUubG9nKG1hcEl0ZW1zKTtcblxuICAgIHJldHVybiBtYXBJdGVtcy5tYXAoKGl0ZW0pID0+IHtcbiAgICAgIC8vIHJlbmRlcmVkIGV2ZW50VHlwZVxuICAgICAgbGV0IHJlbmRlcmVkO1xuXG4gICAgICAvLyBjb25zb2xlLmxvZyhpdGVtLmV2ZW50cy5sZW5ndGgpXG4gICAgICBpZiAoaXRlbS5ldmVudHMubGVuZ3RoID09IDEpIHtcbiAgICAgICAgcmVuZGVyZWQgPSByZW5kZXJFdmVudChpdGVtLmV2ZW50c1swXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZW5kZXJlZCA9IGA8ZGl2IGNsYXNzPSdtdWx0aXBsZS1pdGVtcyc+PHVsPiR7aXRlbS5ldmVudHMubWFwKGkgPT4gYDxsaT4ke3JlbmRlckV2ZW50KGkpfTwvbGk+YCkuam9pbignJyl9PC91bD48L2Rpdj5gXG4gICAgICB9XG5cblxuICAgICAgLy8gY29uc29sZS5sb2cocmVuZGVyZWQsIGl0ZW0uZXZlbnRzLmxlbmd0aClcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgXCJ0eXBlXCI6IFwiRmVhdHVyZVwiLFxuICAgICAgICBnZW9tZXRyeToge1xuICAgICAgICAgIHR5cGU6IFwiUG9pbnRcIixcbiAgICAgICAgICBjb29yZGluYXRlczogW2l0ZW0ubG5nLCBpdGVtLmxhdF1cbiAgICAgICAgfSxcbiAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgIGV2ZW50UHJvcGVydGllczogaXRlbSxcbiAgICAgICAgICBwb3B1cENvbnRlbnQ6IHJlbmRlcmVkLFxuICAgICAgICAgIHBvcHVwQ2xhc3NOYW1lOiBpdGVtLmV2ZW50cy5sZW5ndGggPiAxID8gJ3BvcHVwLW11bHRpcGxlLWl0ZW0nIDogJ3BvcHVwLXNpbmdsZS1pdGVtJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiAob3B0aW9ucykgPT4ge1xuICAgIHZhciBtYXAgPSBudWxsO1xuXG4gICAgaWYgKCFMLkJyb3dzZXIubW9iaWxlKSB7XG4gICAgICBtYXAgPSBMLm1hcCgnbWFwJywgeyBkcmFnZ2luZzogIUwuQnJvd3Nlci5tb2JpbGUgfSkuc2V0Vmlldyh3aW5kb3cuQ1VTVE9NX0NPT1JEIHx8IFszOC40MTE0MjcxLC05Ny42NDExMDQ0XSwgd2luZG93LkNVU1RPTV9aT09NIHx8IDQpO1xuICAgICAgLy8gbWFwLnNjcm9sbFdoZWVsWm9vbS5kaXNhYmxlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG1hcCA9IEwubWFwKCdtYXAnLCB7IGRyYWdnaW5nOiAhTC5Ccm93c2VyLm1vYmlsZSB9KS5zZXRWaWV3KHdpbmRvdy5DVVNUT01fQ09PUkQgfHwgWzM4LjQxMTQyNzEsLTk3LjY0MTEwNDRdLCAzKTtcbiAgICB9XG5cbiAgICBMQU5HVUFHRSA9IG9wdGlvbnMubGFuZyB8fCAnZW4nO1xuXG4gICAgaWYgKG9wdGlvbnMub25Nb3ZlKSB7XG4gICAgICBtYXAub24oJ2RyYWdlbmQnLCAoZXZlbnQpID0+IHtcblxuXG4gICAgICAgIGxldCBzdyA9IFttYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxuZ107XG4gICAgICAgIGxldCBuZSA9IFttYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxuZ107XG4gICAgICAgIG9wdGlvbnMub25Nb3ZlKHN3LCBuZSk7XG4gICAgICB9KS5vbignem9vbWVuZCcsIChldmVudCkgPT4ge1xuXG5odHRwczovL2RvY3MuZ29vZ2xlLmNvbS9kb2N1bWVudC9kLzFLV2tMTk5lSU9lRkVpVldNTndvWUt1MXlBWlJVRGY3OHhJYkkxaWU3RHZzL2VkaXQ/dXNwPXNoYXJpbmdcbiAgICAgICAgbGV0IHN3ID0gW21hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubG5nXTtcbiAgICAgICAgbGV0IG5lID0gW21hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubG5nXTtcbiAgICAgICAgb3B0aW9ucy5vbk1vdmUoc3csIG5lKTtcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgTC50aWxlTGF5ZXIoJ2h0dHBzOi8vc2VydmVyLmFyY2dpc29ubGluZS5jb20vQXJjR0lTL3Jlc3Qvc2VydmljZXMvQ2FudmFzL1dvcmxkX0xpZ2h0X0dyYXlfQmFzZS9NYXBTZXJ2ZXIvdGlsZS97en0ve3l9L3t4fScsIHtcbiAgICAgIFx0YXR0cmlidXRpb246ICdUaWxlcyAmY29weTsgRXNyaSAmbWRhc2g7IEVzcmksIERlTG9ybWUsIE5BVlRFUScsXG4gICAgICBcdG1heFpvb206IDE2fSkuYWRkVG8obWFwKTtcblxuICAgIGxldCBnZW9jb2RlciA9IG51bGw7XG4gICAgcmV0dXJuIHtcbiAgICAgICRtYXA6IG1hcCxcbiAgICAgIGluaXRpYWxpemU6IChjYWxsYmFjaykgPT4ge1xuICAgICAgICBnZW9jb2RlciA9IG5ldyBnb29nbGUubWFwcy5HZW9jb2RlcigpO1xuICAgICAgICBpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZ2V0TWFwOiAoKSA9PiBtYXAsXG4gICAgICBzZXRCb3VuZHM6IChib3VuZHMxLCBib3VuZHMyKSA9PiB7XG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IFtib3VuZHMxLCBib3VuZHMyXTtcbiAgICAgICAgbWFwLmZpdEJvdW5kcyhib3VuZHMpO1xuICAgICAgfSxcbiAgICAgIHNldENlbnRlcjogKGNlbnRlciwgem9vbSA9IDEwKSA9PiB7XG4gICAgICAgIGlmICghY2VudGVyIHx8ICFjZW50ZXJbMF0gfHwgY2VudGVyWzBdID09IFwiXCJcbiAgICAgICAgICAgICAgfHwgIWNlbnRlclsxXSB8fCBjZW50ZXJbMV0gPT0gXCJcIikgcmV0dXJuO1xuICAgICAgICBtYXAuc2V0VmlldyhjZW50ZXIsIHpvb20pO1xuICAgICAgfSxcbiAgICAgIGdldEJvdW5kczogKCkgPT4ge1xuXG4gICAgICAgIGxldCBzdyA9IFttYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxuZ107XG4gICAgICAgIGxldCBuZSA9IFttYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxuZ107XG5cbiAgICAgICAgcmV0dXJuIFtzdywgbmVdO1xuICAgICAgfSxcbiAgICAgIC8vIENlbnRlciBsb2NhdGlvbiBieSBnZW9jb2RlZFxuICAgICAgZ2V0Q2VudGVyQnlMb2NhdGlvbjogKGxvY2F0aW9uLCBjYWxsYmFjaykgPT4ge1xuXG4gICAgICAgIGdlb2NvZGVyLmdlb2NvZGUoeyBhZGRyZXNzOiBsb2NhdGlvbiB9LCBmdW5jdGlvbiAocmVzdWx0cywgc3RhdHVzKSB7XG5cbiAgICAgICAgICBpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhyZXN1bHRzWzBdKVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgc2hvd01hcE1hcmtlcjogKGxhdCwgbG5nKSA9PiB7XG5cbiAgICAgICAgLy9jb25zb2xlLmxvZyhtYXBNYXJrZXIpO1xuICAgICAgICBpZiAobWFwTWFya2VyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBtYXAucmVtb3ZlTGF5ZXIobWFwTWFya2VyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChsYXQgJiYgbG5nKSB7XG4gICAgICAgICAgbWFwTWFya2VyID0gbmV3IEwuTWFya2VyKFtsYXQsbG5nXSwge1xuICAgICAgICAgICAgaWNvbjogd21JY29uXG4gICAgICAgICAgfSkuYWRkVG8obWFwKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHJlZnJlc2hNYXA6ICgpID0+IHtcbiAgICAgICAgbWFwLmludmFsaWRhdGVTaXplKGZhbHNlKTtcbiAgICAgICAgLy8gbWFwLl9vblJlc2l6ZSgpO1xuXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwibWFwIGlzIHJlc2l6ZWRcIilcbiAgICAgIH0sXG4gICAgICBmaWx0ZXJNYXA6IChmaWx0ZXJzKSA9PiB7XG5cbiAgICAgICAgJChcIiNtYXBcIikuZmluZChcIi5ldmVudC1pdGVtLXBvcHVwXCIpLmhpZGUoKTtcblxuXG4gICAgICAgIGlmICghZmlsdGVycykgcmV0dXJuO1xuXG4gICAgICAgIGZpbHRlcnMuZm9yRWFjaCgoaXRlbSkgPT4ge1xuXG4gICAgICAgICAgJChcIiNtYXBcIikuZmluZChcIi5ldmVudC1pdGVtLXBvcHVwLlwiICsgaXRlbS50b0xvd2VyQ2FzZSgpKS5zaG93KCk7XG4gICAgICAgIH0pXG4gICAgICB9LFxuICAgICAgcGxvdFBvaW50czogKGxpc3QsIGhhcmRGaWx0ZXJzKSA9PiB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGxpc3QpXG4gICAgICAgIGNvbnN0IGtleVNldCA9ICFoYXJkRmlsdGVycy5rZXkgPyBbXSA6IGhhcmRGaWx0ZXJzLmtleS5zcGxpdCgnLCcpO1xuXG4gICAgICAgIGlmIChrZXlTZXQubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGxpc3QgPSBsaXN0LmZpbHRlcigoaXRlbSkgPT4ga2V5U2V0LmluY2x1ZGVzKGl0ZW0uZXZlbnRfdHlwZSkpXG4gICAgICAgIH1cblxuXG4gICAgICAgIGNvbnN0IGdlb2pzb24gPSB7XG4gICAgICAgICAgdHlwZTogXCJGZWF0dXJlQ29sbGVjdGlvblwiLFxuICAgICAgICAgIGZlYXR1cmVzOiByZW5kZXJHZW9qc29uKGxpc3QpXG4gICAgICAgIH07XG5cblxuXG4gICAgICAgIEwuZ2VvSlNPTihnZW9qc29uLCB7XG4gICAgICAgICAgICBwb2ludFRvTGF5ZXI6IChmZWF0dXJlLCBsYXRsbmcpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgZXZlbnRUeXBlID0gZmVhdHVyZS5wcm9wZXJ0aWVzLmV2ZW50UHJvcGVydGllcy5ldmVudF90eXBlO1xuICAgICAgICAgICAgICB2YXIgZ2VvanNvbk1hcmtlck9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgICByYWRpdXM6IDYsXG4gICAgICAgICAgICAgICAgICBmaWxsQ29sb3I6ICBldmVudFR5cGUgJiYgZXZlbnRUeXBlLnRvTG93ZXJDYXNlKCkgPT09ICdncm91cCcgPyBcIiMzYzJlODFcIiA6IFwiIzNjMmU4MVwiLFxuICAgICAgICAgICAgICAgICAgY29sb3I6IFwid2hpdGVcIixcbiAgICAgICAgICAgICAgICAgIHdlaWdodDogNCxcbiAgICAgICAgICAgICAgICAgIG9wYWNpdHk6IDAuNSxcbiAgICAgICAgICAgICAgICAgIGZpbGxPcGFjaXR5OiAwLjgsXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIHJldHVybiBMLmNpcmNsZU1hcmtlcihsYXRsbmcsIGdlb2pzb25NYXJrZXJPcHRpb25zKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICBvbkVhY2hGZWF0dXJlOiAoZmVhdHVyZSwgbGF5ZXIpID0+IHtcbiAgICAgICAgICAgIGlmIChmZWF0dXJlLnByb3BlcnRpZXMgJiYgZmVhdHVyZS5wcm9wZXJ0aWVzLnBvcHVwQ29udGVudCkge1xuICAgICAgICAgICAgICBsYXllci5iaW5kUG9wdXAoZmVhdHVyZS5wcm9wZXJ0aWVzLnBvcHVwQ29udGVudCxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogZmVhdHVyZS5wcm9wZXJ0aWVzLnBvcHVwQ2xhc3NOYW1lXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSkuYWRkVG8obWFwKTtcblxuICAgICAgfSxcbiAgICAgIHVwZGF0ZTogKHApID0+IHtcbiAgICAgICAgaWYgKCFwIHx8ICFwLmxhdCB8fCAhcC5sbmcgKSByZXR1cm47XG5cbiAgICAgICAgbWFwLnNldFZpZXcoTC5sYXRMbmcocC5sYXQsIHAubG5nKSwgMTApO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn0pKGpRdWVyeSk7XG4iLCJjb25zdCBRdWVyeU1hbmFnZXIgPSAoKCQpID0+IHtcbiAgcmV0dXJuICh0YXJnZXRGb3JtID0gXCJmb3JtI2ZpbHRlcnMtZm9ybVwiKSA9PiB7XG4gICAgY29uc3QgJHRhcmdldCA9IHR5cGVvZiB0YXJnZXRGb3JtID09PSAnc3RyaW5nJyA/ICQodGFyZ2V0Rm9ybSkgOiB0YXJnZXRGb3JtO1xuICAgIGxldCBsYXQgPSBudWxsO1xuICAgIGxldCBsbmcgPSBudWxsO1xuXG4gICAgbGV0IHByZXZpb3VzID0ge307XG5cbiAgICAkdGFyZ2V0Lm9uKCdzdWJtaXQnLCAoZSkgPT4ge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgbGF0ID0gJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbCgpO1xuICAgICAgbG5nID0gJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbCgpO1xuXG4gICAgICB2YXIgZm9ybSA9ICQuZGVwYXJhbSgkdGFyZ2V0LnNlcmlhbGl6ZSgpKTtcblxuICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAkLnBhcmFtKGZvcm0pO1xuICAgIH0pXG5cbiAgICAkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJy5maWx0ZXItaXRlbSBpbnB1dFt0eXBlPWNoZWNrYm94XScsICgpID0+IHtcbiAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgfSlcblxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGluaXRpYWxpemU6IChjYWxsYmFjaykgPT4ge1xuICAgICAgICBpZiAod2luZG93LmxvY2F0aW9uLmhhc2gubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHZhciBwYXJhbXMgPSAkLmRlcGFyYW0od2luZG93LmxvY2F0aW9uLmhhc2guc3Vic3RyaW5nKDEpKVxuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGFuZ11cIikudmFsKHBhcmFtcy5sYW5nKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKHBhcmFtcy5sYXQpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwocGFyYW1zLmxuZyk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDFdXCIpLnZhbChwYXJhbXMuYm91bmQxKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMl1cIikudmFsKHBhcmFtcy5ib3VuZDIpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG9jXVwiKS52YWwocGFyYW1zLmxvYyk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1rZXldXCIpLnZhbChwYXJhbXMua2V5KTtcblxuICAgICAgICAgIGlmIChwYXJhbXMuZmlsdGVyKSB7XG4gICAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCIuZmlsdGVyLWl0ZW0gaW5wdXRbdHlwZT1jaGVja2JveF1cIikucmVtb3ZlUHJvcChcImNoZWNrZWRcIik7XG4gICAgICAgICAgICBwYXJhbXMuZmlsdGVyLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgICAgICAgICR0YXJnZXQuZmluZChcIi5maWx0ZXItaXRlbSBpbnB1dFt0eXBlPWNoZWNrYm94XVt2YWx1ZT0nXCIgKyBpdGVtICsgXCInXVwiKS5wcm9wKFwiY2hlY2tlZFwiLCB0cnVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZ2V0UGFyYW1ldGVyczogKCkgPT4ge1xuICAgICAgICB2YXIgcGFyYW1ldGVycyA9ICQuZGVwYXJhbSgkdGFyZ2V0LnNlcmlhbGl6ZSgpKTtcbiAgICAgICAgLy8gcGFyYW1ldGVyc1snbG9jYXRpb24nXSA7XG5cbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gcGFyYW1ldGVycykge1xuICAgICAgICAgIGlmICggIXBhcmFtZXRlcnNba2V5XSB8fCBwYXJhbWV0ZXJzW2tleV0gPT0gXCJcIikge1xuICAgICAgICAgICAgZGVsZXRlIHBhcmFtZXRlcnNba2V5XTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGFyYW1ldGVycztcbiAgICAgIH0sXG4gICAgICB1cGRhdGVMb2NhdGlvbjogKGxhdCwgbG5nKSA9PiB7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwobGF0KTtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbChsbmcpO1xuICAgICAgICAvLyAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZVZpZXdwb3J0OiAodmlld3BvcnQpID0+IHtcblxuICAgICAgICBjb25zdCBib3VuZHMgPSBbW3ZpZXdwb3J0LmYuYiwgdmlld3BvcnQuYi5iXSwgW3ZpZXdwb3J0LmYuZiwgdmlld3BvcnQuYi5mXV07XG5cbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDFdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMF0pKTtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDJdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMV0pKTtcbiAgICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGVWaWV3cG9ydEJ5Qm91bmQ6IChzdywgbmUpID0+IHtcblxuICAgICAgICBjb25zdCBib3VuZHMgPSBbc3csIG5lXTsvLy8vLy8vL1xuXG4gICAgICAgIFxuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMV1cIikudmFsKEpTT04uc3RyaW5naWZ5KGJvdW5kc1swXSkpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMl1cIikudmFsKEpTT04uc3RyaW5naWZ5KGJvdW5kc1sxXSkpO1xuICAgICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfSxcbiAgICAgIHRyaWdnZXJTdWJtaXQ6ICgpID0+IHtcbiAgICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pKGpRdWVyeSk7XG4iLCJsZXQgYXV0b2NvbXBsZXRlTWFuYWdlcjtcbmxldCBtYXBNYW5hZ2VyO1xuXG4oZnVuY3Rpb24oJCkge1xuXG4gIC8vIDEuIGdvb2dsZSBtYXBzIGdlb2NvZGVcblxuICAvLyAyLiBmb2N1cyBtYXAgb24gZ2VvY29kZSAodmlhIGxhdC9sbmcpXG4gIGNvbnN0IHF1ZXJ5TWFuYWdlciA9IFF1ZXJ5TWFuYWdlcigpO1xuICAgICAgICBxdWVyeU1hbmFnZXIuaW5pdGlhbGl6ZSgpO1xuXG4gIGNvbnN0IGluaXRQYXJhbXMgPSBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpO1xuICBtYXBNYW5hZ2VyID0gTWFwTWFuYWdlcih7XG4gICAgb25Nb3ZlOiAoc3csIG5lKSA9PiB7XG4gICAgICAvLyBXaGVuIHRoZSBtYXAgbW92ZXMgYXJvdW5kLCB3ZSB1cGRhdGUgdGhlIGxpc3RcbiAgICAgIHF1ZXJ5TWFuYWdlci51cGRhdGVWaWV3cG9ydEJ5Qm91bmQoc3csIG5lKTtcbiAgICAgIC8vdXBkYXRlIFF1ZXJ5XG4gICAgfVxuICB9KTtcblxuICB3aW5kb3cuaW5pdGlhbGl6ZUF1dG9jb21wbGV0ZUNhbGxiYWNrID0gKCkgPT4ge1xuXG4gICAgYXV0b2NvbXBsZXRlTWFuYWdlciA9IEF1dG9jb21wbGV0ZU1hbmFnZXIoXCJpbnB1dFtuYW1lPSdsb2MnXVwiKTtcbiAgICBhdXRvY29tcGxldGVNYW5hZ2VyLmluaXRpYWxpemUoKTtcblxuICAgIGlmIChpbml0UGFyYW1zLmxvYyAmJiBpbml0UGFyYW1zLmxvYyAhPT0gJycgJiYgKCFpbml0UGFyYW1zLmJvdW5kMSAmJiAhaW5pdFBhcmFtcy5ib3VuZDIpKSB7XG4gICAgICBtYXBNYW5hZ2VyLmluaXRpYWxpemUoKCkgPT4ge1xuICAgICAgICBtYXBNYW5hZ2VyLmdldENlbnRlckJ5TG9jYXRpb24oaW5pdFBhcmFtcy5sb2MsIChyZXN1bHQpID0+IHtcbiAgICAgICAgICBxdWVyeU1hbmFnZXIudXBkYXRlVmlld3BvcnQocmVzdWx0Lmdlb21ldHJ5LnZpZXdwb3J0KTtcbiAgICAgICAgfSk7XG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG5cbiAgY29uc3QgbGFuZ3VhZ2VNYW5hZ2VyID0gTGFuZ3VhZ2VNYW5hZ2VyKCk7XG5cbiAgbGFuZ3VhZ2VNYW5hZ2VyLmluaXRpYWxpemUoaW5pdFBhcmFtc1snbGFuZyddIHx8ICdlbicpO1xuXG4gIGNvbnN0IGxpc3RNYW5hZ2VyID0gTGlzdE1hbmFnZXIoKTtcblxuICBpZihpbml0UGFyYW1zLmxhdCAmJiBpbml0UGFyYW1zLmxuZykge1xuICAgIG1hcE1hbmFnZXIuc2V0Q2VudGVyKFtpbml0UGFyYW1zLmxhdCwgaW5pdFBhcmFtcy5sbmddKTtcbiAgfVxuXG4gIC8qKipcbiAgKiBMaXN0IEV2ZW50c1xuICAqIFRoaXMgd2lsbCB0cmlnZ2VyIHRoZSBsaXN0IHVwZGF0ZSBtZXRob2RcbiAgKi9cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGlzdC11cGRhdGUnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcbiAgICBsaXN0TWFuYWdlci5wb3B1bGF0ZUxpc3Qob3B0aW9ucy5wYXJhbXMsIG9wdGlvbnMuZGF0YSk7XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIGxpc3RNYW5hZ2VyLnVwZGF0ZUZpbHRlcihvcHRpb25zKTtcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGlzdC1maWx0ZXItYnktYm91bmQnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcbiAgICBsZXQgYm91bmQxLCBib3VuZDI7XG5cbiAgICBpZiAoIW9wdGlvbnMgfHwgIW9wdGlvbnMuYm91bmQxIHx8ICFvcHRpb25zLmJvdW5kMikge1xuICAgICAgW2JvdW5kMSwgYm91bmQyXSA9IG1hcE1hbmFnZXIuZ2V0Qm91bmRzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJvdW5kMSA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDEpO1xuICAgICAgYm91bmQyID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMik7XG4gICAgfVxuXG5cblxuICAgIGxpc3RNYW5hZ2VyLnVwZGF0ZUJvdW5kcyhib3VuZDEsIGJvdW5kMilcbiAgfSlcblxuICAvKioqXG4gICogTWFwIEV2ZW50c1xuICAqL1xuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtdXBkYXRlJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgLy8gbWFwTWFuYWdlci5zZXRDZW50ZXIoW29wdGlvbnMubGF0LCBvcHRpb25zLmxuZ10pO1xuICAgIGlmICghb3B0aW9ucyB8fCAhb3B0aW9ucy5ib3VuZDEgfHwgIW9wdGlvbnMuYm91bmQyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGJvdW5kMSA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDEpO1xuICAgIHZhciBib3VuZDIgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQyKTtcbiAgICBtYXBNYW5hZ2VyLnNldEJvdW5kcyhib3VuZDEsIGJvdW5kMik7XG4gICAgLy8gY29uc29sZS5sb2cob3B0aW9ucylcbiAgfSk7XG4gIC8vIDMuIG1hcmtlcnMgb24gbWFwXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLW1hcC1wbG90JywgKGUsIG9wdCkgPT4ge1xuXG4gICAgbWFwTWFuYWdlci5wbG90UG9pbnRzKG9wdC5kYXRhLCBvcHQucGFyYW1zKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1maWx0ZXInKTtcbiAgfSlcblxuICAvLyBGaWx0ZXIgbWFwXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLW1hcC1maWx0ZXInLCAoZSwgb3B0KSA9PiB7XG4gICAgaWYgKG9wdCkge1xuICAgICAgbWFwTWFuYWdlci5maWx0ZXJNYXAob3B0LmZpbHRlcik7XG4gICAgfVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1sYW5ndWFnZS11cGRhdGUnLCAoZSwgb3B0KSA9PiB7XG4gICAgaWYgKG9wdCkge1xuICAgICAgbGFuZ3VhZ2VNYW5hZ2VyLnVwZGF0ZUxhbmd1YWdlKG9wdC5sYW5nKTtcbiAgICB9XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICdidXR0b24jc2hvdy1oaWRlLW1hcCcsIChlLCBvcHQpID0+IHtcbiAgICAkKCdib2R5JykudG9nZ2xlQ2xhc3MoJ21hcC12aWV3JylcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJ2J1dHRvbiNzaG93LW1hcCcsIChlLCBvcHQpID0+IHtcbiAgICAkKCdib2R5JykuYWRkQ2xhc3MoJ21hcC12aWV3Jyk7XG5cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBtYXBNYW5hZ2VyLnJlZnJlc2hNYXAoKTtcbiAgICAgIH0sIDEwKVxuXG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICdidXR0b24jc2hvdy1saXN0JywgKGUsIG9wdCkgPT4ge1xuICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbWFwLXZpZXcnKTtcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJ2J1dHRvbi5idG4ubW9yZS1pdGVtcycsIChlLCBvcHQpID0+IHtcbiAgICAkKCcjZW1iZWQtYXJlYScpLnRvZ2dsZUNsYXNzKCdvcGVuJyk7XG4gIH0pXG5cbiAgLy8gU2hvd3MgcG9pbnRlcnMgd2l0aGluIG1hcFxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1zaG93LW1hcmtlcicsIChlLCBvcHQpID0+IHtcbiAgICBsZXQgbGF0ID0gb3B0LmxhdCwgbG5nID0gb3B0LmxuZywgY2xhc3NOYW1lID0gYCR7b3B0LmxhdH0tLSR7b3B0LmxuZ31gO1xuICAgIG1hcE1hbmFnZXIuc2hvd01hcE1hcmtlcihsYXQsIGxuZywgY2xhc3NOYW1lKTtcbiAgfSlcblxuICAvL0FkZCBldmVudCB0byBsaXN0TWFuYWdlclxuICAkKGRvY3VtZW50KS5vbignbW91c2VlbnRlcicsICdkaXYjZXZlbnRzLWxpc3QgdWwgbGkuZXZlbnQtb2JqJywgKGUpID0+IHtcbiAgICBtYXBNYW5hZ2VyLnNob3dNYXBNYXJrZXIoJChlLmN1cnJlbnRUYXJnZXQpLmRhdGEoJ2xhdCcpLCAkKGUuY3VycmVudFRhcmdldCkuZGF0YSgnbG5nJykpO1xuICB9KVxuXG4gICQoZG9jdW1lbnQpLm9uKCdtb3VzZWVudGVyJywgJ3NlY3Rpb24jbWFwJywgKGUpID0+IHtcbiAgICBtYXBNYW5hZ2VyLnNob3dNYXBNYXJrZXIoKTtcbiAgfSlcblxuICAvLyAkKGRvY3VtZW50KS5vbigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCAoZSwgb3B0KSA9PiB7XG4gIC8vICAgLy91cGRhdGUgZW1iZWQgbGluZVxuICAvLyAgIHZhciBjb3B5ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvcHQpKTtcbiAgLy8gICBkZWxldGUgY29weVsnbG5nJ107XG4gIC8vICAgZGVsZXRlIGNvcHlbJ2xhdCddO1xuICAvLyAgIGRlbGV0ZSBjb3B5Wydib3VuZDEnXTtcbiAgLy8gICBkZWxldGUgY29weVsnYm91bmQyJ107XG4gIC8vXG4gIC8vICAgJCgnI2VtYmVkLWFyZWEgaW5wdXRbbmFtZT1lbWJlZF0nKS52YWwoJyMnICsgJC5wYXJhbShjb3B5KSk7XG4gIC8vIH0pO1xuXG4gICQod2luZG93KS5vbihcInJlc2l6ZVwiLCAoZSkgPT4ge1xuICAgIG1hcE1hbmFnZXIucmVmcmVzaE1hcCgpO1xuICB9KTtcblxuICAkKHdpbmRvdykub24oXCJoYXNoY2hhbmdlXCIsIChldmVudCkgPT4ge1xuICAgIGNvbnN0IGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaDtcbiAgICBpZiAoaGFzaC5sZW5ndGggPT0gMCkgcmV0dXJuO1xuICAgIGNvbnN0IHBhcmFtZXRlcnMgPSAkLmRlcGFyYW0oaGFzaC5zdWJzdHJpbmcoMSkpO1xuICAgIGNvbnN0IG9sZFVSTCA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQub2xkVVJMO1xuXG5cbiAgICBjb25zdCBvbGRIYXNoID0gJC5kZXBhcmFtKG9sZFVSTC5zdWJzdHJpbmcob2xkVVJMLnNlYXJjaChcIiNcIikrMSkpO1xuXG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1maWx0ZXInLCBwYXJhbWV0ZXJzKTtcbiAgICAvLyAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLXVwZGF0ZS1lbWJlZCcsIHBhcmFtZXRlcnMpO1xuXG4gICAgLy8gU28gdGhhdCBjaGFuZ2UgaW4gZmlsdGVycyB3aWxsIG5vdCB1cGRhdGUgdGhpc1xuICAgIGlmIChvbGRIYXNoLmJvdW5kMSAhPT0gcGFyYW1ldGVycy5ib3VuZDEgfHwgb2xkSGFzaC5ib3VuZDIgIT09IHBhcmFtZXRlcnMuYm91bmQyKSB7XG5cbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLXVwZGF0ZScsIHBhcmFtZXRlcnMpO1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci1ieS1ib3VuZCcsIHBhcmFtZXRlcnMpO1xuICAgIH1cblxuICAgIC8vIENoYW5nZSBpdGVtc1xuICAgIGlmIChvbGRIYXNoLmxhbmcgIT09IHBhcmFtZXRlcnMubGFuZykge1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1sYW5ndWFnZS11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICB9XG4gIH0pXG5cbiAgLy8gNC4gZmlsdGVyIG91dCBpdGVtcyBpbiBhY3Rpdml0eS1hcmVhXG5cbiAgLy8gNS4gZ2V0IG1hcCBlbGVtZW50c1xuXG4gIC8vIDYuIGdldCBHcm91cCBkYXRhXG5cbiAgLy8gNy4gcHJlc2VudCBncm91cCBlbGVtZW50c1xuXG4gICQuYWpheCh7XG4gICAgdXJsOiAnaHR0cHM6Ly9vY2FzaW8yMDE4LmNvbS9hcGkvZXZlbnRzP2NhbmRpZGF0ZT1hbGV4YW5kcmlhLW9jYXNpby1jb3J0ZXonLCAvLyd8KipEQVRBX1NPVVJDRSoqfCcsXG4gICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICBzdWNjZXNzOiAoZGF0YSkgPT4ge1xuICAgICAgLy8gY29uc29sZS5sb2coZGF0YSk7XG4gICAgICB2YXIgcGFyYW1ldGVycyA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG4gICAgICB2YXIgdGFyZ2V0RGF0YSA9IGRhdGEubWFwKChpdGVtKT0+e1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGF0OiBpdGVtLmxvY2F0aW9uLmxvY2F0aW9uLmxhdGl0dWRlLFxuICAgICAgICAgICAgZXZlbnRfdHlwZTogaXRlbS50eXBlLFxuICAgICAgICAgICAgc3VwZXJncm91cDogXCJPY2FzaW8gZm9yIFVTIENvbmdyZXNzXCIsXG4gICAgICAgICAgICBzdGFydF9kYXRldGltZTogaXRlbS5zdGFydF9kYXRlLFxuICAgICAgICAgICAgdHo6IFwiRVNUXCIsXG4gICAgICAgICAgICB2ZW51ZTogYDxzdHJvbmc+JHtpdGVtLmxvY2F0aW9uLnZlbnVlfS4gPC9zdHJvbmc+YCArIFtpdGVtLmxvY2F0aW9uLmFkZHJlc3NfbGluZXMuam9pbiggKSwgaXRlbS5sb2NhdGlvbi5sb2NhbGl0eSwgaXRlbS5sb2NhdGlvbi5yZWdpb24sIGl0ZW0ubG9jYXRpb24ucG9zdGFsX2NvZGVdLmpvaW4oXCIgXCIpLFxuICAgICAgICAgICAgbG5nOiBpdGVtLmxvY2F0aW9uLmxvY2F0aW9uLmxvbmdpdHVkZSxcbiAgICAgICAgICAgIHVybDogaXRlbS5icm93c2VyX3VybCxcbiAgICAgICAgICAgIHRpdGxlOiBpdGVtLnRpdGxlLFxuICAgICAgICAgICAgZ3JvdXA6IG51bGxcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyAkKCcjZXZlbnRzLWNvdW50JykudGV4dChgJHt3aW5kb3cuRVZFTlRTX0RBVEEubGVuZ3RofSBXYWxrb3V0cyBhbmQgQ291bnRpbmdgKS5jc3MoJ29wYWNpdHknLCAxKTtcblxuICAgICAgdGFyZ2V0RGF0YS5zb3J0KChhLCBiKSA9PiBuZXcgRGF0ZShhLnN0YXJ0X2RhdGV0aW1lKSAtIG5ldyBEYXRlKGIuc3RhcnRfZGF0ZXRpbWUpKTtcbiAgICAgIHRhcmdldERhdGEuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICBpdGVtWydldmVudF90eXBlJ10gPSAnQWN0aW9uJztcbiAgICAgIH0pO1xuXG5cbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC11cGRhdGUnLCB7IHBhcmFtczogcGFyYW1ldGVycywgZGF0YTogdGFyZ2V0RGF0YSB9KTtcbiAgICAgIC8vICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1wbG90JywgeyBkYXRhOiB0YXJnZXREYXRhLCBwYXJhbXM6IHBhcmFtZXRlcnMgfSk7XG4gICAgICAvLyAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLXVwZGF0ZS1lbWJlZCcsIHBhcmFtZXRlcnMpO1xuICAgICAgLy9UT0RPOiBNYWtlIHRoZSBnZW9qc29uIGNvbnZlcnNpb24gaGFwcGVuIG9uIHRoZSBiYWNrZW5kXG5cbiAgICAgIC8vUmVmcmVzaCB0aGluZ3NcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBsZXQgcCA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG4gICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLXVwZGF0ZScsIHApO1xuICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1maWx0ZXInLCBwKTtcbiAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBwKTtcbiAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci1ieS1ib3VuZCcsIHApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCkpXG4gICAgICB9LCAxMDApO1xuXG5cbiAgICAgIHZhciBkaXN0cmljdF9ib3VuZGFyeSA9IG5ldyBMLmdlb0pzb24obnVsbCwge1xuICAgICAgICBjbGlja2FibGU6IGZhbHNlXG4gICAgICB9KTtcbiAgICAgIGRpc3RyaWN0X2JvdW5kYXJ5LmFkZFRvKG1hcE1hbmFnZXIuZ2V0TWFwKCkpO1xuICAgICAgJC5hamF4KHtcbiAgICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxuICAgICAgICB1cmw6IFwiL2RhdGEvTlktMTQuanNvblwiLFxuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgLy8gJChkYXRhLmdlb2pzb24pLmVhY2goZnVuY3Rpb24oa2V5LCBpdGVtKSB7XG4gICAgICAgICAgICBkaXN0cmljdF9ib3VuZGFyeVxuICAgICAgICAgICAgICAuYWRkRGF0YShkYXRhLmdlb2pzb24pXG4gICAgICAgICAgICAgIC5zZXRTdHlsZSh7XG4gICAgICAgICAgICAgICAgZmlsbENvbG9yOiAncmdiYSg2MCwgNDYsIDEyOSwgMC4yNiknLFxuICAgICAgICAgICAgICAgIGNvbG9yOiAncmdiYSg2MCwgNDYsIDEyOSwgMC44KSdcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBpZiAoIXBhcmFtcy56aXBjb2RlIHx8IHBhcmFtcy56aXBjb2RlID09PSAnJykge1xuXG4gICAgICAgICAgICAvLyB9XG4gICAgICAgICAgLy8gfSk7XG4gICAgICAgICAgLy8gY29uc29sZS5sb2coZGlzdHJpY3RfYm91bmRhcnkpO1xuICAgICAgICAgIG1hcE1hbmFnZXIuZ2V0TWFwKClcbiAgICAgICAgICAgIC5maXRCb3VuZHMoZGlzdHJpY3RfYm91bmRhcnkuZ2V0Qm91bmRzKCksIHsgYW5pbWF0ZTogZmFsc2UgfSk7XG4gICAgICAgICAgZGlzdHJpY3RfYm91bmRhcnkuYnJpbmdUb0JhY2soKTtcbiAgICAgICAgfVxuICAgICAgfSkuZXJyb3IoZnVuY3Rpb24oKSB7fSk7XG4gICAgfVxuICB9KTtcblxuXG5cbn0pKGpRdWVyeSk7XG4iXX0=
