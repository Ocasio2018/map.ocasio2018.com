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
      // console.log(data);
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
          // console.log(district_boundary);
          mapManager.getMap().fitBounds(district_boundary.getBounds(), { animate: false });
          district_boundary.bringToBack();
        }
      }).error(function () {});
    }
  });
})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9sYW5ndWFnZS5qcyIsImNsYXNzZXMvbGlzdC5qcyIsImNsYXNzZXMvbWFwLmpzIiwiY2xhc3Nlcy9xdWVyeS5qcyIsImFwcC5qcyJdLCJuYW1lcyI6WyJBdXRvY29tcGxldGVNYW5hZ2VyIiwiJCIsInRhcmdldCIsIkFQSV9LRVkiLCJ0YXJnZXRJdGVtIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwicXVlcnlNZ3IiLCJRdWVyeU1hbmFnZXIiLCJnZW9jb2RlciIsImdvb2dsZSIsIm1hcHMiLCJHZW9jb2RlciIsIiR0YXJnZXQiLCJpbml0aWFsaXplIiwidHlwZWFoZWFkIiwiaGludCIsImhpZ2hsaWdodCIsIm1pbkxlbmd0aCIsImNsYXNzTmFtZXMiLCJtZW51IiwibmFtZSIsImRpc3BsYXkiLCJpdGVtIiwiZm9ybWF0dGVkX2FkZHJlc3MiLCJsaW1pdCIsInNvdXJjZSIsInEiLCJzeW5jIiwiYXN5bmMiLCJnZW9jb2RlIiwiYWRkcmVzcyIsInJlc3VsdHMiLCJzdGF0dXMiLCJvbiIsIm9iaiIsImRhdHVtIiwiZ2VvbWV0cnkiLCJ1cGRhdGVWaWV3cG9ydCIsInZpZXdwb3J0IiwialF1ZXJ5IiwiTGFuZ3VhZ2VNYW5hZ2VyIiwibGFuZ3VhZ2UiLCJkaWN0aW9uYXJ5IiwiJHRhcmdldHMiLCJ1cGRhdGVQYWdlTGFuZ3VhZ2UiLCJ0YXJnZXRMYW5ndWFnZSIsInJvd3MiLCJmaWx0ZXIiLCJpIiwibGFuZyIsImVhY2giLCJpbmRleCIsInRhcmdldEF0dHJpYnV0ZSIsImRhdGEiLCJsYW5nVGFyZ2V0IiwidGV4dCIsInZhbCIsImF0dHIiLCJ0YXJnZXRzIiwiYWpheCIsInVybCIsImRhdGFUeXBlIiwic3VjY2VzcyIsInVwZGF0ZUxhbmd1YWdlIiwiTGlzdE1hbmFnZXIiLCJ0YXJnZXRMaXN0IiwicmVuZGVyRXZlbnQiLCJnbXREYXRlIiwiRGF0ZSIsInN0YXJ0X2RhdGV0aW1lIiwidG9HTVRTdHJpbmciLCJkYXRlIiwibW9tZW50IiwiZm9ybWF0IiwiZ2V0SG91cnMiLCJtYXRjaCIsImV2ZW50X3R5cGUiLCJsYXQiLCJsbmciLCJ0aXRsZSIsInZlbnVlIiwicmVuZGVyR3JvdXAiLCJ3ZWJzaXRlIiwic3VwZXJncm91cCIsImxvY2F0aW9uIiwiZGVzY3JpcHRpb24iLCIkbGlzdCIsInVwZGF0ZUZpbHRlciIsInAiLCJyZW1vdmVQcm9wIiwiYWRkQ2xhc3MiLCJqb2luIiwidXBkYXRlQm91bmRzIiwiYm91bmQxIiwiYm91bmQyIiwibGF0Q2VudGVyIiwibG5nQ2VudGVyIiwic29ydExpc3QiLCJhIiwiYiIsIl9sYXRBIiwiX2xhdEIiLCJfbG5nQSIsIl9sbmdCIiwiZGlzdEEiLCJNYXRoIiwic3FydCIsInBvdyIsImRpc3RCIiwiZmluZCIsInNvcnQiLCJhcHBlbmRUbyIsInBvcHVsYXRlTGlzdCIsImhhcmRGaWx0ZXJzIiwidGFyZ2V0RGF0YSIsImtleVNldCIsImtleSIsInNwbGl0IiwiJGV2ZW50TGlzdCIsIm1hcCIsImxlbmd0aCIsInRvTG93ZXJDYXNlIiwiaW5jbHVkZXMiLCJyZW1vdmUiLCJhcHBlbmQiLCJNYXBNYW5hZ2VyIiwiTEFOR1VBR0UiLCJtYXBNYXJrZXIiLCJ3bUljb24iLCJMIiwiaWNvbiIsImljb25VcmwiLCJpY29uU2l6ZSIsImljb25BbmNob3IiLCJwb3B1cEFuY2hvciIsInNoYWRvd1VybCIsInNoYWRvd1NpemUiLCJzaGFkb3dBbmNob3IiLCJyZW5kZXJHZW9qc29uIiwibGlzdCIsImRpY3RMYXRMbmciLCJmb3JFYWNoIiwicHVzaCIsIm1hcEl0ZW1zIiwiT2JqZWN0Iiwia2V5cyIsInBhcnNlRmxvYXQiLCJldmVudHMiLCJyZW5kZXJlZCIsInR5cGUiLCJjb29yZGluYXRlcyIsInByb3BlcnRpZXMiLCJldmVudFByb3BlcnRpZXMiLCJwb3B1cENvbnRlbnQiLCJwb3B1cENsYXNzTmFtZSIsIm9wdGlvbnMiLCJCcm93c2VyIiwibW9iaWxlIiwiZHJhZ2dpbmciLCJzZXRWaWV3Iiwid2luZG93IiwiQ1VTVE9NX0NPT1JEIiwiQ1VTVE9NX1pPT00iLCJzY3JvbGxXaGVlbFpvb20iLCJkaXNhYmxlIiwib25Nb3ZlIiwiZXZlbnQiLCJzdyIsImdldEJvdW5kcyIsIl9zb3V0aFdlc3QiLCJuZSIsIl9ub3J0aEVhc3QiLCJodHRwcyIsInRpbGVMYXllciIsImF0dHJpYnV0aW9uIiwibWF4Wm9vbSIsImFkZFRvIiwiJG1hcCIsImNhbGxiYWNrIiwiZ2V0TWFwIiwic2V0Qm91bmRzIiwiYm91bmRzMSIsImJvdW5kczIiLCJib3VuZHMiLCJmaXRCb3VuZHMiLCJzZXRDZW50ZXIiLCJjZW50ZXIiLCJ6b29tIiwiZ2V0Q2VudGVyQnlMb2NhdGlvbiIsInNob3dNYXBNYXJrZXIiLCJ1bmRlZmluZWQiLCJyZW1vdmVMYXllciIsIk1hcmtlciIsInJlZnJlc2hNYXAiLCJpbnZhbGlkYXRlU2l6ZSIsImZpbHRlck1hcCIsImZpbHRlcnMiLCJoaWRlIiwic2hvdyIsInBsb3RQb2ludHMiLCJnZW9qc29uIiwiZmVhdHVyZXMiLCJnZW9KU09OIiwicG9pbnRUb0xheWVyIiwiZmVhdHVyZSIsImxhdGxuZyIsImV2ZW50VHlwZSIsImdlb2pzb25NYXJrZXJPcHRpb25zIiwicmFkaXVzIiwiZmlsbENvbG9yIiwiY29sb3IiLCJ3ZWlnaHQiLCJvcGFjaXR5IiwiZmlsbE9wYWNpdHkiLCJjaXJjbGVNYXJrZXIiLCJvbkVhY2hGZWF0dXJlIiwibGF5ZXIiLCJiaW5kUG9wdXAiLCJjbGFzc05hbWUiLCJ1cGRhdGUiLCJsYXRMbmciLCJ0YXJnZXRGb3JtIiwicHJldmlvdXMiLCJlIiwicHJldmVudERlZmF1bHQiLCJmb3JtIiwiZGVwYXJhbSIsInNlcmlhbGl6ZSIsImhhc2giLCJwYXJhbSIsInRyaWdnZXIiLCJwYXJhbXMiLCJzdWJzdHJpbmciLCJsb2MiLCJwcm9wIiwiZ2V0UGFyYW1ldGVycyIsInBhcmFtZXRlcnMiLCJ1cGRhdGVMb2NhdGlvbiIsImYiLCJKU09OIiwic3RyaW5naWZ5IiwidXBkYXRlVmlld3BvcnRCeUJvdW5kIiwidHJpZ2dlclN1Ym1pdCIsImF1dG9jb21wbGV0ZU1hbmFnZXIiLCJtYXBNYW5hZ2VyIiwicXVlcnlNYW5hZ2VyIiwiaW5pdFBhcmFtcyIsImluaXRpYWxpemVBdXRvY29tcGxldGVDYWxsYmFjayIsInJlc3VsdCIsImxhbmd1YWdlTWFuYWdlciIsImxpc3RNYW5hZ2VyIiwicGFyc2UiLCJvcHQiLCJ0b2dnbGVDbGFzcyIsInNldFRpbWVvdXQiLCJyZW1vdmVDbGFzcyIsImN1cnJlbnRUYXJnZXQiLCJvbGRVUkwiLCJvcmlnaW5hbEV2ZW50Iiwib2xkSGFzaCIsInNlYXJjaCIsImxhdGl0dWRlIiwic3RhcnRfZGF0ZSIsInR6IiwiYWRkcmVzc19saW5lcyIsImxvY2FsaXR5IiwicmVnaW9uIiwicG9zdGFsX2NvZGUiLCJsb25naXR1ZGUiLCJicm93c2VyX3VybCIsImdyb3VwIiwiZGlzdHJpY3RfYm91bmRhcnkiLCJnZW9Kc29uIiwiY2xpY2thYmxlIiwiYWRkRGF0YSIsInNldFN0eWxlIiwiYW5pbWF0ZSIsImJyaW5nVG9CYWNrIiwiZXJyb3IiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7O0FBQ0EsSUFBTUEsc0JBQXVCLFVBQVNDLENBQVQsRUFBWTtBQUN2Qzs7QUFFQSxTQUFPLFVBQUNDLE1BQUQsRUFBWTs7QUFFakIsUUFBTUMsVUFBVSx5Q0FBaEI7QUFDQSxRQUFNQyxhQUFhLE9BQU9GLE1BQVAsSUFBaUIsUUFBakIsR0FBNEJHLFNBQVNDLGFBQVQsQ0FBdUJKLE1BQXZCLENBQTVCLEdBQTZEQSxNQUFoRjtBQUNBLFFBQU1LLFdBQVdDLGNBQWpCO0FBQ0EsUUFBSUMsV0FBVyxJQUFJQyxPQUFPQyxJQUFQLENBQVlDLFFBQWhCLEVBQWY7O0FBRUEsV0FBTztBQUNMQyxlQUFTWixFQUFFRyxVQUFGLENBREo7QUFFTEYsY0FBUUUsVUFGSDtBQUdMVSxrQkFBWSxzQkFBTTtBQUNoQmIsVUFBRUcsVUFBRixFQUFjVyxTQUFkLENBQXdCO0FBQ1pDLGdCQUFNLElBRE07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QUFFUkMsbUJBQU87QUFGQyxXQUZaO0FBTUE7O0FBRUE7QUFDRjtBQUNBO0FBQ0FrQyxxQkFBV2pFLE1BQVgsR0FDR0ssU0FESCxDQUNhdUYsa0JBQWtCdkcsU0FBbEIsRUFEYixFQUM0QyxFQUFFNEcsU0FBUyxLQUFYLEVBRDVDO0FBRUFMLDRCQUFrQk0sV0FBbEI7QUFDRDtBQW5CSSxPQUFQLEVBb0JHQyxLQXBCSCxDQW9CUyxZQUFXLENBQUUsQ0FwQnRCO0FBcUJEO0FBdEVJLEdBQVA7QUEyRUQsQ0F4UUQsRUF3UUcvTyxNQXhRSCIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbi8vQVBJIDpBSXphU3lCdWpLVFJ3NXVJWHBfTkhaZ2pZVkR0QnkxZGJ5TnVHRU1cbmNvbnN0IEF1dG9jb21wbGV0ZU1hbmFnZXIgPSAoZnVuY3Rpb24oJCkge1xuICAvL0luaXRpYWxpemF0aW9uLi4uXG5cbiAgcmV0dXJuICh0YXJnZXQpID0+IHtcblxuICAgIGNvbnN0IEFQSV9LRVkgPSBcIkFJemFTeURDMk51R0U3NWpydWtqM2R0R1JKMlRFR0RmS2RlQTE4UVwiO1xuICAgIGNvbnN0IHRhcmdldEl0ZW0gPSB0eXBlb2YgdGFyZ2V0ID09IFwic3RyaW5nXCIgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCkgOiB0YXJnZXQ7XG4gICAgY29uc3QgcXVlcnlNZ3IgPSBRdWVyeU1hbmFnZXIoKTtcbiAgICB2YXIgZ2VvY29kZXIgPSBuZXcgZ29vZ2xlLm1hcHMuR2VvY29kZXIoKTtcblxuICAgIHJldHVybiB7XG4gICAgICAkdGFyZ2V0OiAkKHRhcmdldEl0ZW0pLFxuICAgICAgdGFyZ2V0OiB0YXJnZXRJdGVtLFxuICAgICAgaW5pdGlhbGl6ZTogKCkgPT4ge1xuICAgICAgICAkKHRhcmdldEl0ZW0pLnR5cGVhaGVhZCh7XG4gICAgICAgICAgICAgICAgICAgIGhpbnQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGhpZ2hsaWdodDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgbWluTGVuZ3RoOiA0LFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgbWVudTogJ3R0LWRyb3Bkb3duLW1lbnUnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdzZWFyY2gtcmVzdWx0cycsXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IChpdGVtKSA9PiBpdGVtLmZvcm1hdHRlZF9hZGRyZXNzLFxuICAgICAgICAgICAgICAgICAgICBsaW1pdDogMTAsXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogZnVuY3Rpb24gKHEsIHN5bmMsIGFzeW5jKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdlb2NvZGVyLmdlb2NvZGUoeyBhZGRyZXNzOiBxIH0sIGZ1bmN0aW9uIChyZXN1bHRzLCBzdGF0dXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYXN5bmMocmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICkub24oJ3R5cGVhaGVhZDpzZWxlY3RlZCcsIGZ1bmN0aW9uIChvYmosIGRhdHVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGRhdHVtKVxuICAgICAgICAgICAgICAgICAgICB7XG5cbiAgICAgICAgICAgICAgICAgICAgICB2YXIgZ2VvbWV0cnkgPSBkYXR1bS5nZW9tZXRyeTtcbiAgICAgICAgICAgICAgICAgICAgICBxdWVyeU1nci51cGRhdGVWaWV3cG9ydChnZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gIG1hcC5maXRCb3VuZHMoZ2VvbWV0cnkuYm91bmRzPyBnZW9tZXRyeS5ib3VuZHMgOiBnZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cblxuXG4gICAgcmV0dXJuIHtcblxuICAgIH1cbiAgfVxuXG59KGpRdWVyeSkpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBMYW5ndWFnZU1hbmFnZXIgPSAoKCQpID0+IHtcbiAgLy9rZXlWYWx1ZVxuXG4gIC8vdGFyZ2V0cyBhcmUgdGhlIG1hcHBpbmdzIGZvciB0aGUgbGFuZ3VhZ2VcbiAgcmV0dXJuICgpID0+IHtcbiAgICBsZXQgbGFuZ3VhZ2U7XG4gICAgbGV0IGRpY3Rpb25hcnkgPSB7fTtcbiAgICBsZXQgJHRhcmdldHMgPSAkKFwiW2RhdGEtbGFuZy10YXJnZXRdW2RhdGEtbGFuZy1rZXldXCIpO1xuXG4gICAgY29uc3QgdXBkYXRlUGFnZUxhbmd1YWdlID0gKCkgPT4ge1xuXG4gICAgICBsZXQgdGFyZ2V0TGFuZ3VhZ2UgPSBkaWN0aW9uYXJ5LnJvd3MuZmlsdGVyKChpKSA9PiBpLmxhbmcgPT09IGxhbmd1YWdlKVswXTtcblxuICAgICAgJHRhcmdldHMuZWFjaCgoaW5kZXgsIGl0ZW0pID0+IHtcbiAgICAgICAgbGV0IHRhcmdldEF0dHJpYnV0ZSA9ICQoaXRlbSkuZGF0YSgnbGFuZy10YXJnZXQnKTtcbiAgICAgICAgbGV0IGxhbmdUYXJnZXQgPSAkKGl0ZW0pLmRhdGEoJ2xhbmcta2V5Jyk7XG5cbiAgICAgICAgc3dpdGNoKHRhcmdldEF0dHJpYnV0ZSkge1xuICAgICAgICAgIGNhc2UgJ3RleHQnOlxuICAgICAgICAgICAgJChpdGVtKS50ZXh0KHRhcmdldExhbmd1YWdlW2xhbmdUYXJnZXRdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3ZhbHVlJzpcbiAgICAgICAgICAgICQoaXRlbSkudmFsKHRhcmdldExhbmd1YWdlW2xhbmdUYXJnZXRdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAkKGl0ZW0pLmF0dHIodGFyZ2V0QXR0cmlidXRlLCB0YXJnZXRMYW5ndWFnZVtsYW5nVGFyZ2V0XSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGxhbmd1YWdlLFxuICAgICAgdGFyZ2V0czogJHRhcmdldHMsXG4gICAgICBkaWN0aW9uYXJ5LFxuICAgICAgaW5pdGlhbGl6ZTogKGxhbmcpID0+IHtcblxuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgIC8vIHVybDogJ2h0dHBzOi8vZ3N4Mmpzb24uY29tL2FwaT9pZD0xTzNlQnlqTDF2bFlmN1o3YW0tX2h0UlRRaTczUGFmcUlmTkJkTG1YZThTTSZzaGVldD0xJyxcbiAgICAgICAgICB1cmw6ICcvZGF0YS9sYW5nLmpzb24nLFxuICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgICAgc3VjY2VzczogKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGRpY3Rpb25hcnkgPSBkYXRhO1xuICAgICAgICAgICAgbGFuZ3VhZ2UgPSBsYW5nO1xuICAgICAgICAgICAgdXBkYXRlUGFnZUxhbmd1YWdlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGVMYW5ndWFnZTogKGxhbmcpID0+IHtcblxuICAgICAgICBsYW5ndWFnZSA9IGxhbmc7XG4gICAgICAgIHVwZGF0ZVBhZ2VMYW5ndWFnZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxufSkoalF1ZXJ5KTtcbiIsIi8qIFRoaXMgbG9hZHMgYW5kIG1hbmFnZXMgdGhlIGxpc3QhICovXG5cbmNvbnN0IExpc3RNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIHJldHVybiAodGFyZ2V0TGlzdCA9IFwiI2V2ZW50cy1saXN0XCIpID0+IHtcbiAgICBjb25zdCAkdGFyZ2V0ID0gdHlwZW9mIHRhcmdldExpc3QgPT09ICdzdHJpbmcnID8gJCh0YXJnZXRMaXN0KSA6IHRhcmdldExpc3Q7XG5cbiAgICBjb25zdCByZW5kZXJFdmVudCA9IChpdGVtKSA9PiB7XG4gICAgICB2YXIgZ210RGF0ZSA9IG5ldyBEYXRlKGl0ZW0uc3RhcnRfZGF0ZXRpbWUpLnRvR01UU3RyaW5nKCk7XG4gICAgICB2YXIgZGF0ZSA9IG1vbWVudChuZXcgRGF0ZShnbXREYXRlKSkuZm9ybWF0KG5ldyBEYXRlKGl0ZW0uc3RhcnRfZGF0ZXRpbWUpLmdldEhvdXJzKCkgPT0gMCA/IFwiZGRkZCBNTU0gRERcIiA6IFwiZGRkZCBNTU0gREQsIGg6bW1hXCIpO1xuXG4gICAgICAvLyBjb25zb2xlLmxvZyhkYXRlLCBuZXcgRGF0ZShpdGVtLnN0YXJ0X2RhdGV0aW1lKSwgbmV3IERhdGUoaXRlbS5zdGFydF9kYXRldGltZSkudG9HTVRTdHJpbmcoKSlcbiAgICAgIGxldCB1cmwgPSBpdGVtLnVybC5tYXRjaCgvXmh0dHBzezAsMX06LykgPyBpdGVtLnVybCA6IFwiLy9cIiArIGl0ZW0udXJsO1xuXG5cblxuICAgICAgcmV0dXJuIGBcbiAgICAgIDxsaSBjbGFzcz0nJHtpdGVtLmV2ZW50X3R5cGV9IGV2ZW50LW9iaiB3aXRoaW4tYm91bmQnIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZXZlbnQgdHlwZS1hY3Rpb25cIj5cbiAgICAgICAgICA8aDIgY2xhc3M9XCJldmVudC10aXRsZVwiPjxhIGhyZWY9XCIke3VybCA9PSAnLy8nID8gJ2phdmFzY3JpcHQ6IHZvaWQobnVsbCknIDogdXJsfVwiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0udGl0bGV9PC9hPjwvaDI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImV2ZW50LWRhdGUgZGF0ZVwiIHN0eWxlPVwiZGlzcGxheTogJHshaXRlbS5zdGFydF9kYXRldGltZSA/ICdub25lJyA6ICdibG9jayd9XCI+JHtkYXRlfTwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1hZGRyZXNzIGFkZHJlc3MtYXJlYVwiPlxuICAgICAgICAgICAgPHA+JHtpdGVtLnZlbnVlfTwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIiBzdHlsZT0nZGlzcGxheTogJHt1cmwgPT0gJy8vJyA/ICdub25lJyA6ICdibG9jayd9Jz5cbiAgICAgICAgICAgIDxhIGhyZWY9XCIke3VybCA9PSAnLy8nID8gJ2phdmFzY3JpcHQ6IHZvaWQobnVsbCknIDogdXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5IHJzdnBcIj5SU1ZQPC9hPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvbGk+XG4gICAgICBgXG4gICAgfTtcblxuICAgIGNvbnN0IHJlbmRlckdyb3VwID0gKGl0ZW0pID0+IHtcbiAgICAgIGxldCB1cmwgPSBpdGVtLndlYnNpdGUubWF0Y2goL15odHRwc3swLDF9Oi8pID8gaXRlbS53ZWJzaXRlIDogXCIvL1wiICsgaXRlbS53ZWJzaXRlO1xuICAgICAgcmV0dXJuIGBcbiAgICAgIDxsaSBjbGFzcz0nJHtpdGVtLmV2ZW50X3R5cGV9IGdyb3VwLW9iaicgZGF0YS1sYXQ9JyR7aXRlbS5sYXR9JyBkYXRhLWxuZz0nJHtpdGVtLmxuZ30nPlxuICAgICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ncm91cCBncm91cC1vYmpcIj5cbiAgICAgICAgICA8dWwgY2xhc3M9XCJldmVudC10eXBlcy1saXN0XCI+XG4gICAgICAgICAgICA8bGkgY2xhc3M9XCJ0YWcgdGFnLSR7aXRlbS5zdXBlcmdyb3VwfVwiPiR7aXRlbS5zdXBlcmdyb3VwfTwvbGk+XG4gICAgICAgICAgPC91bD5cbiAgICAgICAgICA8aDI+PGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0ubmFtZX08L2E+PC9oMj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGV0YWlscy1hcmVhXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtbG9jYXRpb24gbG9jYXRpb25cIj4ke2l0ZW0ubG9jYXRpb259PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGVzY3JpcHRpb25cIj5cbiAgICAgICAgICAgICAgPHA+JHtpdGVtLmRlc2NyaXB0aW9ufTwvcD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgICAgPGEgaHJlZj1cIiR7dXJsfVwiIHRhcmdldD0nX2JsYW5rJyBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCI+R2V0IEludm9sdmVkPC9hPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvbGk+XG4gICAgICBgXG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAkbGlzdDogJHRhcmdldCxcbiAgICAgIHVwZGF0ZUZpbHRlcjogKHApID0+IHtcbiAgICAgICAgaWYoIXApIHJldHVybjtcblxuICAgICAgICAvLyBSZW1vdmUgRmlsdGVyc1xuXG4gICAgICAgICR0YXJnZXQucmVtb3ZlUHJvcChcImNsYXNzXCIpO1xuICAgICAgICAkdGFyZ2V0LmFkZENsYXNzKHAuZmlsdGVyID8gcC5maWx0ZXIuam9pbihcIiBcIikgOiAnJylcbiAgICAgIH0sXG4gICAgICB1cGRhdGVCb3VuZHM6IChib3VuZDEsIGJvdW5kMikgPT4ge1xuXG4gICAgICAgIC8vIGNvbnN0IGJvdW5kcyA9IFtwLmJvdW5kczEsIHAuYm91bmRzMl07XG5cblxuICAgICAgICAvLyAkdGFyZ2V0LmZpbmQoJ3VsIGxpLmV2ZW50LW9iaiwgdWwgbGkuZ3JvdXAtb2JqJykuZWFjaCgoaW5kLCBpdGVtKT0+IHtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gICBsZXQgX2xhdCA9ICQoaXRlbSkuZGF0YSgnbGF0JyksXG4gICAgICAgIC8vICAgICAgIF9sbmcgPSAkKGl0ZW0pLmRhdGEoJ2xuZycpO1xuICAgICAgICAvL1xuICAgICAgICAvLyAgIC8vIGNvbnNvbGUubG9nKFwidXBkYXRlQm91bmRzXCIsIGl0ZW0pXG4gICAgICAgIC8vICAgaWYgKGJvdW5kMVswXSA8PSBfbGF0ICYmIGJvdW5kMlswXSA+PSBfbGF0ICYmIGJvdW5kMVsxXSA8PSBfbG5nICYmIGJvdW5kMlsxXSA+PSBfbG5nKSB7XG4gICAgICAgIC8vICAgICAvLyBjb25zb2xlLmxvZyhcIkFkZGluZyBib3VuZHNcIik7XG4gICAgICAgIC8vICAgICAkKGl0ZW0pLmFkZENsYXNzKCd3aXRoaW4tYm91bmQnKTtcbiAgICAgICAgLy8gICB9IGVsc2Uge1xuICAgICAgICAvLyAgICAgJChpdGVtKS5yZW1vdmVDbGFzcygnd2l0aGluLWJvdW5kJyk7XG4gICAgICAgIC8vICAgfVxuICAgICAgICAvLyB9KTtcbiAgICAgICAgLy8gJChpdGVtKS5hZGRDbGFzcygnd2l0aGluLWJvdW5kJyk7XG5cbiAgICAgICAgLy8gT3JkZXJzIHRoZSBzZXQgdG8gbmVhcmVzdFxuICAgICAgICBsZXQgbGF0Q2VudGVyID0gKGJvdW5kMVswXSArIGJvdW5kMlswXSkgLyAyLFxuICAgICAgICAgICAgbG5nQ2VudGVyID0gKGJvdW5kMVsxXSArIGJvdW5kMlsxXSkgLyAyO1xuICAgICAgICBjb25zdCBzb3J0TGlzdCA9IChhLCBiKSA9PiB7XG4gICAgICAgICAgbGV0IF9sYXRBID0gJChhKS5kYXRhKCdsYXQnKSxcbiAgICAgICAgICAgICAgX2xhdEIgPSAkKGIpLmRhdGEoJ2xhdCcpLFxuICAgICAgICAgICAgICBfbG5nQSA9ICQoYSkuZGF0YSgnbG5nJyksXG4gICAgICAgICAgICAgIF9sbmdCID0gJChiKS5kYXRhKCdsbmcnKTtcblxuICAgICAgICAgIGxldCBkaXN0QSA9IE1hdGguc3FydChNYXRoLnBvdyhsYXRDZW50ZXIgLSBfbGF0QSwgMikgKyBNYXRoLnBvdyhsbmdDZW50ZXIgLSBfbG5nQSwgMikpLFxuICAgICAgICAgICAgICBkaXN0QiA9IE1hdGguc3FydChNYXRoLnBvdyhsYXRDZW50ZXIgLSBfbGF0QiwgMikgKyBNYXRoLnBvdyhsbmdDZW50ZXIgLSBfbG5nQiwgMikpO1xuXG4gICAgICAgICAgJChhKS5hdHRyKCdkYXRhLWRpc3RhbmNlJywgZGlzdEEpO1xuXG4gICAgICAgICAgcmV0dXJuIGRpc3RBIC0gZGlzdEI7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHRhcmdldC5maW5kKCd1bCBsaS5ldmVudC1vYmosIHVsIGxpLmdyb3VwLW9iaicpXG4gICAgICAgICAgICAuc29ydChzb3J0TGlzdClcbiAgICAgICAgICAgIC5hcHBlbmRUbygkdGFyZ2V0LmZpbmQoJ3VsJykpO1xuICAgICAgfSxcbiAgICAgIHBvcHVsYXRlTGlzdDogKGhhcmRGaWx0ZXJzLCB0YXJnZXREYXRhKSA9PiB7XG4gICAgICAgIC8vdXNpbmcgd2luZG93LkVWRU5UX0RBVEFcbiAgICAgICAgY29uc3Qga2V5U2V0ID0gIWhhcmRGaWx0ZXJzLmtleSA/IFtdIDogaGFyZEZpbHRlcnMua2V5LnNwbGl0KCcsJyk7XG5cbiAgICAgICAgLy8gY29uc29sZS5sb2codGFyZ2V0RGF0YSk7XG5cbiAgICAgICAgdmFyICRldmVudExpc3QgPSB0YXJnZXREYXRhLm1hcChpdGVtID0+IHtcbiAgICAgICAgICBpZiAoa2V5U2V0Lmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gaXRlbS5ldmVudF90eXBlICYmIGl0ZW0uZXZlbnRfdHlwZS50b0xvd2VyQ2FzZSgpID09ICdncm91cCcgPyByZW5kZXJHcm91cChpdGVtKSA6IHJlbmRlckV2ZW50KGl0ZW0pO1xuICAgICAgICAgIH0gZWxzZSBpZiAoa2V5U2V0Lmxlbmd0aCA+IDAgJiYgaXRlbS5ldmVudF90eXBlICE9ICdncm91cCcgJiYga2V5U2V0LmluY2x1ZGVzKGl0ZW0uZXZlbnRfdHlwZSkpIHtcbiAgICAgICAgICAgIHJldHVybiByZW5kZXJFdmVudChpdGVtKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGtleVNldC5sZW5ndGggPiAwICYmIGl0ZW0uZXZlbnRfdHlwZSA9PSAnZ3JvdXAnICYmIGtleVNldC5pbmNsdWRlcyhpdGVtLnN1cGVyZ3JvdXApKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVuZGVyR3JvdXAoaXRlbSlcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gbnVsbDtcblxuICAgICAgICB9KVxuICAgICAgICAkdGFyZ2V0LmZpbmQoJ3VsIGxpJykucmVtb3ZlKCk7XG4gICAgICAgICR0YXJnZXQuZmluZCgndWwnKS5hcHBlbmQoJGV2ZW50TGlzdCk7XG5cbiAgICAgICAgJHRhcmdldC5maW5kKCd1bCBsaScpXG5cbiAgICAgIH1cbiAgICB9O1xuICB9XG59KShqUXVlcnkpO1xuIiwiXG5jb25zdCBNYXBNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIGxldCBMQU5HVUFHRSA9ICdlbic7XG4gIHZhciBtYXBNYXJrZXI7XG4gIGNvbnN0IHdtSWNvbiA9IEwuaWNvbih7XG4gICAgICBpY29uVXJsOiAnL2ltZy9vY2FzaW8tbWFya2VyLnBuZycsXG4gICAgICBpY29uU2l6ZTogWzMwLCA0MV0sXG4gICAgICBpY29uQW5jaG9yOiBbMTUsIDQxXSxcbiAgICAgIHBvcHVwQW5jaG9yOiBbLTMsIC03Nl0sXG4gICAgICBzaGFkb3dVcmw6ICcvaW1nL29jYXNpby1tYXJrZXItc2hhZG93LnBuZycsXG4gICAgICBzaGFkb3dTaXplOiBbNDMsIDE5XSxcbiAgICAgIHNoYWRvd0FuY2hvcjogWzE1LCAxOV1cbiAgfSk7XG5cbiAgY29uc3QgcmVuZGVyRXZlbnQgPSAoaXRlbSkgPT4ge1xuICAgIHZhciBnbXREYXRlID0gbmV3IERhdGUoaXRlbS5zdGFydF9kYXRldGltZSkudG9HTVRTdHJpbmcoKTtcbiAgICB2YXIgZGF0ZSA9IG1vbWVudChuZXcgRGF0ZShnbXREYXRlKSkuZm9ybWF0KG5ldyBEYXRlKGl0ZW0uc3RhcnRfZGF0ZXRpbWUpLmdldEhvdXJzKCkgPT0gMCA/IFwiZGRkZCBNTU0gRERcIiAgOiBcImRkZGQgTU1NIERELCBoOm1tYVwiKTtcblxuICAgIGxldCB1cmwgPSBpdGVtLnVybC5tYXRjaCgvXmh0dHBzezAsMX06LykgPyBpdGVtLnVybCA6IFwiLy9cIiArIGl0ZW0udXJsO1xuXG5cbiAgICByZXR1cm4gYFxuICAgIDxkaXYgY2xhc3M9J3BvcHVwLWl0ZW0gJHtpdGVtLmV2ZW50X3R5cGV9JyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ldmVudCB0eXBlLWFjdGlvblwiPlxuICAgICAgICA8aDIgY2xhc3M9XCJldmVudC10aXRsZVwiPjxhIGhyZWY9XCIke3VybCA9PSAnLy8nID8gJ2phdmFzY3JpcHQ6IHZvaWQobnVsbCknIDogdXJsfVwiIHRhcmdldD0nX2JsYW5rJz4ke2l0ZW0udGl0bGV9PC9hPjwvaDI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1kYXRlIGRhdGVcIiBzdHlsZT1cImRpc3BsYXk6ICR7IWl0ZW0uc3RhcnRfZGF0ZXRpbWUgPyAnbm9uZScgOiAnYmxvY2snfVwiPiR7ZGF0ZX08L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImV2ZW50LWFkZHJlc3MgYWRkcmVzcy1hcmVhXCI+XG4gICAgICAgICAgPHA+JHtpdGVtLnZlbnVlfTwvcD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiIHN0eWxlPSdkaXNwbGF5OiAke3VybCA9PSAnLy8nID8gJ25vbmUnIDogJ2Jsb2NrJ30nPlxuICAgICAgICAgIDxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeSByc3ZwXCI+UlNWUDwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICBgXG4gIH07XG5cbiAgY29uc3QgcmVuZGVyR3JvdXAgPSAoaXRlbSkgPT4ge1xuXG4gICAgbGV0IHVybCA9IGl0ZW0ud2Vic2l0ZS5tYXRjaCgvXmh0dHBzezAsMX06LykgPyBpdGVtLndlYnNpdGUgOiBcIi8vXCIgKyBpdGVtLndlYnNpdGU7XG4gICAgcmV0dXJuIGBcbiAgICA8bGk+XG4gICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ncm91cCBncm91cC1vYmpcIj5cbiAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgIDxsaSBjbGFzcz1cInRhZyB0YWctJHtpdGVtLnN1cGVyZ3JvdXB9XCI+JHtpdGVtLnN1cGVyZ3JvdXB9PC9saT5cbiAgICAgICAgPC91bD5cbiAgICAgICAgPGgyPjxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLm5hbWV9PC9hPjwvaDI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXRhaWxzLWFyZWFcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtbG9jYXRpb24gbG9jYXRpb25cIj4ke2l0ZW0uYWRkcmVzc308L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGVzY3JpcHRpb25cIj5cbiAgICAgICAgICAgIDxwPiR7aXRlbS5kZXNjcmlwdGlvbn08L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICA8YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIj5HZXQgSW52b2x2ZWQ8L2E+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9saT5cbiAgICBgXG4gIH07XG5cbiAgY29uc3QgcmVuZGVyR2VvanNvbiA9IChsaXN0KSA9PiB7XG4gICAgLy8gY29uc29sZS5sb2cobGlzdClcbiAgICAvLyBHZXQgYWxsIHVuaXF1ZSBMYXQtbG9uZ1xuXG4gICAgbGV0IGRpY3RMYXRMbmcgPSB7fTtcblxuICAgIGxpc3QuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgaWYoIWl0ZW0ubGF0IHx8ICFpdGVtLmxuZyB8fCBpdGVtLmxhdCA9PSBcIlwiIHx8IGl0ZW0ubG5nID09IFwiXCIpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIGlmICggIWRpY3RMYXRMbmdbYCR7aXRlbS5sYXR9LCR7aXRlbS5sbmd9YF0gKSB7XG4gICAgICAgIGRpY3RMYXRMbmdbYCR7aXRlbS5sYXR9LCR7aXRlbS5sbmd9YF0gPSBbaXRlbV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkaWN0TGF0TG5nW2Ake2l0ZW0ubGF0fSwke2l0ZW0ubG5nfWBdLnB1c2goaXRlbSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBQYXJzZSBncm91cHMgaXRlbXNcbiAgICBsZXQgbWFwSXRlbXMgPSBbXTtcbiAgICBPYmplY3Qua2V5cyhkaWN0TGF0TG5nKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgbGV0IFtsYXQsIGxuZ10gPSBrZXkuc3BsaXQoJywnKTtcbiAgICAgIG1hcEl0ZW1zLnB1c2goe1xuICAgICAgICBsYXQ6IHBhcnNlRmxvYXQobGF0KSxcbiAgICAgICAgbG5nOiBwYXJzZUZsb2F0KGxuZyksXG4gICAgICAgIGV2ZW50czogZGljdExhdExuZ1trZXldXG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIGNvbnNvbGUubG9nKG1hcEl0ZW1zKTtcblxuICAgIHJldHVybiBtYXBJdGVtcy5tYXAoKGl0ZW0pID0+IHtcbiAgICAgIC8vIHJlbmRlcmVkIGV2ZW50VHlwZVxuICAgICAgbGV0IHJlbmRlcmVkO1xuXG4gICAgICAvLyBjb25zb2xlLmxvZyhpdGVtLmV2ZW50cy5sZW5ndGgpXG4gICAgICBpZiAoaXRlbS5ldmVudHMubGVuZ3RoID09IDEpIHtcbiAgICAgICAgcmVuZGVyZWQgPSByZW5kZXJFdmVudChpdGVtLmV2ZW50c1swXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZW5kZXJlZCA9IGA8ZGl2IGNsYXNzPSdtdWx0aXBsZS1pdGVtcyc+PHVsPiR7aXRlbS5ldmVudHMubWFwKGkgPT4gYDxsaT4ke3JlbmRlckV2ZW50KGkpfTwvbGk+YCkuam9pbignJyl9PC91bD48L2Rpdj5gXG4gICAgICB9XG5cblxuICAgICAgLy8gY29uc29sZS5sb2cocmVuZGVyZWQsIGl0ZW0uZXZlbnRzLmxlbmd0aClcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgXCJ0eXBlXCI6IFwiRmVhdHVyZVwiLFxuICAgICAgICBnZW9tZXRyeToge1xuICAgICAgICAgIHR5cGU6IFwiUG9pbnRcIixcbiAgICAgICAgICBjb29yZGluYXRlczogW2l0ZW0ubG5nLCBpdGVtLmxhdF1cbiAgICAgICAgfSxcbiAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgIGV2ZW50UHJvcGVydGllczogaXRlbSxcbiAgICAgICAgICBwb3B1cENvbnRlbnQ6IHJlbmRlcmVkLFxuICAgICAgICAgIHBvcHVwQ2xhc3NOYW1lOiBpdGVtLmV2ZW50cy5sZW5ndGggPiAxID8gJ3BvcHVwLW11bHRpcGxlLWl0ZW0nIDogJ3BvcHVwLXNpbmdsZS1pdGVtJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiAob3B0aW9ucykgPT4ge1xuICAgIHZhciBtYXAgPSBudWxsO1xuXG4gICAgaWYgKCFMLkJyb3dzZXIubW9iaWxlKSB7XG4gICAgICBtYXAgPSBMLm1hcCgnbWFwJywgeyBkcmFnZ2luZzogIUwuQnJvd3Nlci5tb2JpbGUgfSkuc2V0Vmlldyh3aW5kb3cuQ1VTVE9NX0NPT1JEIHx8IFszOC40MTE0MjcxLC05Ny42NDExMDQ0XSwgd2luZG93LkNVU1RPTV9aT09NIHx8IDQpO1xuICAgICAgbWFwLnNjcm9sbFdoZWVsWm9vbS5kaXNhYmxlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG1hcCA9IEwubWFwKCdtYXAnLCB7IGRyYWdnaW5nOiAhTC5Ccm93c2VyLm1vYmlsZSB9KS5zZXRWaWV3KHdpbmRvdy5DVVNUT01fQ09PUkQgfHwgWzM4LjQxMTQyNzEsLTk3LjY0MTEwNDRdLCAzKTtcbiAgICB9XG5cbiAgICBMQU5HVUFHRSA9IG9wdGlvbnMubGFuZyB8fCAnZW4nO1xuXG4gICAgaWYgKG9wdGlvbnMub25Nb3ZlKSB7XG4gICAgICBtYXAub24oJ2RyYWdlbmQnLCAoZXZlbnQpID0+IHtcblxuXG4gICAgICAgIGxldCBzdyA9IFttYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxuZ107XG4gICAgICAgIGxldCBuZSA9IFttYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxuZ107XG4gICAgICAgIG9wdGlvbnMub25Nb3ZlKHN3LCBuZSk7XG4gICAgICB9KS5vbignem9vbWVuZCcsIChldmVudCkgPT4ge1xuXG5odHRwczovL2RvY3MuZ29vZ2xlLmNvbS9kb2N1bWVudC9kLzFLV2tMTk5lSU9lRkVpVldNTndvWUt1MXlBWlJVRGY3OHhJYkkxaWU3RHZzL2VkaXQ/dXNwPXNoYXJpbmdcbiAgICAgICAgbGV0IHN3ID0gW21hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubG5nXTtcbiAgICAgICAgbGV0IG5lID0gW21hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubG5nXTtcbiAgICAgICAgb3B0aW9ucy5vbk1vdmUoc3csIG5lKTtcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgTC50aWxlTGF5ZXIoJ2h0dHBzOi8vc2VydmVyLmFyY2dpc29ubGluZS5jb20vQXJjR0lTL3Jlc3Qvc2VydmljZXMvQ2FudmFzL1dvcmxkX0xpZ2h0X0dyYXlfQmFzZS9NYXBTZXJ2ZXIvdGlsZS97en0ve3l9L3t4fScsIHtcbiAgICAgIFx0YXR0cmlidXRpb246ICdUaWxlcyAmY29weTsgRXNyaSAmbWRhc2g7IEVzcmksIERlTG9ybWUsIE5BVlRFUScsXG4gICAgICBcdG1heFpvb206IDE2fSkuYWRkVG8obWFwKTtcblxuICAgIGxldCBnZW9jb2RlciA9IG51bGw7XG4gICAgcmV0dXJuIHtcbiAgICAgICRtYXA6IG1hcCxcbiAgICAgIGluaXRpYWxpemU6IChjYWxsYmFjaykgPT4ge1xuICAgICAgICBnZW9jb2RlciA9IG5ldyBnb29nbGUubWFwcy5HZW9jb2RlcigpO1xuICAgICAgICBpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZ2V0TWFwOiAoKSA9PiBtYXAsXG4gICAgICBzZXRCb3VuZHM6IChib3VuZHMxLCBib3VuZHMyKSA9PiB7XG4gICAgICAgIGNvbnN0IGJvdW5kcyA9IFtib3VuZHMxLCBib3VuZHMyXTtcbiAgICAgICAgbWFwLmZpdEJvdW5kcyhib3VuZHMpO1xuICAgICAgfSxcbiAgICAgIHNldENlbnRlcjogKGNlbnRlciwgem9vbSA9IDEwKSA9PiB7XG4gICAgICAgIGlmICghY2VudGVyIHx8ICFjZW50ZXJbMF0gfHwgY2VudGVyWzBdID09IFwiXCJcbiAgICAgICAgICAgICAgfHwgIWNlbnRlclsxXSB8fCBjZW50ZXJbMV0gPT0gXCJcIikgcmV0dXJuO1xuICAgICAgICBtYXAuc2V0VmlldyhjZW50ZXIsIHpvb20pO1xuICAgICAgfSxcbiAgICAgIGdldEJvdW5kczogKCkgPT4ge1xuXG4gICAgICAgIGxldCBzdyA9IFttYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxuZ107XG4gICAgICAgIGxldCBuZSA9IFttYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxuZ107XG5cbiAgICAgICAgcmV0dXJuIFtzdywgbmVdO1xuICAgICAgfSxcbiAgICAgIC8vIENlbnRlciBsb2NhdGlvbiBieSBnZW9jb2RlZFxuICAgICAgZ2V0Q2VudGVyQnlMb2NhdGlvbjogKGxvY2F0aW9uLCBjYWxsYmFjaykgPT4ge1xuXG4gICAgICAgIGdlb2NvZGVyLmdlb2NvZGUoeyBhZGRyZXNzOiBsb2NhdGlvbiB9LCBmdW5jdGlvbiAocmVzdWx0cywgc3RhdHVzKSB7XG5cbiAgICAgICAgICBpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhyZXN1bHRzWzBdKVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgc2hvd01hcE1hcmtlcjogKGxhdCwgbG5nKSA9PiB7XG5cbiAgICAgICAgLy9jb25zb2xlLmxvZyhtYXBNYXJrZXIpO1xuICAgICAgICBpZiAobWFwTWFya2VyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBtYXAucmVtb3ZlTGF5ZXIobWFwTWFya2VyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChsYXQgJiYgbG5nKSB7XG4gICAgICAgICAgbWFwTWFya2VyID0gbmV3IEwuTWFya2VyKFtsYXQsbG5nXSwge1xuICAgICAgICAgICAgaWNvbjogd21JY29uXG4gICAgICAgICAgfSkuYWRkVG8obWFwKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHJlZnJlc2hNYXA6ICgpID0+IHtcbiAgICAgICAgbWFwLmludmFsaWRhdGVTaXplKGZhbHNlKTtcbiAgICAgICAgLy8gbWFwLl9vblJlc2l6ZSgpO1xuXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwibWFwIGlzIHJlc2l6ZWRcIilcbiAgICAgIH0sXG4gICAgICBmaWx0ZXJNYXA6IChmaWx0ZXJzKSA9PiB7XG5cbiAgICAgICAgJChcIiNtYXBcIikuZmluZChcIi5ldmVudC1pdGVtLXBvcHVwXCIpLmhpZGUoKTtcblxuXG4gICAgICAgIGlmICghZmlsdGVycykgcmV0dXJuO1xuXG4gICAgICAgIGZpbHRlcnMuZm9yRWFjaCgoaXRlbSkgPT4ge1xuXG4gICAgICAgICAgJChcIiNtYXBcIikuZmluZChcIi5ldmVudC1pdGVtLXBvcHVwLlwiICsgaXRlbS50b0xvd2VyQ2FzZSgpKS5zaG93KCk7XG4gICAgICAgIH0pXG4gICAgICB9LFxuICAgICAgcGxvdFBvaW50czogKGxpc3QsIGhhcmRGaWx0ZXJzKSA9PiB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGxpc3QpXG4gICAgICAgIGNvbnN0IGtleVNldCA9ICFoYXJkRmlsdGVycy5rZXkgPyBbXSA6IGhhcmRGaWx0ZXJzLmtleS5zcGxpdCgnLCcpO1xuXG4gICAgICAgIGlmIChrZXlTZXQubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGxpc3QgPSBsaXN0LmZpbHRlcigoaXRlbSkgPT4ga2V5U2V0LmluY2x1ZGVzKGl0ZW0uZXZlbnRfdHlwZSkpXG4gICAgICAgIH1cblxuXG4gICAgICAgIGNvbnN0IGdlb2pzb24gPSB7XG4gICAgICAgICAgdHlwZTogXCJGZWF0dXJlQ29sbGVjdGlvblwiLFxuICAgICAgICAgIGZlYXR1cmVzOiByZW5kZXJHZW9qc29uKGxpc3QpXG4gICAgICAgIH07XG5cblxuXG4gICAgICAgIEwuZ2VvSlNPTihnZW9qc29uLCB7XG4gICAgICAgICAgICBwb2ludFRvTGF5ZXI6IChmZWF0dXJlLCBsYXRsbmcpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgZXZlbnRUeXBlID0gZmVhdHVyZS5wcm9wZXJ0aWVzLmV2ZW50UHJvcGVydGllcy5ldmVudF90eXBlO1xuICAgICAgICAgICAgICB2YXIgZ2VvanNvbk1hcmtlck9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgICByYWRpdXM6IDYsXG4gICAgICAgICAgICAgICAgICBmaWxsQ29sb3I6ICBldmVudFR5cGUgJiYgZXZlbnRUeXBlLnRvTG93ZXJDYXNlKCkgPT09ICdncm91cCcgPyBcIiM0MEQ3RDRcIiA6IFwiIzU3MjU4MlwiLFxuICAgICAgICAgICAgICAgICAgY29sb3I6IFwid2hpdGVcIixcbiAgICAgICAgICAgICAgICAgIHdlaWdodDogNCxcbiAgICAgICAgICAgICAgICAgIG9wYWNpdHk6IDAuNSxcbiAgICAgICAgICAgICAgICAgIGZpbGxPcGFjaXR5OiAwLjgsXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIHJldHVybiBMLmNpcmNsZU1hcmtlcihsYXRsbmcsIGdlb2pzb25NYXJrZXJPcHRpb25zKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICBvbkVhY2hGZWF0dXJlOiAoZmVhdHVyZSwgbGF5ZXIpID0+IHtcbiAgICAgICAgICAgIGlmIChmZWF0dXJlLnByb3BlcnRpZXMgJiYgZmVhdHVyZS5wcm9wZXJ0aWVzLnBvcHVwQ29udGVudCkge1xuICAgICAgICAgICAgICBsYXllci5iaW5kUG9wdXAoZmVhdHVyZS5wcm9wZXJ0aWVzLnBvcHVwQ29udGVudCxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogZmVhdHVyZS5wcm9wZXJ0aWVzLnBvcHVwQ2xhc3NOYW1lXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSkuYWRkVG8obWFwKTtcblxuICAgICAgfSxcbiAgICAgIHVwZGF0ZTogKHApID0+IHtcbiAgICAgICAgaWYgKCFwIHx8ICFwLmxhdCB8fCAhcC5sbmcgKSByZXR1cm47XG5cbiAgICAgICAgbWFwLnNldFZpZXcoTC5sYXRMbmcocC5sYXQsIHAubG5nKSwgMTApO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn0pKGpRdWVyeSk7XG4iLCJjb25zdCBRdWVyeU1hbmFnZXIgPSAoKCQpID0+IHtcbiAgcmV0dXJuICh0YXJnZXRGb3JtID0gXCJmb3JtI2ZpbHRlcnMtZm9ybVwiKSA9PiB7XG4gICAgY29uc3QgJHRhcmdldCA9IHR5cGVvZiB0YXJnZXRGb3JtID09PSAnc3RyaW5nJyA/ICQodGFyZ2V0Rm9ybSkgOiB0YXJnZXRGb3JtO1xuICAgIGxldCBsYXQgPSBudWxsO1xuICAgIGxldCBsbmcgPSBudWxsO1xuXG4gICAgbGV0IHByZXZpb3VzID0ge307XG5cbiAgICAkdGFyZ2V0Lm9uKCdzdWJtaXQnLCAoZSkgPT4ge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgbGF0ID0gJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbCgpO1xuICAgICAgbG5nID0gJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbCgpO1xuXG4gICAgICB2YXIgZm9ybSA9ICQuZGVwYXJhbSgkdGFyZ2V0LnNlcmlhbGl6ZSgpKTtcblxuICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAkLnBhcmFtKGZvcm0pO1xuICAgIH0pXG5cbiAgICAkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJy5maWx0ZXItaXRlbSBpbnB1dFt0eXBlPWNoZWNrYm94XScsICgpID0+IHtcbiAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgfSlcblxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGluaXRpYWxpemU6IChjYWxsYmFjaykgPT4ge1xuICAgICAgICBpZiAod2luZG93LmxvY2F0aW9uLmhhc2gubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHZhciBwYXJhbXMgPSAkLmRlcGFyYW0od2luZG93LmxvY2F0aW9uLmhhc2guc3Vic3RyaW5nKDEpKVxuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGFuZ11cIikudmFsKHBhcmFtcy5sYW5nKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKHBhcmFtcy5sYXQpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwocGFyYW1zLmxuZyk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDFdXCIpLnZhbChwYXJhbXMuYm91bmQxKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMl1cIikudmFsKHBhcmFtcy5ib3VuZDIpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG9jXVwiKS52YWwocGFyYW1zLmxvYyk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1rZXldXCIpLnZhbChwYXJhbXMua2V5KTtcblxuICAgICAgICAgIGlmIChwYXJhbXMuZmlsdGVyKSB7XG4gICAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCIuZmlsdGVyLWl0ZW0gaW5wdXRbdHlwZT1jaGVja2JveF1cIikucmVtb3ZlUHJvcChcImNoZWNrZWRcIik7XG4gICAgICAgICAgICBwYXJhbXMuZmlsdGVyLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgICAgICAgICR0YXJnZXQuZmluZChcIi5maWx0ZXItaXRlbSBpbnB1dFt0eXBlPWNoZWNrYm94XVt2YWx1ZT0nXCIgKyBpdGVtICsgXCInXVwiKS5wcm9wKFwiY2hlY2tlZFwiLCB0cnVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZ2V0UGFyYW1ldGVyczogKCkgPT4ge1xuICAgICAgICB2YXIgcGFyYW1ldGVycyA9ICQuZGVwYXJhbSgkdGFyZ2V0LnNlcmlhbGl6ZSgpKTtcbiAgICAgICAgLy8gcGFyYW1ldGVyc1snbG9jYXRpb24nXSA7XG5cbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gcGFyYW1ldGVycykge1xuICAgICAgICAgIGlmICggIXBhcmFtZXRlcnNba2V5XSB8fCBwYXJhbWV0ZXJzW2tleV0gPT0gXCJcIikge1xuICAgICAgICAgICAgZGVsZXRlIHBhcmFtZXRlcnNba2V5XTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGFyYW1ldGVycztcbiAgICAgIH0sXG4gICAgICB1cGRhdGVMb2NhdGlvbjogKGxhdCwgbG5nKSA9PiB7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwobGF0KTtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbChsbmcpO1xuICAgICAgICAvLyAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZVZpZXdwb3J0OiAodmlld3BvcnQpID0+IHtcblxuICAgICAgICBjb25zdCBib3VuZHMgPSBbW3ZpZXdwb3J0LmYuYiwgdmlld3BvcnQuYi5iXSwgW3ZpZXdwb3J0LmYuZiwgdmlld3BvcnQuYi5mXV07XG5cbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDFdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMF0pKTtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDJdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMV0pKTtcbiAgICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGVWaWV3cG9ydEJ5Qm91bmQ6IChzdywgbmUpID0+IHtcblxuICAgICAgICBjb25zdCBib3VuZHMgPSBbc3csIG5lXTsvLy8vLy8vL1xuXG4gICAgICAgIFxuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMV1cIikudmFsKEpTT04uc3RyaW5naWZ5KGJvdW5kc1swXSkpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWJvdW5kMl1cIikudmFsKEpTT04uc3RyaW5naWZ5KGJvdW5kc1sxXSkpO1xuICAgICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfSxcbiAgICAgIHRyaWdnZXJTdWJtaXQ6ICgpID0+IHtcbiAgICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pKGpRdWVyeSk7XG4iLCJsZXQgYXV0b2NvbXBsZXRlTWFuYWdlcjtcbmxldCBtYXBNYW5hZ2VyO1xuXG4oZnVuY3Rpb24oJCkge1xuXG4gIC8vIDEuIGdvb2dsZSBtYXBzIGdlb2NvZGVcblxuICAvLyAyLiBmb2N1cyBtYXAgb24gZ2VvY29kZSAodmlhIGxhdC9sbmcpXG4gIGNvbnN0IHF1ZXJ5TWFuYWdlciA9IFF1ZXJ5TWFuYWdlcigpO1xuICAgICAgICBxdWVyeU1hbmFnZXIuaW5pdGlhbGl6ZSgpO1xuXG4gIGNvbnN0IGluaXRQYXJhbXMgPSBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpO1xuICBtYXBNYW5hZ2VyID0gTWFwTWFuYWdlcih7XG4gICAgb25Nb3ZlOiAoc3csIG5lKSA9PiB7XG4gICAgICAvLyBXaGVuIHRoZSBtYXAgbW92ZXMgYXJvdW5kLCB3ZSB1cGRhdGUgdGhlIGxpc3RcbiAgICAgIHF1ZXJ5TWFuYWdlci51cGRhdGVWaWV3cG9ydEJ5Qm91bmQoc3csIG5lKTtcbiAgICAgIC8vdXBkYXRlIFF1ZXJ5XG4gICAgfVxuICB9KTtcblxuICB3aW5kb3cuaW5pdGlhbGl6ZUF1dG9jb21wbGV0ZUNhbGxiYWNrID0gKCkgPT4ge1xuXG4gICAgYXV0b2NvbXBsZXRlTWFuYWdlciA9IEF1dG9jb21wbGV0ZU1hbmFnZXIoXCJpbnB1dFtuYW1lPSdsb2MnXVwiKTtcbiAgICBhdXRvY29tcGxldGVNYW5hZ2VyLmluaXRpYWxpemUoKTtcblxuICAgIGlmIChpbml0UGFyYW1zLmxvYyAmJiBpbml0UGFyYW1zLmxvYyAhPT0gJycgJiYgKCFpbml0UGFyYW1zLmJvdW5kMSAmJiAhaW5pdFBhcmFtcy5ib3VuZDIpKSB7XG4gICAgICBtYXBNYW5hZ2VyLmluaXRpYWxpemUoKCkgPT4ge1xuICAgICAgICBtYXBNYW5hZ2VyLmdldENlbnRlckJ5TG9jYXRpb24oaW5pdFBhcmFtcy5sb2MsIChyZXN1bHQpID0+IHtcbiAgICAgICAgICBxdWVyeU1hbmFnZXIudXBkYXRlVmlld3BvcnQocmVzdWx0Lmdlb21ldHJ5LnZpZXdwb3J0KTtcbiAgICAgICAgfSk7XG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG5cbiAgY29uc3QgbGFuZ3VhZ2VNYW5hZ2VyID0gTGFuZ3VhZ2VNYW5hZ2VyKCk7XG5cbiAgbGFuZ3VhZ2VNYW5hZ2VyLmluaXRpYWxpemUoaW5pdFBhcmFtc1snbGFuZyddIHx8ICdlbicpO1xuXG4gIGNvbnN0IGxpc3RNYW5hZ2VyID0gTGlzdE1hbmFnZXIoKTtcblxuICBpZihpbml0UGFyYW1zLmxhdCAmJiBpbml0UGFyYW1zLmxuZykge1xuICAgIG1hcE1hbmFnZXIuc2V0Q2VudGVyKFtpbml0UGFyYW1zLmxhdCwgaW5pdFBhcmFtcy5sbmddKTtcbiAgfVxuXG4gIC8qKipcbiAgKiBMaXN0IEV2ZW50c1xuICAqIFRoaXMgd2lsbCB0cmlnZ2VyIHRoZSBsaXN0IHVwZGF0ZSBtZXRob2RcbiAgKi9cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGlzdC11cGRhdGUnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcbiAgICBsaXN0TWFuYWdlci5wb3B1bGF0ZUxpc3Qob3B0aW9ucy5wYXJhbXMsIG9wdGlvbnMuZGF0YSk7XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIGxpc3RNYW5hZ2VyLnVwZGF0ZUZpbHRlcihvcHRpb25zKTtcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGlzdC1maWx0ZXItYnktYm91bmQnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcbiAgICBsZXQgYm91bmQxLCBib3VuZDI7XG5cbiAgICBpZiAoIW9wdGlvbnMgfHwgIW9wdGlvbnMuYm91bmQxIHx8ICFvcHRpb25zLmJvdW5kMikge1xuICAgICAgW2JvdW5kMSwgYm91bmQyXSA9IG1hcE1hbmFnZXIuZ2V0Qm91bmRzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJvdW5kMSA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDEpO1xuICAgICAgYm91bmQyID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMik7XG4gICAgfVxuXG5cblxuICAgIGxpc3RNYW5hZ2VyLnVwZGF0ZUJvdW5kcyhib3VuZDEsIGJvdW5kMilcbiAgfSlcblxuICAvKioqXG4gICogTWFwIEV2ZW50c1xuICAqL1xuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtdXBkYXRlJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgLy8gbWFwTWFuYWdlci5zZXRDZW50ZXIoW29wdGlvbnMubGF0LCBvcHRpb25zLmxuZ10pO1xuICAgIGlmICghb3B0aW9ucyB8fCAhb3B0aW9ucy5ib3VuZDEgfHwgIW9wdGlvbnMuYm91bmQyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGJvdW5kMSA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDEpO1xuICAgIHZhciBib3VuZDIgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQyKTtcbiAgICBtYXBNYW5hZ2VyLnNldEJvdW5kcyhib3VuZDEsIGJvdW5kMik7XG4gICAgLy8gY29uc29sZS5sb2cob3B0aW9ucylcbiAgfSk7XG4gIC8vIDMuIG1hcmtlcnMgb24gbWFwXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLW1hcC1wbG90JywgKGUsIG9wdCkgPT4ge1xuXG4gICAgbWFwTWFuYWdlci5wbG90UG9pbnRzKG9wdC5kYXRhLCBvcHQucGFyYW1zKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1maWx0ZXInKTtcbiAgfSlcblxuICAvLyBGaWx0ZXIgbWFwXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLW1hcC1maWx0ZXInLCAoZSwgb3B0KSA9PiB7XG4gICAgaWYgKG9wdCkge1xuICAgICAgbWFwTWFuYWdlci5maWx0ZXJNYXAob3B0LmZpbHRlcik7XG4gICAgfVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1sYW5ndWFnZS11cGRhdGUnLCAoZSwgb3B0KSA9PiB7XG4gICAgaWYgKG9wdCkge1xuICAgICAgbGFuZ3VhZ2VNYW5hZ2VyLnVwZGF0ZUxhbmd1YWdlKG9wdC5sYW5nKTtcbiAgICB9XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICdidXR0b24jc2hvdy1oaWRlLW1hcCcsIChlLCBvcHQpID0+IHtcbiAgICAkKCdib2R5JykudG9nZ2xlQ2xhc3MoJ21hcC12aWV3JylcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJ2J1dHRvbiNzaG93LW1hcCcsIChlLCBvcHQpID0+IHtcbiAgICAkKCdib2R5JykuYWRkQ2xhc3MoJ21hcC12aWV3Jyk7XG5cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBtYXBNYW5hZ2VyLnJlZnJlc2hNYXAoKTtcbiAgICAgIH0sIDEwKVxuXG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICdidXR0b24jc2hvdy1saXN0JywgKGUsIG9wdCkgPT4ge1xuICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbWFwLXZpZXcnKTtcbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJ2J1dHRvbi5idG4ubW9yZS1pdGVtcycsIChlLCBvcHQpID0+IHtcbiAgICAkKCcjZW1iZWQtYXJlYScpLnRvZ2dsZUNsYXNzKCdvcGVuJyk7XG4gIH0pXG5cbiAgLy8gU2hvd3MgcG9pbnRlcnMgd2l0aGluIG1hcFxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1zaG93LW1hcmtlcicsIChlLCBvcHQpID0+IHtcbiAgICBsZXQgbGF0ID0gb3B0LmxhdCwgbG5nID0gb3B0LmxuZywgY2xhc3NOYW1lID0gYCR7b3B0LmxhdH0tLSR7b3B0LmxuZ31gO1xuICAgIG1hcE1hbmFnZXIuc2hvd01hcE1hcmtlcihsYXQsIGxuZywgY2xhc3NOYW1lKTtcbiAgfSlcblxuICAvL0FkZCBldmVudCB0byBsaXN0TWFuYWdlclxuICAkKGRvY3VtZW50KS5vbignbW91c2VlbnRlcicsICdkaXYjZXZlbnRzLWxpc3QgdWwgbGkuZXZlbnQtb2JqJywgKGUpID0+IHtcbiAgICBtYXBNYW5hZ2VyLnNob3dNYXBNYXJrZXIoJChlLmN1cnJlbnRUYXJnZXQpLmRhdGEoJ2xhdCcpLCAkKGUuY3VycmVudFRhcmdldCkuZGF0YSgnbG5nJykpO1xuICB9KVxuXG4gICQoZG9jdW1lbnQpLm9uKCdtb3VzZWVudGVyJywgJ3NlY3Rpb24jbWFwJywgKGUpID0+IHtcbiAgICBtYXBNYW5hZ2VyLnNob3dNYXBNYXJrZXIoKTtcbiAgfSlcblxuICAvLyAkKGRvY3VtZW50KS5vbigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCAoZSwgb3B0KSA9PiB7XG4gIC8vICAgLy91cGRhdGUgZW1iZWQgbGluZVxuICAvLyAgIHZhciBjb3B5ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvcHQpKTtcbiAgLy8gICBkZWxldGUgY29weVsnbG5nJ107XG4gIC8vICAgZGVsZXRlIGNvcHlbJ2xhdCddO1xuICAvLyAgIGRlbGV0ZSBjb3B5Wydib3VuZDEnXTtcbiAgLy8gICBkZWxldGUgY29weVsnYm91bmQyJ107XG4gIC8vXG4gIC8vICAgJCgnI2VtYmVkLWFyZWEgaW5wdXRbbmFtZT1lbWJlZF0nKS52YWwoJyMnICsgJC5wYXJhbShjb3B5KSk7XG4gIC8vIH0pO1xuXG4gICQod2luZG93KS5vbihcInJlc2l6ZVwiLCAoZSkgPT4ge1xuICAgIG1hcE1hbmFnZXIucmVmcmVzaE1hcCgpO1xuICB9KTtcblxuICAkKHdpbmRvdykub24oXCJoYXNoY2hhbmdlXCIsIChldmVudCkgPT4ge1xuICAgIGNvbnN0IGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaDtcbiAgICBpZiAoaGFzaC5sZW5ndGggPT0gMCkgcmV0dXJuO1xuICAgIGNvbnN0IHBhcmFtZXRlcnMgPSAkLmRlcGFyYW0oaGFzaC5zdWJzdHJpbmcoMSkpO1xuICAgIGNvbnN0IG9sZFVSTCA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQub2xkVVJMO1xuXG5cbiAgICBjb25zdCBvbGRIYXNoID0gJC5kZXBhcmFtKG9sZFVSTC5zdWJzdHJpbmcob2xkVVJMLnNlYXJjaChcIiNcIikrMSkpO1xuXG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1maWx0ZXInLCBwYXJhbWV0ZXJzKTtcbiAgICAvLyAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLXVwZGF0ZS1lbWJlZCcsIHBhcmFtZXRlcnMpO1xuXG4gICAgLy8gU28gdGhhdCBjaGFuZ2UgaW4gZmlsdGVycyB3aWxsIG5vdCB1cGRhdGUgdGhpc1xuICAgIGlmIChvbGRIYXNoLmJvdW5kMSAhPT0gcGFyYW1ldGVycy5ib3VuZDEgfHwgb2xkSGFzaC5ib3VuZDIgIT09IHBhcmFtZXRlcnMuYm91bmQyKSB7XG5cbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLXVwZGF0ZScsIHBhcmFtZXRlcnMpO1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci1ieS1ib3VuZCcsIHBhcmFtZXRlcnMpO1xuICAgIH1cblxuICAgIC8vIENoYW5nZSBpdGVtc1xuICAgIGlmIChvbGRIYXNoLmxhbmcgIT09IHBhcmFtZXRlcnMubGFuZykge1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1sYW5ndWFnZS11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICB9XG4gIH0pXG5cbiAgLy8gNC4gZmlsdGVyIG91dCBpdGVtcyBpbiBhY3Rpdml0eS1hcmVhXG5cbiAgLy8gNS4gZ2V0IG1hcCBlbGVtZW50c1xuXG4gIC8vIDYuIGdldCBHcm91cCBkYXRhXG5cbiAgLy8gNy4gcHJlc2VudCBncm91cCBlbGVtZW50c1xuXG4gIC8vIGNvbnNvbGUubG9nKHdpbmRvdy5FVkVOVFNfVVJMIHx8ICdodHRwczovL2QyaGgxMWwxYWoya2cxLmNsb3VkZnJvbnQubmV0L2RhdGEvd29tZW5zbWFyY2guanMuZ3onKTtcbiAgJC5hamF4KHtcbiAgICB1cmw6ICdodHRwOi8vbWFwLmp1c3RpY2VkZW1vY3JhdHMuY29tL2FwaS9ldmVudHM/Y2FuZGlkYXRlPWFsZXhhbmRyaWEtb2Nhc2lvLWNvcnRleicsIC8vJ3wqKkRBVEFfU09VUkNFKip8JyxcbiAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgIHN1Y2Nlc3M6IChkYXRhKSA9PiB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhkYXRhKTtcbiAgICAgIHZhciBwYXJhbWV0ZXJzID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcbiAgICAgIHZhciB0YXJnZXREYXRhID0gZGF0YS5tYXAoKGl0ZW0pPT57XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsYXQ6IGl0ZW0ubG9jYXRpb24ubG9jYXRpb24ubGF0aXR1ZGUsXG4gICAgICAgICAgICBldmVudF90eXBlOiBpdGVtLnR5cGUsXG4gICAgICAgICAgICBzdXBlcmdyb3VwOiBcIk9jYXNpbyBmb3IgVVMgQ29uZ3Jlc3NcIixcbiAgICAgICAgICAgIHN0YXJ0X2RhdGV0aW1lOiBpdGVtLnN0YXJ0X2RhdGUsXG4gICAgICAgICAgICB0ejogXCJFU1RcIixcbiAgICAgICAgICAgIHZlbnVlOiBpdGVtLmxvY2F0aW9uLnZlbnVlICsgW2l0ZW0ubG9jYXRpb24uYWRkcmVzc19saW5lcy5qb2luKCApLCBpdGVtLmxvY2F0aW9uLmxvY2FsaXR5LCBpdGVtLmxvY2F0aW9uLnJlZ2lvbiwgaXRlbS5sb2NhdGlvbi5wb3N0YWxfY29kZV0uam9pbihcIiBcIiksXG4gICAgICAgICAgICBsbmc6IGl0ZW0ubG9jYXRpb24ubG9jYXRpb24ubG9uZ2l0dWRlLFxuICAgICAgICAgICAgdXJsOiBpdGVtLmJyb3dzZXJfdXJsLFxuICAgICAgICAgICAgdGl0bGU6IGl0ZW0udGl0bGUsXG4gICAgICAgICAgICBncm91cDogbnVsbFxuICAgICAgICB9O1xuICAgICAgfSk7XG5cbiAgICAgIC8vICQoJyNldmVudHMtY291bnQnKS50ZXh0KGAke3dpbmRvdy5FVkVOVFNfREFUQS5sZW5ndGh9IFdhbGtvdXRzIGFuZCBDb3VudGluZ2ApLmNzcygnb3BhY2l0eScsIDEpO1xuXG5cbiAgICAgIHRhcmdldERhdGEuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICBpdGVtWydldmVudF90eXBlJ10gPSAnQWN0aW9uJztcbiAgICAgIH0pXG5cbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC11cGRhdGUnLCB7IHBhcmFtczogcGFyYW1ldGVycywgZGF0YTogdGFyZ2V0RGF0YSB9KTtcbiAgICAgIC8vICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1wbG90JywgeyBkYXRhOiB0YXJnZXREYXRhLCBwYXJhbXM6IHBhcmFtZXRlcnMgfSk7XG4gICAgICAvLyAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLXVwZGF0ZS1lbWJlZCcsIHBhcmFtZXRlcnMpO1xuICAgICAgLy9UT0RPOiBNYWtlIHRoZSBnZW9qc29uIGNvbnZlcnNpb24gaGFwcGVuIG9uIHRoZSBiYWNrZW5kXG5cbiAgICAgIC8vUmVmcmVzaCB0aGluZ3NcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBsZXQgcCA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG4gICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLXVwZGF0ZScsIHApO1xuICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC1maWx0ZXInLCBwKTtcbiAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBwKTtcbiAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci1ieS1ib3VuZCcsIHApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCkpXG4gICAgICB9LCAxMDApO1xuXG5cbiAgICAgIHZhciBkaXN0cmljdF9ib3VuZGFyeSA9IG5ldyBMLmdlb0pzb24obnVsbCwge1xuICAgICAgICBjbGlja2FibGU6IGZhbHNlXG4gICAgICB9KTtcbiAgICAgIGRpc3RyaWN0X2JvdW5kYXJ5LmFkZFRvKG1hcE1hbmFnZXIuZ2V0TWFwKCkpO1xuICAgICAgJC5hamF4KHtcbiAgICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxuICAgICAgICB1cmw6IFwiL2RhdGEvTlktMTQuanNvblwiLFxuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgLy8gJChkYXRhLmdlb2pzb24pLmVhY2goZnVuY3Rpb24oa2V5LCBpdGVtKSB7XG4gICAgICAgICAgICBkaXN0cmljdF9ib3VuZGFyeVxuICAgICAgICAgICAgICAuYWRkRGF0YShkYXRhLmdlb2pzb24pXG4gICAgICAgICAgICAgIC5zZXRTdHlsZSh7XG4gICAgICAgICAgICAgICAgZmlsbENvbG9yOiAncmdiYSg4NywgMzcsIDEyNSwgMC4yNiknLFxuICAgICAgICAgICAgICAgIGNvbG9yOiAncmdiYSg4NywgMzcsIDEyNSwgMC44KSdcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBpZiAoIXBhcmFtcy56aXBjb2RlIHx8IHBhcmFtcy56aXBjb2RlID09PSAnJykge1xuXG4gICAgICAgICAgICAvLyB9XG4gICAgICAgICAgLy8gfSk7XG4gICAgICAgICAgLy8gY29uc29sZS5sb2coZGlzdHJpY3RfYm91bmRhcnkpO1xuICAgICAgICAgIG1hcE1hbmFnZXIuZ2V0TWFwKClcbiAgICAgICAgICAgIC5maXRCb3VuZHMoZGlzdHJpY3RfYm91bmRhcnkuZ2V0Qm91bmRzKCksIHsgYW5pbWF0ZTogZmFsc2UgfSk7XG4gICAgICAgICAgZGlzdHJpY3RfYm91bmRhcnkuYnJpbmdUb0JhY2soKTtcbiAgICAgICAgfVxuICAgICAgfSkuZXJyb3IoZnVuY3Rpb24oKSB7fSk7XG4gICAgfVxuICB9KTtcblxuXG5cbn0pKGpRdWVyeSk7XG4iXX0=
