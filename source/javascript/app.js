let autocompleteManager;
let mapManager;

(function($) {

  // 1. google maps geocode

  // 2. focus map on geocode (via lat/lng)
  const queryManager = QueryManager();
        queryManager.initialize();

  const initParams = queryManager.getParameters();
  mapManager = MapManager({
    onMove: (sw, ne) => {
      // When the map moves around, we update the list
      queryManager.updateViewportByBound(sw, ne);
      //update Query
    }
  });

  window.initializeAutocompleteCallback = () => {

    autocompleteManager = AutocompleteManager("input[name='loc']");
    autocompleteManager.initialize();

    if (initParams.loc && initParams.loc !== '' && (!initParams.bound1 && !initParams.bound2)) {
      mapManager.initialize(() => {
        mapManager.getCenterByLocation(initParams.loc, (result) => {
          queryManager.updateViewport(result.geometry.viewport);
        });
      })
    }
  }


  const languageManager = LanguageManager();

  languageManager.initialize(initParams['lang'] || 'en');

  const listManager = ListManager();

  if(initParams.lat && initParams.lng) {
    mapManager.setCenter([initParams.lat, initParams.lng]);
  }

  /***
  * List Events
  * This will trigger the list update method
  */
  $(document).on('trigger-list-update', (event, options) => {
    listManager.populateList(options.params, options.data);
  });

  $(document).on('trigger-list-filter-update', (event, options) => {
    listManager.updateFilter(options);
  });

  $(document).on('trigger-list-filter-by-bound', (event, options) => {
    let bound1, bound2;

    if (!options || !options.bound1 || !options.bound2) {
      [bound1, bound2] = mapManager.getBounds();
    } else {
      bound1 = JSON.parse(options.bound1);
      bound2 = JSON.parse(options.bound2);
    }



    listManager.updateBounds(bound1, bound2)
  })

  /***
  * Map Events
  */
  $(document).on('trigger-map-update', (event, options) => {
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
  $(document).on('trigger-map-plot', (e, opt) => {

    mapManager.plotPoints(opt.data, opt.params);
    $(document).trigger('trigger-map-filter');
  })

  // Filter map
  $(document).on('trigger-map-filter', (e, opt) => {
    if (opt) {
      mapManager.filterMap(opt.filter);
    }
  });

  $(document).on('trigger-language-update', (e, opt) => {
    if (opt) {
      languageManager.updateLanguage(opt.lang);
    }
  });

  $(document).on('click', 'button#show-hide-map', (e, opt) => {
    $('body').toggleClass('map-view')
  });

  $(document).on('click', 'button#show-map', (e, opt) => {
    $('body').addClass('map-view');

      setTimeout(() => {
        mapManager.refreshMap();
      }, 10)

  });

  $(document).on('click', 'button#show-list', (e, opt) => {
    $('body').removeClass('map-view');
  });

  $(document).on('click', 'button.btn.more-items', (e, opt) => {
    $('#embed-area').toggleClass('open');
  })

  // Shows pointers within map
  $(document).on('trigger-show-marker', (e, opt) => {
    let lat = opt.lat, lng = opt.lng, className = `${opt.lat}--${opt.lng}`;
    mapManager.showMapMarker(lat, lng, className);
  })

  //Add event to listManager
  $(document).on('mouseenter', 'div#events-list ul li.event-obj', (e) => {
    mapManager.showMapMarker($(e.currentTarget).data('lat'), $(e.currentTarget).data('lng'));
  })

  $(document).on('mouseenter', 'section#map', (e) => {
    mapManager.showMapMarker();
  })

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

  $(window).on("resize", (e) => {
    mapManager.refreshMap();
  });

  $(window).on("hashchange", (event) => {
    const hash = window.location.hash;
    if (hash.length == 0) return;
    const parameters = $.deparam(hash.substring(1));
    const oldURL = event.originalEvent.oldURL;


    const oldHash = $.deparam(oldURL.substring(oldURL.search("#")+1));

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
  })

  // 4. filter out items in activity-area

  // 5. get map elements

  // 6. get Group data

  // 7. present group elements

  $.ajax({
    url: 'https://map.justicedemocrats.com/api/events?candidate=alexandria-ocasio-cortez', //'|**DATA_SOURCE**|',
    dataType: 'json',
    success: (data) => {
      // console.log(data);
      var parameters = queryManager.getParameters();
      var targetData = data.map((item)=>{
        return {
            lat: item.location.location.latitude,
            event_type: item.type,
            supergroup: "Ocasio for US Congress",
            start_datetime: item.start_date,
            tz: "EST",
            venue: item.location.venue + [item.location.address_lines.join( ), item.location.locality, item.location.region, item.location.postal_code].join(" "),
            lng: item.location.location.longitude,
            url: item.browser_url,
            title: item.title,
            group: null
        };
      });

      // $('#events-count').text(`${window.EVENTS_DATA.length} Walkouts and Counting`).css('opacity', 1);


      targetData.forEach((item) => {
        item['event_type'] = 'Action';
      })

      $(document).trigger('trigger-list-update', { params: parameters, data: targetData });
      // $(document).trigger('trigger-list-filter-update', parameters);
      $(document).trigger('trigger-map-plot', { data: targetData, params: parameters });
      // $(document).trigger('trigger-update-embed', parameters);
      //TODO: Make the geojson conversion happen on the backend

      //Refresh things
      setTimeout(() => {
        let p = queryManager.getParameters();
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
        success: function(data) {
          // $(data.geojson).each(function(key, item) {
            district_boundary
              .addData(data.geojson)
              .setStyle({
                fillColor: 'rgba(60, 46, 129, 0.26)',
                color: 'rgba(60, 46, 129, 0.8)'
              });
            // if (!params.zipcode || params.zipcode === '') {

            // }
          // });
          // console.log(district_boundary);
          mapManager.getMap()
            .fitBounds(district_boundary.getBounds(), { animate: false });
          district_boundary.bringToBack();
        }
      }).error(function() {});
    }
  });



})(jQuery);
