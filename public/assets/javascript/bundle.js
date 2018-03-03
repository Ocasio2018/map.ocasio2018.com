"use strict";
//API :AIzaSyBujKTRw5uIXp_NHZgjYVDtBy1dbyNuGEM

var AutocompleteManager = function ($) {
  //Initialization...

  return function (target) {

    var API_KEY = "AIzaSyCLlxWn3yInmPEUT4zPV9PBX7n5ZkHxKvM";
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
      var date = moment(new Date(gmtDate)).utc().format(new Date(item.start_datetime).getHours() == 0 ? "dddd MMM DD" : "dddd MMM DD, h:mma");

      // console.log(date, new Date(item.start_datetime), new Date(item.start_datetime).toGMTString())
      var url = item.url.match(/^https{0,1}:/) ? item.url : "//" + item.url;
      return "\n      <li class='" + item.event_type + " event-obj within-bound' data-lat='" + item.lat + "' data-lng='" + item.lng + "'>\n        <div class=\"type-event type-action\">\n          <h2 class=\"event-title\"><a href=\"" + (url == '//' ? 'javascript: void(null)' : url) + "\" target='_blank'>" + item.title + "</a></h2>\n          <div class=\"event-date date\" style=\"display: " + (!item.start_datetime ? 'none' : 'block') + "\">" + date + "</div>\n          <div class=\"event-address address-area\">\n            <p>" + item.venue + "</p>\n          </div>\n          <div class=\"event-address address-area\" style='display: " + (url == '//' ? 'block' : 'none') + "'>\n            <p>" + item.description + "</p>\n          </div>\n          <div class=\"call-to-action\" style='display: " + (url == '//' ? 'none' : 'block') + "'>\n            <a href=\"" + (url == '//' ? 'javascript: void(null)' : url) + "\" target='_blank' class=\"btn btn-secondary rsvp\">RSVP</a>\n          </div>\n        </div>\n      </li>\n      ";
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
    iconUrl: '/img/wm-marker.png',
    iconSize: [30, 41],
    iconAnchor: [15, 41],
    popupAnchor: [-3, -76],
    shadowUrl: '/img/wm-marker-shadow.png',
    shadowSize: [43, 19],
    shadowAnchor: [15, 19]
  });

  var renderEvent = function renderEvent(item) {
    var gmtDate = new Date(item.start_datetime).toGMTString();
    var date = moment(new Date(gmtDate)).utc().format(new Date(item.start_datetime).getHours() == 0 ? "dddd MMM DD" : "dddd MMM DD, h:mma");

    var url = item.url.match(/^https{0,1}:/) ? item.url : "//" + item.url;
    return '\n    <div class=\'popup-item ' + item.event_type + '\' data-lat=\'' + item.lat + '\' data-lng=\'' + item.lng + '\'>\n      <div class="type-event type-action">\n        <h2 class="event-title"><a href="' + (url == '//' ? 'javascript: void(null)' : url) + '" target=\'_blank\'>' + item.title + '</a></h2>\n        <div class="event-date date" style="display: ' + (!item.start_datetime ? 'none' : 'block') + '">' + date + '</div>\n        <div class="event-address address-area">\n          <p>' + item.venue + '</p>\n        </div>\n        <div class="event-address address-area" style=\'display: ' + (url == '//' ? 'block' : 'none') + '\'>\n          <p>' + item.description + '</p>\n        </div>\n        <div class="call-to-action" style=\'display: ' + (url == '//' ? 'none' : 'block') + '\'>\n          <a href="' + url + '" target=\'_blank\' class="btn btn-secondary rsvp">RSVP</a>\n        </div>\n      </div>\n    </div>\n    ';
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
              fillColor: eventType && eventType.toLowerCase() === 'group' ? "#40D7D4" : "#ef4134",
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
    url: window.EVENTS_URL || 'https://d2hh11l1aj2kg1.cloudfront.net/data/womensmarch.js.gz', //'|**DATA_SOURCE**|',
    dataType: 'script',
    success: function success(data) {

      var parameters = queryManager.getParameters();
      var targetData = window.EVENTS_DATA;

      $('#events-count').text(window.EVENTS_DATA.length + ' Walkouts and Counting').css('opacity', 1);

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
    }
  });
})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9sYW5ndWFnZS5qcyIsImNsYXNzZXMvbGlzdC5qcyIsImNsYXNzZXMvbWFwLmpzIiwiY2xhc3Nlcy9xdWVyeS5qcyIsImFwcC5qcyJdLCJuYW1lcyI6WyJBdXRvY29tcGxldGVNYW5hZ2VyIiwiJCIsInRhcmdldCIsIkFQSV9LRVkiLCJ0YXJnZXRJdGVtIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwicXVlcnlNZ3IiLCJRdWVyeU1hbmFnZXIiLCJnZW9jb2RlciIsImdvb2dsZSIsIm1hcHMiLCJHZW9jb2RlciIsIiR0YXJnZXQiLCJpbml0aWFsaXplIiwidHlwZWFoZWFkIiwiaGludCIsImhpZ2hsaWdodCIsIm1pbkxlbmd0aCIsImNsYXNzTmFtZXMiLCJtZW51IiwibmFtZSIsImRpc3BsYXkiLCJpdGVtIiwiZm9ybWF0dGVkX2FkZHJlc3MiLCJsaW1pdCIsInNvdXJjZSIsInEiLCJzeW5jIiwiYXN5bmMiLCJnZW9jb2RlIiwiYWRkcmVzcyIsInJlc3VsdHMiLCJzdGF0dXMiLCJvbiIsIm9iaiIsImRhdHVtIiwiZ2VvbWV0cnkiLCJ1cGRhdGVWaWV3cG9ydCIsInZpZXdwb3J0IiwialF1ZXJ5IiwiTGFuZ3VhZ2VNYW5hZ2VyIiwibGFuZ3VhZ2UiLCJkaWN0aW9uYXJ5IiwiJHRhcmdldHMiLCJ1cGRhdGVQYWdlTGFuZ3VhZ2UiLCJ0YXJnZXRMYW5ndWFnZSIsInJvd3MiLCJmaWx0ZXIiLCJpIiwibGFuZyIsImVhY2giLCJpbmRleCIsInRhcmdldEF0dHJpYnV0ZSIsImRhdGEiLCJsYW5nVGFyZ2V0IiwidGV4dCIsInZhbCIsImF0dHIiLCJ0YXJnZXRzIiwiYWpheCIsInVybCIsImRhdGFUeXBlIiwic3VjY2VzcyIsInVwZGF0ZUxhbmd1YWdlIiwiTGlzdE1hbmFnZXIiLCJ0YXJnZXRMaXN0IiwicmVuZGVyRXZlbnQiLCJnbXREYXRlIiwiRGF0ZSIsInN0YXJ0X2RhdGV0aW1lIiwidG9HTVRTdHJpbmciLCJkYXRlIiwibW9tZW50IiwidXRjIiwiZm9ybWF0IiwiZ2V0SG91cnMiLCJtYXRjaCIsImV2ZW50X3R5cGUiLCJsYXQiLCJsbmciLCJ0aXRsZSIsInZlbnVlIiwiZGVzY3JpcHRpb24iLCJyZW5kZXJHcm91cCIsIndlYnNpdGUiLCJzdXBlcmdyb3VwIiwibG9jYXRpb24iLCIkbGlzdCIsInVwZGF0ZUZpbHRlciIsInAiLCJyZW1vdmVQcm9wIiwiYWRkQ2xhc3MiLCJqb2luIiwidXBkYXRlQm91bmRzIiwiYm91bmQxIiwiYm91bmQyIiwibGF0Q2VudGVyIiwibG5nQ2VudGVyIiwic29ydExpc3QiLCJhIiwiYiIsIl9sYXRBIiwiX2xhdEIiLCJfbG5nQSIsIl9sbmdCIiwiZGlzdEEiLCJNYXRoIiwic3FydCIsInBvdyIsImRpc3RCIiwiZmluZCIsInNvcnQiLCJhcHBlbmRUbyIsInBvcHVsYXRlTGlzdCIsImhhcmRGaWx0ZXJzIiwidGFyZ2V0RGF0YSIsImtleVNldCIsImtleSIsInNwbGl0IiwiJGV2ZW50TGlzdCIsIm1hcCIsImxlbmd0aCIsInRvTG93ZXJDYXNlIiwiaW5jbHVkZXMiLCJyZW1vdmUiLCJhcHBlbmQiLCJNYXBNYW5hZ2VyIiwiTEFOR1VBR0UiLCJtYXBNYXJrZXIiLCJ3bUljb24iLCJMIiwiaWNvbiIsImljb25VcmwiLCJpY29uU2l6ZSIsImljb25BbmNob3IiLCJwb3B1cEFuY2hvciIsInNoYWRvd1VybCIsInNoYWRvd1NpemUiLCJzaGFkb3dBbmNob3IiLCJyZW5kZXJHZW9qc29uIiwibGlzdCIsImRpY3RMYXRMbmciLCJmb3JFYWNoIiwicHVzaCIsIm1hcEl0ZW1zIiwiT2JqZWN0Iiwia2V5cyIsInBhcnNlRmxvYXQiLCJldmVudHMiLCJyZW5kZXJlZCIsInR5cGUiLCJjb29yZGluYXRlcyIsInByb3BlcnRpZXMiLCJldmVudFByb3BlcnRpZXMiLCJwb3B1cENvbnRlbnQiLCJwb3B1cENsYXNzTmFtZSIsIm9wdGlvbnMiLCJCcm93c2VyIiwibW9iaWxlIiwiZHJhZ2dpbmciLCJzZXRWaWV3Iiwid2luZG93IiwiQ1VTVE9NX0NPT1JEIiwiQ1VTVE9NX1pPT00iLCJzY3JvbGxXaGVlbFpvb20iLCJkaXNhYmxlIiwib25Nb3ZlIiwiZXZlbnQiLCJzdyIsImdldEJvdW5kcyIsIl9zb3V0aFdlc3QiLCJuZSIsIl9ub3J0aEVhc3QiLCJodHRwcyIsInRpbGVMYXllciIsImF0dHJpYnV0aW9uIiwibWF4Wm9vbSIsImFkZFRvIiwiJG1hcCIsImNhbGxiYWNrIiwic2V0Qm91bmRzIiwiYm91bmRzMSIsImJvdW5kczIiLCJib3VuZHMiLCJmaXRCb3VuZHMiLCJzZXRDZW50ZXIiLCJjZW50ZXIiLCJ6b29tIiwiZ2V0Q2VudGVyQnlMb2NhdGlvbiIsInNob3dNYXBNYXJrZXIiLCJ1bmRlZmluZWQiLCJyZW1vdmVMYXllciIsIk1hcmtlciIsInJlZnJlc2hNYXAiLCJpbnZhbGlkYXRlU2l6ZSIsImZpbHRlck1hcCIsImZpbHRlcnMiLCJoaWRlIiwic2hvdyIsInBsb3RQb2ludHMiLCJnZW9qc29uIiwiZmVhdHVyZXMiLCJnZW9KU09OIiwicG9pbnRUb0xheWVyIiwiZmVhdHVyZSIsImxhdGxuZyIsImV2ZW50VHlwZSIsImdlb2pzb25NYXJrZXJPcHRpb25zIiwicmFkaXVzIiwiZmlsbENvbG9yIiwiY29sb3IiLCJ3ZWlnaHQiLCJvcGFjaXR5IiwiZmlsbE9wYWNpdHkiLCJjaXJjbGVNYXJrZXIiLCJvbkVhY2hGZWF0dXJlIiwibGF5ZXIiLCJiaW5kUG9wdXAiLCJjbGFzc05hbWUiLCJ1cGRhdGUiLCJsYXRMbmciLCJ0YXJnZXRGb3JtIiwicHJldmlvdXMiLCJlIiwicHJldmVudERlZmF1bHQiLCJmb3JtIiwiZGVwYXJhbSIsInNlcmlhbGl6ZSIsImhhc2giLCJwYXJhbSIsInRyaWdnZXIiLCJwYXJhbXMiLCJzdWJzdHJpbmciLCJsb2MiLCJwcm9wIiwiZ2V0UGFyYW1ldGVycyIsInBhcmFtZXRlcnMiLCJ1cGRhdGVMb2NhdGlvbiIsImYiLCJKU09OIiwic3RyaW5naWZ5IiwidXBkYXRlVmlld3BvcnRCeUJvdW5kIiwidHJpZ2dlclN1Ym1pdCIsImF1dG9jb21wbGV0ZU1hbmFnZXIiLCJtYXBNYW5hZ2VyIiwicXVlcnlNYW5hZ2VyIiwiaW5pdFBhcmFtcyIsImluaXRpYWxpemVBdXRvY29tcGxldGVDYWxsYmFjayIsInJlc3VsdCIsImxhbmd1YWdlTWFuYWdlciIsImxpc3RNYW5hZ2VyIiwicGFyc2UiLCJvcHQiLCJ0b2dnbGVDbGFzcyIsInNldFRpbWVvdXQiLCJyZW1vdmVDbGFzcyIsImN1cnJlbnRUYXJnZXQiLCJvbGRVUkwiLCJvcmlnaW5hbEV2ZW50Iiwib2xkSGFzaCIsInNlYXJjaCIsIkVWRU5UU19VUkwiLCJFVkVOVFNfREFUQSIsImNzcyJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTs7QUFDQSxJQUFNQSxzQkFBdUIsVUFBU0MsQ0FBVCxFQUFZO0FBQ3ZDOztBQUVBLFNBQU8sVUFBQ0MsTUFBRCxFQUFZOztBQUVqQixRQUFNQyxVQUFVLHlDQUFoQjtBQUNBLFFBQU1DLGFBQWEsT0FBT0YsTUFBUCxJQUFpQixRQUFqQixHQUE0QkcsU0FBU0MsYUFBVCxDQUF1QkosTUFBdkIsQ0FBNUIsR0FBNkRBLE1BQWhGO0FBQ0EsUUFBTUssV0FBV0MsY0FBakI7QUFDQSxRQUFJQyxXQUFXLElBQUlDLE9BQU9DLElBQVAsQ0FBWUMsUUFBaEIsRUFBZjs7QUFFQSxXQUFPO0FBQ0xDLGVBQVNaLEVBQUVHLFVBQUYsQ0FESjtBQUVMRixjQUFRRSxVQUZIO0FBR0xVLGtCQUFZLHNCQUFNO0FBQ2hCYixVQUFFRyxVQUFGLEVBQWNXLFNBQWQsQ0FBd0I7QUFDWkMsZ0JBQU0sSUFETTtBQUVaQyxxQkFBVyxJQUZDO0FBR1pDLHFCQUFXLENBSEM7QUFJWkMsc0JBQVk7QUFDVkMsa0JBQU07QUFESTtBQUpBLFNBQXhCLEVBUVU7QUFDRUMsZ0JBQU0sZ0JBRFI7QUFFRUMsbUJBQVMsaUJBQUNDLElBQUQ7QUFBQSxtQkFBVUEsS0FBS0MsaUJBQWY7QUFBQSxXQUZYO0FBR0VDLGlCQUFPLEVBSFQ7QUFJRUMs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QUFvQiw0QkFBcEIsRUFBa0Q3SSxDQUFsRDtBQUNBekYsVUFBRUksUUFBRixFQUFZa08sT0FBWixDQUFvQiw4QkFBcEIsRUFBb0Q3SSxDQUFwRDtBQUNBO0FBQ0QsT0FQRCxFQU9HLEdBUEg7QUFRRDtBQTlCSSxHQUFQO0FBbUNELENBaE9ELEVBZ09HbEQsTUFoT0giLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG4vL0FQSSA6QUl6YVN5QnVqS1RSdzV1SVhwX05IWmdqWVZEdEJ5MWRieU51R0VNXG5jb25zdCBBdXRvY29tcGxldGVNYW5hZ2VyID0gKGZ1bmN0aW9uKCQpIHtcbiAgLy9Jbml0aWFsaXphdGlvbi4uLlxuXG4gIHJldHVybiAodGFyZ2V0KSA9PiB7XG5cbiAgICBjb25zdCBBUElfS0VZID0gXCJBSXphU3lDTGx4V24zeUlubVBFVVQ0elBWOVBCWDduNVprSHhLdk1cIjtcbiAgICBjb25zdCB0YXJnZXRJdGVtID0gdHlwZW9mIHRhcmdldCA9PSBcInN0cmluZ1wiID8gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpIDogdGFyZ2V0O1xuICAgIGNvbnN0IHF1ZXJ5TWdyID0gUXVlcnlNYW5hZ2VyKCk7XG4gICAgdmFyIGdlb2NvZGVyID0gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgJHRhcmdldDogJCh0YXJnZXRJdGVtKSxcbiAgICAgIHRhcmdldDogdGFyZ2V0SXRlbSxcbiAgICAgIGluaXRpYWxpemU6ICgpID0+IHtcbiAgICAgICAgJCh0YXJnZXRJdGVtKS50eXBlYWhlYWQoe1xuICAgICAgICAgICAgICAgICAgICBoaW50OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBoaWdobGlnaHQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG1pbkxlbmd0aDogNCxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lczoge1xuICAgICAgICAgICAgICAgICAgICAgIG1lbnU6ICd0dC1kcm9wZG93bi1tZW51J1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnc2VhcmNoLXJlc3VsdHMnLFxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAoaXRlbSkgPT4gaXRlbS5mb3JtYXR0ZWRfYWRkcmVzcyxcbiAgICAgICAgICAgICAgICAgICAgbGltaXQ6IDEwLFxuICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IGZ1bmN0aW9uIChxLCBzeW5jLCBhc3luYyl7XG4gICAgICAgICAgICAgICAgICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHsgYWRkcmVzczogcSB9LCBmdW5jdGlvbiAocmVzdWx0cywgc3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGFzeW5jKHJlc3VsdHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApLm9uKCd0eXBlYWhlYWQ6c2VsZWN0ZWQnLCBmdW5jdGlvbiAob2JqLCBkYXR1bSkge1xuICAgICAgICAgICAgICAgICAgICBpZihkYXR1bSlcbiAgICAgICAgICAgICAgICAgICAge1xuXG4gICAgICAgICAgICAgICAgICAgICAgdmFyIGdlb21ldHJ5ID0gZGF0dW0uZ2VvbWV0cnk7XG4gICAgICAgICAgICAgICAgICAgICAgcXVlcnlNZ3IudXBkYXRlVmlld3BvcnQoZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICAgICAgICAgICAgICAgIC8vICBtYXAuZml0Qm91bmRzKGdlb21ldHJ5LmJvdW5kcz8gZ2VvbWV0cnkuYm91bmRzIDogZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG5cblxuICAgIHJldHVybiB7XG5cbiAgICB9XG4gIH1cblxufShqUXVlcnkpKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgTGFuZ3VhZ2VNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIC8va2V5VmFsdWVcblxuICAvL3RhcmdldHMgYXJlIHRoZSBtYXBwaW5ncyBmb3IgdGhlIGxhbmd1YWdlXG4gIHJldHVybiAoKSA9PiB7XG4gICAgbGV0IGxhbmd1YWdlO1xuICAgIGxldCBkaWN0aW9uYXJ5ID0ge307XG4gICAgbGV0ICR0YXJnZXRzID0gJChcIltkYXRhLWxhbmctdGFyZ2V0XVtkYXRhLWxhbmcta2V5XVwiKTtcblxuICAgIGNvbnN0IHVwZGF0ZVBhZ2VMYW5ndWFnZSA9ICgpID0+IHtcblxuICAgICAgbGV0IHRhcmdldExhbmd1YWdlID0gZGljdGlvbmFyeS5yb3dzLmZpbHRlcigoaSkgPT4gaS5sYW5nID09PSBsYW5ndWFnZSlbMF07XG5cbiAgICAgICR0YXJnZXRzLmVhY2goKGluZGV4LCBpdGVtKSA9PiB7XG4gICAgICAgIGxldCB0YXJnZXRBdHRyaWJ1dGUgPSAkKGl0ZW0pLmRhdGEoJ2xhbmctdGFyZ2V0Jyk7XG4gICAgICAgIGxldCBsYW5nVGFyZ2V0ID0gJChpdGVtKS5kYXRhKCdsYW5nLWtleScpO1xuXG4gICAgICAgIHN3aXRjaCh0YXJnZXRBdHRyaWJ1dGUpIHtcbiAgICAgICAgICBjYXNlICd0ZXh0JzpcbiAgICAgICAgICAgICQoaXRlbSkudGV4dCh0YXJnZXRMYW5ndWFnZVtsYW5nVGFyZ2V0XSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICd2YWx1ZSc6XG4gICAgICAgICAgICAkKGl0ZW0pLnZhbCh0YXJnZXRMYW5ndWFnZVtsYW5nVGFyZ2V0XSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgJChpdGVtKS5hdHRyKHRhcmdldEF0dHJpYnV0ZSwgdGFyZ2V0TGFuZ3VhZ2VbbGFuZ1RhcmdldF0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICBsYW5ndWFnZSxcbiAgICAgIHRhcmdldHM6ICR0YXJnZXRzLFxuICAgICAgZGljdGlvbmFyeSxcbiAgICAgIGluaXRpYWxpemU6IChsYW5nKSA9PiB7XG5cbiAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAvLyB1cmw6ICdodHRwczovL2dzeDJqc29uLmNvbS9hcGk/aWQ9MU8zZUJ5akwxdmxZZjdaN2FtLV9odFJUUWk3M1BhZnFJZk5CZExtWGU4U00mc2hlZXQ9MScsXG4gICAgICAgICAgdXJsOiAnL2RhdGEvbGFuZy5qc29uJyxcbiAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PiB7XG4gICAgICAgICAgICBkaWN0aW9uYXJ5ID0gZGF0YTtcbiAgICAgICAgICAgIGxhbmd1YWdlID0gbGFuZztcbiAgICAgICAgICAgIHVwZGF0ZVBhZ2VMYW5ndWFnZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlTGFuZ3VhZ2U6IChsYW5nKSA9PiB7XG5cbiAgICAgICAgbGFuZ3VhZ2UgPSBsYW5nO1xuICAgICAgICB1cGRhdGVQYWdlTGFuZ3VhZ2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbn0pKGpRdWVyeSk7XG4iLCIvKiBUaGlzIGxvYWRzIGFuZCBtYW5hZ2VzIHRoZSBsaXN0ISAqL1xuXG5jb25zdCBMaXN0TWFuYWdlciA9ICgoJCkgPT4ge1xuICByZXR1cm4gKHRhcmdldExpc3QgPSBcIiNldmVudHMtbGlzdFwiKSA9PiB7XG4gICAgY29uc3QgJHRhcmdldCA9IHR5cGVvZiB0YXJnZXRMaXN0ID09PSAnc3RyaW5nJyA/ICQodGFyZ2V0TGlzdCkgOiB0YXJnZXRMaXN0O1xuXG4gICAgY29uc3QgcmVuZGVyRXZlbnQgPSAoaXRlbSkgPT4ge1xuICAgICAgdmFyIGdtdERhdGUgPSBuZXcgRGF0ZShpdGVtLnN0YXJ0X2RhdGV0aW1lKS50b0dNVFN0cmluZygpO1xuICAgICAgdmFyIGRhdGUgPSBtb21lbnQobmV3IERhdGUoZ210RGF0ZSkpLnV0YygpLmZvcm1hdChuZXcgRGF0ZShpdGVtLnN0YXJ0X2RhdGV0aW1lKS5nZXRIb3VycygpID09IDAgPyBcImRkZGQgTU1NIEREXCIgOiBcImRkZGQgTU1NIERELCBoOm1tYVwiKTtcblxuICAgICAgLy8gY29uc29sZS5sb2coZGF0ZSwgbmV3IERhdGUoaXRlbS5zdGFydF9kYXRldGltZSksIG5ldyBEYXRlKGl0ZW0uc3RhcnRfZGF0ZXRpbWUpLnRvR01UU3RyaW5nKCkpXG4gICAgICBsZXQgdXJsID0gaXRlbS51cmwubWF0Y2goL15odHRwc3swLDF9Oi8pID8gaXRlbS51cmwgOiBcIi8vXCIgKyBpdGVtLnVybDtcbiAgICAgIHJldHVybiBgXG4gICAgICA8bGkgY2xhc3M9JyR7aXRlbS5ldmVudF90eXBlfSBldmVudC1vYmogd2l0aGluLWJvdW5kJyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWV2ZW50IHR5cGUtYWN0aW9uXCI+XG4gICAgICAgICAgPGgyIGNsYXNzPVwiZXZlbnQtdGl0bGVcIj48YSBocmVmPVwiJHt1cmwgPT0gJy8vJyA/ICdqYXZhc2NyaXB0OiB2b2lkKG51bGwpJyA6IHVybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLnRpdGxlfTwvYT48L2gyPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJldmVudC1kYXRlIGRhdGVcIiBzdHlsZT1cImRpc3BsYXk6ICR7IWl0ZW0uc3RhcnRfZGF0ZXRpbWUgPyAnbm9uZScgOiAnYmxvY2snfVwiPiR7ZGF0ZX08L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtYWRkcmVzcyBhZGRyZXNzLWFyZWFcIj5cbiAgICAgICAgICAgIDxwPiR7aXRlbS52ZW51ZX08L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImV2ZW50LWFkZHJlc3MgYWRkcmVzcy1hcmVhXCIgc3R5bGU9J2Rpc3BsYXk6ICR7dXJsID09ICcvLycgPyAnYmxvY2snIDogJ25vbmUnfSc+XG4gICAgICAgICAgICA8cD4ke2l0ZW0uZGVzY3JpcHRpb259PC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiIHN0eWxlPSdkaXNwbGF5OiAke3VybCA9PSAnLy8nID8gJ25vbmUnIDogJ2Jsb2NrJ30nPlxuICAgICAgICAgICAgPGEgaHJlZj1cIiR7dXJsID09ICcvLycgPyAnamF2YXNjcmlwdDogdm9pZChudWxsKScgOiB1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnkgcnN2cFwiPlJTVlA8L2E+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9saT5cbiAgICAgIGBcbiAgICB9O1xuXG4gICAgY29uc3QgcmVuZGVyR3JvdXAgPSAoaXRlbSkgPT4ge1xuICAgICAgbGV0IHVybCA9IGl0ZW0ud2Vic2l0ZS5tYXRjaCgvXmh0dHBzezAsMX06LykgPyBpdGVtLndlYnNpdGUgOiBcIi8vXCIgKyBpdGVtLndlYnNpdGU7XG4gICAgICByZXR1cm4gYFxuICAgICAgPGxpIGNsYXNzPScke2l0ZW0uZXZlbnRfdHlwZX0gZ3JvdXAtb2JqJyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWdyb3VwIGdyb3VwLW9ialwiPlxuICAgICAgICAgIDx1bCBjbGFzcz1cImV2ZW50LXR5cGVzLWxpc3RcIj5cbiAgICAgICAgICAgIDxsaSBjbGFzcz1cInRhZyB0YWctJHtpdGVtLnN1cGVyZ3JvdXB9XCI+JHtpdGVtLnN1cGVyZ3JvdXB9PC9saT5cbiAgICAgICAgICA8L3VsPlxuICAgICAgICAgIDxoMj48YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS5uYW1lfTwvYT48L2gyPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXRhaWxzLWFyZWFcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1sb2NhdGlvbiBsb2NhdGlvblwiPiR7aXRlbS5sb2NhdGlvbn08L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXNjcmlwdGlvblwiPlxuICAgICAgICAgICAgICA8cD4ke2l0ZW0uZGVzY3JpcHRpb259PC9wPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNhbGwtdG8tYWN0aW9uXCI+XG4gICAgICAgICAgICA8YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIj5HZXQgSW52b2x2ZWQ8L2E+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9saT5cbiAgICAgIGBcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICRsaXN0OiAkdGFyZ2V0LFxuICAgICAgdXBkYXRlRmlsdGVyOiAocCkgPT4ge1xuICAgICAgICBpZighcCkgcmV0dXJuO1xuXG4gICAgICAgIC8vIFJlbW92ZSBGaWx0ZXJzXG5cbiAgICAgICAgJHRhcmdldC5yZW1vdmVQcm9wKFwiY2xhc3NcIik7XG4gICAgICAgICR0YXJnZXQuYWRkQ2xhc3MocC5maWx0ZXIgPyBwLmZpbHRlci5qb2luKFwiIFwiKSA6ICcnKVxuICAgICAgfSxcbiAgICAgIHVwZGF0ZUJvdW5kczogKGJvdW5kMSwgYm91bmQyKSA9PiB7XG5cbiAgICAgICAgLy8gY29uc3QgYm91bmRzID0gW3AuYm91bmRzMSwgcC5ib3VuZHMyXTtcblxuXG4gICAgICAgIC8vICR0YXJnZXQuZmluZCgndWwgbGkuZXZlbnQtb2JqLCB1bCBsaS5ncm91cC1vYmonKS5lYWNoKChpbmQsIGl0ZW0pPT4ge1xuICAgICAgICAvL1xuICAgICAgICAvLyAgIGxldCBfbGF0ID0gJChpdGVtKS5kYXRhKCdsYXQnKSxcbiAgICAgICAgLy8gICAgICAgX2xuZyA9ICQoaXRlbSkuZGF0YSgnbG5nJyk7XG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgLy8gY29uc29sZS5sb2coXCJ1cGRhdGVCb3VuZHNcIiwgaXRlbSlcbiAgICAgICAgLy8gICBpZiAoYm91bmQxWzBdIDw9IF9sYXQgJiYgYm91bmQyWzBdID49IF9sYXQgJiYgYm91bmQxWzFdIDw9IF9sbmcgJiYgYm91bmQyWzFdID49IF9sbmcpIHtcbiAgICAgICAgLy8gICAgIC8vIGNvbnNvbGUubG9nKFwiQWRkaW5nIGJvdW5kc1wiKTtcbiAgICAgICAgLy8gICAgICQoaXRlbSkuYWRkQ2xhc3MoJ3dpdGhpbi1ib3VuZCcpO1xuICAgICAgICAvLyAgIH0gZWxzZSB7XG4gICAgICAgIC8vICAgICAkKGl0ZW0pLnJlbW92ZUNsYXNzKCd3aXRoaW4tYm91bmQnKTtcbiAgICAgICAgLy8gICB9XG4gICAgICAgIC8vIH0pO1xuICAgICAgICAvLyAkKGl0ZW0pLmFkZENsYXNzKCd3aXRoaW4tYm91bmQnKTtcblxuICAgICAgICAvLyBPcmRlcnMgdGhlIHNldCB0byBuZWFyZXN0XG4gICAgICAgIGxldCBsYXRDZW50ZXIgPSAoYm91bmQxWzBdICsgYm91bmQyWzBdKSAvIDIsXG4gICAgICAgICAgICBsbmdDZW50ZXIgPSAoYm91bmQxWzFdICsgYm91bmQyWzFdKSAvIDI7XG4gICAgICAgIGNvbnN0IHNvcnRMaXN0ID0gKGEsIGIpID0+IHtcbiAgICAgICAgICBsZXQgX2xhdEEgPSAkKGEpLmRhdGEoJ2xhdCcpLFxuICAgICAgICAgICAgICBfbGF0QiA9ICQoYikuZGF0YSgnbGF0JyksXG4gICAgICAgICAgICAgIF9sbmdBID0gJChhKS5kYXRhKCdsbmcnKSxcbiAgICAgICAgICAgICAgX2xuZ0IgPSAkKGIpLmRhdGEoJ2xuZycpO1xuXG4gICAgICAgICAgbGV0IGRpc3RBID0gTWF0aC5zcXJ0KE1hdGgucG93KGxhdENlbnRlciAtIF9sYXRBLCAyKSArIE1hdGgucG93KGxuZ0NlbnRlciAtIF9sbmdBLCAyKSksXG4gICAgICAgICAgICAgIGRpc3RCID0gTWF0aC5zcXJ0KE1hdGgucG93KGxhdENlbnRlciAtIF9sYXRCLCAyKSArIE1hdGgucG93KGxuZ0NlbnRlciAtIF9sbmdCLCAyKSk7XG5cbiAgICAgICAgICAkKGEpLmF0dHIoJ2RhdGEtZGlzdGFuY2UnLCBkaXN0QSk7XG5cbiAgICAgICAgICByZXR1cm4gZGlzdEEgLSBkaXN0QjtcbiAgICAgICAgfTtcblxuICAgICAgICAkdGFyZ2V0LmZpbmQoJ3VsIGxpLmV2ZW50LW9iaiwgdWwgbGkuZ3JvdXAtb2JqJylcbiAgICAgICAgICAgIC5zb3J0KHNvcnRMaXN0KVxuICAgICAgICAgICAgLmFwcGVuZFRvKCR0YXJnZXQuZmluZCgndWwnKSk7XG4gICAgICB9LFxuICAgICAgcG9wdWxhdGVMaXN0OiAoaGFyZEZpbHRlcnMsIHRhcmdldERhdGEpID0+IHtcbiAgICAgICAgLy91c2luZyB3aW5kb3cuRVZFTlRfREFUQVxuICAgICAgICBjb25zdCBrZXlTZXQgPSAhaGFyZEZpbHRlcnMua2V5ID8gW10gOiBoYXJkRmlsdGVycy5rZXkuc3BsaXQoJywnKTtcblxuICAgICAgICAvLyBjb25zb2xlLmxvZyh0YXJnZXREYXRhKTtcblxuICAgICAgICB2YXIgJGV2ZW50TGlzdCA9IHRhcmdldERhdGEubWFwKGl0ZW0gPT4ge1xuICAgICAgICAgIGlmIChrZXlTZXQubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtLmV2ZW50X3R5cGUgJiYgaXRlbS5ldmVudF90eXBlLnRvTG93ZXJDYXNlKCkgPT0gJ2dyb3VwJyA/IHJlbmRlckdyb3VwKGl0ZW0pIDogcmVuZGVyRXZlbnQoaXRlbSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChrZXlTZXQubGVuZ3RoID4gMCAmJiBpdGVtLmV2ZW50X3R5cGUgIT0gJ2dyb3VwJyAmJiBrZXlTZXQuaW5jbHVkZXMoaXRlbS5ldmVudF90eXBlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlbmRlckV2ZW50KGl0ZW0pO1xuICAgICAgICAgIH0gZWxzZSBpZiAoa2V5U2V0Lmxlbmd0aCA+IDAgJiYgaXRlbS5ldmVudF90eXBlID09ICdncm91cCcgJiYga2V5U2V0LmluY2x1ZGVzKGl0ZW0uc3VwZXJncm91cCkpIHtcbiAgICAgICAgICAgIHJldHVybiByZW5kZXJHcm91cChpdGVtKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgICAgIH0pXG4gICAgICAgICR0YXJnZXQuZmluZCgndWwgbGknKS5yZW1vdmUoKTtcbiAgICAgICAgJHRhcmdldC5maW5kKCd1bCcpLmFwcGVuZCgkZXZlbnRMaXN0KTtcblxuICAgICAgICAkdGFyZ2V0LmZpbmQoJ3VsIGxpJylcblxuICAgICAgfVxuICAgIH07XG4gIH1cbn0pKGpRdWVyeSk7XG4iLCJcbmNvbnN0IE1hcE1hbmFnZXIgPSAoKCQpID0+IHtcbiAgbGV0IExBTkdVQUdFID0gJ2VuJztcbiAgdmFyIG1hcE1hcmtlcjtcbiAgY29uc3Qgd21JY29uID0gTC5pY29uKHtcbiAgICAgIGljb25Vcmw6ICcvaW1nL3dtLW1hcmtlci5wbmcnLFxuICAgICAgaWNvblNpemU6IFszMCwgNDFdLFxuICAgICAgaWNvbkFuY2hvcjogWzE1LCA0MV0sXG4gICAgICBwb3B1cEFuY2hvcjogWy0zLCAtNzZdLFxuICAgICAgc2hhZG93VXJsOiAnL2ltZy93bS1tYXJrZXItc2hhZG93LnBuZycsXG4gICAgICBzaGFkb3dTaXplOiBbNDMsIDE5XSxcbiAgICAgIHNoYWRvd0FuY2hvcjogWzE1LCAxOV1cbiAgfSk7XG5cbiAgY29uc3QgcmVuZGVyRXZlbnQgPSAoaXRlbSkgPT4ge1xuICAgIHZhciBnbXREYXRlID0gbmV3IERhdGUoaXRlbS5zdGFydF9kYXRldGltZSkudG9HTVRTdHJpbmcoKTtcbiAgICB2YXIgZGF0ZSA9IG1vbWVudChuZXcgRGF0ZShnbXREYXRlKSkudXRjKCkuZm9ybWF0KG5ldyBEYXRlKGl0ZW0uc3RhcnRfZGF0ZXRpbWUpLmdldEhvdXJzKCkgPT0gMCA/IFwiZGRkZCBNTU0gRERcIiAgOiBcImRkZGQgTU1NIERELCBoOm1tYVwiKTtcblxuICAgIGxldCB1cmwgPSBpdGVtLnVybC5tYXRjaCgvXmh0dHBzezAsMX06LykgPyBpdGVtLnVybCA6IFwiLy9cIiArIGl0ZW0udXJsO1xuICAgIHJldHVybiBgXG4gICAgPGRpdiBjbGFzcz0ncG9wdXAtaXRlbSAke2l0ZW0uZXZlbnRfdHlwZX0nIGRhdGEtbGF0PScke2l0ZW0ubGF0fScgZGF0YS1sbmc9JyR7aXRlbS5sbmd9Jz5cbiAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWV2ZW50IHR5cGUtYWN0aW9uXCI+XG4gICAgICAgIDxoMiBjbGFzcz1cImV2ZW50LXRpdGxlXCI+PGEgaHJlZj1cIiR7dXJsID09ICcvLycgPyAnamF2YXNjcmlwdDogdm9pZChudWxsKScgOiB1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnPiR7aXRlbS50aXRsZX08L2E+PC9oMj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImV2ZW50LWRhdGUgZGF0ZVwiIHN0eWxlPVwiZGlzcGxheTogJHshaXRlbS5zdGFydF9kYXRldGltZSA/ICdub25lJyA6ICdibG9jayd9XCI+JHtkYXRlfTwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZXZlbnQtYWRkcmVzcyBhZGRyZXNzLWFyZWFcIj5cbiAgICAgICAgICA8cD4ke2l0ZW0udmVudWV9PC9wPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImV2ZW50LWFkZHJlc3MgYWRkcmVzcy1hcmVhXCIgc3R5bGU9J2Rpc3BsYXk6ICR7dXJsID09ICcvLycgPyAnYmxvY2snIDogJ25vbmUnfSc+XG4gICAgICAgICAgPHA+JHtpdGVtLmRlc2NyaXB0aW9ufTwvcD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiIHN0eWxlPSdkaXNwbGF5OiAke3VybCA9PSAnLy8nID8gJ25vbmUnIDogJ2Jsb2NrJ30nPlxuICAgICAgICAgIDxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuaycgY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeSByc3ZwXCI+UlNWUDwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICBgXG4gIH07XG5cbiAgY29uc3QgcmVuZGVyR3JvdXAgPSAoaXRlbSkgPT4ge1xuXG4gICAgbGV0IHVybCA9IGl0ZW0ud2Vic2l0ZS5tYXRjaCgvXmh0dHBzezAsMX06LykgPyBpdGVtLndlYnNpdGUgOiBcIi8vXCIgKyBpdGVtLndlYnNpdGU7XG4gICAgcmV0dXJuIGBcbiAgICA8bGk+XG4gICAgICA8ZGl2IGNsYXNzPVwidHlwZS1ncm91cCBncm91cC1vYmpcIj5cbiAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgIDxsaSBjbGFzcz1cInRhZyB0YWctJHtpdGVtLnN1cGVyZ3JvdXB9XCI+JHtpdGVtLnN1cGVyZ3JvdXB9PC9saT5cbiAgICAgICAgPC91bD5cbiAgICAgICAgPGgyPjxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9J19ibGFuayc+JHtpdGVtLm5hbWV9PC9hPjwvaDI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJncm91cC1kZXRhaWxzLWFyZWFcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtbG9jYXRpb24gbG9jYXRpb25cIj4ke2l0ZW0uYWRkcmVzc308L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGVzY3JpcHRpb25cIj5cbiAgICAgICAgICAgIDxwPiR7aXRlbS5kZXNjcmlwdGlvbn08L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICA8YSBocmVmPVwiJHt1cmx9XCIgdGFyZ2V0PSdfYmxhbmsnIGNsYXNzPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIj5HZXQgSW52b2x2ZWQ8L2E+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9saT5cbiAgICBgXG4gIH07XG5cbiAgY29uc3QgcmVuZGVyR2VvanNvbiA9IChsaXN0KSA9PiB7XG4gICAgLy8gY29uc29sZS5sb2cobGlzdClcbiAgICAvLyBHZXQgYWxsIHVuaXF1ZSBMYXQtbG9uZ1xuXG4gICAgbGV0IGRpY3RMYXRMbmcgPSB7fTtcblxuICAgIGxpc3QuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgaWYoIWl0ZW0ubGF0IHx8ICFpdGVtLmxuZyB8fCBpdGVtLmxhdCA9PSBcIlwiIHx8IGl0ZW0ubG5nID09IFwiXCIpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIGlmICggIWRpY3RMYXRMbmdbYCR7aXRlbS5sYXR9LCR7aXRlbS5sbmd9YF0gKSB7XG4gICAgICAgIGRpY3RMYXRMbmdbYCR7aXRlbS5sYXR9LCR7aXRlbS5sbmd9YF0gPSBbaXRlbV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkaWN0TGF0TG5nW2Ake2l0ZW0ubGF0fSwke2l0ZW0ubG5nfWBdLnB1c2goaXRlbSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBQYXJzZSBncm91cHMgaXRlbXNcbiAgICBsZXQgbWFwSXRlbXMgPSBbXTtcbiAgICBPYmplY3Qua2V5cyhkaWN0TGF0TG5nKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgbGV0IFtsYXQsIGxuZ10gPSBrZXkuc3BsaXQoJywnKTtcbiAgICAgIG1hcEl0ZW1zLnB1c2goe1xuICAgICAgICBsYXQ6IHBhcnNlRmxvYXQobGF0KSxcbiAgICAgICAgbG5nOiBwYXJzZUZsb2F0KGxuZyksXG4gICAgICAgIGV2ZW50czogZGljdExhdExuZ1trZXldXG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIGNvbnNvbGUubG9nKG1hcEl0ZW1zKTtcblxuICAgIHJldHVybiBtYXBJdGVtcy5tYXAoKGl0ZW0pID0+IHtcbiAgICAgIC8vIHJlbmRlcmVkIGV2ZW50VHlwZVxuICAgICAgbGV0IHJlbmRlcmVkO1xuXG4gICAgICAvLyBjb25zb2xlLmxvZyhpdGVtLmV2ZW50cy5sZW5ndGgpXG4gICAgICBpZiAoaXRlbS5ldmVudHMubGVuZ3RoID09IDEpIHtcbiAgICAgICAgcmVuZGVyZWQgPSByZW5kZXJFdmVudChpdGVtLmV2ZW50c1swXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZW5kZXJlZCA9IGA8ZGl2IGNsYXNzPSdtdWx0aXBsZS1pdGVtcyc+PHVsPiR7aXRlbS5ldmVudHMubWFwKGkgPT4gYDxsaT4ke3JlbmRlckV2ZW50KGkpfTwvbGk+YCkuam9pbignJyl9PC91bD48L2Rpdj5gXG4gICAgICB9XG5cblxuICAgICAgLy8gY29uc29sZS5sb2cocmVuZGVyZWQsIGl0ZW0uZXZlbnRzLmxlbmd0aClcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgXCJ0eXBlXCI6IFwiRmVhdHVyZVwiLFxuICAgICAgICBnZW9tZXRyeToge1xuICAgICAgICAgIHR5cGU6IFwiUG9pbnRcIixcbiAgICAgICAgICBjb29yZGluYXRlczogW2l0ZW0ubG5nLCBpdGVtLmxhdF1cbiAgICAgICAgfSxcbiAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgIGV2ZW50UHJvcGVydGllczogaXRlbSxcbiAgICAgICAgICBwb3B1cENvbnRlbnQ6IHJlbmRlcmVkLFxuICAgICAgICAgIHBvcHVwQ2xhc3NOYW1lOiBpdGVtLmV2ZW50cy5sZW5ndGggPiAxID8gJ3BvcHVwLW11bHRpcGxlLWl0ZW0nIDogJ3BvcHVwLXNpbmdsZS1pdGVtJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiAob3B0aW9ucykgPT4ge1xuICAgIHZhciBtYXAgPSBudWxsO1xuXG4gICAgaWYgKCFMLkJyb3dzZXIubW9iaWxlKSB7XG4gICAgICBtYXAgPSBMLm1hcCgnbWFwJywgeyBkcmFnZ2luZzogIUwuQnJvd3Nlci5tb2JpbGUgfSkuc2V0Vmlldyh3aW5kb3cuQ1VTVE9NX0NPT1JEIHx8IFszOC40MTE0MjcxLC05Ny42NDExMDQ0XSwgd2luZG93LkNVU1RPTV9aT09NIHx8IDQpO1xuICAgICAgbWFwLnNjcm9sbFdoZWVsWm9vbS5kaXNhYmxlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG1hcCA9IEwubWFwKCdtYXAnLCB7IGRyYWdnaW5nOiAhTC5Ccm93c2VyLm1vYmlsZSB9KS5zZXRWaWV3KHdpbmRvdy5DVVNUT01fQ09PUkQgfHwgWzM4LjQxMTQyNzEsLTk3LjY0MTEwNDRdLCAzKTtcbiAgICB9XG5cbiAgICBMQU5HVUFHRSA9IG9wdGlvbnMubGFuZyB8fCAnZW4nO1xuXG4gICAgaWYgKG9wdGlvbnMub25Nb3ZlKSB7XG4gICAgICBtYXAub24oJ2RyYWdlbmQnLCAoZXZlbnQpID0+IHtcblxuXG4gICAgICAgIGxldCBzdyA9IFttYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxuZ107XG4gICAgICAgIGxldCBuZSA9IFttYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sYXQsIG1hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxuZ107XG4gICAgICAgIG9wdGlvbnMub25Nb3ZlKHN3LCBuZSk7XG4gICAgICB9KS5vbignem9vbWVuZCcsIChldmVudCkgPT4ge1xuXG5odHRwczovL2RvY3MuZ29vZ2xlLmNvbS9kb2N1bWVudC9kLzFLV2tMTk5lSU9lRkVpVldNTndvWUt1MXlBWlJVRGY3OHhJYkkxaWU3RHZzL2VkaXQ/dXNwPXNoYXJpbmdcbiAgICAgICAgbGV0IHN3ID0gW21hcC5nZXRCb3VuZHMoKS5fc291dGhXZXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubG5nXTtcbiAgICAgICAgbGV0IG5lID0gW21hcC5nZXRCb3VuZHMoKS5fbm9ydGhFYXN0LmxhdCwgbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubG5nXTtcbiAgICAgICAgb3B0aW9ucy5vbk1vdmUoc3csIG5lKTtcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgTC50aWxlTGF5ZXIoJ2h0dHBzOi8vc2VydmVyLmFyY2dpc29ubGluZS5jb20vQXJjR0lTL3Jlc3Qvc2VydmljZXMvQ2FudmFzL1dvcmxkX0xpZ2h0X0dyYXlfQmFzZS9NYXBTZXJ2ZXIvdGlsZS97en0ve3l9L3t4fScsIHtcbiAgICAgIFx0YXR0cmlidXRpb246ICdUaWxlcyAmY29weTsgRXNyaSAmbWRhc2g7IEVzcmksIERlTG9ybWUsIE5BVlRFUScsXG4gICAgICBcdG1heFpvb206IDE2fSkuYWRkVG8obWFwKTtcblxuICAgIGxldCBnZW9jb2RlciA9IG51bGw7XG4gICAgcmV0dXJuIHtcbiAgICAgICRtYXA6IG1hcCxcbiAgICAgIGluaXRpYWxpemU6IChjYWxsYmFjaykgPT4ge1xuICAgICAgICBnZW9jb2RlciA9IG5ldyBnb29nbGUubWFwcy5HZW9jb2RlcigpO1xuICAgICAgICBpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgc2V0Qm91bmRzOiAoYm91bmRzMSwgYm91bmRzMikgPT4ge1xuICAgICAgICBjb25zdCBib3VuZHMgPSBbYm91bmRzMSwgYm91bmRzMl07XG4gICAgICAgIG1hcC5maXRCb3VuZHMoYm91bmRzKTtcbiAgICAgIH0sXG4gICAgICBzZXRDZW50ZXI6IChjZW50ZXIsIHpvb20gPSAxMCkgPT4ge1xuICAgICAgICBpZiAoIWNlbnRlciB8fCAhY2VudGVyWzBdIHx8IGNlbnRlclswXSA9PSBcIlwiXG4gICAgICAgICAgICAgIHx8ICFjZW50ZXJbMV0gfHwgY2VudGVyWzFdID09IFwiXCIpIHJldHVybjtcbiAgICAgICAgbWFwLnNldFZpZXcoY2VudGVyLCB6b29tKTtcbiAgICAgIH0sXG4gICAgICBnZXRCb3VuZHM6ICgpID0+IHtcblxuICAgICAgICBsZXQgc3cgPSBbbWFwLmdldEJvdW5kcygpLl9zb3V0aFdlc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX3NvdXRoV2VzdC5sbmddO1xuICAgICAgICBsZXQgbmUgPSBbbWFwLmdldEJvdW5kcygpLl9ub3J0aEVhc3QubGF0LCBtYXAuZ2V0Qm91bmRzKCkuX25vcnRoRWFzdC5sbmddO1xuXG4gICAgICAgIHJldHVybiBbc3csIG5lXTtcbiAgICAgIH0sXG4gICAgICAvLyBDZW50ZXIgbG9jYXRpb24gYnkgZ2VvY29kZWRcbiAgICAgIGdldENlbnRlckJ5TG9jYXRpb246IChsb2NhdGlvbiwgY2FsbGJhY2spID0+IHtcblxuICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHsgYWRkcmVzczogbG9jYXRpb24gfSwgZnVuY3Rpb24gKHJlc3VsdHMsIHN0YXR1cykge1xuXG4gICAgICAgICAgaWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2socmVzdWx0c1swXSlcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIHNob3dNYXBNYXJrZXI6IChsYXQsIGxuZykgPT4ge1xuXG4gICAgICAgIC8vY29uc29sZS5sb2cobWFwTWFya2VyKTtcbiAgICAgICAgaWYgKG1hcE1hcmtlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgbWFwLnJlbW92ZUxheWVyKG1hcE1hcmtlcik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobGF0ICYmIGxuZykge1xuICAgICAgICAgIG1hcE1hcmtlciA9IG5ldyBMLk1hcmtlcihbbGF0LGxuZ10sIHtcbiAgICAgICAgICAgIGljb246IHdtSWNvblxuICAgICAgICAgIH0pLmFkZFRvKG1hcCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICByZWZyZXNoTWFwOiAoKSA9PiB7XG4gICAgICAgIG1hcC5pbnZhbGlkYXRlU2l6ZShmYWxzZSk7XG4gICAgICAgIC8vIG1hcC5fb25SZXNpemUoKTtcblxuICAgICAgICAvLyBjb25zb2xlLmxvZyhcIm1hcCBpcyByZXNpemVkXCIpXG4gICAgICB9LFxuICAgICAgZmlsdGVyTWFwOiAoZmlsdGVycykgPT4ge1xuXG4gICAgICAgICQoXCIjbWFwXCIpLmZpbmQoXCIuZXZlbnQtaXRlbS1wb3B1cFwiKS5oaWRlKCk7XG5cblxuICAgICAgICBpZiAoIWZpbHRlcnMpIHJldHVybjtcblxuICAgICAgICBmaWx0ZXJzLmZvckVhY2goKGl0ZW0pID0+IHtcblxuICAgICAgICAgICQoXCIjbWFwXCIpLmZpbmQoXCIuZXZlbnQtaXRlbS1wb3B1cC5cIiArIGl0ZW0udG9Mb3dlckNhc2UoKSkuc2hvdygpO1xuICAgICAgICB9KVxuICAgICAgfSxcbiAgICAgIHBsb3RQb2ludHM6IChsaXN0LCBoYXJkRmlsdGVycykgPT4ge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhsaXN0KVxuICAgICAgICBjb25zdCBrZXlTZXQgPSAhaGFyZEZpbHRlcnMua2V5ID8gW10gOiBoYXJkRmlsdGVycy5rZXkuc3BsaXQoJywnKTtcblxuICAgICAgICBpZiAoa2V5U2V0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBsaXN0ID0gbGlzdC5maWx0ZXIoKGl0ZW0pID0+IGtleVNldC5pbmNsdWRlcyhpdGVtLmV2ZW50X3R5cGUpKVxuICAgICAgICB9XG5cblxuICAgICAgICBjb25zdCBnZW9qc29uID0ge1xuICAgICAgICAgIHR5cGU6IFwiRmVhdHVyZUNvbGxlY3Rpb25cIixcbiAgICAgICAgICBmZWF0dXJlczogcmVuZGVyR2VvanNvbihsaXN0KVxuICAgICAgICB9O1xuXG5cblxuICAgICAgICBMLmdlb0pTT04oZ2VvanNvbiwge1xuICAgICAgICAgICAgcG9pbnRUb0xheWVyOiAoZmVhdHVyZSwgbGF0bG5nKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGV2ZW50VHlwZSA9IGZlYXR1cmUucHJvcGVydGllcy5ldmVudFByb3BlcnRpZXMuZXZlbnRfdHlwZTtcbiAgICAgICAgICAgICAgdmFyIGdlb2pzb25NYXJrZXJPcHRpb25zID0ge1xuICAgICAgICAgICAgICAgICAgcmFkaXVzOiA2LFxuICAgICAgICAgICAgICAgICAgZmlsbENvbG9yOiAgZXZlbnRUeXBlICYmIGV2ZW50VHlwZS50b0xvd2VyQ2FzZSgpID09PSAnZ3JvdXAnID8gXCIjNDBEN0Q0XCIgOiBcIiNlZjQxMzRcIixcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiBcIndoaXRlXCIsXG4gICAgICAgICAgICAgICAgICB3ZWlnaHQ6IDQsXG4gICAgICAgICAgICAgICAgICBvcGFjaXR5OiAwLjUsXG4gICAgICAgICAgICAgICAgICBmaWxsT3BhY2l0eTogMC44LFxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICByZXR1cm4gTC5jaXJjbGVNYXJrZXIobGF0bG5nLCBnZW9qc29uTWFya2VyT3B0aW9ucyk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgb25FYWNoRmVhdHVyZTogKGZlYXR1cmUsIGxheWVyKSA9PiB7XG4gICAgICAgICAgICBpZiAoZmVhdHVyZS5wcm9wZXJ0aWVzICYmIGZlYXR1cmUucHJvcGVydGllcy5wb3B1cENvbnRlbnQpIHtcbiAgICAgICAgICAgICAgbGF5ZXIuYmluZFBvcHVwKGZlYXR1cmUucHJvcGVydGllcy5wb3B1cENvbnRlbnQsXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6IGZlYXR1cmUucHJvcGVydGllcy5wb3B1cENsYXNzTmFtZVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pLmFkZFRvKG1hcCk7XG5cbiAgICAgIH0sXG4gICAgICB1cGRhdGU6IChwKSA9PiB7XG4gICAgICAgIGlmICghcCB8fCAhcC5sYXQgfHwgIXAubG5nICkgcmV0dXJuO1xuXG4gICAgICAgIG1hcC5zZXRWaWV3KEwubGF0TG5nKHAubGF0LCBwLmxuZyksIDEwKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59KShqUXVlcnkpO1xuIiwiY29uc3QgUXVlcnlNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIHJldHVybiAodGFyZ2V0Rm9ybSA9IFwiZm9ybSNmaWx0ZXJzLWZvcm1cIikgPT4ge1xuICAgIGNvbnN0ICR0YXJnZXQgPSB0eXBlb2YgdGFyZ2V0Rm9ybSA9PT0gJ3N0cmluZycgPyAkKHRhcmdldEZvcm0pIDogdGFyZ2V0Rm9ybTtcbiAgICBsZXQgbGF0ID0gbnVsbDtcbiAgICBsZXQgbG5nID0gbnVsbDtcblxuICAgIGxldCBwcmV2aW91cyA9IHt9O1xuXG4gICAgJHRhcmdldC5vbignc3VibWl0JywgKGUpID0+IHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGxhdCA9ICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwoKTtcbiAgICAgIGxuZyA9ICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwoKTtcblxuICAgICAgdmFyIGZvcm0gPSAkLmRlcGFyYW0oJHRhcmdldC5zZXJpYWxpemUoKSk7XG5cbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJC5wYXJhbShmb3JtKTtcbiAgICB9KVxuXG4gICAgJChkb2N1bWVudCkub24oJ2NoYW5nZScsICcuZmlsdGVyLWl0ZW0gaW5wdXRbdHlwZT1jaGVja2JveF0nLCAoKSA9PiB7XG4gICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgIH0pXG5cblxuICAgIHJldHVybiB7XG4gICAgICBpbml0aWFsaXplOiAoY2FsbGJhY2spID0+IHtcbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB2YXIgcGFyYW1zID0gJC5kZXBhcmFtKHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKSlcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhbmddXCIpLnZhbChwYXJhbXMubGFuZyk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbChwYXJhbXMubGF0KTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKHBhcmFtcy5sbmcpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwocGFyYW1zLmJvdW5kMSk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDJdXCIpLnZhbChwYXJhbXMuYm91bmQyKTtcbiAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxvY11cIikudmFsKHBhcmFtcy5sb2MpO1xuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9a2V5XVwiKS52YWwocGFyYW1zLmtleSk7XG5cbiAgICAgICAgICBpZiAocGFyYW1zLmZpbHRlcikge1xuICAgICAgICAgICAgJHRhcmdldC5maW5kKFwiLmZpbHRlci1pdGVtIGlucHV0W3R5cGU9Y2hlY2tib3hdXCIpLnJlbW92ZVByb3AoXCJjaGVja2VkXCIpO1xuICAgICAgICAgICAgcGFyYW1zLmZpbHRlci5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCIuZmlsdGVyLWl0ZW0gaW5wdXRbdHlwZT1jaGVja2JveF1bdmFsdWU9J1wiICsgaXRlbSArIFwiJ11cIikucHJvcChcImNoZWNrZWRcIiwgdHJ1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGdldFBhcmFtZXRlcnM6ICgpID0+IHtcbiAgICAgICAgdmFyIHBhcmFtZXRlcnMgPSAkLmRlcGFyYW0oJHRhcmdldC5zZXJpYWxpemUoKSk7XG4gICAgICAgIC8vIHBhcmFtZXRlcnNbJ2xvY2F0aW9uJ10gO1xuXG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIHBhcmFtZXRlcnMpIHtcbiAgICAgICAgICBpZiAoICFwYXJhbWV0ZXJzW2tleV0gfHwgcGFyYW1ldGVyc1trZXldID09IFwiXCIpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBwYXJhbWV0ZXJzW2tleV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhcmFtZXRlcnM7XG4gICAgICB9LFxuICAgICAgdXBkYXRlTG9jYXRpb246IChsYXQsIGxuZykgPT4ge1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxhdF1cIikudmFsKGxhdCk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bG5nXVwiKS52YWwobG5nKTtcbiAgICAgICAgLy8gJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGVWaWV3cG9ydDogKHZpZXdwb3J0KSA9PiB7XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gW1t2aWV3cG9ydC5mLmIsIHZpZXdwb3J0LmIuYl0sIFt2aWV3cG9ydC5mLmYsIHZpZXdwb3J0LmIuZl1dO1xuXG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQxXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzBdKSk7XG4gICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9Ym91bmQyXVwiKS52YWwoSlNPTi5zdHJpbmdpZnkoYm91bmRzWzFdKSk7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9LFxuICAgICAgdXBkYXRlVmlld3BvcnRCeUJvdW5kOiAoc3csIG5lKSA9PiB7XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gW3N3LCBuZV07Ly8vLy8vLy9cblxuICAgICAgICBcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDFdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMF0pKTtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1ib3VuZDJdXCIpLnZhbChKU09OLnN0cmluZ2lmeShib3VuZHNbMV0pKTtcbiAgICAgICAgJHRhcmdldC50cmlnZ2VyKCdzdWJtaXQnKTtcbiAgICAgIH0sXG4gICAgICB0cmlnZ2VyU3VibWl0OiAoKSA9PiB7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9XG4gICAgfVxuICB9XG59KShqUXVlcnkpO1xuIiwibGV0IGF1dG9jb21wbGV0ZU1hbmFnZXI7XG5sZXQgbWFwTWFuYWdlcjtcblxuKGZ1bmN0aW9uKCQpIHtcblxuICAvLyAxLiBnb29nbGUgbWFwcyBnZW9jb2RlXG5cbiAgLy8gMi4gZm9jdXMgbWFwIG9uIGdlb2NvZGUgKHZpYSBsYXQvbG5nKVxuICBjb25zdCBxdWVyeU1hbmFnZXIgPSBRdWVyeU1hbmFnZXIoKTtcbiAgICAgICAgcXVlcnlNYW5hZ2VyLmluaXRpYWxpemUoKTtcblxuICBjb25zdCBpbml0UGFyYW1zID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcbiAgbWFwTWFuYWdlciA9IE1hcE1hbmFnZXIoe1xuICAgIG9uTW92ZTogKHN3LCBuZSkgPT4ge1xuICAgICAgLy8gV2hlbiB0aGUgbWFwIG1vdmVzIGFyb3VuZCwgd2UgdXBkYXRlIHRoZSBsaXN0XG4gICAgICBxdWVyeU1hbmFnZXIudXBkYXRlVmlld3BvcnRCeUJvdW5kKHN3LCBuZSk7XG4gICAgICAvL3VwZGF0ZSBRdWVyeVxuICAgIH1cbiAgfSk7XG5cbiAgd2luZG93LmluaXRpYWxpemVBdXRvY29tcGxldGVDYWxsYmFjayA9ICgpID0+IHtcblxuICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIgPSBBdXRvY29tcGxldGVNYW5hZ2VyKFwiaW5wdXRbbmFtZT0nbG9jJ11cIik7XG4gICAgYXV0b2NvbXBsZXRlTWFuYWdlci5pbml0aWFsaXplKCk7XG5cbiAgICBpZiAoaW5pdFBhcmFtcy5sb2MgJiYgaW5pdFBhcmFtcy5sb2MgIT09ICcnICYmICghaW5pdFBhcmFtcy5ib3VuZDEgJiYgIWluaXRQYXJhbXMuYm91bmQyKSkge1xuICAgICAgbWFwTWFuYWdlci5pbml0aWFsaXplKCgpID0+IHtcbiAgICAgICAgbWFwTWFuYWdlci5nZXRDZW50ZXJCeUxvY2F0aW9uKGluaXRQYXJhbXMubG9jLCAocmVzdWx0KSA9PiB7XG4gICAgICAgICAgcXVlcnlNYW5hZ2VyLnVwZGF0ZVZpZXdwb3J0KHJlc3VsdC5nZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgIH0pO1xuICAgICAgfSlcbiAgICB9XG4gIH1cblxuXG4gIGNvbnN0IGxhbmd1YWdlTWFuYWdlciA9IExhbmd1YWdlTWFuYWdlcigpO1xuXG4gIGxhbmd1YWdlTWFuYWdlci5pbml0aWFsaXplKGluaXRQYXJhbXNbJ2xhbmcnXSB8fCAnZW4nKTtcblxuICBjb25zdCBsaXN0TWFuYWdlciA9IExpc3RNYW5hZ2VyKCk7XG5cbiAgaWYoaW5pdFBhcmFtcy5sYXQgJiYgaW5pdFBhcmFtcy5sbmcpIHtcbiAgICBtYXBNYW5hZ2VyLnNldENlbnRlcihbaW5pdFBhcmFtcy5sYXQsIGluaXRQYXJhbXMubG5nXSk7XG4gIH1cblxuICAvKioqXG4gICogTGlzdCBFdmVudHNcbiAgKiBUaGlzIHdpbGwgdHJpZ2dlciB0aGUgbGlzdCB1cGRhdGUgbWV0aG9kXG4gICovXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxpc3QtdXBkYXRlJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgbGlzdE1hbmFnZXIucG9wdWxhdGVMaXN0KG9wdGlvbnMucGFyYW1zLCBvcHRpb25zLmRhdGEpO1xuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcbiAgICBsaXN0TWFuYWdlci51cGRhdGVGaWx0ZXIob3B0aW9ucyk7XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLWJ5LWJvdW5kJywgKGV2ZW50LCBvcHRpb25zKSA9PiB7XG4gICAgbGV0IGJvdW5kMSwgYm91bmQyO1xuXG4gICAgaWYgKCFvcHRpb25zIHx8ICFvcHRpb25zLmJvdW5kMSB8fCAhb3B0aW9ucy5ib3VuZDIpIHtcbiAgICAgIFtib3VuZDEsIGJvdW5kMl0gPSBtYXBNYW5hZ2VyLmdldEJvdW5kcygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBib3VuZDEgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQxKTtcbiAgICAgIGJvdW5kMiA9IEpTT04ucGFyc2Uob3B0aW9ucy5ib3VuZDIpO1xuICAgIH1cblxuXG5cbiAgICBsaXN0TWFuYWdlci51cGRhdGVCb3VuZHMoYm91bmQxLCBib3VuZDIpXG4gIH0pXG5cbiAgLyoqKlxuICAqIE1hcCBFdmVudHNcbiAgKi9cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbWFwLXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIC8vIG1hcE1hbmFnZXIuc2V0Q2VudGVyKFtvcHRpb25zLmxhdCwgb3B0aW9ucy5sbmddKTtcbiAgICBpZiAoIW9wdGlvbnMgfHwgIW9wdGlvbnMuYm91bmQxIHx8ICFvcHRpb25zLmJvdW5kMikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBib3VuZDEgPSBKU09OLnBhcnNlKG9wdGlvbnMuYm91bmQxKTtcbiAgICB2YXIgYm91bmQyID0gSlNPTi5wYXJzZShvcHRpb25zLmJvdW5kMik7XG4gICAgbWFwTWFuYWdlci5zZXRCb3VuZHMoYm91bmQxLCBib3VuZDIpO1xuICAgIC8vIGNvbnNvbGUubG9nKG9wdGlvbnMpXG4gIH0pO1xuICAvLyAzLiBtYXJrZXJzIG9uIG1hcFxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtcGxvdCcsIChlLCBvcHQpID0+IHtcblxuICAgIG1hcE1hbmFnZXIucGxvdFBvaW50cyhvcHQuZGF0YSwgb3B0LnBhcmFtcyk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtZmlsdGVyJyk7XG4gIH0pXG5cbiAgLy8gRmlsdGVyIG1hcFxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1tYXAtZmlsdGVyJywgKGUsIG9wdCkgPT4ge1xuICAgIGlmIChvcHQpIHtcbiAgICAgIG1hcE1hbmFnZXIuZmlsdGVyTWFwKG9wdC5maWx0ZXIpO1xuICAgIH1cbiAgfSk7XG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlJywgKGUsIG9wdCkgPT4ge1xuICAgIGlmIChvcHQpIHtcbiAgICAgIGxhbmd1YWdlTWFuYWdlci51cGRhdGVMYW5ndWFnZShvcHQubGFuZyk7XG4gICAgfVxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnYnV0dG9uI3Nob3ctaGlkZS1tYXAnLCAoZSwgb3B0KSA9PiB7XG4gICAgJCgnYm9keScpLnRvZ2dsZUNsYXNzKCdtYXAtdmlldycpXG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICdidXR0b24jc2hvdy1tYXAnLCAoZSwgb3B0KSA9PiB7XG4gICAgJCgnYm9keScpLmFkZENsYXNzKCdtYXAtdmlldycpO1xuXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgbWFwTWFuYWdlci5yZWZyZXNoTWFwKCk7XG4gICAgICB9LCAxMClcblxuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnYnV0dG9uI3Nob3ctbGlzdCcsIChlLCBvcHQpID0+IHtcbiAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ21hcC12aWV3Jyk7XG4gIH0pO1xuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICdidXR0b24uYnRuLm1vcmUtaXRlbXMnLCAoZSwgb3B0KSA9PiB7XG4gICAgJCgnI2VtYmVkLWFyZWEnKS50b2dnbGVDbGFzcygnb3BlbicpO1xuICB9KVxuXG4gIC8vIFNob3dzIHBvaW50ZXJzIHdpdGhpbiBtYXBcbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItc2hvdy1tYXJrZXInLCAoZSwgb3B0KSA9PiB7XG4gICAgbGV0IGxhdCA9IG9wdC5sYXQsIGxuZyA9IG9wdC5sbmcsIGNsYXNzTmFtZSA9IGAke29wdC5sYXR9LS0ke29wdC5sbmd9YDtcbiAgICBtYXBNYW5hZ2VyLnNob3dNYXBNYXJrZXIobGF0LCBsbmcsIGNsYXNzTmFtZSk7XG4gIH0pXG5cbiAgLy9BZGQgZXZlbnQgdG8gbGlzdE1hbmFnZXJcbiAgJChkb2N1bWVudCkub24oJ21vdXNlZW50ZXInLCAnZGl2I2V2ZW50cy1saXN0IHVsIGxpLmV2ZW50LW9iaicsIChlKSA9PiB7XG4gICAgbWFwTWFuYWdlci5zaG93TWFwTWFya2VyKCQoZS5jdXJyZW50VGFyZ2V0KS5kYXRhKCdsYXQnKSwgJChlLmN1cnJlbnRUYXJnZXQpLmRhdGEoJ2xuZycpKTtcbiAgfSlcblxuICAkKGRvY3VtZW50KS5vbignbW91c2VlbnRlcicsICdzZWN0aW9uI21hcCcsIChlKSA9PiB7XG4gICAgbWFwTWFuYWdlci5zaG93TWFwTWFya2VyKCk7XG4gIH0pXG5cbiAgLy8gJChkb2N1bWVudCkub24oJ3RyaWdnZXItdXBkYXRlLWVtYmVkJywgKGUsIG9wdCkgPT4ge1xuICAvLyAgIC8vdXBkYXRlIGVtYmVkIGxpbmVcbiAgLy8gICB2YXIgY29weSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob3B0KSk7XG4gIC8vICAgZGVsZXRlIGNvcHlbJ2xuZyddO1xuICAvLyAgIGRlbGV0ZSBjb3B5WydsYXQnXTtcbiAgLy8gICBkZWxldGUgY29weVsnYm91bmQxJ107XG4gIC8vICAgZGVsZXRlIGNvcHlbJ2JvdW5kMiddO1xuICAvL1xuICAvLyAgICQoJyNlbWJlZC1hcmVhIGlucHV0W25hbWU9ZW1iZWRdJykudmFsKCcjJyArICQucGFyYW0oY29weSkpO1xuICAvLyB9KTtcblxuICAkKHdpbmRvdykub24oXCJyZXNpemVcIiwgKGUpID0+IHtcbiAgICBtYXBNYW5hZ2VyLnJlZnJlc2hNYXAoKTtcbiAgfSk7XG5cbiAgJCh3aW5kb3cpLm9uKFwiaGFzaGNoYW5nZVwiLCAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgaWYgKGhhc2gubGVuZ3RoID09IDApIHJldHVybjtcbiAgICBjb25zdCBwYXJhbWV0ZXJzID0gJC5kZXBhcmFtKGhhc2guc3Vic3RyaW5nKDEpKTtcbiAgICBjb25zdCBvbGRVUkwgPSBldmVudC5vcmlnaW5hbEV2ZW50Lm9sZFVSTDtcblxuXG4gICAgY29uc3Qgb2xkSGFzaCA9ICQuZGVwYXJhbShvbGRVUkwuc3Vic3RyaW5nKG9sZFVSTC5zZWFyY2goXCIjXCIpKzEpKTtcblxuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtZmlsdGVyJywgcGFyYW1ldGVycyk7XG4gICAgLy8gJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci11cGRhdGUtZW1iZWQnLCBwYXJhbWV0ZXJzKTtcblxuICAgIC8vIFNvIHRoYXQgY2hhbmdlIGluIGZpbHRlcnMgd2lsbCBub3QgdXBkYXRlIHRoaXNcbiAgICBpZiAob2xkSGFzaC5ib3VuZDEgIT09IHBhcmFtZXRlcnMuYm91bmQxIHx8IG9sZEhhc2guYm91bmQyICE9PSBwYXJhbWV0ZXJzLmJvdW5kMikge1xuXG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLW1hcC11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGlzdC1maWx0ZXItYnktYm91bmQnLCBwYXJhbWV0ZXJzKTtcbiAgICB9XG5cbiAgICAvLyBDaGFuZ2UgaXRlbXNcbiAgICBpZiAob2xkSGFzaC5sYW5nICE9PSBwYXJhbWV0ZXJzLmxhbmcpIHtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbGFuZ3VhZ2UtdXBkYXRlJywgcGFyYW1ldGVycyk7XG4gICAgfVxuICB9KVxuXG4gIC8vIDQuIGZpbHRlciBvdXQgaXRlbXMgaW4gYWN0aXZpdHktYXJlYVxuXG4gIC8vIDUuIGdldCBtYXAgZWxlbWVudHNcblxuICAvLyA2LiBnZXQgR3JvdXAgZGF0YVxuXG4gIC8vIDcuIHByZXNlbnQgZ3JvdXAgZWxlbWVudHNcblxuICAvLyBjb25zb2xlLmxvZyh3aW5kb3cuRVZFTlRTX1VSTCB8fCAnaHR0cHM6Ly9kMmhoMTFsMWFqMmtnMS5jbG91ZGZyb250Lm5ldC9kYXRhL3dvbWVuc21hcmNoLmpzLmd6Jyk7XG4gICQuYWpheCh7XG4gICAgdXJsOiB3aW5kb3cuRVZFTlRTX1VSTCB8fCAnaHR0cHM6Ly9kMmhoMTFsMWFqMmtnMS5jbG91ZGZyb250Lm5ldC9kYXRhL3dvbWVuc21hcmNoLmpzLmd6JywgLy8nfCoqREFUQV9TT1VSQ0UqKnwnLFxuICAgIGRhdGFUeXBlOiAnc2NyaXB0JyxcbiAgICBzdWNjZXNzOiAoZGF0YSkgPT4ge1xuXG4gICAgICB2YXIgcGFyYW1ldGVycyA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG4gICAgICB2YXIgdGFyZ2V0RGF0YSA9IHdpbmRvdy5FVkVOVFNfREFUQTtcblxuICAgICAgJCgnI2V2ZW50cy1jb3VudCcpLnRleHQoYCR7d2luZG93LkVWRU5UU19EQVRBLmxlbmd0aH0gV2Fsa291dHMgYW5kIENvdW50aW5nYCkuY3NzKCdvcGFjaXR5JywgMSk7XG5cblxuICAgICAgdGFyZ2V0RGF0YS5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgIGl0ZW1bJ2V2ZW50X3R5cGUnXSA9ICdBY3Rpb24nO1xuICAgICAgfSlcblxuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LXVwZGF0ZScsIHsgcGFyYW1zOiBwYXJhbWV0ZXJzLCBkYXRhOiB0YXJnZXREYXRhIH0pO1xuICAgICAgLy8gJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBwYXJhbWV0ZXJzKTtcbiAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLXBsb3QnLCB7IGRhdGE6IHRhcmdldERhdGEsIHBhcmFtczogcGFyYW1ldGVycyB9KTtcbiAgICAgIC8vICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItdXBkYXRlLWVtYmVkJywgcGFyYW1ldGVycyk7XG4gICAgICAvL1RPRE86IE1ha2UgdGhlIGdlb2pzb24gY29udmVyc2lvbiBoYXBwZW4gb24gdGhlIGJhY2tlbmRcblxuICAgICAgLy9SZWZyZXNoIHRoaW5nc1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGxldCBwID0gcXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKTtcbiAgICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1tYXAtdXBkYXRlJywgcCk7XG4gICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLWZpbHRlcicsIHApO1xuICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIHApO1xuICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLWJ5LWJvdW5kJywgcCk7XG4gICAgICAgIC8vY29uc29sZS5sb2cocXVlcnlNYW5hZ2VyLmdldFBhcmFtZXRlcnMoKSlcbiAgICAgIH0sIDEwMCk7XG4gICAgfVxuICB9KTtcblxuXG5cbn0pKGpRdWVyeSk7XG4iXX0=
