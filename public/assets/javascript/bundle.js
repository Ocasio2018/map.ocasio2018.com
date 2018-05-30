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


        // $target.find('ul li.event-obj, ul li.group-obj').each((ind, item)=> {
        //
        //   let _lat = $(item).data('lat'),
        //       _lng = $(item).data('lng');
        //
        //   // console.log("updateBounds", item)
        //   if (bound1[0] <= _lat && bound2[0] >= _lat && bound1[1] <= _lng && bound2[1] >= _lng) {
        //     // console.log("Adding bounds");
        //     $(item).addClass('within-bound');
        //   } else {
        //     $(item).removeClass('within-bound');
        //   }
        // });
        // $(item).addClass('within-bound');

        // Orders the set to nearest
        var latCenter = (bound1[0] + bound2[0]) / 2,
            lngCenter = (bound1[1] + bound2[1]) / 2;
        var sortList = function sortList(a, b) {
          var _latA = $(a).data('lat'),
              _latB = $(b).data('lat'),
              _lngA = $(a).data('lng'),
              _lngB = $(b).data('lng');

          var distA = Math.sqrt(Math.pow(latCenter - _latA, 2) + Math.pow(lngCenter - _lngA, 2)),
              distB = Math.sqrt(Math.pow(latCenter - _latB, 2) + Math.pow(lngCenter - _lngB, 2));

          $(a).attr('data-distance', distA);

          return distA - distB;
        };

        $target.find('ul li.event-obj, ul li.group-obj').sort(sortList).appendTo($target.find('ul'));
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
      map.scrollWheelZoom.disable();
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
              fillColor: eventType && eventType.toLowerCase() === 'group' ? "#40D7D4" : "#572582",
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

  // console.log(window.EVENTS_URL || 'https://d2hh11l1aj2kg1.cloudfront.net/data/womensmarch.js.gz');
  $.ajax({
    url: 'http://map.justicedemocrats.com/api/events?candidate=alexandria-ocasio-cortez', //'|**DATA_SOURCE**|',
    dataType: 'json',
    success: function success(data) {
      console.log(data);
      var parameters = queryManager.getParameters();
      var targetData = data.map(function (item) {
        return {
          lat: item.location.location.latitude,
          event_type: item.type,
          supergroup: "Ocasio for US Congress",
          start_datetime: item.start_date,
          tz: "EST",
          venue: item.location.venue + [item.location.address_lines.join(), item.location.locality, item.location.region, item.location.postal_code].join(" "),
          lng: item.location.location.longitude,
          url: item.browser_url,
          title: item.title,
          group: null
        };
      });

      // $('#events-count').text(`${window.EVENTS_DATA.length} Walkouts and Counting`).css('opacity', 1);


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
            fillColor: 'rgba(87, 37, 125, 0.26)',
            color: 'rgba(87, 37, 125, 0.8)'
          });
          // if (!params.zipcode || params.zipcode === '') {

          // }
          // });
          console.log(district_boundary);
          mapManager.getMap().fitBounds(district_boundary.getBounds(), { animate: false });
          district_boundary.bringToBack();
        }
      }).error(function () {});
    }
  });
})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9sYW5ndWFnZS5qcyIsImNsYXNzZXMvbGlzdC5qcyIsImNsYXNzZXMvbWFwLmpzIiwiY2xhc3Nlcy9xdWVyeS5qcyIsImFwcC5qcyJdLCJuYW1lcyI6WyJBdXRvY29tcGxldGVNYW5hZ2VyIiwiJCIsInRhcmdldCIsIkFQSV9LRVkiLCJ0YXJnZXRJdGVtIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwicXVlcnlNZ3IiLCJRdWVyeU1hbmFnZXIiLCJnZW9jb2RlciIsImdvb2dsZSIsIm1hcHMiLCJHZW9jb2RlciIsIiR0YXJnZXQiLCJpbml0aWFsaXplIiwidHlwZWFoZWFkIiwiaGludCIsImhpZ2hsaWdodCIsIm1pbkxlbmd0aCIsImNsYXNzTmFtZXMiLCJtZW51IiwibmFtZSIsImRpc3BsYXkiLCJpdGVtIiwiZm9ybWF0dGVkX2FkZHJlc3MiLCJsaW1pdCIsInNvdXJjZSIsInEiLCJzeW5jIiwiYXN5bmMiLCJnZW9jb2RlIiwiYWRkcmVzcyIsInJlc3VsdHMiLCJzdGF0dXMiLCJvbiIsIm9iaiIsImRhdHVtIiwiZ2VvbWV0cnkiLCJ1cGRhdGVWaWV3cG9ydCIsInZpZXdwb3J0IiwialF1ZXJ5IiwiTGFuZ3VhZ2VNYW5hZ2VyIiwibGFuZ3VhZ2UiLCJkaWN0aW9uYXJ5IiwiJHRhcmdldHMiLCJ1cGRhdGVQYWdlTGFuZ3VhZ2UiLCJ0YXJnZXRMYW5ndWFnZSIsInJvd3MiLCJmaWx0ZXIiLCJpIiwibGFuZyIsImVhY2giLCJpbmRleCIsInRhcmdldEF0dHJpYnV0ZSIsImRhdGEiLCJsYW5nVGFyZ2V0IiwidGV4dCIsInZhbCIsImF0dHIiLCJ0YXJnZXRzIiwiYWpheCIsInVybCIsImRhdGFUeXBlIiwic3VjY2VzcyIsInVwZGF0ZUxhbmd1YWdlIiwiTGlzdE1hbmFnZXIiLCJ0YXJnZXRMaXN0IiwicmVuZGVyRXZlbnQiLCJnbXREYXRlIiwiRGF0ZSIsInN0YXJ0X2RhdGV0aW1lIiwidG9HTVRTdHJpbmciLCJkYXRlIiwibW9tZW50IiwiZm9ybWF0IiwiZ2V0SG91cnMiLCJtYXRjaCIsImV2ZW50X3R5cGUiLCJsYXQiLCJsbmciLCJ0aXRsZSIsInZlbnVlIiwicmVuZGVyR3JvdXAiLCJ3ZWJzaXRlIiwic3VwZXJncm91cCIsImxvY2F0aW9uIiwiZGVzY3JpcHRpb24iLCIkbGlzdCIsInVwZGF0ZUZpbHRlciIsInAiLCJyZW1vdmVQcm9wIiwiYWRkQ2xhc3MiLCJqb2luIiwidXBkYXRlQm91bmRzIiwiYm91bmQxIiwiYm91bmQyIiwibGF0Q2VudGVyIiwibG5nQ2VudGVyIiwic29ydExpc3QiLCJhIiwiYiIsIl9sYXRBIiwiX2xhdEIiLCJfbG5nQSIsIl9sbmdCIiwiZGlzdEEiLCJNYXRoIiwic3FydCIsInBvdyIsImRpc3RCIiwiZmluZCIsInNvcnQiLCJhcHBlbmRUbyIsInBvcHVsYXRlTGlzdCIsImhhcmRGaWx0ZXJzIiwidGFyZ2V0RGF0YSIsImtleVNldCIsImtleSIsInNwbGl0IiwiJGV2ZW50TGlzdCIsIm1hcCIsImxlbmd0aCIsInRvTG93ZXJDYXNlIiwiaW5jbHVkZXMiLCJyZW1vdmUiLCJhcHBlbmQiLCJNYXBNYW5hZ2VyIiwiTEFOR1VBR0UiLCJtYXBNYXJrZXIiLCJ3bUljb24iLCJMIiwiaWNvbiIsImljb25VcmwiLCJpY29uU2l6ZSIsImljb25BbmNob3IiLCJwb3B1cEFuY2hvciIsInNoYWRvd1VybCIsInNoYWRvd1NpemUiLCJzaGFkb3dBbmNob3IiLCJyZW5kZXJHZW9qc29uIiwibGlzdCIsImRpY3RMYXRMbmciLCJmb3JFYWNoIiwicHVzaCIsIm1hcEl0ZW1zIiwiT2JqZWN0Iiwia2V5cyIsInBhcnNlRmxvYXQiLCJldmVudHMiLCJyZW5kZXJlZCIsInR5cGUiLCJjb29yZGluYXRlcyIsInByb3BlcnRpZXMiLCJldmVudFByb3BlcnRpZXMiLCJwb3B1cENvbnRlbnQiLCJwb3B1cENsYXNzTmFtZSIsIm9wdGlvbnMiLCJCcm93c2VyIiwibW9iaWxlIiwiZHJhZ2dpbmciLCJzZXRWaWV3Iiwid2luZG93IiwiQ1VTVE9NX0NPT1JEIiwiQ1VTVE9NX1pPT00iLCJzY3JvbGxXaGVlbFpvb20iLCJkaXNhYmxlIiwib25Nb3ZlIiwiZXZlbnQiLCJzdyIsImdldEJvdW5kcyIsIl9zb3V0aFdlc3QiLCJuZSIsIl9ub3J0aEVhc3QiLCJodHRwcyIsInRpbGVMYXllciIsImF0dHJpYnV0aW9uIiwibWF4Wm9vbSIsImFkZFRvIiwiJG1hcCIsImNhbGxiYWNrIiwiZ2V0TWFwIiwic2V0Qm91bmRzIiwiYm91bmRzMSIsImJvdW5kczIiLCJib3VuZHMiLCJmaXRCb3VuZHMiLCJzZXRDZW50ZXIiLCJjZW50ZXIiLCJ6b29tIiwiZ2V0Q2VudGVyQnlMb2NhdGlvbiIsInNob3dNYXBNYXJrZXIiLCJ1bmRlZmluZWQiLCJyZW1vdmVMYXllciIsIk1hcmtlciIsInJlZnJlc2hNYXAiLCJpbnZhbGlkYXRlU2l6ZSIsImZpbHRlck1hcCIsImZpbHRlcnMiLCJoaWRlIiwic2hvdyIsInBsb3RQb2ludHMiLCJnZW9qc29uIiwiZmVhdHVyZXMiLCJnZW9KU09OIiwicG9pbnRUb0xheWVyIiwiZmVhdHVyZSIsImxhdGxuZyIsImV2ZW50VHlwZSIsImdlb2pzb25NYXJrZXJPcHRpb25zIiwicmFkaXVzIiwiZmlsbENvbG9yIiwiY29sb3IiLCJ3ZWlnaHQiLCJvcGFjaXR5IiwiZmlsbE9wYWNpdHkiLCJjaXJjbGVNYXJrZXIiLCJvbkVhY2hGZWF0dXJlIiwibGF5ZXIiLCJiaW5kUG9wdXAiLCJjbGFzc05hbWUiLCJ1cGRhdGUiLCJsYXRMbmciLCJ0YXJnZXRGb3JtIiwicHJldmlvdXMiLCJlIiwicHJldmVudERlZmF1bHQiLCJmb3JtIiwiZGVwYXJhbSIsInNlcmlhbGl6ZSIsImhhc2giLCJwYXJhbSIsInRyaWdnZXIiLCJwYXJhbXMiLCJzdWJzdHJpbmciLCJsb2MiLCJwcm9wIiwiZ2V0UGFyYW1ldGVycyIsInBhcmFtZXRlcnMiLCJ1cGRhdGVMb2NhdGlvbiIsImYiLCJKU09OIiwic3RyaW5naWZ5IiwidXBkYXRlVmlld3BvcnRCeUJvdW5kIiwidHJpZ2dlclN1Ym1pdCIsImF1dG9jb21wbGV0ZU1hbmFnZXIiLCJtYXBNYW5hZ2VyIiwicXVlcnlNYW5hZ2VyIiwiaW5pdFBhcmFtcyIsImluaXRpYWxpemVBdXRvY29tcGxldGVDYWxsYmFjayIsInJlc3VsdCIsImxhbmd1YWdlTWFuYWdlciIsImxpc3RNYW5hZ2VyIiwicGFyc2UiLCJvcHQiLCJ0b2dnbGVDbGFzcyIsInNldFRpbWVvdXQiLCJyZW1vdmVDbGFzcyIsImN1cnJlbnRUYXJnZXQiLCJvbGRVUkwiLCJvcmlnaW5hbEV2ZW50Iiwib2xkSGFzaCIsInNlYXJjaCIsImNvbnNvbGUiLCJsb2ciLCJsYXRpdHVkZSIsInN0YXJ0X2RhdGUiLCJ0eiIsImFkZHJlc3NfbGluZXMiLCJsb2NhbGl0eSIsInJlZ2lvbiIsInBvc3RhbF9jb2RlIiwibG9uZ2l0dWRlIiwiYnJvd3Nlcl91cmwiLCJncm91cCIsImRpc3RyaWN0X2JvdW5kYXJ5IiwiZ2VvSnNvbiIsImNsaWNrYWJsZSIsImFkZERhdGEiLCJzZXRTdHlsZSIsImFuaW1hdGUiLCJicmluZ1RvQmFjayIsImVycm9yIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBOztBQUNBLElBQU1BLHNCQUF1QixVQUFTQyxDQUFULEVBQVk7QUFDdkM7O0FBRUEsU0FBTyxVQUFDQyxNQUFELEVBQVk7O0FBRWpCLFFBQU1DLFVBQVUseUNBQWhCO0FBQ0EsUUFBTUMsYUFBYSxPQUFPRixNQUFQLElBQWlCLFFBQWpCLEdBQTRCRyxTQUFTQyxhQUFULENBQXVCSixNQUF2QixDQUE1QixHQUE2REEsTUFBaEY7QUFDQSxRQUFNSyxXQUFXQyxjQUFqQjtBQUNBLFFBQUlDLFdBQVcsSUFBSUMsT0FBT0MsSUFBUCxDQUFZQyxRQUFoQixFQUFmOztBQUVBLFdBQU87QUFDTEMsZUFBU1osRUFBRUcsVUFBRixDQURKO0FBRUxGLGNBQVFFLFVBRkg7QUFHTFUsa0JBQVksc0JBQU07QUFDaEJiLFVBQUVHLFVBQUYsRUFBY1csU0FBZCxDQUF3QjtB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QURoQixFQUVHNkUsUUFGSCxDQUVZO0FBQ1JwRSx1QkFBVyx5QkFESDtBQUVSQyxtQkFBTztBQUZDLFdBRlo7QUFNQTs7QUFFQTtBQUNGO0FBQ0FtRCxrQkFBUUMsR0FBUixDQUFZVyxpQkFBWjtBQUNBN0IscUJBQVdqRSxNQUFYLEdBQ0dLLFNBREgsQ0FDYXlGLGtCQUFrQnpHLFNBQWxCLEVBRGIsRUFDNEMsRUFBRThHLFNBQVMsS0FBWCxFQUQ1QztBQUVBTCw0QkFBa0JNLFdBQWxCO0FBQ0Q7QUFuQkksT0FBUCxFQW9CR0MsS0FwQkgsQ0FvQlMsWUFBVyxDQUFFLENBcEJ0QjtBQXFCRDtBQXRFSSxHQUFQO0FBMkVELENBeFFELEVBd1FHalAsTUF4UUgiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG4vL0FQSSA6QUl6YVN5QnVqS1RSdzV1SVhwX05IWmdqWVZEdEJ5MWRieU51R0VNXG5jb25zdCBBdXRvY29tcGxldGVNYW5hZ2VyID0gKGZ1bmN0aW9uKCQpIHtcbiAgLy9Jbml0aWFsaXphdGlvbi4uLlxuXG4gIHJldHVybiAodGFyZ2V0KSA9PiB7XG5cbiAgICBjb25zdCBBUElfS0VZID0gXCJBSXphU3lEQzJOdUdFNzVqcnVrajNkdEdSSjJURUdEZktkZUExOFFcIjtcbiAgICBjb25zdCB0YXJnZXRJdGVtID0gdHlwZW9mIHRhcmdldCA9PSBcInN0cmluZ1wiID8gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpIDogdGFyZ2V0O1xuICAgIGNvbnN0IHF1ZXJ5TWdyID0gUXVlcnlNYW5hZ2VyKCk7XG4gICAgdmFyIGdlb2NvZGVyID0gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgJHRhcmdldDogJCh0YXJnZXRJdGVtKSxcbiAgICAgIHRhcmdldDogdGFyZ2V0SXRlbSxcbiAgICAgIGluaXRpYWxpemU6ICgpID0+IHtcbiAgICAgICAgJCh0YXJnZXRJdGVtKS50eXBlYWhlYWQoe1xuICAgICAgICAgICAgICAgICAgICBoaW50OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBoaWdobGlnaHQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG1pbkxlbmd0aDogNCxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lczoge1xuICAgICAgICAgICAgICAgICAgICAgIG1lbnU6ICd0dC1kcm9wZG93bi1tZW51J1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnc2VhcmNoLXJlc3VsdHMnLFxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAoaXRlbSkgPT4gaXRlbS5mb3JtYXR0ZWRfYWRkcmVzcyxcbiAgICAgICAgICAgICAgICAgICAgbGltaXQ6IDEwLFxuICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IGZ1bmN0aW9uIChxLCBzeW5jLCBhc3luYyl7XG4gICAgICAgICAgICAgICAgICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHsgYWRkcmVzczogcSB9LCBmdW5jdGlvbiAocmVzdWx0cywgc3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGFzeW5jKHJlc3VsdHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApLm9uKCd0eXBlYWhlYWQ6c2VsZWN0ZWQnLCBmdW5jdGlvbiAob2JqLCBkYXR1bSkge1xuICAgICAgICAgICAgICAgICAgICBpZihkYXR1bSlcbiAgICAgICAgICAgICAgICAgICAge1xuXG4gICAgICAgICAgICAgICAgICAgICAgdmFyIGdlb21ldHJ5ID0gZGF0dW0uZ2VvbWV0cnk7XG4gICAgICAgICAgICAgICAgICAgICAgcXVlcnlNZ3IudXBkYXRlVmlld3BvcnQoZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICAgICAgICAgICAgICAgIC8vICBtYXAuZml0Qm91bmRzKGdlb21ldHJ5LmJvdW5kcz8gZ2VvbWV0cnkuYm91bmRzIDogZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG5cblxuICAgIHJldHVybiB7XG5cbiAgICB9XG4gIH1cblxufShqUXVlcnkpKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgTGFuZ3VhZ2VNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIC8va2V5VmFsdWVcblxuICAvL3RhcmdldHMgYXJlIHRoZSBtYXBwaW5ncyBmb3IgdGhlIGxhbmd1YWdlXG4gIHJldHVybiAoKSA9PiB7XG4gICAgbGV0IGxhbmd1YWdlO1xuICAgIGxldCBkaWN0aW9uYXJ5ID0ge307XG4gICAgbGV0ICR0YXJnZXRzID0gJChcIltkYXRhLWxhbmctdGFyZ2V0XVtkYXRhLWxhbmcta2V5XVwiKTtcblxuICAgIGNvbnN0IHVwZGF0ZVBhZ2VMYW5ndWFnZSA9ICgpID0+IHtcblxuICAgICAgbGV0IHRhcmdldExhbmd1YWdlID0gZGljdGlvbmFyeS5yb3dzLmZpbHRlcigoaSkgPT4gaS5sYW5nID09PSBsYW5ndWFnZSlbMF07XG5cbiAgICAgICR0YXJnZXRzLmVhY2goKGluZGV4LCBpdGVtKSA9PiB7XG4gICAgICAgIGxldCB0YXJnZXRBdHRyaWJ1dGUgPSAkKGl0ZW0pLmRhdGEoJ2xhbmctdGFyZ2V0Jyk7XG4gICAgICAgIGxldCBsYW5nVGFyZ2V0ID0gJChpdGVtKS5kYXRhKCdsYW5nLWtleScpO1xuXG4gICAgICAgIHN3aXRjaCh0YXJnZXRBdHRyaWJ1dGUpIHtcbiAgICAgICAgICBjYXNlICd0ZXh0JzpcbiAgICAgICAgICAgICQoaXRlbSkudGV4dCh0YXJnZXRMYW5ndWFnZVtsYW5nVGFyZ2V0XSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICd2YWx1ZSc6XG4gICAgICAgICAgICAkKGl0ZW0pLnZhbCh0YXJnZXRMYW5ndWFnZVtsYW5nVGFyZ2V0XSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgJChpdGVtKS5hdHRyKHRhcmdldEF0dHJpYnV0ZSwgdGFyZ2V0TGFuZ3VhZ2VbbGFuZ1RhcmdldF0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICBsYW5ndWFnZSxcbiAgICAgIHRhcmdldHM6ICR0YXJnZXRzLFxuICAgICAgZGljdGlvbmFyeSxcbiAgICAgIGluaXRpYWxpemU6IChsYW5nKSA9PiB7XG5cbiAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAvLyB1cmw6ICdodHRwczovL2dzeDJqc29uLmNvbS9hcGk/aWQ9MU8zZUJ5akwxdmxZZjdaN2FtLV9odFJUUWk3M1BhZnFJZk5CZExtWGU4U00mc2hlZXQ9MScsXG4gICAgICAgICAgdXJsOiAnL2RhdGEvbGFuZy5qc29uJyxcbiAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PiB7XG4gICAgICAgICAgICBkaWN0aW9uYXJ5ID0gZGF0YTtcbiAgICAgICAgICAgIGxhbmd1YWdlID0gbGFuZztcbiAgICAgICAgICAgIHVwZGF0ZVBhZ2VMYW5ndWFnZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlTGFuZ3VhZ2U6IChsYW5nKSA9PiB7XG5cbiAgICAgICAgbGFuZ3VhZ2UgPSBsYW5nO1xuICAgICAgICB1cGRhdGVQYWdlTGFuZ3VhZ2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbn0pKGpRdWVyeSk7XG4iLCIvKiBUaGlzIGxvYWRzIGFuZCBtYW5hZ2VzIHRoZSBsaXN0ISAqL1xuXG5jb25zdCBMaXN0TWFuYWdlciA9ICgoJCkgPT4ge1xuICByZXR1cm4gKHRhcmdldExpc3QgPSBcIiNldmVudHMtbGlzdFwiKSA9PiB7XG4gICAgY29uc3QgJHRhcmdldCA9IHR5cGVvZiB0YXJnZXRMaXN0ID09PSAnc3RyaW5nJyA/ICQodGFyZ2V0TGlzdCkgOiB0YXJnZXRMaXN0O1xuXG4gICAgY29uc3QgcmVuZGVyRXZlbnQgPSAoaXRlbSkgPT4ge1xuICAgICAgdmFyIGdtdERhdGUgPSBuZXcgRGF0ZShpdGVtLnN0YXJ0X2RhdGV0aW1lKS50b0dNVFN0cmluZygpO1xuICAgICAgdmFyIGRhdGUgPSBtb21lbnQobmV3IERhdGUoZ210RGF0ZSkpLmZvcm1hdChuZXcgRGF0ZShpdGVtLnN0YXJ0X2RhdGV0aW1lKS5nZXRIb3VycygpID09IDAgPyBcImRkZGQgTU1NIEREXCIgOiBcImRkZGQgTU1NIERELCBoOm1tYVwiKTtcblxuICAgICAgLy8gY29uc29sZS5sb2coZGF0ZSwgbmV3IERhdGUoaXRlbS5zdGFydF9kYXRldGltZSksIG5ldyBEYXRlKGl0ZW0uc3RhcnRfZGF0ZXRpbWUpLnRvR01UU3RyaW5nKCkpXG4gICAgICBsZXQgdXJsID0gaXRlbS51cmwubWF0Y2goL15odHRwc3swLDF9Oi8pID8gaXRlbS51cmwgOiBcIi8vXCIgKyBpdGVtLnVybDtcblxuXG5cbiAgICAgIHJldHVybiBgXG4gICAgICA8bGkgY2xhc3M9JyR7aXRlbS5ldmVudF90eXBlfSBldmVudC1vYmogd2l0aGluLWJvdW5kJyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWV2ZW50IHR5cGUtYWN0aW9uXCI+XG4gICAgICAgICAgPGgyIGNsYXNzPVwiZXZlbnQtdGl0bGVcIj48YSBocmVmPVwiJHt1cmwgPT0gJy8vJyA/ICdqYXZhc2NyaXB0OiB2b2lkKG51bGwpJyA6IHVybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLnRpdGxlfTwvYT48L2gyPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1kYXRlIGRhdGVcIiBzdHlsZT1cImRpc3BsYXk6ICR7IWl0ZW0uc3RhcnRfZGF0ZXRpbWUgPyAnbm9uZScgOiAnYmxvY2snfVwiPiR7ZGF0ZX08L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtYWRkcmVzcyBhZGRyZXNzLWFyZWFcIj5cbiAgICAgICAgICAgIDxwPiR7aXRlbS52ZW51ZX08L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCIgc3R5bGU9J2Rpc3BsYXk6ICR7dXJsID09ICcvLycgPyAnbm9uZScgOiAnYmxvY2snfSc+XG4gICAgICAgICAgICA8YSBocmVmPVwiJHt1cmwgPT0gJy8vJyA/ICdqYXZhc2NyaXB0OiB2b2lkKG51bGwpJyA6IHVybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeSByc3ZwXCI+UlNWUDwvYT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2xpPlxuICAgICAgYFxuICAgIH07XG5cbiAgICBjb25zdCByZW5kZXJHcm91cCA9IChpdGVtKSA9PiB7XG4gICAgICBsZXQgdXJsID0gaXRlbS53ZWJzaXRlLm1hdGNoKC9eaHR0cHN7MCwxfTovKSA/IGl0ZW0ud2Vic2l0ZSA6IFwiLy9cIiArIGl0ZW0ud2Vic2l0ZTtcbiAgICAgIHJldHVybiBgXG4gICAgICA8bGkgY2xhc3M9JyR7aXRlbS5ldmVudF90eXBlfSBncm91cC1vYmonIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZ3JvdXAgZ3JvdXAtb2JqXCI+XG4gICAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgICAgPGxpIGNsYXNzPVwidGFnIHRhZy0ke2l0ZW0uc3VwZXJncm91cH1cIj4ke2l0ZW0uc3VwZXJncm91cH08L2xpPlxuICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgPGgyPjxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLm5hbWV9PC9hPjwvaDI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRldGFpbHMtYXJlYVwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWxvY2F0aW9uIGxvY2F0aW9uXCI+JHtpdGVtLmxvY2F0aW9ufTwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRlc2NyaXB0aW9uXCI+XG4gICAgICAgICAgICAgIDxwPiR7aXRlbS5kZXNjcmlwdGlvbn08L3A+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICAgIDxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeVwiPkdldCBJbnZvbHZlZDwvYT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2xpPlxuICAgICAgYFxuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgJGxpc3Q6ICR0YXJnZXQsXG4gICAgICB1cGRhdGVGaWx0ZXI6IChwKSA9PiB7XG4gICAgICAgIGlmKCFwKSByZXR1cm47XG5cbiAgICAgICAgLy8gUmVtb3ZlIEZpbHRlcnNcblxuICAgICAgICAkdGFyZ2V0LnJlbW92ZVByb3AoXCJjbGFzc1wiKTtcbiAgICAgICAgJHRhcmdldC5hZGRDbGFzcyhwLmZpbHRlciA/IHAuZmlsdGVyLmpvaW4oXCIgXCIpIDogJycpXG4gICAgICB9LFxuICAgICAgdXBkYXRlQm91bmRzOiAoYm91bmQxLCBib3VuZDIpID0+IHtcblxuICAgICAgICAvLyBjb25zdCBib3VuZHMgPSBbcC5ib3VuZHMxLCBwLmJvdW5kczJdO1xuXG5cbiAgICAgICAgLy8gJHRhcmdldC5maW5kKCd1bCBsaS5ldmVudC1vYmosIHVsIGxpLmdyb3VwLW9iaicpLmVhY2goKGluZCwgaXRlbSk9PiB7XG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgbGV0IF9sYXQgPSAkKGl0ZW0pLmRhdGEoJ2xhdCcpLFxuICAgICAgICAvLyAgICAgICBfbG5nID0gJChpdGVtKS5kYXRhKCdsbmcnKTtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gICAvLyBjb25zb2xlLmxvZyhcInVwZGF0ZUJvdW5kc1wiLCBpdGVtKVxuICAgICAgICAvLyAgIGlmIChib3VuZDFbMF0gPD0gX2xhdCAmJiBib3VuZDJbMF0gPj0gX2xhdCAmJiBib3VuZDFbMV0gPD0gX2xuZyAmJiBib3VuZDJbMV0gPj0gX2xuZykge1xuICAgICAgICAvLyAgICAgLy8gY29uc29sZS5sb2coXCJBZGRpbmcgYm91bmRzXCIpO1xuICAgICAgICAvLyAgICAgJChpdGVtKS5hZGRDbGFzcygnd2l0aGluLWJvdW5kJyk7XG4gICAgICAgIC8vICAgfSBlbHNlIHtcbiAgICAgICAgLy8gICAgICQoaXRlbSkucmVtb3ZlQ2xhc3MoJ3dpdGhpbi1ib3VuZCcpO1xuICAgICAgICAvLyAgIH1cbiAgICAgICAgLy8gfSk7XG4gICAgICAgIC8vICQoaXRlbSkuYWRkQ2xhc3MoJ3dpdGhpbi1ib3VuZCcpO1xuXG4gICAgICAgIC8vIE9yZGVycyB0aGUgc2V0IHRvIG5lYXJlc3RcbiAgICAgICAgbGV0IGxhdENlbnRlciA9IChib3VuZDFbMF0gKyBib3VuZDJbMF0pIC8gMixcbiAgICAgICAgICAgIGxuZ0NlbnRlciA9IChib3VuZDFbMV0gKyBib3VuZDJbMV0pIC8gMjtcbiAgICAgICAgY29uc3Qgc29ydExpc3QgPSAoYSwgYikgPT4ge1xuICAgICAgICAgIGxldCBfbGF0QSA9ICQoYSkuZGF0YSgnbGF0JyksXG4gICAgICAgICAgICAgIF9sYXRCID0gJChiKS5kYXRhKCdsYXQnKSxcbiAgICAgICAgICAgICAgX2xuZ0EgPSAkKGEpLmRhdGEoJ2xuZycpLFxuICAgICAgICAgICAgICBfbG5nQiA9ICQoYikuZGF0YSgnbG5nJyk7XG5cbiAgICAgICAgICBsZXQgZGlzdEEgPSBNYXRoLnNxcnQoTWF0aC5wb3cobGF0Q2VudGVyIC0gX2xhdEEsIDIpICsgTWF0aC5wb3cobG5nQ2VudGVyIC0gX2xuZ0EsIDIpKSxcbiAgICAgICAgICAgICAgZGlzdEIgPSBNYXRoLnNxcnQoTWF0aC5wb3cobGF0Q2VudGVyIC0gX2xhdEIsIDIpICsgTWF0aC5wb3cobG5nQ2VudGVyIC0gX2xuZ0IsIDIpKTtcblxuICAgICAgICAgICQoYSkuYXR0cignZGF0YS1kaXN0YW5jZScsIGRpc3RBKTtcblxuICAgICAgICAgIHJldHVybiBkaXN0QSAtIGRpc3RCO1xuICAgICAgICB9O1xuXG4gICAgICAgICR0YXJnZXQuZmluZCgndWwgbGkuZXZlbnQtb2JqLCB1bCBsaS5ncm91cC1vYmonKVxuICAgICAgICAgICAgLnNvcnQoc29ydExpc3QpXG4gICAgICAgICAgICAuYXBwZW5kVG8oJHRhcmdldC5maW5kKCd1bCcpKTtcbiAgICAgIH0sXG4gICAgICBwb3B1bGF0ZUxpc3Q6IChoYXJkRmlsdGVycywgdGFyZ2V0RGF0YSkgPT4ge1xuICAgICAgICAvL3VzaW5nIHdpbmRvdy5FVkVOVF9EQVRBXG4gICAgICAgIGNvbnN0IGtleVNldCA9ICFoYXJkRmlsdGVycy5rZXkgPyBbXSA6IGhhcmRGaWx0ZXJzLmtleS5zcGxpdCgnLCcpO1xuXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHRhcmdldERhdGEpO1xuXG4gICAgICAgIHZhciAkZXZlbnRMaXN0ID0gdGFyZ2V0RGF0YS5tYXAoaXRlbSA9PiB7XG4gICAgICAgICAgaWYgKGtleVNldC5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW0uZXZlbnRfdHlwZSAmJiBpdGVtLmV2ZW50X3R5cGUudG9Mb3dlckNhc2UoKSA9PSAnZ3JvdXAnID8gcmVuZGVyR3JvdXAoaXRlbSkgOiByZW5kZXJFdmVudChpdGVtKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGtleVNldC5sZW5ndGggPiAwICYmIGl0ZW0uZXZlbnRfdHlwZSAhPSAnZ3JvdXAnICYmIGtleVNldC5pbmNsdWRlcyhpdGVtLmV2ZW50X3R5cGUpKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVuZGVyRXZlbnQoaXRlbSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChrZXlTZXQubGVuZ3RoID4gMCAmJiBpdGVtLmV2ZW50X3R5cGUgPT0gJ2dyb3VwJyAmJiBrZXlTZXQuaW5jbHVkZXMoaXRlbS5zdXBlcmdyb3VwKSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlbmRlckdyb3VwKGl0ZW0pXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgfSlcbiAgICAgICAgJHRhcmdldC5maW5kKCd1bCBsaScpLnJlbW92ZSgpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoJ3VsJykuYXBwZW5kKCRldmVudExpc3QpO1xuXG4gICAgICAgICR0YXJnZXQuZmluZCgndWwgbGknKVxuXG4gICAgICB9XG4gICAgfTtcbiAgfVxufSkoalF1ZXJ5KTtcbiIsIlxuY29uc3QgTWFwTWFuYWdlciA9ICgoJCkgPT4ge1xuICBsZXQgTEFOR1VBR0UgPSAnZW4nO1xuICB2YXIgbWFwTWFya2VyO1xuICBjb25zdCB3bUljb24gPSBMLmljb24oe1xuICAgICAgaWNvblVybDogJy9pbWcvb2Nhc2lvLW1hcmtlci5wbmcnLFxuICAgICAgaWNvblNpemU6IFszMCwgNDFdLFxuICAgICAgaWNvbkFuY2hvcjogWzE1LCA0MV0sXG4gICAgICBwb3B1cEFuY2hvcjogWy0zLCAtNzZdLFxuICAgICAgc2hhZG93VXJsOiAnL2ltZy9vY2FzaW8tbWFya2VyLXNoYWRvdy5wbmcnLFxuICAgICAgc2hhZG93U2l6ZTogWzQzLCAxOV0sXG4gICAgICBzaGFkb3dBbmNob3I6IFsxNSwgMTldXG4gIH0pO1xuXG4gIGNvbnN0IHJlbmRlckV2ZW50ID0gKGl0ZW0pID0+IHtcbiAgICB2YXIgZ210RGF0ZSA9IG5ldyBEYXRlKGl0ZW0uc3RhcnRfZGF0ZXRpbWUpLnRvR01UU3RyaW5nKCk7XG4gICAgdmFyIGRhdGUgPSBtb21lbnQobmV3IERhdGUoZ210RGF0ZSkpLmZvcm1hdChuZXcgRGF0ZShpdGVtLnN0YXJ0X2RhdGV0aW1lKS5nZXRIb3VycygpID09IDAgPyBcImRkZGQgTU1NIEREXCIgIDogXCJkZGRkIE1NTSBERCwgaDptbWFcIik7XG5cbiAgICBsZXQgdXJsID0gaXRlbS51cmwubWF0Y2goL15odHRwc3swLDF9Oi8pID8gaXRlbS51cmwgOiBcIi8vXCIgKyBpdGVtLnVybDtcblxuXG4gICAgcmV0dXJuIGBcbiAgICA8ZGl2IGNsYXNzPSdwb3B1cC1pdGVtICR7aXRlbS5ldmVudF90eXBlfScgZGF0YS1sYXQ9JyR7aXRlbS5sYXR9JyBkYXRhLWxuZz0nJHtpdGVtLmxuZ30nPlxuICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZXZlbnQgdHlwZS1hY3Rpb25cIj5cbiAgICAgICAgPGgyIGNsYXNzPVwiZXZlbnQtdGl0bGVcIj48YSBocmVmPVwiJHt1cmwgPT0gJy8vJyA/ICdqYXZhc2NyaXB0OiB2b2lkKG51bGwpJyA6IHVybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLnRpdGxlfTwvYT48L2gyPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtZGF0ZSBkYXRlXCIgc3R5bGU9XCJkaXNwbGF5OiAkeyFpdGVtLnN0YXJ0X2RhdGV0aW1lID8gJ25vbmUnIDogJ2Jsb2NrJ31cIj4ke2RhdGV9PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1hZGRyZXNzIGFkZHJlc3MtYXJlYVwiPlxuICAgICAgICAgIDxwPiR7aXRlbS52ZW51ZX08L3A+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIiBzdHlsZT0nZGlzcGxheTogJHt1cmwgPT0gJy8vJyA/ICdub25lJyA6ICdibG9jayd9Jz5cbiAgICAgICAgICA8YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnkgcnN2cFwiPlJTVlA8L2E+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICAgYFxuICB9O1xuXG4gIGNvbnN0IHJlbmRlckdyb3VwID0gKGl0ZW0pID0+IHtcblxuICAgIGxldCB1cmwgPSBpdGVtLndlYnNpdGUubWF0Y2goL15odHRwc3swLDF9Oi8pID8gaXRlbS53ZWJzaXRlIDogXCIvL1wiICsgaXRlbS53ZWJzaXRlO1xuICAgIHJldHVybiBgXG4gICAgPGxpPlxuICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZ3JvdXAgZ3JvdXAtb2JqXCI+XG4gICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICA8bGkgY2xhc3M9XCJ0YWcgdGFnLSR7aXRlbS5zdXBlcmdyb3VwfVwiPiR7aXRlbS5zdXBlcmdyb3VwfTwvbGk+XG4gICAgICAgIDwvdWw+XG4gICAgICAgIDxoMj48YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS5uYW1lfTwvYT48L2gyPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGV0YWlscy1hcmVhXCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWxvY2F0aW9uIGxvY2F0aW9uXCI+JHtpdGVtLmFkZHJlc3N9PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWRlc2NyaXB0aW9uXCI+XG4gICAgICAgICAgICA8cD4ke2l0ZW0uZGVzY3JpcHRpb259PC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgPGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCI+R2V0IEludm9sdmVkPC9hPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvbGk+XG4gICAgYFxuICB9O1xuXG4gIGNvbnN0IHJlbmRlckdlb2pzb24gPSAobGlzdCkgPT4ge1xuICAgIC8vIGNvbnNvbGUubG9nKGxpc3QpXG4gICAgLy8gR2V0IGFsbCB1bmlxdWUgTGF0LWxvbmdcblxuICAgIGxldCBkaWN0TGF0TG5nID0ge307XG5cbiAgICBsaXN0LmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgIGlmKCFpdGVtLmxhdCB8fCAhaXRlbS5sbmcgfHwgaXRlbS5sYXQgPT0gXCJcIiB8fCBpdGVtLmxuZyA9PSBcIlwiKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiAoICFkaWN0TGF0TG5nW2Ake2l0ZW0ubGF0fSwke2l0ZW0ubG5nfWBdICkge1xuICAgICAgICBkaWN0TGF0TG5nW2Ake2l0ZW0ubGF0fSwke2l0ZW0ubG5nfWBdID0gW2l0ZW1dO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGljdExhdExuZ1tgJHtpdGVtLmxhdH0sJHtpdGVtLmxuZ31gXS5wdXNoKGl0ZW0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gUGFyc2UgZ3JvdXBzIGl0ZW1zXG4gICAgbGV0IG1hcEl0ZW1zID0gW107XG4gICAgT2JqZWN0LmtleXMoZGljdExhdExuZykuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgIGxldCBbbGF0LCBsbmddID0ga2V5LnNwbGl0KCcsJyk7XG4gICAgICBtYXBJdGVtcy5wdXNoKHtcbiAgICAgICAgbGF0OiBwYXJzZUZsb2F0KGxhdCksXG4gICAgICAgIGxuZzogcGFyc2VGbG9hdChsbmcpLFxuICAgICAgICBldmVudHM6IGRpY3RMYXRMbmdba2V5XVxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyBjb25zb2xlLmxvZyhtYXBJdGVtcyk7XG5cbiAgICByZXR1cm4gbWFwSXRlbXMubWFwKChpdGVtKSA9PiB7XG4gICAgICAvLyByZW5kZXJlZCBldmVudFR5cGVcbiAgICAgIGxldCByZW5kZXJlZDtcblxuICAgICAgLy8gY29uc29sZS5sb2coaXRlbS5ldmVudHMubGVuZ3RoKVxuICAgICAgaWYgKGl0ZW0uZXZlbnRzLmxlbmd0aCA9PSAxKSB7XG4gICAgICAgIHJlbmRlcmVkID0gcmVuZGVyRXZlbnQoaXRlbS5ldmVudHNbMF0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVuZGVyZWQgPSBgPGRpdiBjbGFzcz0nbXVsdGlwbGUtaXRlbXMnPjx1bD4ke2l0ZW0uZXZlbnRzLm1hcChpID0+IGA8bGk+JHtyZW5kZXJFdmVudChpKX08L2xpPmApLmpvaW4oJycpfTwvdWw+PC9kaXY+YFxuICAgICAgfVxuXG5cbiAgICAgIC8vIGNvbnNvbGUubG9nKHJlbmRlcmVkLCBpdGVtLmV2ZW50cy5sZW5ndGgpXG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAgICAgICAgZ2VvbWV0cnk6IHtcbiAgICAgICAgICB0eXBlOiBcIlBvaW50XCIsXG4gICAgICAgICAgY29vcmRpbmF0ZXM6IFtpdGVtLmxuZywgaXRlbS5sYXRdXG4gICAgICAgIH0sXG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICBldmVudFByb3BlcnRpZXM6IGl0ZW0sXG4gICAgICAgICAgcG9wdXBDb250ZW50OiByZW5kZXJlZCxcbiAgICAgICAgICBwb3B1cENsYXNzTmFtZTogaXRlbS5ldmVudHMubGVuZ3RoID4gMSA/ICdwb3B1cC1tdWx0aXBsZS1pdGVtJyA6ICdwb3B1cC1zaW5nbGUtaXRlbSdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gKG9wdGlvbnMpID0+IHtcbiAgICB2YXIgbWFwID0gbnVsbDtcblxuICAgIGlmICghTC5Ccm93c2VyLm1vYmlsZSkge1xuICAgICAgbWFwID0gTC5tYXAoJ21hcCcsIHsgZHJhZ2dpbmc6ICFMLkJyb3dzZXIubW9iaWxlIH0pLnNldFZpZXcod2luZG93LkNVU1RPTV9DT09SRCB8fCBbMzguNDExNDI3MSwtOTcuNjQxMTA0NF0sIHdpbmRvdy5DVVNUT01fWk9PTSB8fCA0KTtcbiAgICAgIG1hcC5zY3JvbGxXaGVlbFpvb20uZGlzYWJsZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBtYXAgPSBMLm1hcCgnbWFwJywgeyBkcmFnZ2luZzogIUwuQnJvd3Nlci5tb2JpbGUgfSkuc2V0Vmlldyh3aW5kb3cuQ1VTVE9NX0NPT1JEIHx8IFszOC40MTE0MjcxLC05Ny42NDExMDQ0XSwgMyk7XG4gICAgfVxuXG4gICAgTEFOR1VBR0UgPSBvcHRpb25zLmxhbmcgfHwgJ2VuJztcblxuICAgIGlmIChvcHRpb25zLm9uTW92ZSkge1xuICAgICAgbWFwLm9uKCdkcmFnZW5kJywgKGV2ZW50KSA9PiB7XG5cblxuICAgICAgICBsZXQgc3cgPSBbbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sbmddO1xuICAgICAgICBsZXQgbmUgPSBbbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sbmddO1xuICAgICAgICBvcHRpb25zLm9uTW92ZShzdywgbmUpO1xuICAgICAgfSkub24oJ3pvb21lbmQnLCAoZXZlbnQpID0+IHtcblxuaHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vZG9jdW1lbnQvZC8xS1drTE5OZUlPZUZFaVZXTU53b1lLdTF5QVpSVURmNzh4SWJJMWllN0R2cy9lZGl0P3VzcD1zaGFyaW5nXG4gICAgICAgIGxldCBzdyA9IFttYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxuZ107XG4gICAgICAgIGxldCBuZSA9IFttYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxuZ107XG4gICAgICAgIG9wdGlvbnMub25Nb3ZlKHN3LCBuZSk7XG4gICAgICB9KVxuICAgIH1cblxuICAgIEwudGlsZUxheWVyKCdodHRwczovL3NlcnZlci5hcmNnaXNvbmxpbmUuY29tL0FyY0dJUy9yZXN0L3NlcnZpY2VzL0NhbnZhcy9Xb3JsZF9MaWdodF9HcmF5X0Jhc2UvTWFwU2VydmVyL3RpbGUve3p9L3t5fS97eH0nLCB7XG4gICAgICBcdGF0dHJpYnV0aW9uOiAnVGlsZXMgJmNvcHk7IEVzcmkgJm1kYXNoOyBFc3JpLCBEZUxvcm1lLCBOQVZURVEnLFxuICAgICAgXHRtYXhab29tOiAxNn0pLmFkZFRvKG1hcCk7XG5cbiAgICBsZXQgZ2VvY29kZXIgPSBudWxsO1xuICAgIHJldHVybiB7XG4gICAgICAkbWFwOiBtYXAsXG4gICAgICBpbml0aWFsaXplOiAoY2FsbGJhY2spID0+IHtcbiAgICAgICAgZ2VvY29kZXIgPSBuZXcgZ29vZ2xlLm1hcHMuR2VvY29kZXIoKTtcbiAgICAgICAgaWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGdldE1hcDogKCkgPT4gbWFwLFxuICAgICAgc2V0Qm91bmRzOiAoYm91bmRzMSwgYm91bmRzMikgPT4ge1xuICAgICAgICBjb25zdCBib3VuZHMgPSBbYm91bmRzMSwgYm91bmRzMl07XG4gICAgICAgIG1hcC5maXRCb3VuZHMoYm91bmRzKTtcbiAgICAgIH0sXG4gICAgICBzZXRDZW50ZXI6IChjZW50ZXIsIHpvb20gPSAxMCkgPT4ge1xuICAgICAgICBpZiAoIWNlbnRlciB8fCAhY2VudGVyWzBdIHx8IGNlbnRlclswXSA9PSBcIlwiXG4gICAgICAgICAgICAgIHx8ICFjZW50ZXJbMV0gfHwgY2VudGVyWzFdID09IFwiXCIpIHJldHVybjtcbiAgICAgICAgbWFwLnNldFZpZXcoY2VudGVyLCB6b29tKTtcbiAgICAgIH0sXG4gICAgICBnZXRCb3VuZHM6ICgpID0+IHtcblxuICAgICAgICBsZXQgc3cgPSBbbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sbmddO1xuICAgICAgICBsZXQgbmUgPSBbbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sbmddO1xuXG4gICAgICAgIHJldHVybiBbc3csIG5lXTtcbiAgICAgIH0sXG4gICAgICAvLyBDZW50ZXIgbG9jYXRpb24gYnkgZ2VvY29kZWRcbiAgICAgIGdldENlbnRlckJ5TG9jYXRpb246IChsb2NhdGlvbiwgY2FsbGJhY2spID0+IHtcblxuICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHsgYWRkcmVzczogbG9jYXRpb24gfSwgZnVuY3Rpb24gKHJlc3VsdHMsIHN0YXR1cykge1xuXG4gICAgICAgICAgaWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2socmVzdWx0c1swXSlcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIHNob3dNYXBNYXJrZXI6IChsYXQsIGxuZykgPT4ge1xuXG4gICAgICAgIC8vY29uc29sZS5sb2cobWFwTWFya2VyKTtcbiAgICAgICAgaWYgKG1hcE1hcmtlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgbWFwLnJlbW92ZUxheWVyKG1hcE1hcmtlcik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobGF0ICYmIGxuZykge1xuICAgICAgICAgIG1hcE1hcmtlciA9IG5ldyBMLk1hcmtlcihbbGF0LGxuZ10sIHtcbiAgICAgICAgICAgIGljb246IHdtSWNvblxuICAgICAgICAgIH0pLmFkZFRvKG1hcCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICByZWZyZXNoTWFwOiAoKSA9PiB7XG4gICAgICAgIG1hcC5pbnZhbGlkYXRlU2l6ZShmYWxzZSk7XG4gICAgICAgIC8vIG1hcC5fb25SZXNpemUoKTtcblxuICAgICAgICAvLyBjb25zb2xlLmxvZyhcIm1hcCBpcyByZXNpemVkXCIpXG4gICAgICB9LFxuICAgICAgZmlsdGVyTWFwOiAoZmlsdGVycykgPT4ge1xuXG4gICAgICAgICQoXCIjbWFwXCIpLmZpbmQoXCIuZXZlbnQtaXRlbS1wb3B1cFwiKS5oaWRlKCk7XG5cblxuICAgICAgICBpZiAoIWZpbHRlcnMpIHJldHVybjtcblxuICAgICAgICBmaWx0ZXJzLmZvckVhY2goKGl0ZW0pID0+IHtcblxuICAgICAgICAgICQoXCIjbWFwXCIpLmZpbmQoXCIuZXZlbnQtaXRlbS1wb3B1cC5cIiArIGl0ZW0udG9Mb3dlckNhc2UoKSkuc2hvdygpO1xuICAgICAgICB9KVxuICAgICAgfSxcbiAgICAgIHBsb3RQb2ludHM6IChsaXN0LCBoYXJkRmlsdGVycykgPT4ge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhsaXN0KVxuICAgICAgICBjb25zdCBrZXlTZXQgPSAhaGFyZEZpbHRlcnMua2V5ID8gW10gOiBoYXJkRmlsdGVycy5rZXkuc3BsaXQoJywnKTtcblxuICAgICAgICBpZiAoa2V5U2V0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBsaXN0ID0gbGlzdC5maWx0ZXIoKGl0ZW0pID0+IGtleVNldC5pbmNsdWRlcyhpdGVtLmV2ZW50X3R5cGUpKVxuICAgICAgICB9XG5cblxuICAgICAgICBjb25zdCBnZW9qc29uID0ge1xuICAgICAgICAgIHR5cGU6IFwiRmVhdHVyZUNvbGxlY3Rpb25cIixcbiAgICAgICAgICBmZWF0dXJlczogcmVuZGVyR2VvanNvbihsaXN0KVxuICAgICAgICB9O1xuXG5cblxuICAgICAgICBMLmdlb0pTT04oZ2VvanNvbiwge1xuICAgICAgICAgICAgcG9pbnRUb0xheWVyOiAoZmVhdHVyZSwgbGF0bG5nKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGV2ZW50VHlwZSA9IGZlYXR1cmUucHJvcGVydGllcy5ldmVudFByb3BlcnRpZXMuZXZlbnRfdHlwZTtcbiAgICAgICAgICAgICAgdmFyIGdlb2pzb25NYXJrZXJPcHRpb25zID0ge1xuICAgICAgICAgICAgICAgICAgcmFkaXVzOiA2LFxuICAgICAgICAgICAgICAgICAgZmlsbENvbG9yOiAgZXZlbnRUeXBlICYmIGV2ZW50VHlwZS50b0xvd2VyQ2FzZSgpID09PSAnZ3JvdXAnID8gXCIjNDBEN0Q0XCIgOiBcIiM1NzI1ODJcIixcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiBcIndoaXRlXCIsXG4gICAgICAgICAgICAgICAgICB3ZWlnaHQ6IDQsXG4gICAgICAgICAgICAgICAgICBvcGFjaXR5OiAwLjUsXG4gICAgICAgICAgICAgICAgICBmaWxsT3BhY2l0eTogMC44LFxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICByZXR1cm4gTC5jaXJjbGVNYXJrZXIobGF0bG5nLCBnZW9qc29uTWFya2VyT3B0aW9ucyk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgb25FYWNoRmVhdHVyZTogKGZlYXR1cmUsIGxheWVyKSA9PiB7XG4gICAgICAgICAgICBpZiAoZmVhdHVyZS5wcm9wZXJ0aWVzICYmIGZlYXR1cmUucHJvcGVydGllcy5wb3B1cENvbnRlbnQpIHtcbiAgICAgICAgICAgICAgbGF5ZXIuYmluZFBvcHVwKGZlYXR1cmUucHJvcGVydGllcy5wb3B1cENvbnRlbnQsXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6IGZlYXR1cmUucHJvcGVydGllcy5wb3B1cENsYXNzTmFtZVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pLmFkZFRvKG1hcCk7XG5cbiAgICAgIH0sXG4gICAgICB1cGRhdGU6IChwKSA9PiB7XG4gICAgICAgIGlmICghcCB8fCAhcC5sYXQgfHwgIXAubG5nICkgcmV0dXJuO1xuXG4gICAgICAgIG1hcC5zZXRWaWV3KEwubGF0TG5nKHAubGF0LCBwLmxuZyksIDEwKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59KShqUXVlcnkpO1xuIiwiY29uc3QgUXVlcnlNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIHJldHVybiAodGFyZ2V0Rm9ybSA9IFwiZm9ybSNmaWx0ZXJzLWZvcm1cIikgPT4ge1xuICAgIGNvbnN0ICR0YXJnZXQgPSB0eXBlb2YgdGFyZ2V0Rm9ybSA9PT0gJ3N0cmluZycgPyAkKHRhcmdldEZvcm0pIDogdGFyZ2V0Rm9ybTtcbiAgICBsZXQgbGF0ID0gbnVsbDtcbiAgICBsZXQgbG5nID0gbnVsbDtcblxuICAgIGxldCBwcmV2aW91cyA9IHt9O1xuXG4gICAgJHRhcmdldC5vbignc3VibWl0JywgKGUpID0+IHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGxhdCA9ICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwoKTtcbiAgICAgIGxuZyA9ICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwoKTtcblxuICAgICAgdmFyIGZvcm0gPSAkLmRlcGFyYW0oJHRhcmdldC5zZXJpYWxpemUoKSk7XG5cbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJC5wYXJhbShmb3JtKTtcbiAgICB9KVxuXG4gICAgJChkb2N1bWVudCkub24oJ2NoYW5nZScsICcuZmlsdGVyLWl0ZW0gaW5wdXRbdHlwZT1jaGVja2JveF0nLCAoKSA9PiB7XG4gICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgIH0pXG5cblxuICAgIHJldHVybiB7XG4gICAgICBpbml0aWFsaXplOiAoY2FsbGJhY2spID0+IHtcbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB2YXIgcGFyYW1zID0gJC5kZXBhcmFtKHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKSlcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhbmddXCIpLnZhbChwYXJhbXMubGFuZyk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbChwYXJhbXMubGF0KTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKHBhcmFtcy5sbmcpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwocGFyYW1zLmJvdW5kMSk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDJdXCIpLnZhbChwYXJhbXMuYm91bmQyKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxvY11cIikudmFsKHBhcmFtcy5sb2MpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9a2V5XVwiKS52YWwocGFyYW1zLmtleSk7XG5cbiAgICAgICAgICBpZiAocGFyYW1zLmZpbHRlcikge1xuICAgICAgICAgICAgJHRhcmdldC5maW5kKFwiLmZpbHRlci1pdGVtIGlucHV0W3R5cGU9Y2hlY2tib3hdXCIpLnJlbW92ZVByb3AoXCJjaGVja2VkXCIpO1xuICAgICAgICAgICAgcGFyYW1zLmZpbHRlci5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCIuZmlsdGVyLWl0ZW0gaW5wdXRbdHlwZT1jaGVja2JveF1bdmFsdWU9J1wiICsgaXRlbSArIFwiJ11cIikucHJvcChcImNoZWNrZWRcIiwgdHJ1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGdldFBhcmFtZXRlcnM6ICgpID0+IHtcbiAgICAgICAgdmFyIHBhcmFtZXRlcnMgPSAkLmRlcGFyYW0oJHRhcmdldC5zZXJpYWxpemUoKSk7XG4gICAgICAgIC8vIHBhcmFtZXRlcnNbJ2xvY2F0aW9uJ10gO1xuXG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIHBhcmFtZXRlcnMpIHtcbiAgICAgICAgICBpZiAoICFwYXJhbWV0ZXJzW2tleV0gfHwgcGFyYW1ldGVyc1trZXldID09IFwiXCIpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBwYXJhbWV0ZXJzW2tleV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhcmFtZXRlcnM7XG4gICAgICB9LFxuICAgICAgdXBkYXRlTG9jYXRpb246IChsYXQsIGxuZykgPT4ge1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKGxhdCk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwobG5nKTtcbiAgICAgICAgLy8gJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGVWaWV3cG9ydDogKHZpZXdwb3J0KSA9PiB7XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gW1t2aWV3cG9ydC5mLmIsIHZpZXdwb3J0LmIuYl0sIFt2aWV3cG9ydC5mLmYsIHZpZXdwb3J0LmIuZl1dO1xuXG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzBdKSk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQyXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzFdKSk7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlVmlld3BvcnRCeUJvdW5kOiAoc3csIG5lKSA9PiB7XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gW3N3LCBuZV07Ly8vLy8vLy9cblxuICAgICAgICBcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDFdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMF0pKTtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDJdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMV0pKTtcbiAgICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH0sXG4gICAgICB0cmlnZ2VyU3VibWl0OiAoKSA9PiB7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9XG4gICAgfVxuICB9XG59KShqUXVlcnkpO1xuIiwibGV0IGF1dG9jb21wbGV0ZU1hbmFnZXI7XG5sZXQgbWFwTWFuYWdlcjtcblxuKGZ1bmN0aW9uKCQpIHtcblxuICAvLyAxLiBnb29nbGUgbWFwcyBnZW9jb2RlXG5cbiAgLy8gMi4gZm9jdXMgbWFwIG9uIGdlb2NvZGUgKHZpYSBsYXQvbG5nKVxuICBjb25zdCBxdWVyeU1hbmFnZXIgPSBRdWVyeU1hbmFnZXIoKTtcbiAgICAgICAgcXVlcnlNYW5hZ2VyLmluaXRpYWxpemUoKTtcblxuICBjb25zdCBpbml0UGFyYW1zID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcbiAgbWFwTWFuYWdlciA9IE1hcE1hbmFnZXIoe1xuICAgIG9uTW92ZTogKHN3LCBuZSkgPT4ge1xuICAgICAgLy8gV2hlbiB0aGUgbWFwIG1vdmVzIGFyb3VuZCwgd2UgdXBkYXRlIHRoZSBsaXN0XG4gICAgICBxdWVyeU1hbmFnZXIudXBkYXRlVmlld3BvcnRCeUJvdW5kKHN3LCBuZSk7XG4gICAgICAvL3VwZGF0ZSBRdWVyeVxuICAgIH1cbiAgfSk7XG5cbiAgd2luZG93LmluaXRpYWxpemVBdXRvY29tcGxldGVDYWxsYmFjayA9ICgpID0+IHtcblxuICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIgPSBBdXRvY29tcGxldGVNYW5hZ2VyKFwiaW5wdXRbbmFtZT0nbG9jJ11cIik7XG4gICAgYXV0b2NvbXBsZXRlTWFuYWdlci5pbml0aWFsaXplKCk7XG5cbiAgICBpZiAoaW5pdFBhcmFtcy5sb2MgJiYgaW5pdFBhcmFtcy5sb2MgIT09ICcnICYmICghaW5pdFBhcmFtcy5ib3VuZDEgJiYgIWluaXRQYXJhbXMuYm91bmQyKSkge1xuICAgICAgbWFwTWFuYWdlci5pbml0aWFsaXplKCgpID0+IHtcbiAgICAgICAgbWFwTWFuYWdlci5nZXRDZW50ZXJCeUxvY2F0aW9uKGluaXRQYXJhbXMubG9jLCAocmVzdWx0KSA9PiB7XG4gICAgICAgICAgcXVlcnlNYW5hZ2VyLnVwZGF0ZVZpZXdwb3J0KHJlc3VsdC5nZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgIH0pO1xuICAgICAgfSlcbiAgICB9XG4gIH1cblxuXG4gIGNvbnN0IGxhbmd1YWdlTWFuYWdlciA9IExhbmd1YWdlTWFuYWdlcigpO1xuXG4gIGxhbmd1YWdlTWFuYWdlci5pbml0aWFsaXplKGluaXRQYXJhbXNbJ2xhbmcnXSB8fCAnZW4nKTtcblxuICBjb25zdCBsaXN0TWFuYWdlciA9IExpc3RNYW5hZ2VyKCk7XG5cbiAgaWYoaW5pdFBhcmFtcy5sYXQgJiYgaW5pdFBhcmFtcy5sbmcpIHtcbiAgICBtYXBNYW5hZ2VyLnNldENlbnRlcihbaW5pdFBhcmFtcy5sYXQsIGluaXRQYXJhbXMubG5nXSk7XG4gIH1cblxuICAvKioqXG4gICogTGlzdCBFdmVudHNcbiAgKiBUaGlzIHdpbGwgdHJpZ2dlciB0aGUgbGlzdCB1cGRhdGUgbWV0aG9kXG4gICovXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxpc3QtdXBkYXRlJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgbGlzdE1hbmFnZXIucG9wdWxhdGVMaXN0KG9wdGlvbnMucGFyYW1zLCBvcHRpb25zLmRhdGEpO1xuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcbiAgICBsaXN0TWFuYWdlci51cGRhdGVGaWx0ZXIob3B0aW9ucyk7XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLWJ5LWJvdW5kJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgbGV0IGJvdW5kMSwgYm91bmQyO1xuXG4gICAgaWYgKCFvcHRpb25zIHx8ICFvcHRpb25zLmJvdW5kMSB8fCAhb3B0aW9ucy5ib3VuZDIpIHtcbiAgICAgIFtib3VuZDEsIGJvdW5kMl0gPSBtYXBNYW5hZ2VyLmdldEJvdW5kcygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBib3VuZDEgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQxKTtcbiAgICAgIGJvdW5kMiA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDIpO1xuICAgIH1cblxuXG5cbiAgICBsaXN0TWFuYWdlci51cGRhdGVCb3VuZHMoYm91bmQxLCBib3VuZDIpXG4gIH0pXG5cbiAgLyoqKlxuICAqIE1hcCBFdmVudHNcbiAgKi9cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbWFwLXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIC8vIG1hcE1hbmFnZXIuc2V0Q2VudGVyKFtvcHRpb25zLmxhdCwgb3B0aW9ucy5sbmddKTtcbiAgICBpZiAoIW9wdGlvbnMgfHwgIW9wdGlvbnMuYm91bmQxIHx8ICFvcHRpb25zLmJvdW5kMikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBib3VuZDEgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQxKTtcbiAgICB2YXIgYm91bmQyID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMik7XG4gICAgbWFwTWFuYWdlci5zZXRCb3VuZHMoYm91bmQxLCBib3VuZDIpO1xuICAgIC8vIGNvbnNvbGUubG9nKG9wdGlvbnMpXG4gIH0pO1xuICAvLyAzLiBtYXJrZXJzIG9uIG1hcFxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtcGxvdCcsIChlLCBvcHQpID0+IHtcblxuICAgIG1hcE1hbmFnZXIucGxvdFBvaW50cyhvcHQuZGF0YSwgb3B0LnBhcmFtcyk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtZmlsdGVyJyk7XG4gIH0pXG5cbiAgLy8gRmlsdGVyIG1hcFxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtZmlsdGVyJywgKGUsIG9wdCkgPT4ge1xuICAgIGlmIChvcHQpIHtcbiAgICAgIG1hcE1hbmFnZXIuZmlsdGVyTWFwKG9wdC5maWx0ZXIpO1xuICAgIH1cbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlJywgKGUsIG9wdCkgPT4ge1xuICAgIGlmIChvcHQpIHtcbiAgICAgIGxhbmd1YWdlTWFuYWdlci51cGRhdGVMYW5ndWFnZShvcHQubGFuZyk7XG4gICAgfVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnYnV0dG9uI3Nob3ctaGlkZS1tYXAnLCAoZSwgb3B0KSA9PiB7XG4gICAgJCgnYm9keScpLnRvZ2dsZUNsYXNzKCdtYXAtdmlldycpXG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICdidXR0b24jc2hvdy1tYXAnLCAoZSwgb3B0KSA9PiB7XG4gICAgJCgnYm9keScpLmFkZENsYXNzKCdtYXAtdmlldycpO1xuXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgbWFwTWFuYWdlci5yZWZyZXNoTWFwKCk7XG4gICAgICB9LCAxMClcblxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnYnV0dG9uI3Nob3ctbGlzdCcsIChlLCBvcHQpID0+IHtcbiAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ21hcC12aWV3Jyk7XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICdidXR0b24uYnRuLm1vcmUtaXRlbXMnLCAoZSwgb3B0KSA9PiB7XG4gICAgJCgnI2VtYmVkLWFyZWEnKS50b2dnbGVDbGFzcygnb3BlbicpO1xuICB9KVxuXG4gIC8vIFNob3dzIHBvaW50ZXJzIHdpdGhpbiBtYXBcbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItc2hvdy1tYXJrZXInLCAoZSwgb3B0KSA9PiB7XG4gICAgbGV0IGxhdCA9IG9wdC5sYXQsIGxuZyA9IG9wdC5sbmcsIGNsYXNzTmFtZSA9IGAke29wdC5sYXR9LS0ke29wdC5sbmd9YDtcbiAgICBtYXBNYW5hZ2VyLnNob3dNYXBNYXJrZXIobGF0LCBsbmcsIGNsYXNzTmFtZSk7XG4gIH0pXG5cbiAgLy9BZGQgZXZlbnQgdG8gbGlzdE1hbmFnZXJcbiAgJChkb2N1bWVudCkub24oJ21vdXNlZW50ZXInLCAnZGl2I2V2ZW50cy1saXN0IHVsIGxpLmV2ZW50LW9iaicsIChlKSA9PiB7XG4gICAgbWFwTWFuYWdlci5zaG93TWFwTWFya2VyKCQoZS5jdXJyZW50VGFyZ2V0KS5kYXRhKCdsYXQnKSwgJChlLmN1cnJlbnRUYXJnZXQpLmRhdGEoJ2xuZycpKTtcbiAgfSlcblxuICAkKGRvY3VtZW50KS5vbignbW91c2VlbnRlcicsICdzZWN0aW9uI21hcCcsIChlKSA9PiB7XG4gICAgbWFwTWFuYWdlci5zaG93TWFwTWFya2VyKCk7XG4gIH0pXG5cbiAgLy8gJChkb2N1bWVudCkub24oJ3RyaWdnZXItdXBkYXRlLWVtYmVkJywgKGUsIG9wdCkgPT4ge1xuICAvLyAgIC8vdXBkYXRlIGVtYmVkIGxpbmVcbiAgLy8gICB2YXIgY29weSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob3B0KSk7XG4gIC8vICAgZGVsZXRlIGNvcHlbJ2xuZyddO1xuICAvLyAgIGRlbGV0ZSBjb3B5WydsYXQnXTtcbiAgLy8gICBkZWxldGUgY29weVsnYm91bmQxJ107XG4gIC8vICAgZGVsZXRlIGNvcHlbJ2JvdW5kMiddO1xuICAvL1xuICAvLyAgICQoJyNlbWJlZC1hcmVhIGlucHV0W25hbWU9ZW1iZWRdJykudmFsKCcjJyArICQucGFyYW0oY29weSkpO1xuICAvLyB9KTtcblxuICAkKHdpbmRvdykub24oXCJyZXNpemVcIiwgKGUpID0+IHtcbiAgICBtYXBNYW5hZ2VyLnJlZnJlc2hNYXAoKTtcbiAgfSk7XG5cbiAgJCh3aW5kb3cpLm9uKFwiaGFzaGNoYW5nZVwiLCAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgaWYgKGhhc2gubGVuZ3RoID09IDApIHJldHVybjtcbiAgICBjb25zdCBwYXJhbWV0ZXJzID0gJC5kZXBhcmFtKGhhc2guc3Vic3RyaW5nKDEpKTtcbiAgICBjb25zdCBvbGRVUkwgPSBldmVudC5vcmlnaW5hbEV2ZW50Lm9sZFVSTDtcblxuXG4gICAgY29uc3Qgb2xkSGFzaCA9ICQuZGVwYXJhbShvbGRVUkwuc3Vic3RyaW5nKG9sZFVSTC5zZWFyY2goXCIjXCIpKzEpKTtcblxuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtZmlsdGVyJywgcGFyYW1ldGVycyk7XG4gICAgLy8gJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCBwYXJhbWV0ZXJzKTtcblxuICAgIC8vIFNvIHRoYXQgY2hhbmdlIGluIGZpbHRlcnMgd2lsbCBub3QgdXBkYXRlIHRoaXNcbiAgICBpZiAob2xkSGFzaC5ib3VuZDEgIT09IHBhcmFtZXRlcnMuYm91bmQxIHx8IG9sZEhhc2guYm91bmQyICE9PSBwYXJhbWV0ZXJzLmJvdW5kMikge1xuXG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItYnktYm91bmQnLCBwYXJhbWV0ZXJzKTtcbiAgICB9XG5cbiAgICAvLyBDaGFuZ2UgaXRlbXNcbiAgICBpZiAob2xkSGFzaC5sYW5nICE9PSBwYXJhbWV0ZXJzLmxhbmcpIHtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgfVxuICB9KVxuXG4gIC8vIDQuIGZpbHRlciBvdXQgaXRlbXMgaW4gYWN0aXZpdHktYXJlYVxuXG4gIC8vIDUuIGdldCBtYXAgZWxlbWVudHNcblxuICAvLyA2LiBnZXQgR3JvdXAgZGF0YVxuXG4gIC8vIDcuIHByZXNlbnQgZ3JvdXAgZWxlbWVudHNcblxuICAvLyBjb25zb2xlLmxvZyh3aW5kb3cuRVZFTlRTX1VSTCB8fCAnaHR0cHM6Ly9kMmhoMTFsMWFqMmtnMS5jbG91ZGZyb250Lm5ldC9kYXRhL3dvbWVuc21hcmNoLmpzLmd6Jyk7XG4gICQuYWpheCh7XG4gICAgdXJsOiAnaHR0cDovL21hcC5qdXN0aWNlZGVtb2NyYXRzLmNvbS9hcGkvZXZlbnRzP2NhbmRpZGF0ZT1hbGV4YW5kcmlhLW9jYXNpby1jb3J0ZXonLCAvLyd8KipEQVRBX1NPVVJDRSoqfCcsXG4gICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICBzdWNjZXNzOiAoZGF0YSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coZGF0YSk7XG4gICAgICB2YXIgcGFyYW1ldGVycyA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG4gICAgICB2YXIgdGFyZ2V0RGF0YSA9IGRhdGEubWFwKChpdGVtKT0+e1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGF0OiBpdGVtLmxvY2F0aW9uLmxvY2F0aW9uLmxhdGl0dWRlLFxuICAgICAgICAgICAgZXZlbnRfdHlwZTogaXRlbS50eXBlLFxuICAgICAgICAgICAgc3VwZXJncm91cDogXCJPY2FzaW8gZm9yIFVTIENvbmdyZXNzXCIsXG4gICAgICAgICAgICBzdGFydF9kYXRldGltZTogaXRlbS5zdGFydF9kYXRlLFxuICAgICAgICAgICAgdHo6IFwiRVNUXCIsXG4gICAgICAgICAgICB2ZW51ZTogaXRlbS5sb2NhdGlvbi52ZW51ZSArIFtpdGVtLmxvY2F0aW9uLmFkZHJlc3NfbGluZXMuam9pbiggKSwgaXRlbS5sb2NhdGlvbi5sb2NhbGl0eSwgaXRlbS5sb2NhdGlvbi5yZWdpb24sIGl0ZW0ubG9jYXRpb24ucG9zdGFsX2NvZGVdLmpvaW4oXCIgXCIpLFxuICAgICAgICAgICAgbG5nOiBpdGVtLmxvY2F0aW9uLmxvY2F0aW9uLmxvbmdpdHVkZSxcbiAgICAgICAgICAgIHVybDogaXRlbS5icm93c2VyX3VybCxcbiAgICAgICAgICAgIHRpdGxlOiBpdGVtLnRpdGxlLFxuICAgICAgICAgICAgZ3JvdXA6IG51bGxcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyAkKCcjZXZlbnRzLWNvdW50JykudGV4dChgJHt3aW5kb3cuRVZFTlRTX0RBVEEubGVuZ3RofSBXYWxrb3V0cyBhbmQgQ291bnRpbmdgKS5jc3MoJ29wYWNpdHknLCAxKTtcblxuXG4gICAgICB0YXJnZXREYXRhLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgaXRlbVsnZXZlbnRfdHlwZSddID0gJ0FjdGlvbic7XG4gICAgICB9KVxuXG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtdXBkYXRlJywgeyBwYXJhbXM6IHBhcmFtZXRlcnMsIGRhdGE6IHRhcmdldERhdGEgfSk7XG4gICAgICAvLyAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIHBhcmFtZXRlcnMpO1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtcGxvdCcsIHsgZGF0YTogdGFyZ2V0RGF0YSwgcGFyYW1zOiBwYXJhbWV0ZXJzIH0pO1xuICAgICAgLy8gJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCBwYXJhbWV0ZXJzKTtcbiAgICAgIC8vVE9ETzogTWFrZSB0aGUgZ2VvanNvbiBjb252ZXJzaW9uIGhhcHBlbiBvbiB0aGUgYmFja2VuZFxuXG4gICAgICAvL1JlZnJlc2ggdGhpbmdzXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgbGV0IHAgPSBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpO1xuICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC11cGRhdGUnLCBwKTtcbiAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtZmlsdGVyJywgcCk7XG4gICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcCk7XG4gICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItYnktYm91bmQnLCBwKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpKVxuICAgICAgfSwgMTAwKTtcblxuXG4gICAgICB2YXIgZGlzdHJpY3RfYm91bmRhcnkgPSBuZXcgTC5nZW9Kc29uKG51bGwsIHtcbiAgICAgICAgY2xpY2thYmxlOiBmYWxzZVxuICAgICAgfSk7XG4gICAgICBkaXN0cmljdF9ib3VuZGFyeS5hZGRUbyhtYXBNYW5hZ2VyLmdldE1hcCgpKTtcbiAgICAgICQuYWpheCh7XG4gICAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcbiAgICAgICAgdXJsOiBcIi9kYXRhL05ZLTE0Lmpzb25cIixcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIC8vICQoZGF0YS5nZW9qc29uKS5lYWNoKGZ1bmN0aW9uKGtleSwgaXRlbSkge1xuICAgICAgICAgICAgZGlzdHJpY3RfYm91bmRhcnlcbiAgICAgICAgICAgICAgLmFkZERhdGEoZGF0YS5nZW9qc29uKVxuICAgICAgICAgICAgICAuc2V0U3R5bGUoe1xuICAgICAgICAgICAgICAgIGZpbGxDb2xvcjogJ3JnYmEoODcsIDM3LCAxMjUsIDAuMjYpJyxcbiAgICAgICAgICAgICAgICBjb2xvcjogJ3JnYmEoODcsIDM3LCAxMjUsIDAuOCknXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gaWYgKCFwYXJhbXMuemlwY29kZSB8fCBwYXJhbXMuemlwY29kZSA9PT0gJycpIHtcblxuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgIC8vIH0pO1xuICAgICAgICAgIGNvbnNvbGUubG9nKGRpc3RyaWN0X2JvdW5kYXJ5KTtcbiAgICAgICAgICBtYXBNYW5hZ2VyLmdldE1hcCgpXG4gICAgICAgICAgICAuZml0Qm91bmRzKGRpc3RyaWN0X2JvdW5kYXJ5LmdldEJvdW5kcygpLCB7IGFuaW1hdGU6IGZhbHNlIH0pO1xuICAgICAgICAgIGRpc3RyaWN0X2JvdW5kYXJ5LmJyaW5nVG9CYWNrKCk7XG4gICAgICAgIH1cbiAgICAgIH0pLmVycm9yKGZ1bmN0aW9uKCkge30pO1xuICAgIH1cbiAgfSk7XG5cblxuXG59KShqUXVlcnkpO1xuIl19
