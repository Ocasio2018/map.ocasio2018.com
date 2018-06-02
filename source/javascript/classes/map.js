
const MapManager = (($) => {
  let LANGUAGE = 'en';
  var mapMarker;
  const wmIcon = L.icon({
      iconUrl: '/img/ocasio-marker.png',
      iconSize: [30, 41],
      iconAnchor: [15, 41],
      popupAnchor: [-3, -76],
      shadowUrl: '/img/ocasio-marker-shadow.png',
      shadowSize: [43, 19],
      shadowAnchor: [15, 19]
  });

  const renderEvent = (item) => {
    var gmtDate = new Date(item.start_datetime).toGMTString();
    var date = moment(new Date(gmtDate)).format(new Date(item.start_datetime).getHours() == 0 ? "dddd MMM DD"  : "dddd MMM DD, h:mma");

    let url = item.url.match(/^https{0,1}:/) ? item.url : "//" + item.url;


    return `
    <div class='popup-item ${item.event_type}' data-lat='${item.lat}' data-lng='${item.lng}'>
      <div class="type-event type-action">
        <h2 class="event-title"><a href="${url == '//' ? 'javascript: void(null)' : url}" target='_blank'>${item.title}</a></h2>
        <div class="event-date date" style="display: ${!item.start_datetime ? 'none' : 'block'}">${date}</div>
        <div class="event-address address-area">
          <p>${item.venue}</p>
        </div>
        <div class="call-to-action" style='display: ${url == '//' ? 'none' : 'block'}'>
          <a href="${url}" target='_blank' class="btn btn-secondary rsvp">RSVP</a>
        </div>
      </div>
    </div>
    `
  };

  const renderGroup = (item) => {

    let url = item.website.match(/^https{0,1}:/) ? item.website : "//" + item.website;
    return `
    <li>
      <div class="type-group group-obj">
        <ul class="event-types-list">
          <li class="tag tag-${item.supergroup}">${item.supergroup}</li>
        </ul>
        <h2><a href="${url}" target='_blank'>${item.name}</a></h2>
        <div class="group-details-area">
          <div class="group-location location">${item.address}</div>
          <div class="group-description">
            <p>${item.description}</p>
          </div>
        </div>
        <div class="call-to-action">
          <a href="${url}" target='_blank' class="btn btn-secondary">Get Involved</a>
        </div>
      </div>
    </li>
    `
  };

  const renderGeojson = (list) => {
    // console.log(list)
    // Get all unique Lat-long

    let dictLatLng = {};

    list.forEach((item) => {
      if(!item.lat || !item.lng || item.lat == "" || item.lng == "") {
        return null;
      }

      if ( !dictLatLng[`${item.lat},${item.lng}`] ) {
        dictLatLng[`${item.lat},${item.lng}`] = [item];
      } else {
        dictLatLng[`${item.lat},${item.lng}`].push(item);
      }
    });

    // Parse groups items
    let mapItems = [];
    Object.keys(dictLatLng).forEach(function(key) {
      let [lat, lng] = key.split(',');
      mapItems.push({
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        events: dictLatLng[key]
      });
    });

    // console.log(mapItems);

    return mapItems.map((item) => {
      // rendered eventType
      let rendered;

      // console.log(item.events.length)
      if (item.events.length == 1) {
        rendered = renderEvent(item.events[0]);
      } else {
        rendered = `<div class='multiple-items'><ul>${item.events.map(i => `<li>${renderEvent(i)}</li>`).join('')}</ul></div>`
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
      }
    })
  }

  return (options) => {
    var map = null;

    if (!L.Browser.mobile) {
      map = L.map('map', { dragging: !L.Browser.mobile }).setView(window.CUSTOM_COORD || [38.4114271,-97.6411044], window.CUSTOM_ZOOM || 4);
      // map.scrollWheelZoom.disable();
    } else {
      map = L.map('map', { dragging: !L.Browser.mobile }).setView(window.CUSTOM_COORD || [38.4114271,-97.6411044], 3);
    }

    LANGUAGE = options.lang || 'en';

    if (options.onMove) {
      map.on('dragend', (event) => {


        let sw = [map.getBounds()._southWest.lat, map.getBounds()._southWest.lng];
        let ne = [map.getBounds()._northEast.lat, map.getBounds()._northEast.lng];
        options.onMove(sw, ne);
      }).on('zoomend', (event) => {

https://docs.google.com/document/d/1KWkLNNeIOeFEiVWMNwoYKu1yAZRUDf78xIbI1ie7Dvs/edit?usp=sharing
        let sw = [map.getBounds()._southWest.lat, map.getBounds()._southWest.lng];
        let ne = [map.getBounds()._northEast.lat, map.getBounds()._northEast.lng];
        options.onMove(sw, ne);
      })
    }

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
      	maxZoom: 16}).addTo(map);

    let geocoder = null;
    return {
      $map: map,
      initialize: (callback) => {
        geocoder = new google.maps.Geocoder();
        if (callback && typeof callback === 'function') {
            callback();
        }
      },
      getMap: () => map,
      setBounds: (bounds1, bounds2) => {
        const bounds = [bounds1, bounds2];
        map.fitBounds(bounds);
      },
      setCenter: (center, zoom = 10) => {
        if (!center || !center[0] || center[0] == ""
              || !center[1] || center[1] == "") return;
        map.setView(center, zoom);
      },
      getBounds: () => {

        let sw = [map.getBounds()._southWest.lat, map.getBounds()._southWest.lng];
        let ne = [map.getBounds()._northEast.lat, map.getBounds()._northEast.lng];

        return [sw, ne];
      },
      // Center location by geocoded
      getCenterByLocation: (location, callback) => {

        geocoder.geocode({ address: location }, function (results, status) {

          if (callback && typeof callback === 'function') {
            callback(results[0])
          }
        });
      },
      showMapMarker: (lat, lng) => {

        //console.log(mapMarker);
        if (mapMarker !== undefined) {
          map.removeLayer(mapMarker);
        }

        if (lat && lng) {
          mapMarker = new L.Marker([lat,lng], {
            icon: wmIcon
          }).addTo(map);
        }
      },
      refreshMap: () => {
        map.invalidateSize(false);
        // map._onResize();

        // console.log("map is resized")
      },
      filterMap: (filters) => {

        $("#map").find(".event-item-popup").hide();


        if (!filters) return;

        filters.forEach((item) => {

          $("#map").find(".event-item-popup." + item.toLowerCase()).show();
        })
      },
      plotPoints: (list, hardFilters) => {
        // console.log(list)
        const keySet = !hardFilters.key ? [] : hardFilters.key.split(',');

        if (keySet.length > 0) {
          list = list.filter((item) => keySet.includes(item.event_type))
        }


        const geojson = {
          type: "FeatureCollection",
          features: renderGeojson(list)
        };



        L.geoJSON(geojson, {
            pointToLayer: (feature, latlng) => {
              const eventType = feature.properties.eventProperties.event_type;
              var geojsonMarkerOptions = {
                  radius: 6,
                  fillColor:  eventType && eventType.toLowerCase() === 'group' ? "#3c2e81" : "#3c2e81",
                  color: "white",
                  weight: 4,
                  opacity: 0.5,
                  fillOpacity: 0.8,
              };
              return L.circleMarker(latlng, geojsonMarkerOptions);
            },

          onEachFeature: (feature, layer) => {
            if (feature.properties && feature.properties.popupContent) {
              layer.bindPopup(feature.properties.popupContent,
              {
                className: feature.properties.popupClassName
              });
            }
          }
        }).addTo(map);

      },
      update: (p) => {
        if (!p || !p.lat || !p.lng ) return;

        map.setView(L.latLng(p.lat, p.lng), 10);
      }
    };
  }
})(jQuery);
